import Link from "next/link";

export default function Custom404() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-[#0F0C0A] text-[#FAF4EF] text-center">
      <h1 className="text-6xl font-extrabold text-[#B46A2C]">404</h1>
      <h2 className="text-xl font-semibold mt-2 mb-4">Page Not Found</h2>
      <p className="text-xs text-[#A39385] max-w-sm mb-6">
        The page you are looking for does not exist or has been moved.
      </p>
      <Link
        href="/"
        className="px-4 py-2 text-xs font-semibold rounded-lg bg-[#B46A2C] text-white hover:bg-[#995222] transition"
      >
        Return Home
      </Link>
    </div>
  );
}
