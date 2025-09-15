# Ringle AI Tutor

영어 회화 연습을 위한 **Next.js + Rails + OpenAI** 기반 웹 앱입니다.  
역할극(Scenario)로 대화를 시작하고, 사용자가 채팅 또는 음성 입력(STT)으로 답하면 AI가 교정/응답/후속 질문을 제공합니다.  
결제(모의), 멤버십/쿠폰, 대화 세션 생성·종료, 어드민 관리(플랜/쿠폰/멤버십 지급)를 포함합니다.

---

## ✅ 핵심 기능

- **역할극 시나리오** 선택 → AI가 상황을 짧게 설명하고 대화 시작
- **문장 교정 우선**(반드시 응답의 맨 앞에 교정 + 짧은 이유)
- **채팅 + 음성 입력**
- **AI 음성 재생(TTS)**: AI 응답을 음성으로 듣기
- **대화 세션 생성/종료**: 탭 닫기/새로고침 시에도 종료 신호 전송
- **멤버십/쿠폰 권한**: Premium 무제한 / `chat, free_trial` 쿠폰 1회 차감
- **어드민**: 플랜/쿠폰/멤버십 지급 페이지

---

## 🧱 기술 스택 & 선정 배경

- **Frontend**: Next.js (App Router) + React + Tailwind  
  - **Server Actions + API Route 프록시**로 OpenAI 키/쿠키를 서버에서만 처리 → 보안 강화  
  - **음성 파이프라인**:
    - **STT**: `MicRecorder.tsx`로 로컬 녹음 → `/api/stt`(Next Route Handler) 업로드 → **서버에서 Whisper 기반 STT** 수행 → 텍스트 반환  
    - **TTS**: `/api/tts` 경유 **MP3 Progressive 스트리밍** → `<audio>` 재생

- **Backend**: Rails (API mode, PostgreSQL)
  - **JWT + HttpOnly 쿠키 인증**: `ApplicationController#current_user`에서 `Authorization` 헤더 또는 `cookies.encrypted[:token]`을 해석
  - **도메인 로직**: 멤버십/쿠폰/세션/결제(모의)/권한 체크(`ChatGatekeeper`)를 컨트롤러/서비스 레이어에 분리

- **AI**: OpenAI (대화/교정, STT, TTS)
  - **Chat/교정**: `gpt-4o-mini`
  - **TTS**: `tts-1` (MP3 스트림 반환)
  - **STT**: `whisper-1` (업로드형 전사; 서버 측에서 처리)

> **선정 배경**  
> 1) **일관성/호환성**: 브라우저 **Web Speech(실시간 STT)** 는 브라우저·로케일별 편차가 커서 제외. 업로드형 STT는 모든 환경에서 동일 품질 보장.  
> 2) **보안**: OpenAI 키와 인증 쿠키는 **서버 전용**(Server Actions/Route Handlers)에서만 사용 → 노출 최소화.  
> 3) **확장성**: 음성/결제/세션 같은 **도메인 규칙은 Rails**에 집중시켜 테스트·권한·감사를 단순화.

---

## 실행 방법

### 사전 요구사항
- **Node.js** ≥ 18.x / **npm** ≥ 9.x  
- **Ruby** ≥ 3.3.x / **Bundler** ≥ 2.x  
- PostgreSQL준비 — 실제 사용 시 `database.yml`/환경변수에 맞춰 설정

### git
```
git clone https://github.com/HyeongjaeJang/Ringle_AI_Tutor.git
cd Ringle_AI_Tutor
```

### A. Backend (Rails)
```bash
데이터베이스 환경변수들은 이렇게 설정되어있습니다.
바꿔야한다면 백엔드에서 config/database.yml의 설정을 바꿔주십시요.
  adapter: postgresql
  encoding: unicode
  # For details on connection pooling, see Rails configuration guide
  # https://guides.rubyonrails.org/configuring.html#database-pooling
  pool: <%= ENV.fetch("RAILS_MAX_THREADS") { 5 } %>
  host: 127.0.0.1
  port: 5432
  username: postgres
  password: 123

cd ringle_ai_tutor
bundle install
bin/rails db:drop db:create db:migrate db:seed

# 서버 실행
rails s -p 4000
# → http://localhost:4000
```

### B. Frontend
```bash
cd ai-tutor-web
npm install

.env.sample 파일을 .env로 바꿔주십시요. OpenAI API키는 제가 가지고있는 credit으로 돌아가고 있습니다.
# .env.sample 예시
# NEXT_PUBLIC_API_BASE_URL=http://localhost:4000/api/v1
# OPENAI_API_KEY="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"


# 개발 서버
npm run dev
# → http://localhost:3000
```

중요 포인트

API 프록시: app/api/**/route.ts에서 Rails로 쿠키 포함 전달

예) /api/stt, /api/tts → OpenAI/백엔드로 전달 후 응답 반환

Server Actions: chat/actions.ts에서 폼/뮤테이션 등을 서버에서 직접 처리

대화 세션 종료: app/conversation_sessions/[id]/end_session/route.ts

음성 기능

components/MicRecorder.tsx: 업로드형 STT + 파형 표시

## 테스트
```bash
cd ringle_ai_tutor
bundle exec rspec
```
