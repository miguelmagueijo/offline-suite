import { DEFAULT_VAT, type NumField, type PriceSide } from "./vat";

export type RowStatus = "pending" | "valid" | "invalid";

export interface CartRow {
	id: string;
	name: string;
	gross: NumField;
	net: NumField;
	vat: NumField;
	amount: number | null;
	lastEdited: PriceSide;
	status: RowStatus;
	error?: string;
}

export interface CartTotals {
	gross: number;
	net: number;
	amount: number;
	count: number;
}

export function newRow(): CartRow {
	return {
		id: crypto.randomUUID ? crypto.randomUUID() : `${Date.now()}-${Math.random()}`,
		name: "",
		gross: null,
		net: null,
		vat: DEFAULT_VAT,
		amount: null,
		lastEdited: "net",
		status: "pending"
	};
}

/**
 * Column layout shared by the cart header, rows and totals so they stay aligned.
 * Phones: name/amount/remove on the first line, VAT % and both prices on the second.
 * sm and up: one line per item, VAT % only as wide as "VAT (%)" / "100".
 */
export const CART_GRID =
	"grid grid-cols-[4rem_minmax(0,1fr)_minmax(0,1fr)_2rem] gap-x-2 gap-y-1.5 sm:grid-cols-[minmax(0,1fr)_4rem_6.5rem_6.5rem_5.5rem_2rem] sm:gap-y-0";
