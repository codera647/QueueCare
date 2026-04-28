import Link from "next/link";
import { ThemeToggle } from "./theme-toggle";

function PreviewCard({ mode }: { mode: "light" | "dark" }) {
  const rootClass = mode === "dark" ? "dark" : "light";
  const label = mode === "dark" ? "Dark Luxury" : "Light Luxury";

  return (
    <section
      className={[
        rootClass,
        "relative overflow-hidden rounded-3xl border border-border bg-bg text-text",
        "p-6 sm:p-8",
      ].join(" ")}
      aria-label={`${label} theme preview`}
    >
      <div
        className={[
          "pointer-events-none absolute -top-24 left-1/2 h-64 w-64 -translate-x-1/2 rounded-full blur-3xl",
          "bg-gradient-to-br from-primary/30 via-tech/15 to-accent/30",
        ].join(" ")}
      />
      <div
        className={[
          "pointer-events-none absolute -bottom-24 right-8 h-48 w-48 rounded-full blur-3xl",
          "bg-gradient-to-tr from-primary/15 to-accent/20",
        ].join(" ")}
      />

      <header className="relative flex items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-xl bg-gradient-to-br from-primary to-accent" />
            <span className="text-sm font-semibold tracking-wide">
              QueueCare
            </span>
          </div>
          <h2 className="mt-4 text-2xl font-semibold tracking-tight">
            {label}
          </h2>
          <p className="mt-1 max-w-md text-sm text-text-muted">
            Smarter queues with a calm, premium interface.
          </p>
        </div>

        <span className="relative inline-flex items-center rounded-full border border-border bg-surface px-3 py-1 text-xs text-text-muted">
          {mode === "dark" ? "Default" : "Optional"}
        </span>
      </header>

      <div className="relative mt-6 grid gap-4">
        <div className="rounded-2xl border border-border bg-surface p-5 backdrop-blur">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-sm font-medium">Live queue status</p>
              <p className="mt-1 text-sm text-text-muted">
                Token #A-14 • ~12 minutes
              </p>
            </div>
            <span className="inline-flex items-center rounded-full bg-primary px-3 py-1 text-sm font-medium text-primary-foreground">
              Near your turn
            </span>
          </div>

          <div className="mt-4 h-2 w-full overflow-hidden rounded-full bg-bg-2">
            <div className="h-full w-2/3 rounded-full bg-gradient-to-r from-primary to-accent" />
          </div>
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          <button
            type="button"
            className="h-11 rounded-xl bg-primary px-4 text-sm font-semibold text-primary-foreground transition hover:opacity-95"
          >
            Request Demo
          </button>
          <button
            type="button"
            className="h-11 rounded-xl border border-border bg-surface px-4 text-sm font-semibold text-text transition hover:bg-surface-2"
          >
            Join Early Access
          </button>
        </div>

        <form className="grid gap-3 rounded-2xl border border-border bg-surface p-5">
          <div className="grid gap-2">
            <label className="text-sm font-medium" htmlFor={`${mode}-email`}>
              Email
            </label>
            <input
              id={`${mode}-email`}
              name="email"
              type="email"
              placeholder="you@clinic.com"
              className={[
                "h-11 rounded-xl border border-border bg-surface-2 px-3 text-sm",
                "placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-primary/30",
              ].join(" ")}
            />
          </div>
          <p className="text-xs text-text-muted">
            Polished inputs, soft borders, and glass surfaces.
          </p>
        </form>
      </div>
    </section>
  );
}

export default function ThemeDemoPage() {
  return (
    <div className="flex-1 bg-bg">
      <div className="mx-auto w-full max-w-6xl px-5 py-10 sm:px-8">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-semibold tracking-tight">
              Theme demo
            </h1>
            <p className="mt-2 max-w-2xl text-sm text-text-muted">
              Side-by-side preview of QueueCare’s dark and light luxury themes.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-4">
            <ThemeToggle />
            <Link
              href="/"
              className="rounded-full border border-border bg-surface px-4 py-2 text-sm font-medium text-text transition hover:bg-surface-2"
            >
              Home
            </Link>
          </div>
        </div>

        <div className="mt-8 grid gap-6 lg:grid-cols-2">
          <PreviewCard mode="dark" />
          <PreviewCard mode="light" />
        </div>
      </div>
    </div>
  );
}

