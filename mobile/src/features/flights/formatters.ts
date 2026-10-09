import type { FlightDto } from "./api/flight.types";

const priceNumberFormat = new Intl.NumberFormat("tr-TR", {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

const CURRENCY_LABEL: Record<FlightDto["currency"], string> = { TRY: "TL" };

const MONTHS = [
  "Ocak",
  "Şubat",
  "Mart",
  "Nisan",
  "Mayıs",
  "Haziran",
  "Temmuz",
  "Ağustos",
  "Eylül",
  "Ekim",
  "Kasım",
  "Aralık",
];

const INVALID_DATE_TIME = "—";

const ISO_ISTANBUL = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2}):(\d{2})\+03:00$/;

function parseIsoLocal(iso: string) {
  const match = ISO_ISTANBUL.exec(iso);
  if (!match) return null;
  const [, year, month, day, hour, minute, second] = match;
  const monthNumber = Number(month);
  const dayNumber = Number(day);
  if (
    monthNumber < 1 ||
    monthNumber > 12 ||
    dayNumber < 1 ||
    dayNumber > 31 ||
    Number(hour) > 23 ||
    Number(minute) > 59 ||
    Number(second) > 59
  ) {
    return null;
  }
  return { year, month: monthNumber, day: dayNumber, hour, minute };
}

export function formatPrice(
  priceMinor: FlightDto["priceMinor"],
  currency: FlightDto["currency"],
): string {
  return `${priceNumberFormat.format(priceMinor / 100)} ${CURRENCY_LABEL[currency]}`;
}

export function formatTime(iso: string): string {
  const parts = parseIsoLocal(iso);
  if (!parts) return INVALID_DATE_TIME;
  return `${parts.hour}:${parts.minute}`;
}

export function formatDate(iso: string): string {
  const parts = parseIsoLocal(iso);
  if (!parts) return INVALID_DATE_TIME;
  return `${parts.day} ${MONTHS[parts.month - 1]} ${parts.year}`;
}

export function getArrivalDayOffset(departureAt: string, arrivalAt: string): number {
  const departure = parseIsoLocal(departureAt);
  const arrival = parseIsoLocal(arrivalAt);
  if (!departure || !arrival) return 0;
  const toDayNumber = (parts: { year: string; month: number; day: number }) =>
    Date.UTC(Number(parts.year), parts.month - 1, parts.day) / 86_400_000;
  return toDayNumber(arrival) - toDayNumber(departure);
}

export function formatDuration(minutes: FlightDto["durationMinutes"]): string {
  const hours = Math.floor(minutes / 60);
  const rest = minutes % 60;
  if (hours === 0) return `${rest} dk`;
  if (rest === 0) return `${hours} sa`;
  return `${hours} sa ${rest} dk`;
}

export function formatStops(stops: FlightDto["stops"]): string {
  return stops === 0 ? "Direkt" : "1 aktarma";
}

export function formatBaggage(baggageKg: FlightDto["baggageKg"]): string {
  if (baggageKg === null) return "Bagaj bilgisi yok";
  if (baggageKg === 0) return "Bagaj dahil değil";
  return `${baggageKg} kg bagaj`;
}
