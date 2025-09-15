"use client";

import { useEffect, useState } from "react";
import api from "@/lib/api";
import { getErrorMessage } from "@/utils/errors";
import { useRouter } from "next/navigation";

type Plan = {
  id: number;
  name: string;
  duration_days: number;
  price_cents: number;
  features: string[];
};

export default function GrantMembershipClient() {
  const router = useRouter();
  const [plans, setPlans] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);

  const [userId, setUserId] = useState("");
  const [planName, setPlanName] = useState("");
  const [msg, setMsg] = useState<string | null>(null);

  const [cancelUserId, setCancelUserId] = useState("");
  const [membershipId, setMembershipId] = useState("");

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        setErr(null);
        const res = await api.get("/api/admin/membership_plans");
        setPlans(res.data?.data || []);
      } catch (e: unknown) {
        const error = getErrorMessage(e);
        setErr(error);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const grant = async () => {
    try {
      setMsg(null);
      setErr(null);
      if (!userId || !planName)
        throw new Error("user id와 plan_name을 입력하세요.");
      const res = await api.post(`/api/admin/users/${userId}/memberships`, {
        plan_name: planName,
      });
      if (!res.data?.success && !res.data?.data)
        throw new Error(res.data?.error || "지급 실패");
      setMsg(`지급 완료: membership id ${res.data.data?.id ?? "(확인 필요)"}`);
      setTimeout(() => {
        router.replace("/dashboard");
        router.refresh();
      }, 2000);
    } catch (e: unknown) {
      const error = getErrorMessage(e);
      setErr(error);
    }
  };

  const cancel = async () => {
    try {
      setMsg(null);
      setErr(null);
      if (!cancelUserId || !membershipId)
        throw new Error("user id와 membership id를 입력하세요.");
      const res = await api.delete(
        `/api/admin/users/${cancelUserId}/memberships/${membershipId}`,
      );
      if (!res.data?.success && !res.data?.data)
        throw new Error(res.data?.error || "회수 실패");
      setMsg("회수(취소) 완료");
      setTimeout(() => {
        router.replace("/dashboard");
        router.refresh();
      }, 2000);
    } catch (e: unknown) {
      const error = getErrorMessage(e);
      setErr(error);
    }
  };

  return (
    <section className="space-y-6">
      <div className="rounded-2xl border bg-white p-5 shadow-sm">
        <h2 className="mb-3 text-lg font-semibold">멤버십 지급</h2>

        <div className="grid gap-3 md:grid-cols-3">
          <input
            className="rounded border p-2"
            placeholder="user id"
            value={userId}
            onChange={(e) => setUserId(e.target.value)}
          />
          <select
            className="rounded border p-2"
            value={planName}
            onChange={(e) => setPlanName(e.target.value)}
          >
            <option value="">-- plan 선택 --</option>
            {plans.map((p) => (
              <option key={p.id} value={p.name}>
                {p.name} · {p.duration_days}d · {p.price_cents.toLocaleString()}
                원
              </option>
            ))}
          </select>
          <button
            onClick={grant}
            className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
            disabled={loading}
          >
            지급
          </button>
        </div>

        {loading && (
          <div className="mt-3 text-sm text-slate-500">플랜 불러오는 중…</div>
        )}
      </div>

      <div className="rounded-2xl border bg-white p-5 shadow-sm">
        <h2 className="mb-3 text-lg font-semibold">멤버십 회수(취소)</h2>
        <div className="grid gap-3 md:grid-cols-3">
          <input
            className="rounded border p-2"
            placeholder="user id"
            value={cancelUserId}
            onChange={(e) => setCancelUserId(e.target.value)}
          />
          <input
            className="rounded border p-2"
            placeholder="membership id"
            value={membershipId}
            onChange={(e) => setMembershipId(e.target.value)}
          />
          <button
            onClick={cancel}
            className="rounded-lg border px-4 py-2 text-sm font-medium hover:bg-slate-50"
          >
            회수
          </button>
        </div>
        <p className="mt-2 text-xs text-slate-500">
          * 회수하려면 membership id가 필요합니다. (지급 응답으로 id가 반환됨)
        </p>
      </div>
      {err && (
        <div className="mt-3 rounded border border-red-200 bg-red-50 p-3 text-sm text-red-700">
          {err}
        </div>
      )}
      {msg && (
        <div className="mt-3 rounded border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-700">
          {msg}
        </div>
      )}
    </section>
  );
}
