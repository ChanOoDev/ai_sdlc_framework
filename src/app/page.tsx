import Link from "next/link";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24">
      <div className="z-10 w-full max-w-5xl items-center justify-between font-mono text-sm lg:flex">
        <h1 className="text-4xl font-bold">Doctor Note MVP</h1>
      </div>

      <div className="mt-8 grid text-center lg:grid-cols-2 lg:w-full lg:max-w-5xl">
        <Link
          href="/login"
          className="group rounded-lg border border-transparent px-5 py-4 transition-colors hover:border-gray-300 hover:bg-gray-100"
        >
          <h2 className="mb-3 text-2xl font-semibold">Login</h2>
          <p className="m-0 max-w-[30ch] text-sm opacity-50">
            Sign in to your account
          </p>
        </Link>

        <Link
          href="/signup"
          className="group rounded-lg border border-transparent px-5 py-4 transition-colors hover:border-gray-300 hover:bg-gray-100"
        >
          <h2 className="mb-3 text-2xl font-semibold">Sign Up</h2>
          <p className="m-0 max-w-[30ch] text-sm opacity-50">
            Create a new account
          </p>
        </Link>
      </div>
    </main>
  );
}
