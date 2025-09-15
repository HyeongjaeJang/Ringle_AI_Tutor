"use client";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useAuth } from "@/store/auth";

export default function LogoutButton() {
  const router = useRouter();
  const clearUser = useAuth((s) => s.clear);
  const [loading, setLoading] = useState(false);

  const onLogout = async () => {
    try {
      setLoading(true);
      await fetch("/api/auth/logout", { method: "POST" });
      clearUser();
      router.replace("/");
      router.refresh();
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={onLogout}
      disabled={loading}
      className="rounded-lg border px-3 py-1.5 text-sm font-medium hover:bg-slate-50 disabled:opacity-60"
    >
      {loading ? "Logging out..." : "Logout"}
    </button>
  );
}
