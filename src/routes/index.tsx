import { createFileRoute } from "@tanstack/react-router";
import { Moon, Sun } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import {
  HIJRI_MONTHS,
  formatGregorian,
  formatHijri,
  fromHijri,
  toHijri,
  toInputValue,
  todayUTC,
  utcDate,
  type Formatted,
} from "@/lib/hijri";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Date Converter · محول التاريخ | Hijri ⇄ Gregorian" },
      {
        name: "description",
        content:
          "Convert dates between the Umm al-Qura Hijri calendar and the Gregorian calendar instantly, in Arabic and English.",
      },
      { property: "og:title", content: "Date Converter · محول التاريخ" },
      {
        property: "og:description",
        content: "Instant Hijri ⇄ Gregorian date conversion using the official Umm al-Qura calendar.",
      },
    ],
  }),
  component: Index,
});

function ResultCard({
  labelEn,
  labelAr,
  value,
}: {
  labelEn: string;
  labelAr: string;
  value: Formatted | null;
}) {
  return (
    <div className="mt-5 rounded-xl border border-border bg-secondary/60 p-4 sm:p-5">
      <div className="flex items-baseline justify-between gap-3">
        <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
          {labelEn}
        </span>
        <span dir="rtl" className="text-xs text-muted-foreground">
          {labelAr}
        </span>
      </div>
      {value ? (
        <div className="mt-3 space-y-2">
          <p className="text-lg font-semibold leading-snug text-foreground sm:text-xl">
            {value.weekdayEn}, {value.en}
          </p>
          <p
            dir="rtl"
            lang="ar"
            className="text-lg font-semibold leading-snug text-primary sm:text-xl"
          >
            {value.weekdayAr}، {value.ar}
          </p>
        </div>
      ) : (
        <p className="mt-3 text-sm text-destructive">
          This date does not exist in the Umm al-Qura calendar · هذا التاريخ غير موجود في تقويم أم
          القرى
        </p>
      )}
    </div>
  );
}

const fieldClass =
  "w-full rounded-lg border border-input bg-card px-3 py-2.5 text-base text-foreground shadow-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-ring/40";

function Index() {
  const today = useMemo(() => todayUTC(), []);
  const todayHijri = useMemo(() => toHijri(today), [today]);

  const [gregInput, setGregInput] = useState(() => toInputValue(today));
  const [hDay, setHDay] = useState(todayHijri.day);
  const [hMonth, setHMonth] = useState(todayHijri.month);
  const [hYear, setHYear] = useState(todayHijri.year);

  const hijriResult = useMemo(() => {
    const [y, m, d] = gregInput.split("-").map(Number);
    if (!y || !m || !d) return null;
    return formatHijri(utcDate(y, m, d));
  }, [gregInput]);

  const gregResult = useMemo(() => {
    const date = fromHijri({ day: hDay, month: hMonth, year: hYear });
    return date ? formatGregorian(date) : null;
  }, [hDay, hMonth, hYear]);

  const years = useMemo(
    () => Array.from({ length: 201 }, (_, i) => 1300 + i),
    [],
  );

  return (
    <main
      className="min-h-screen px-4 py-10 sm:py-14"
      style={{ backgroundImage: "var(--gradient-page)" }}
    >
      <div className="mx-auto w-full max-w-2xl">
        <header className="text-center">
          <h1 className="text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
            Date Converter <span className="text-muted-foreground">·</span>{" "}
            <span dir="rtl" lang="ar">
              محول التاريخ
            </span>
          </h1>
          <p className="mx-auto mt-3 max-w-md text-sm text-muted-foreground">
            Hijri ⇄ Gregorian, using the official Umm al-Qura calendar
            <br />
            <span dir="rtl" lang="ar">
              التحويل بين الهجري والميلادي وفق تقويم أم القرى
            </span>
          </p>
        </header>

        <section
          className="mt-8 rounded-2xl border border-border bg-card p-5 sm:p-6"
          style={{ boxShadow: "var(--shadow-soft)" }}
        >
          <div className="flex flex-wrap items-baseline justify-between gap-2">
            <h2 className="text-base font-semibold text-foreground">Gregorian → Hijri</h2>
            <h2 dir="rtl" lang="ar" className="text-base font-semibold text-primary">
              ميلادي ← هجري
            </h2>
          </div>

          <label className="mt-4 block">
            <span className="mb-1.5 flex justify-between text-xs font-medium text-muted-foreground">
              <span>Gregorian date</span>
              <span dir="rtl" lang="ar">
                التاريخ الميلادي
              </span>
            </span>
            <input
              type="date"
              value={gregInput}
              onChange={(e) => setGregInput(e.target.value)}
              className={fieldClass}
            />
          </label>

          <ResultCard labelEn="Hijri date" labelAr="التاريخ الهجري" value={hijriResult} />
        </section>

        <section
          className="mt-6 rounded-2xl border border-border bg-card p-5 sm:p-6"
          style={{ boxShadow: "var(--shadow-soft)" }}
        >
          <div className="flex flex-wrap items-baseline justify-between gap-2">
            <h2 className="text-base font-semibold text-foreground">Hijri → Gregorian</h2>
            <h2 dir="rtl" lang="ar" className="text-base font-semibold text-primary">
              هجري ← ميلادي
            </h2>
          </div>

          <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-3">
            <label className="block">
              <span className="mb-1.5 flex justify-between text-xs font-medium text-muted-foreground">
                <span>Day</span>
                <span dir="rtl" lang="ar">
                  اليوم
                </span>
              </span>
              <select
                value={hDay}
                onChange={(e) => setHDay(Number(e.target.value))}
                className={fieldClass}
              >
                {Array.from({ length: 30 }, (_, i) => i + 1).map((d) => (
                  <option key={d} value={d}>
                    {d}
                  </option>
                ))}
              </select>
            </label>

            <label className="block">
              <span className="mb-1.5 flex justify-between text-xs font-medium text-muted-foreground">
                <span>Month</span>
                <span dir="rtl" lang="ar">
                  الشهر
                </span>
              </span>
              <select
                value={hMonth}
                onChange={(e) => setHMonth(Number(e.target.value))}
                className={fieldClass}
              >
                {HIJRI_MONTHS.map((m, i) => (
                  <option key={m.en} value={i + 1}>
                    {m.ar} — {m.en}
                  </option>
                ))}
              </select>
            </label>

            <label className="block">
              <span className="mb-1.5 flex justify-between text-xs font-medium text-muted-foreground">
                <span>Year</span>
                <span dir="rtl" lang="ar">
                  السنة
                </span>
              </span>
              <select
                value={hYear}
                onChange={(e) => setHYear(Number(e.target.value))}
                className={fieldClass}
              >
                {years.map((y) => (
                  <option key={y} value={y}>
                    {y}
                  </option>
                ))}
              </select>
            </label>
          </div>

          <ResultCard labelEn="Gregorian date" labelAr="التاريخ الميلادي" value={gregResult} />
        </section>

        <p className="mt-6 text-center text-xs text-muted-foreground">
          Based on your browser&apos;s Umm al-Qura calendar data ·{" "}
          <span dir="rtl" lang="ar">
            يعتمد على بيانات تقويم أم القرى في المتصفح
          </span>
        </p>
      </div>
    </main>
  );
}
