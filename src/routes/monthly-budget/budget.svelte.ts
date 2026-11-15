export interface Expense {
	id: string;
	name: string;
	amount: number;
}

export interface Category {
	id: string;
	name: string;
	percentage: number;
	color: string;
	description: string;
	/** Fixed categories (duodécimos) use the duodécimos amount as their target instead of a percentage. */
	fixed?: boolean;
	expenses: Expense[];
}

export interface BudgetData {
	income: number;
	duodecimos: number;
	duo: Category;
	categories: Category[];
}

export const STORAGE_KEY = "offline-suite:monthly-budget";
export const EXPORT_VERSION = 3;

const HEX_COLOR = /^#[0-9A-Fa-f]{6}$/;

const currency = new Intl.NumberFormat("en-IE", { style: "currency", currency: "EUR" });

export function money(value: number): string {
	return currency.format(Number(value) || 0);
}

export function generateId(): string {
	return crypto.randomUUID ? crypto.randomUUID() : `${Date.now()}-${Math.random()}`;
}

function clamp(value: number, min: number, max: number) {
	return Math.max(min, Math.min(max, value));
}

function isRecord(value: unknown): value is Record<string, unknown> {
	return !!value && typeof value === "object";
}

function normalizeExpenses(value: unknown): Expense[] {
	if (!Array.isArray(value)) return [];
	return value.filter(isRecord).map((expense) => ({
		id: typeof expense.id === "string" && expense.id ? expense.id : generateId(),
		name: typeof expense.name === "string" ? expense.name : "",
		amount: Math.max(0, Number(expense.amount) || 0)
	}));
}

function normalizeDuo(value: unknown): Category {
	const src = isRecord(value) ? value : {};
	return {
		id: "duodecimos",
		name: typeof src.name === "string" && src.name ? src.name : "Duodécimos",
		percentage: 0,
		color: typeof src.color === "string" && HEX_COLOR.test(src.color) ? src.color : "#0ea5e9",
		description: "",
		fixed: true,
		expenses: normalizeExpenses(src.expenses)
	};
}

function normalizeCategory(value: Record<string, unknown>, index: number): Category {
	return {
		id: typeof value.id === "string" && value.id ? value.id : generateId(),
		name: typeof value.name === "string" && value.name ? value.name : `Category ${index + 1}`,
		percentage: clamp(Number(value.percentage) || 0, 0, 100),
		color:
			typeof value.color === "string" && HEX_COLOR.test(value.color)
				? value.color
				: "#64748b",
		description: typeof value.description === "string" ? value.description : "",
		expenses: normalizeExpenses(value.expenses)
	};
}

/** Validates arbitrary (stored or imported) data. Returns null if it isn't a budget. */
export function parseBudget(value: unknown): BudgetData | null {
	if (!isRecord(value) || !Array.isArray(value.categories)) return null;
	return {
		income: Math.max(0, Number(value.income) || 0),
		duodecimos: Math.max(0, Number(value.duodecimos) || 0),
		duo: normalizeDuo(value.duo),
		categories: value.categories.filter(isRecord).map(normalizeCategory)
	};
}

export function defaultBudget(): BudgetData {
	return {
		income: 2500,
		duodecimos: 0,
		duo: normalizeDuo(undefined),
		categories: [
			{
				id: "needs",
				name: "Needs",
				percentage: 50,
				color: "#16a34a",
				description: "Housing, utilities, food and essential costs.",
				expenses: []
			},
			{
				id: "wants",
				name: "Wants",
				percentage: 30,
				color: "#f59e0b",
				description: "Entertainment, restaurants, shopping and hobbies.",
				expenses: []
			},
			{
				id: "savings",
				name: "Savings",
				percentage: 20,
				color: "#8b5cf6",
				description: "Savings, investments and debt repayment.",
				expenses: []
			}
		]
	};
}

export function categorySpent(category: Category): number {
	return category.expenses.reduce((sum, expense) => sum + (Number(expense.amount) || 0), 0);
}

/** Reactive budget state with derived totals. */
export class Budget {
	income = $state(0);
	duodecimos = $state(0);
	categories = $state<Category[]>([]);
	duo = $state<Category>(normalizeDuo(undefined));

	all = $derived([...this.categories, this.duo]);

	totalPercentage = $derived(
		this.categories.reduce((total, category) => total + (Number(category.percentage) || 0), 0)
	);

	overAllocated = $derived(this.totalPercentage > 100);

	totalBudget = $derived(this.income + this.duodecimos);

	totalTracked = $derived(
		this.all.reduce((total, category) => total + categorySpent(category), 0)
	);

	constructor(data: BudgetData = defaultBudget()) {
		this.load(data);
	}

	load(data: BudgetData) {
		this.income = data.income;
		this.duodecimos = data.duodecimos;
		this.categories = data.categories;
		this.duo = data.duo;
	}

	target(category: Category): number {
		if (category.fixed) return this.duodecimos;
		return (this.income * (Number(category.percentage) || 0)) / 100;
	}

	toJSON(): BudgetData {
		return $state.snapshot({
			income: this.income,
			duodecimos: this.duodecimos,
			duo: this.duo,
			categories: this.categories
		});
	}
}

export function loadFromStorage(): BudgetData {
	try {
		const saved = localStorage.getItem(STORAGE_KEY);
		if (saved) return parseBudget(JSON.parse(saved)) ?? defaultBudget();
	} catch {
		// Corrupt or inaccessible storage: fall back to defaults.
	}
	return defaultBudget();
}

export function saveToStorage(data: BudgetData) {
	try {
		localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
	} catch {
		// Storage full or unavailable: nothing more we can do offline.
	}
}

export function clearStorage() {
	try {
		localStorage.removeItem(STORAGE_KEY);
	} catch {
		// Storage unavailable: nothing stored to clear.
	}
}

export function downloadJSON(data: BudgetData) {
	const payload = {
		version: EXPORT_VERSION,
		// eslint-disable-next-line svelte/prefer-svelte-reactivity -- one-off timestamp, not reactive state
		exportedAt: new Date().toISOString(),
		...data
	};
	const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
	const url = URL.createObjectURL(blob);
	const link = document.createElement("a");
	link.href = url;
	link.download = "budget-planner.json";
	link.click();
	URL.revokeObjectURL(url);
}

export async function readBudgetFile(file: File): Promise<BudgetData> {
	const data = parseBudget(JSON.parse(await file.text()));
	if (!data) throw new Error("Invalid budget file");
	return data;
}
