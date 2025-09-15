export interface MembershipPlan {
  id: number;
  name: string;
  duration_days: number;
  price_cents: number;
  features: string[];
  created_at: string;
  updated_at: string;
}

export interface PlanForm {
  name: string;
  duration_days: number;
  price_cents: number;
  features_csv: string;
}

export interface Membership {
  id: number;
  active: boolean;
  plan: MembershipPlan | null;
  starts_at: string;
  ends_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface Coupon {
  id: number;
  code: string;
  kind: string;
  discount?: number;
  remaining_uses: number;
  expires_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface ApiResponse<T> {
  data: T;
  message?: string;
}

export interface ApiErrorResponse {
  error?: string;
  message?: string;
}

export interface AxiosError {
  response?: {
    data?: ApiErrorResponse;
    status: number;
  };
  message?: string;
}

export type Plan = {
  id: number;
  name: string;
  price_cents: number;
  duration_days: number;
  features: string[];
};
