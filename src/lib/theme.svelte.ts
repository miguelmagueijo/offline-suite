export type ThemeMode = "auto" | "light" | "dark";

const STORAGE_KEY = "offline-suite:theme";
const MODES: ThemeMode[] = ["auto", "light", "dark"];

function readStoredMode(): ThemeMode {
	try {
		const stored = localStorage.getItem(STORAGE_KEY) as ThemeMode | null;
		return stored && MODES.includes(stored) ? stored : "auto";
	} catch {
		return "auto";
	}
}

class Theme {
	mode = $state<ThemeMode>("auto");

	#media: MediaQueryList | null = null;

	/** Call once on the client (from the root layout). Returns a cleanup function. */
	init() {
		this.mode = readStoredMode();
		this.#media = window.matchMedia("(prefers-color-scheme: dark)");
		const onChange = () => this.apply();
		this.#media.addEventListener("change", onChange);
		this.apply();
		return () => this.#media?.removeEventListener("change", onChange);
	}

	cycle() {
		this.mode = MODES[(MODES.indexOf(this.mode) + 1) % MODES.length];
		try {
			localStorage.setItem(STORAGE_KEY, this.mode);
		} catch {
			// Storage unavailable (private mode etc.): the choice just won't persist.
		}
		this.apply();
	}

	apply() {
		const dark = this.mode === "dark" || (this.mode === "auto" && !!this.#media?.matches);
		document.documentElement.classList.toggle("dark", dark);
	}
}

export const theme = new Theme();
