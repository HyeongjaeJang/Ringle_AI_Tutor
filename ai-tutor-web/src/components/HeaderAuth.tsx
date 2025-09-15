"use client";
import Link from "next/link";
import { useAuth } from "@/store/auth";
import LogoutButton from "./LogoutButton";

export default function HeaderAuth({ ssrAuthed }: { ssrAuthed: boolean }) {
  const user = useAuth((s) => s.user);
  const isAuthed = user ? true : ssrAuthed;

  return (
    <nav className="flex items-center gap-2">
      <Link
        href="/"
        className="rounded-lg px-3 py-1.5 text-sm font-medium hover:bg-slate-100"
      >
        Home
      </Link>

      {isAuthed ? (
        <>
          {user?.role == "admin" ? (
            <Link
              href="/admin/plans"
              className="rounded-lg px-3 py-1.5 text-sm font-medium hover:bg-slate-100"
            >
              Admin
            </Link>
          ) : null}
          <Link
            href="/dashboard"
            className="rounded-lg px-3 py-1.5 text-sm font-medium hover:bg-slate-100"
          >
            Dashboard
          </Link>
          <LogoutButton />
        </>
      ) : (
        <>
          <Link
            href="/login"
            className="rounded-lg px-3 py-1.5 text-sm font-medium hover:bg-slate-100"
          >
            Login
          </Link>
          <Link
            href="/signup"
            className="rounded-lg bg-blue-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-blue-700"
          >
            Sign up
          </Link>
        </>
      )}
    </nav>
  );
}
