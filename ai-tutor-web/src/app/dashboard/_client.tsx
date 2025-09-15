"use client";
import React, { useEffect, useState } from "react";
import api from "@/lib/api";
import { useAuth } from "@/store/auth";
import Link from "next/link";
import { useMounted } from "@/utils/mount";
import { getErrorMessage } from "@/utils/errors";
import { Membership, Coupon, ApiResponse } from "@/types";

export default function DashboardClient() {
  const { user } = useAuth();
  const mount = useMounted();
  const [membership, setMembership] = useState<Membership | null>(null);
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async (): Promise<void> => {
      try {
        setLoading(true);
        setErr(null);

        const [membershipResponse, couponsResponse] = await Promise.all([
          api.get<ApiResponse<Membership | null>>(
            "/api/me/memberships/current",
          ),
          api.get<ApiResponse<Coupon[]>>("/api/me/coupons"),
        ]);

        setMembership(membershipResponse.data.data);
        setCoupons(couponsResponse.data.data || []);
      } catch (error: unknown) {
        const errorMessage = getErrorMessage(error);
        setErr(errorMessage);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  return (
    <section className="grid gap-6 md:grid-cols-2">
      <WelcomeCard name={mount ? user?.name : undefined} />
      <QuickActions />

      <Card title="Current Membership" loading={loading} error={err}>
        {loading ? (
          <span className="text-sm text-slate-500">Loading…</span>
        ) : membership?.active ? (
          <div className="text-sm">
            <div className="space-y-2">
              <div>
                <span className="font-medium">#</span>
                {membership.id || "N/A"}
              </div>
              <div>
                <span className="font-medium">Plan:</span>{" "}
                {membership.plan?.name || "N/A"}
              </div>
              <div>
                <span className="font-medium">Duration:</span>{" "}
                {membership.plan?.duration_days || "N/A"} days
              </div>
              <div className="space-y-2">
                <span className="font-medium">Features:</span>{" "}
                {membership.plan?.features.join(", ")}
              </div>
              <div>
                <span className="font-medium">Expires at:</span>{" "}
                {membership.ends_at?.slice(0, 10) || "Never"}
              </div>
            </div>
          </div>
        ) : (
          <p className="text-sm text-slate-600">활성 멤버십이 없습니다.</p>
        )}
        <div>
          {user?.role !== "admin" ? (
            <div className="mt-5">
              <Link
                href="/purchase"
                className="inline-block rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
              >
                멤버십 구매하기
              </Link>
            </div>
          ) : (
            <div className="flex gap-3 mt-5">
              <Link
                href="/admin/plans"
                className="inline-block rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
              >
                멤버십 관리하기
              </Link>
              <Link
                href="/admin/memberships"
                className="inline-block rounded-lg border px-4 py-2 text-sm font-medium hover:bg-slate-50"
              >
                유저에게 멤버십 관리
              </Link>
            </div>
          )}
        </div>
      </Card>

      <Card title="Coupons" loading={loading} error={err}>
        {user?.role == "admin" ? (
          <div>
            <p className="mt-1 text-slate-600">유저에게 쿠폰 지급</p>
            <Link
              href="/admin/coupons"
              className="mt-3 inline-block rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
            >
              관리 페이지로
            </Link>
          </div>
        ) : coupons.length > 0 ? (
          <ul className="space-y-2 text-sm">
            {coupons.map((coupon: Coupon) =>
              coupon.remaining_uses > 0 ? (
                <li key={coupon.id} className="rounded-lg border p-3">
                  <div className="font-medium">
                    {coupon.code || `#${coupon.id}`}
                  </div>
                  <div className="text-slate-600">Type: {coupon.kind}</div>
                  {coupon.discount && (
                    <div className="text-slate-600">
                      Discount: {coupon.discount}%
                    </div>
                  )}
                  <div className="text-slate-600">
                    Remaining uses: {coupon.remaining_uses}
                  </div>
                  {coupon.expires_at && (
                    <div className="text-slate-600">
                      Expires:{" "}
                      {new Date(coupon.expires_at).toLocaleDateString()}
                    </div>
                  )}
                </li>
              ) : null,
            )}
          </ul>
        ) : (
          !loading && (
            <p className="text-sm text-slate-600">보유 쿠폰이 없습니다.</p>
          )
        )}
      </Card>
    </section>
  );
}

interface CardProps {
  title: string;
  loading: boolean;
  error: string | null;
  children: React.ReactNode;
}

function Card({ title, loading, error, children }: CardProps) {
  return (
    <div className="rounded-2xl border bg-white p-5 shadow-sm">
      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-lg font-semibold">{title}</h2>
        {loading && (
          <span className="animate-pulse text-xs text-slate-500">Loading…</span>
        )}
      </div>
      {error ? (
        <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
          {error}
        </div>
      ) : (
        children
      )}
    </div>
  );
}

interface WelcomeCardProps {
  name?: string | null;
}

function WelcomeCard({ name }: WelcomeCardProps) {
  return (
    <div className="flex flex-col rounded-2xl border bg-gradient-to-br from-blue-50 to-white p-5 shadow-sm h-fit">
      <div className="flex gap-3 text-2xl font-bold text-slate-600">
        <div>Welcome</div>
        <div>{name ?? "User"}</div>
      </div>
      <p className="mt-10 text-slate-600">
        멤버십/쿠폰을 확인하고, 바로 채팅을 시작해 보세요.
      </p>
    </div>
  );
}

function QuickActions() {
  return (
    <div className="flex flex-col justify-between rounded-2xl border bg-white p-5 shadow-sm h-fit">
      <h2 className="text-lg font-semibold mb-7">Quick Actions</h2>
      <div className="flex flex-wrap gap-3">
        <Link
          href="/chat"
          className="rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-blue-700"
        >
          Go to Chat
        </Link>
        <Link
          href="/"
          className="rounded-lg border px-4 py-2.5 text-sm font-medium hover:bg-slate-50"
        >
          Home
        </Link>
      </div>
    </div>
  );
}
