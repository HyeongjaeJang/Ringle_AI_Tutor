"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import api from "@/lib/api";
import { getErrorMessage } from "@/utils/errors";

export default function CouponsClient() {
  const router = useRouter();
  const [userId, setUserId] = useState<string>("");
  const [email, setEmail] = useState<string>("");
  const [kind, setKind] = useState("chat");
  const [remaining, setRemaining] = useState<number>(1);
  const [expiresAt, setExpiresAt] = useState<string>("");
  const [msg, setMsg] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const submit = async () => {
    try {
      setLoading(true);
      setErr(null);
      setMsg(null);

      if (userId) {
        const res = await api.post(`/api/admin/users/${userId}/coupons`, {
          kind,
          remaining_uses: remaining,
          expires_at: expiresAt || null,
        });
        if (!res.data?.success && !res.data?.data)
          throw new Error(res.data?.error || "실패");
        setMsg("쿠폰 지급 완료");
        router.replace("/dashboard");
        router.refresh();
        return;
      }

      if (email) {
        const res = await api.post(`/api/admin/coupons/by-email`, {
          email,
          kind,
          remaining_uses: remaining,
          expires_at: expiresAt || null,
        });
        if (!res.data?.success && !res.data?.data)
          throw new Error(res.data?.error || "실패");
        setMsg("쿠폰 지급 완료");
        router.replace("/dashboard");
        router.refresh();
        return;
      }

      throw new Error("user id 또는 email을 입력하세요.");
    } catch (e: unknown) {
      const error = getErrorMessage(e);
      setErr(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="space-y-4">
      <div className="rounded-2xl border bg-white p-5 shadow-sm">
        <h2 className="mb-3 text-lg font-semibold">지급 조건</h2>
        <div className="grid gap-3 md:grid-cols-3">
          <input
            className="rounded border p-2"
            placeholder="user id"
            value={userId}
            onChange={(e) => setUserId(e.target.value)}
          />
          <div className="self-center text-center text-sm text-slate-500">
            또는
          </div>
          <input
            className="rounded border p-2"
            placeholder="user email (백엔드가 허용 시)"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>

        <div className="mt-4 grid gap-3 md:grid-cols-4">
          <select
            className="rounded border p-2"
            value={kind}
            onChange={(e) => setKind(e.target.value)}
          >
            <option value="chat">chat</option>
            <option value="free_trial">free_trial</option>
          </select>
          <input
            className="rounded border p-2"
            type="number"
            placeholder="remaining_uses"
            value={remaining}
            onChange={(e) => setRemaining(+e.target.value)}
          />
          <input
            className="rounded border p-2"
            type="date"
            value={expiresAt}
            onChange={(e) => setExpiresAt(e.target.value)}
          />
        </div>

        <button
          onClick={submit}
          disabled={loading}
          className="mt-3 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-60"
        >
          {loading ? "지급 중..." : "쿠폰 지급"}
        </button>

        {msg && (
          <div className="mt-3 rounded border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-700">
            {msg}
          </div>
        )}
        {err && (
          <div className="mt-3 rounded border border-red-200 bg-red-50 p-3 text-sm text-red-700">
            {err}
          </div>
        )}
      </div>
    </section>
  );
}
