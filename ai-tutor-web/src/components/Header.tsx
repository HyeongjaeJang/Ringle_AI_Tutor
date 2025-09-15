import Link from "next/link";
import { cookies } from "next/headers";
import HeaderAuth from "./HeaderAuth";

export default async function Header() {
  const token = (await cookies()).get("token")?.value;
  const ssrAuthed = !!token;

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-white/90 backdrop-blur">
      <div className="mx-auto flex h-14 max-w-5xl items-center justify-between px-6">
        <Link href="/" className="text-lg font-extrabold tracking-tight">
          Ringle
        </Link>

        <HeaderAuth ssrAuthed={ssrAuthed} />
      </div>
    </header>
  );
}
