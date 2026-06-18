const MONTHS = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

const MONTHS_FULL = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

export function formatMoney(amount: number): string {
  const [int, dec] = amount.toFixed(2).split(".");
  const grouped = int.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  return `Rs ${grouped}.${dec}`;
}

/** "YYYY-MM" bucket key for grouping expenses by month. */
export function monthKey(ms: number): string {
  const d = new Date(ms);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
}

/** Turns a "YYYY-MM" key into a label like "June 2026". */
export function formatMonthLabel(key: string): string {
  const [year, month] = key.split("-").map(Number);
  return `${MONTHS_FULL[month - 1]} ${year}`;
}

export function formatDate(ms: number): string {
  const d = new Date(ms);
  return `${d.getDate()} ${MONTHS[d.getMonth()]} ${d.getFullYear()}`;
}

export function formatTime(ms: number): string {
  const d = new Date(ms);
  let hours = d.getHours();
  const minutes = d.getMinutes();
  const ampm = hours >= 12 ? "PM" : "AM";
  hours = hours % 12 || 12;
  return `${hours}:${String(minutes).padStart(2, "0")} ${ampm}`;
}

export function formatDateTime(ms: number): string {
  return `${formatDate(ms)} · ${formatTime(ms)}`;
}
