import Link from "next/link";

export default function LandingPage() {
  return (
    <main className="min-h-screen bg-paper text-ink flex flex-col justify-between">
      <header className="mx-auto flex w-full max-w-4xl items-center justify-between px-6 py-6 border-b border-line">
        <span className="font-serif text-2xl font-bold tracking-tight">TravelMate</span>
        <div className="flex items-center gap-3">
          <Link
            href="/login"
            className="rounded-lg px-4 py-2 text-sm font-medium text-ink hover:bg-sand transition-colors"
          >
            Log in
          </Link>
          <Link
            href="/signup"
            className="btn-primary rounded-lg px-4 py-2 text-sm"
          >
            Sign up
          </Link>
        </div>
      </header>

      <section className="mx-auto flex w-full max-w-3xl flex-col items-center justify-center px-6 py-20 text-center my-auto">
        <p className="text-xs font-semibold uppercase tracking-widest text-muted">
          Travel Compatibility & Group Matching
        </p>
        <h1 className="mt-4 font-serif text-4xl sm:text-5xl md:text-6xl text-ink leading-tight">
          Find people who travel like you.
        </h1>
        <p className="mt-5 max-w-lg text-base sm:text-lg text-muted leading-relaxed">
          Match with travelers based on daily pace, budgets, and habits. Join real groups, find certified local guides, or plan itineraries together.
        </p>

        <div className="mt-8 flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto">
          <Link
            href="/login"
            className="btn-primary w-full sm:w-44 rounded-lg py-3 text-center text-sm"
          >
            Log in
          </Link>
          <Link
            href="/signup"
            className="btn-secondary w-full sm:w-44 rounded-lg py-3 text-center text-sm"
          >
            Sign up
          </Link>
        </div>

        <div className="mt-6 pt-6 border-t border-line w-full max-w-md">
          <Link
            href="/login?role=guide"
            className="text-sm font-medium text-muted hover:text-ink transition-colors inline-flex items-center gap-1.5"
          >
            Are you a local guide? <span className="text-forest underline">Continue as Guide →</span>
          </Link>
        </div>
      </section>

      <footer className="mx-auto w-full max-w-4xl px-6 py-6 border-t border-line text-xs text-muted flex flex-col sm:flex-row items-center justify-between gap-2">
        <span>TravelMate &copy; {new Date().getFullYear()}</span>
        <div className="flex gap-4">
          <Link href="/login" className="hover:underline">Traveler Login</Link>
          <Link href="/login?role=guide" className="hover:underline">Guide Portal</Link>
          <Link href="/signup" className="hover:underline">Register</Link>
        </div>
      </footer>
    </main>
  );
}
