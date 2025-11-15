const DATE_FORMATTER = new Intl.DateTimeFormat("sl-SI", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric"
});

export function formatDisplayDate(date: string): string {
    const d = new Date(date + "T00:00:00");
    return DATE_FORMATTER.format(d);
}

export function formatDisplayDateTime(date: string, time?: string): string {
    const formattedDate = formatDisplayDate(date);
    return time ? `${formattedDate} ob ${time}` : formattedDate;
}
