const dateFormat = new Intl.DateTimeFormat("en-US", { year: "numeric", month: "short", day: "numeric", timeZone: "UTC" });
const numberFormat = new Intl.NumberFormat("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

// Formats a YYYY-MM-DD date without a time zone shift.
export function formatDate(iso: string | null | undefined): string {
  return iso ? dateFormat.format(new Date(`${iso}T00:00:00Z`)) : "—";
}

export function formatAmount(value: number | null | undefined): string {
  return value == null ? "—" : numberFormat.format(value);
}

export const MONTHS_SHORT = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"] as const;
