import { AxiosError } from "@/types";

export const isAxiosError = (error: unknown): error is AxiosError => {
  return typeof error === "object" && error !== null && "response" in error;
};

export const isErrorWithMessage = (
  error: unknown,
): error is { message: string } => {
  return (
    typeof error === "object" &&
    error !== null &&
    "message" in error &&
    typeof (error as { message: unknown }).message === "string"
  );
};

export const getErrorMessage = (error: unknown): string => {
  if (isAxiosError(error)) {
    return (
      error.response?.data?.error ||
      error.response?.data?.message ||
      error.message ||
      "API 요청에 실패했습니다."
    );
  }

  if (isErrorWithMessage(error)) {
    return error.message;
  }

  if (typeof error === "string") {
    return error;
  }

  return "데이터를 불러오지 못했습니다.";
};
