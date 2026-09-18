export const HIJRI_MONTHS = [
  { en: "Muharram", ar: "محرم" },
  { en: "Safar", ar: "صفر" },
  { en: "Rabi' al-Awwal", ar: "ربيع الأول" },
  { en: "Rabi' al-Thani", ar: "ربيع الآخر" },
  { en: "Jumada al-Ula", ar: "جمادى الأولى" },
  { en: "Jumada al-Akhirah", ar: "جمادى الآخرة" },
  { en: "Rajab", ar: "رجب" },
  { en: "Sha'ban", ar: "شعبان" },
  { en: "Ramadan", ar: "رمضان" },
  { en: "Shawwal", ar: "شوال" },
  { en: "Dhu al-Qi'dah", ar: "ذو القعدة" },
  { en: "Dhu al-Hijjah", ar: "ذو الحجة" },
];

const umalquraParts = new Intl.DateTimeFormat("en-u-ca-islamic-umalqura-nu-latn", {
  day: "numeric",
  month: "numeric",
  year: "numeric",
  timeZone: "UTC",
});

export type HijriDate = { day: number; month: number; year: number };

/** Convert a JS Date (UTC-noon based) to Umm al-Qura hijri numbers. */
export function toHijri(date: Date): HijriDate {
  const parts = umalquraParts.formatToParts(date);
  const get = (t: string) => Number(parts.find((p) => p.type === t)?.value.replace(/[^0-9]/g, ""));
  return { day: get("day"), month: get("month"), year: get("year") };
}

export function utcDate(y: number, m: number, d: number) {
  return new Date(Date.UTC(y, m - 1, d, 12, 0, 0));
}

export function todayUTC() {
  const now = new Date();
  return utcDate(now.getFullYear(), now.getMonth() + 1, now.getDate());
}

const DAY = 86400000;

/** Find the Gregorian Date matching a given Umm al-Qura hijri date, or null. */
export function fromHijri(h: HijriDate): Date | null {
  // Approximate: mean hijri year 354.367 days, epoch 1 Muharram 1 AH = 19 July 622 CE.
  const approxDays =
    (h.year - 1) * 354.367 + (h.month - 1) * 29.53 + (h.day - 1);
  const epoch = Date.UTC(622, 6, 19, 12, 0, 0);
  let guess = epoch + Math.round(approxDays) * DAY;

  for (let offset = 0; offset <= 60; offset++) {
    for (const sign of offset === 0 ? [1] : [1, -1]) {
      const candidate = new Date(guess + sign * offset * DAY);
      const c = toHijri(candidate);
      if (c.day === h.day && c.month === h.month && c.year === h.year) {
        return candidate;
      }
    }
  }
  return null;
}

export type Formatted = {
  en: string;
  ar: string;
  weekdayEn: string;
  weekdayAr: string;
};

function fmt(date: Date, locale: string, calendar: string) {
  return new Intl.DateTimeFormat(`${locale}-u-ca-${calendar}`, {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  }).format(date);
}

function weekday(date: Date, locale: string) {
  return new Intl.DateTimeFormat(locale, { weekday: "long", timeZone: "UTC" }).format(date);
}

export function formatHijri(date: Date): Formatted {
  return {
    en: (() => {
      const h = toHijri(date);
      return `${h.day} ${HIJRI_MONTHS[h.month - 1].en} ${h.year} AH`;
    })(),
    ar: fmt(date, "ar-SA", "islamic-umalqura"),
    weekdayEn: weekday(date, "en"),
    weekdayAr: weekday(date, "ar-SA"),
  };
}

export function formatGregorian(date: Date): Formatted {
  return {
    en: fmt(date, "en", "gregory"),
    ar: fmt(date, "ar-SA", "gregory"),
    weekdayEn: weekday(date, "en"),
    weekdayAr: weekday(date, "ar-SA"),
  };
}

export function toInputValue(date: Date) {
  return date.toISOString().slice(0, 10);
}
