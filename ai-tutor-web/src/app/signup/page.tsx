"use client";
import api from "@/lib/api";
import { useForm } from "react-hook-form";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { getErrorMessage } from "@/utils/errors";

type Form = {
  email: string;
  name: string;
  password: string;
  admin_code?: string;
};

export default function SignupPage() {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<Form>();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [serverErr, setServerErr] = useState<string | null>(null);
  const [showPw, setShowPw] = useState(false);

  const onSubmit = async (data: Form) => {
    try {
      setLoading(true);
      setServerErr(null);
      await api.post("/auth/signup", data);
      router.push("/login");
    } catch (err: unknown) {
      const errorMessage = getErrorMessage(err);
      setServerErr(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-[80vh] grid place-items-center bg-slate-50 px-4">
      <div className="w-full max-w-sm rounded-2xl border bg-white p-6 shadow-sm">
        <header className="mb-6">
          <h1 className="text-2xl font-bold">회원가입</h1>
          <p className="mt-1 text-sm text-slate-600">
            기본 정보를 입력해 계정을 생성하세요.
          </p>
        </header>

        {serverErr && (
          <div
            role="alert"
            className="mb-4 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700"
          >
            {serverErr}
          </div>
        )}

        <form
          onSubmit={handleSubmit(onSubmit)}
          className="space-y-4"
          noValidate
        >
          <div>
            <label htmlFor="email" className="block text-sm font-medium">
              이메일
            </label>
            <input
              id="email"
              type="email"
              placeholder="you@example.com"
              className="mt-1 w-full rounded-lg border px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500"
              aria-invalid={!!errors.email || undefined}
              {...register("email", {
                required: "이메일을 입력하세요.",
                pattern: {
                  value: /\S+@\S+\.\S+/,
                  message: "이메일 형식이 아닙니다.",
                },
              })}
            />
            {errors.email && (
              <p className="mt-1 text-xs text-red-600">
                {errors.email.message}
              </p>
            )}
          </div>

          <div>
            <label htmlFor="name" className="block text-sm font-medium">
              이름
            </label>
            <input
              id="name"
              placeholder="홍길동"
              className="mt-1 w-full rounded-lg border px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500"
              aria-invalid={!!errors.name || undefined}
              {...register("name", { required: "이름을 입력하세요." })}
            />
            {errors.name && (
              <p className="mt-1 text-xs text-red-600">{errors.name.message}</p>
            )}
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium">
              비밀번호
            </label>
            <div className="mt-1 flex gap-2">
              <input
                id="password"
                type={showPw ? "text" : "password"}
                placeholder="최소 6자 이상"
                className="w-full rounded-lg border px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500"
                aria-invalid={!!errors.password || undefined}
                {...register("password", {
                  required: "비밀번호를 입력하세요.",
                  minLength: { value: 6, message: "6자 이상 입력하세요." },
                })}
              />
              <button
                type="button"
                onClick={() => setShowPw((v) => !v)}
                className="shrink-0 rounded-lg border px-3 text-sm hover:bg-slate-50"
              >
                {showPw ? "숨김" : "보기"}
              </button>
            </div>
            {errors.password && (
              <p className="mt-1 text-xs text-red-600">
                {errors.password.message}
              </p>
            )}
          </div>

          <div>
            <label htmlFor="admin_code" className="block text-sm font-medium">
              관리자 코드 <span className="text-slate-400">(선택)</span>
            </label>
            <input
              id="admin_code"
              placeholder="(선택) 관리자 코드"
              className="mt-1 w-full rounded-lg border px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500"
              {...register("admin_code")}
            />
            <p className="mt-1 text-xs text-slate-500">
              어드민 권한이 필요한 경우에만 입력하세요.
            </p>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="mt-2 inline-flex w-full items-center justify-center rounded-lg bg-blue-600 px-4 py-2.5 font-medium text-white hover:bg-blue-700 disabled:opacity-60"
            aria-busy={loading}
          >
            {loading ? "계정 생성 중..." : "계정 생성"}
          </button>
        </form>

        <div className="mt-6 text-center text-sm text-slate-600">
          이미 계정이 있으신가요?{" "}
          <Link
            href="/login"
            className="font-medium text-blue-700 hover:underline"
          >
            로그인
          </Link>
        </div>
      </div>
    </main>
  );
}
