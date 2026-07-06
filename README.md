# 🔗 LinkedIn Clone 서비스

React와 Express, MongoDB를 활용하여 구현한 프리미엄 디자인의 **LinkedIn 클론 서비스**입니다.  
사용자 인증부터 게시글 피드, 인맥 네트워크 관리, 실시간 알림, 그리고 멀티미디어 업로드 및 이메일 전송까지 링크드인의 핵심 비즈니스 로직을 완벽하게 구현했습니다.

---

## 🛠️ 기술 스택 (Tech Stack)

### Backend
* **Runtime**: Node.js (ES Modules)
* **Framework**: Express.js
* **Database**: MongoDB (Mongoose ODM)
* **Authentication**: JSON Web Tokens (JWT) & bcryptjs (비밀번호 해시)
* **Storage**: Cloudinary (프로필/배너/게시글 이미지 업로드 및 호스팅)
* **Email Service**: Mailtrap (댓글 및 1촌 수락 시 자동 이메일 알림 발송)

### Frontend
* **Framework**: React (Vite 빌드 도구 활용)
* **Styling**: Tailwind CSS & DaisyUI (다크/글래스모피즘 테마의 프리미엄 UI)
* **State Management & Fetching**: `@tanstack/react-query` (React Query)를 통한 서버 상태 동기화 및 캐싱 관리
* **Routing**: React Router DOM (v7)
* **Icons**: Lucide React

---

## 📁 프로젝트 구조 (Directory Structure)

```text
webMobile-Linkedin/
 ├─ backend/             # 백엔드 소스 코드
 │   ├─ src/
 │   │   ├─ controllers/ # API 비즈니스 로직
 │   │   ├─ models/      # Mongoose 데이터베이스 스키마
 │   │   ├─ routes/      # 라우트 설정 (auth, connection, notification, post, user)
 │   │   ├─ middleware/  # 보호된 라우트 검증 미들웨어
 │   │   ├─ emails/      # Mailtrap 이메일 발송 템플릿 및 핸들러
 │   │   └─ lib/         # DB 커넥션 및 Cloudinary 설정 라이브러리
 │   ├─ server.js        # 백엔드 엔트리포인트 (포트 3000 실행)
 │   └─ package.json
 │
 ├─ frontend/            # 프론트엔드 소스 코드
 │   ├─ src/
 │   │   ├─ componnents/ # 공통 UI 컴포넌트 (Navbar, Sidebar, PostCard, CommentSection 등)
 │   │   ├─ pages/       # 라우팅 페이지 (HomePage, ProfilePage, NotificationsPage, ConnectionsPage 등)
 │   │   ├─ App.jsx      # 리액트 엔트리 컴포넌트 및 라우터 설정
 │   │   ├─ main.jsx     # 리액트 렌더링 진입점
 │   │   └─ index.css    # Tailwind 및 기본 스타일 시트
 │   ├─ vite.config.js   # Vite 빌드 설정 (백엔드 3000포트 프록시 연동)
 │   └─ package.json
 │
 └─ README.md            # 프로젝트 안내 문서 (본 파일)
```

---

## 🚀 주요 기능 (Core Features)

### 1. 사용자 인증 (Authentication)
* **회원가입/로그인/로그아웃**: JWT 토큰을 쿠키에 담아 세션을 유지합니다.
* **보호된 라우트**: 로그인하지 않은 사용자는 로그인 페이지(`/login`)로 리다이렉트되며, 로그인한 유저는 홈 페이지(`/`)로 이동합니다.

### 2. 피드 및 소통 (Post & Comment)
* **피드글 작성**: 텍스트 작성은 물론, 이미지를 드래그하거나 선택하여 첨부할 수 있습니다 (Base64로 변환 후 Cloudinary에 안전하게 업로드 및 최적화).
* **좋아요 (Like/Unlike)**: 피드글에 좋아요를 누르거나 취소할 수 있으며, 내 글이 아닌 경우 작성자에게 실시간 알림이 발송됩니다.
* **댓글 (Comment)**: 댓글 실시간 작성 및 삭제 기능을 지원하며, 타인이 댓글을 작성하면 글쓴이에게 이메일 알림이 자동으로 전송됩니다.
* **게시글 삭제**: 내가 쓴 글은 즉각 삭제가 가능하며 Cloudinary에 업로드되었던 이미지도 스토리지에서 함께 삭제됩니다.

### 3. 인맥 네트워크 관리 (Connections)
* **인맥 추천 (Suggestions)**: 아직 1촌 관계가 아니며 나 자신도 아닌 유저를 추천 인맥으로 추천합니다.
* **1촌 신청 및 대기**: 추천 카드에서 `1촌 맺기`를 누르면 즉시 신청이 전송되며 대기 상태로 변경됩니다.
* **받은 1촌 요청 관리**: 누군가 나에게 1촌 신청을 보내면 홈페이지 우측 상단에 **받은 1촌 요청** 목록이 실시간으로 활성화되며, 여기서 즉시 **수락** 또는 **거절**을 결정할 수 있습니다.
* **내 인맥 관리 페이지 (`/network`)**: 현재 맺어진 모든 1촌들의 목록을 그리드 뷰로 모아보고, 필요시 인맥 관계를 손쉽게 해제할 수 있습니다.

### 4. 알림 센터 (`/notifications`)
* 좋아요, 댓글 등록, 1촌 수락 등 유저의 활동으로 생성된 알림 목록을 한눈에 제공합니다.
* 미확인 알림 수(Badge)가 상단 네비게이션 바에 실시간으로 표시됩니다.
* 알림 클릭 시 읽음 처리 기능 및 해당 알림과 연관된 게시글을 즉석에서 프리미엄 팝업 모달로 띄워 상세 조회 및 댓글 소통을 가능하게 합니다.

### 5. 개인 프로필 (`/profile/:username`)
* **프로필 및 배너 이미지 업로드**: 내 프로필에서 배너와 아바타 이미지를 실시간으로 수정하여 Cloudinary로 업로드합니다.
* **기본 정보 및 소개**: 이름, 헤드라인, 위치 정보 및 상세 자기소개(About)를 즉각 수정할 수 있습니다.
* **경력/학력/보유 기술**: 내 이력을 동적으로 추가/삭제하여 프로필을 풍성하게 가꿀 수 있습니다.
* **상대방과의 일촌 관계 감지**: 타인의 프로필 페이지를 방문할 시, 나와의 관계에 맞추어 `1촌 끊기`, `요청 수락/거절`, `1촌 맺기` 버튼이 유동적으로 활성화됩니다.

---

## ⚙️ 환경 변수 설정 (Configuration)

프로젝트 실행을 위해서는 `backend/` 폴더 아래에 `.env` 파일을 생성하고 아래 변수들을 알맞게 구성해야 합니다.  
*(보안을 위해 실제 비밀키 정보는 절대 Github에 업로드하지 마십시오)*

```env
# Server Port
PORT=3000

# Database URI (MongoDB Atlas 또는 Local MongoDB)
MONGO_URI=mongodb+srv://<username>:<password>@cluster.mongodb.net/linkedin-db

# JWT Secret Key (임의의 무작위 문자열)
JWT_SECRET=your_jwt_secret_key_here

# Client URL (Vite 기본 주소)
CLIENT_URL=http://localhost:5173

# Cloudinary Credentials (이미지 업로드용)
CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret

# Mailtrap Credentials (이메일 발송용)
MAILTRAP_TOKEN=your_mailtrap_api_token
MAILTRAP_SENDER_EMAIL=mailtrap@yourdomain.com
```

---

## 🏃‍♂️ 실행 방법 (How to Run)

프로젝트를 로컬 컴퓨터에서 구동하는 방법입니다.

### 1. 백엔드 실행 (Express Server)
```bash
cd backend
npm install
npm run dev
```
* 백엔드 서버가 `http://localhost:3000` 에서 실행되며 데이터베이스 연결을 대기합니다.

### 2. 프론트엔드 실행 (React Dev Server)
```bash
cd frontend
npm install
npm run dev
```
* 프론트엔드가 `http://localhost:5173` 에서 구동됩니다.
* Vite Proxy 설정에 의해 프론트엔드에서 `/api/...`로 보내는 모든 비동기 요청은 백엔드 서버(`http://localhost:3000`)로 자동 우회 전달됩니다.
