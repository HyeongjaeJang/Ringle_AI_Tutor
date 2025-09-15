basic = MembershipPlan.find_or_create_by!(name: "Basic") do |p|
  p.duration_days = 30
  p.features      = ["AI 표현 학습"]
  p.price_cents   = 9900
end

premium = MembershipPlan.find_or_create_by!(name: "Premium") do |p|
  p.duration_days = 60
  p.features      = ["AI 표현 학습", "AI 롤플레잉", "AI 디스커션", "무제한 AI 분석"]
  p.price_cents   = 19900
end

user = User.find_or_create_by!(email: "test@example.com", name:"Jay", password_digest: "test1234")

user.coupons.find_or_create_by!(kind: "chat") do |c|
  c.remaining_uses = 10
  c.expires_at     = 60.days.from_now
end
