export const DEFAULT_VAT = 23;

/** A number field bound to an <input type="number">: empty is null. */
export type NumField = number | null;

export type PriceSide = "net" | "gross";

export interface VatResult {
	vat: number;
	net: number;
	gross: number;
	amount: number;
}

// Euro sign after the amount (1,250.00€), with English digit grouping.
const amount = new Intl.NumberFormat("en-IE", {
	minimumFractionDigits: 2,
	maximumFractionDigits: 2
});

export function money(value: number): string {
	return `${amount.format(value)}€`;
}

export function isFilled(value: NumField | undefined): value is number {
	return value !== null && value !== undefined && Number.isFinite(value);
}

export function round2(value: number): number {
	return Math.round((value + Number.EPSILON) * 100) / 100;
}

/**
 * Computes the missing price from the one that's filled in.
 * When both are filled, `prefer` (the one the user edited last) wins.
 * An empty VAT rate falls back to DEFAULT_VAT.
 */
export function computeVat(
	vat: NumField,
	net: NumField,
	gross: NumField,
	prefer: PriceSide = "net"
): VatResult | { error: string } {
	const rate = isFilled(vat) ? vat : DEFAULT_VAT;
	if (rate < 0) return { error: "VAT can't be negative." };

	const hasNet = isFilled(net);
	const hasGross = isFilled(gross);
	if (!hasNet && !hasGross) return { error: "Fill in a price with or without VAT." };

	const useNet = hasNet && (prefer === "net" || !hasGross);
	const base = useNet ? net : gross;
	if ((base as number) < 0) return { error: "Prices can't be negative." };

	const factor = 1 + rate / 100;
	const netValue = round2(useNet ? (net as number) : (gross as number) / factor);
	const grossValue = round2(useNet ? (net as number) * factor : (gross as number));

	return { vat: rate, net: netValue, gross: grossValue, amount: round2(grossValue - netValue) };
}
