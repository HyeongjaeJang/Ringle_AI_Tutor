# Ringle AI Tutor Backend

API-only Rails 백엔드. 회원가입/로그인(JWT), 멤버십 플랜, 결제(Mock), 쿠폰, 대화 세션 로깅을 제공합니다.

## Requirements

- Ruby 3.3+
- Rails 8
- PostgreSQL
- Bundler

## Environment Variables

로컬 기본값이 있으므로 꼭 설정하지 않아도 동작하지만, 명시하면 더 안전합니다.

- `JWT_SECRET` (기본: devsecret)
- `ADMIN_TOKEN` (기본: admin123) — Admin API 헤더 보호용
- `ADMIN_REG_CODE` (기본: letmein) — 관리자 회원가입 코드

### bash/zsh 환경변수 설정

```bash
export JWT_SECRET=devsecret
export ADMIN_TOKEN=admin123
export ADMIN_REG_CODE=letmein
```

### fish shell 환경변수 설정

```fish
set -x JWT_SECRET devsecret
set -x ADMIN_TOKEN admin123
set -x ADMIN_REG_CODE letmein
```

### .env 파일 환경변수 설정
```.env
JWT_SECRET=devsecret
ADMIN_TOKEN=admin123
ADMIN_REG_CODE=letmein
```

## Setup

```bash
git clone <repo>
cd ringle_api
bundle install

# DB 준비 + seed (예: 30일 Basic, 60일 Premium 플랜 생성)
bin/rails db:create db:migrate db:seed

# 서버 실행
rails s
```

참고: 일부 컨트롤러에서 실패 응답 코드를 `:unprocessable_content`로 사용합니다. Rack 3에서 `:unprocessable_entity` 경고가 뜨는 경우를 피하기 위함입니다.

## Running Tests

```bash
# 테스트 DB 준비
bin/rails db:create db:migrate RAILS_ENV=test

# 전체 테스트
bundle exec rspec --format documentation
```

## Seeds

`db/seeds.rb`는 기본적으로 아래 플랜을 생성합니다.

- **Basic**: 30일, features: ["study"]
- **Premium**: 60일, features: ["study","chat","analysis"]

필요시 수정 후 `bin/rails db:seed` 재실행.

## API Endpoints Summary

| Method    | Path                                            | Auth          | Description            |
| --------- | ----------------------------------------------- | ------------- | ---------------------- |
| POST      | `/api/v1/auth/signup`                           | -             | 회원가입               |
| POST      | `/api/v1/auth/login`                            | -             | 로그인 (토큰 발급)     |
| GET       | `/api/v1/me/memberships/current`                | Bearer        | 현재 멤버십 조회       |
| GET       | `/api/v1/me/coupons`                            | Bearer        | 내 쿠폰 목록           |
| POST      | `/api/v1/conversation_sessions`                 | Bearer        | 대화 세션 생성         |
| PATCH     | `/api/v1/conversation_sessions/:id`             | Bearer        | 대화 턴 추가           |
| POST      | `/api/v1/conversation_sessions/:id/end_session` | Bearer        | 대화 세션 종료         |
| POST      | `/api/v1/payments/mock_charge`                  | Bearer        | 결제 (Mock)            |
| GET       | `/api/v1/admin/membership_plans`                | X-Admin-Token | 멤버십 플랜 목록       |
| POST      | `/api/v1/admin/membership_plans`                | X-Admin-Token | 멤버십 플랜 생성       |
| PUT/PATCH | `/api/v1/admin/membership_plans/:id`            | X-Admin-Token | 멤버십 플랜 수정       |
| DELETE    | `/api/v1/admin/membership_plans/:id`            | X-Admin-Token | 멤버십 플랜 삭제       |
| POST      | `/api/v1/admin/users/:user_id/memberships`      | X-Admin-Token | 사용자에게 멤버십 할당 |
| DELETE    | `/api/v1/admin/users/:user_id/memberships/:id`  | X-Admin-Token | 사용자 멤버십 취소     |
| POST      | `/api/v1/admin/users/:user_id/coupons`          | X-Admin-Token | 사용자에게 쿠폰 생성   |
| POST      | `/api/v1/admin/payments/mock_charge`            | X-Admin-Token | 관리자 결제 처리       |

## API Usage Examples

### Authentication

#### 1. 일반 사용자 회원가입

```bash
curl -X POST http://localhost:3000/api/v1/auth/signup \
  -H "Content-Type: application/json" \
  -d '{"email":"user1@example.com","name":"User One","password":"secret1234"}'
```

#### 2. 관리자 회원가입

```bash
curl -X POST http://localhost:3000/api/v1/auth/signup \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@example.com","name":"Admin User","password":"admin1234","admin_code":"letmein"}'
```

#### 3. 로그인 & 토큰 획득

**Fish Shell:**

```fish
set RAW (curl -s -X POST http://localhost:3000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"user1@example.com","password":"secret1234"}')

set TOKEN (echo $RAW | ruby -rjson -e 'json=JSON.parse(STDIN.read); puts json["data"] && json["data"]["token"] || ""')
echo "Token: $TOKEN"

set RAW_ADMIN (curl -s -X POST http://localhost:3000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@example.com","password":"admin1234"}')

echo "Admin Login Response: $RAW_ADMIN"
set ADMIN_TOKEN (echo $RAW_ADMIN | ruby -rjson -e 'json=JSON.parse(STDIN.read); puts json["data"] && json["data"]["token"] || ""')
echo "Admin Token: $ADMIN_TOKEN"
```

**Bash/Zsh:**

```bash
RAW=$(curl -s -X POST http://localhost:3000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"user1@example.com","password":"secret1234"}')

TOKEN=$(echo "$RAW" | ruby -rjson -e 'json=JSON.parse(STDIN.read); puts json["data"] && json["data"]["token"] || ""')
echo "Token: $TOKEN"
```

### User APIs

#### 현재 멤버십 조회

```bash
curl -H "Authorization: Bearer $TOKEN" \
  http://localhost:3000/api/v1/me/memberships/current
```

#### 내 쿠폰 목록 조회

```bash
curl -H "Authorization: Bearer $TOKEN" \
  http://localhost:3000/api/v1/me/coupons
```

#### 결제 처리

```bash
curl -X POST http://localhost:3000/api/v1/payments/mock_charge \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{"plan_name":"Premium","amount_cents":19900,"provider_txn_id":"user_txn_001"}'
```

### Admin APIs

#### 멤버십 플랜 목록 조회

```bash
curl -H "Authorization: Bearer $ADMIN_TOKEN" \
  http://localhost:3000/api/v1/admin/membership_plans
```

#### 새 멤버십 플랜 생성

```bash
curl -X POST http://localhost:3000/api/v1/admin/membership_plans \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -d '{"membership_plan":{"name":"Test Plan","duration_days":15,"price_cents":5000,"features":["study","chat"]}}'
```

#### 사용자에게 멤버십 할당

```bash
curl -X POST http://localhost:3000/api/v1/admin/users/1/memberships \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -d '{"plan_name":"Premium"}'
```

#### 사용자에게 쿠폰 생성

```bash
curl -X POST http://localhost:3000/api/v1/admin/users/1/coupons \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -d '{"coupon":{"kind":"chat","remaining_uses":5,"expires_at":"2025-12-31T23:59:59Z"}}'
```

### Conversation Sessions

#### 대화 세션 생성

```fish
set SESSION_RAW (curl -s -X POST http://localhost:3000/api/v1/conversation_sessions \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN")

set SESSION_ID (echo $SESSION_RAW | ruby -rjson -e 'json=JSON.parse(STDIN.read); puts json["data"] && json["data"]["session_id"] || ""')
```

#### 대화 턴 추가

```bash
curl -X PATCH http://localhost:3000/api/v1/conversation_sessions/$SESSION_ID \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{"role":"user","content":"Hello, how are you?"}'
```

#### 대화 세션 종료

```bash
curl -X POST http://localhost:3000/api/v1/conversation_sessions/$SESSION_ID/end_session \
  -H "Authorization: Bearer $TOKEN"
```

## Testing Commands

### Fish Shell 테스트 스크립트

전체 테스트 플로우를 실행하려면:

```fish
# 1. 사용자 생성 및 로그인
curl -X POST http://localhost:3000/api/v1/auth/signup \
  -H "Content-Type: application/json" \
  -d '{"email":"testuser@example.com","name":"Test User","password":"test1234"}'

# 2. 토큰 획득
set TOKEN_RAW (curl -s -X POST http://localhost:3000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"testuser@example.com","password":"test1234"}')
set TOKEN (echo $TOKEN_RAW | ruby -rjson -e 'json=JSON.parse(STDIN.read); puts json["data"]["token"]')

# 3. 멤버십 확인
curl -H "Authorization: Bearer $TOKEN" \
  http://localhost:3000/api/v1/me/memberships/current

# 4. 쿠폰 확인
curl -H "Authorization: Bearer $TOKEN" \
  http://localhost:3000/api/v1/me/coupons

echo "Basic flow test completed!"
```

### Error Test Cases

#### 잘못된 토큰 테스트

```bash
curl -H "Authorization: Bearer invalid_token" \
  http://localhost:3000/api/v1/me/memberships/current
```

#### 존재하지 않는 사용자로 로그인 시도

```bash
curl -X POST http://localhost:3000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"nonexistent@example.com","password":"wrongpassword"}'
```

#### 필수 파라미터 누락으로 결제 시도

```bash
curl -X POST http://localhost:3000/api/v1/payments/mock_charge \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{"plan_name":"Premium"}'
```

## Cron / Scheduling

멤버십 만료 배치 작업 (매일 00:05):

```bash
5 0 * * * cd /APP/PATH && bin/rails memberships:expire RAILS_ENV=production >> log/cron.log 2>&1
```

ActiveJob 큐를 사용할 경우 `Memberships::ExpireJob.perform_later`로 대체하고, 백엔드(Solid Queue/Sidekiq 등)를 설정하세요.

## Common Troubleshooting

- **401 Unauthorized**: 토큰 누락/만료, `Authorization: Bearer TOKEN` 확인
- **403 Forbidden (Admin)**: X-Admin-Token 값 확인 (admin123 기본)
- **422 경고**: Rack 3 환경에서 `:unprocessable_entity` 심볼 경고가 보이면 `:unprocessable_content` 사용
- **Autoloading 오류**: 파일 경로/클래스 이름의 네임스페이스(예: `Api::V1::Me::MembershipsController`)가 정확한지 확인

## Development Tips

### 토큰 변수 관리 (Fish Shell)

```fish
# 현재 토큰들 확인
echo "User Token: $USER_TOKEN"
echo "Admin Token: $ADMIN_TOKEN"
echo "Session ID: $SESSION_ID"

# 토큰 변수 재설정 (필요시)
set USER_TOKEN "your_user_token_here"
set ADMIN_TOKEN "your_admin_token_here"
set SESSION_ID "your_session_id_here"
```

### 빠른 관리자 설정

```fish
# 관리자 계정 생성 및 토큰 저장
set RAW_ADMIN (curl -s -X POST http://localhost:3000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@example.com","password":"admin1234"}')

set ADMIN_TOKEN (echo $RAW_ADMIN | ruby -rjson -e 'json=JSON.parse(STDIN.read); puts json["data"] && json["data"]["token"] || ""')
```

이 README는 개발자들이 API를 쉽게 테스트하고 사용할 수 있도록 실용적인 예제와 함께 구성되어 있습니다.
