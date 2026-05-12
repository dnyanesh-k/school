import Link from "next/link";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-zinc-50 p-6 dark:bg-zinc-950">
      <div className="max-w-3xl text-center">
        <h1 className="text-4xl font-bold text-zinc-900 dark:text-white sm:text-6xl">
          School Management System
        </h1>
        <p className="mt-4 text-lg text-zinc-600 dark:text-zinc-400">
          Manage students, track roll numbers, and handle authentication seamlessly.
        </p>

        <div className="mt-10 flex flex-wrap justify-center gap-4">
          <Link
            href="/login"
            className="rounded-lg bg-blue-600 px-6 py-3 font-semibold text-white transition hover:bg-blue-700"
          >
            Login to Portal
          </Link>
          <Link
            href="/students"
            className="rounded-lg border border-zinc-300 px-6 py-3 font-semibold text-zinc-900 transition hover:bg-zinc-100 dark:border-zinc-700 dark:text-white dark:hover:bg-zinc-800"
          >
            View Students
          </Link>
        </div>
      </div>
    </main>
  );
}
