# 🔗 LinkedIn Clone Full-Stack 서비스 (Web & Mobile)

이 프로젝트는 React(Web)와 Expo React Native(Mobile), 그리고 Express.js(Backend)와 MongoDB를 결합하여 개발한 **Vite 웹 & Expo 모바일 링크드인 클론 풀스택 서비스**입니다.  

초보자분들도 프로젝트의 전체 흐름을 완벽하게 파악하고 쉽게 실행해볼 수 있도록, 개발 셋업부터 작성 순서, 핵심 기능까지 상세하게 정리해 두었습니다.

---

## 🛠️ 기술 스택 (Tech Stack)

### 1. Backend (공통)
* **Runtime**: Node.js (ES Modules)
* **Framework**: Express.js
* **Database**: MongoDB (Mongoose ODM)
* **Authentication**: JSON Web Tokens (JWT) & bcryptjs (비밀번호 암호화)
* **Storage**: Cloudinary (프로필/배너/게시글 이미지 업로드 및 호스팅)
* **Email Service**: Mailtrap (댓글 작성 시 자동 이메일 알림 발송)

### 2. Web Frontend (`frontend/`)
* **Framework**: React (Vite 빌드 도구 활용)
* **Styling**: Tailwind CSS & DaisyUI (다크/글래스모피즘 테마의 프리미엄 UI)
* **State Management & Fetching**: `@tanstack/react-query` (React Query)를 통한 서버 상태 동기화 및 캐싱 관리
* **Routing**: React Router DOM (v7)

### 3. Mobile Frontend (`mobile/`)
* **Framework**: Expo (React Native) & Expo Router (파일 기반 라우팅)
* **Styling**: NativeWind (React Native용 Tailwind CSS)
* **State Management**: Zustand + AsyncStorage (JWT 토큰 및 사용자 정보 영구 저장)
* **Image Processing**: `expo-image` & `expo-image-picker` (모바일 앨범 및 업로드 최적화)

---

## 📁 프로젝트 구조 (Directory Structure)

```text
webMobile-Linkedin/
 ├─ backend/             # 백엔드 Express 소스 코드
 │   ├─ src/
 │   │   ├─ controllers/ # API 비즈니스 로직 (auth, connection, notification, post, user)
 │   │   ├─ models/      # Mongoose DB 스키마 (User, Post, Notification, Connection)
 │   │   ├─ routes/      # 라우트 핸들러 매핑
 │   │   ├─ middleware/  # 보호된 라우트(protectRoute) 검증 미들웨어
 │   │   ├─ emails/      # Mailtrap 이메일 발송 템플릿
 │   │   └─ lib/         # DB 연결, Cloudinary 설정, JWT 토큰 발급 유틸
 │   ├─ server.js        # 백엔드 엔트리포인트 (포트 3000)
 │   └─ package.json
 │
 ├─ frontend/            # 웹 프론트엔드 React (Vite)
 │   ├─ src/
 │   │   ├─ components/  # 웹 공통 UI 컴포넌트
 │   │   ├─ pages/       # 각 라우팅 페이지 (Home, Profile, Notifications, Network)
 │   │   ├─ App.jsx      # 리액트 라우터 및 상태 엔트리
 │   │   └─ index.css    # Tailwind 및 테마 스타일링
 │   ├─ vite.config.js   # 백엔드 API 포트(3000) 프록시 연동 설정
 │   └─ package.json
 │
 └─ mobile/              # 모바일 프론트엔드 React Native (Expo)
     ├─ app/             # Expo Router 파일 기반 라우팅 폴더
     │   ├─ (auth)/      # 로그인, 회원가입 화면
     │   ├─ (tabs)/      # 하단 탭 내비게이션 (홈, 인맥, 알림, 프로필)
     │   ├─ profile/     # 타 유저 프로필 조회 화면
     │   └─ _layout.tsx  # 루트 레이아웃 (네비게이션 제어)
     ├─ components/      # 모바일 전용 공통 컴포넌트 (Avatar, LoadingSpinner, PostCard 등)
     ├─ lib/             # API 통신 인스턴스 (customFetch)
     ├─ store/           # Zustand 스토어 (인증 데이터 캐싱)
     └─ package.json
```

---

## ⚙️ 환경 변수 및 외부 서비스 연동 설정

서버를 구동하기 전에, 백엔드가 정상적으로 작동할 수 있도록 `backend/` 폴더 내에 `.env` 파일을 생성하고 아래 변수들을 구성해야 합니다.

```env
# 구동 서버 포트
PORT=3000

# MongoDB 연결 주소 (Local DB 또는 MongoDB Atlas 주소)
MONGO_URI=mongodb+srv://<username>:<password>@cluster.mongodb.net/linkedin-db

# JWT 암호화 비밀키 (임의의 임의의 무작위 문자열)
JWT_SECRET=your_jwt_secret_key_here

# 웹 클라이언트 기본 주소
CLIENT_URL=http://localhost:5173

# Cloudinary 계정 정보 (Cloudinary 가입 후 대시보드에서 획득)
CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret

# Mailtrap 계정 정보 (Mailtrap 가입 후 API Token 획득)
MAILTRAP_TOKEN=your_mailtrap_api_token
EMAIL_FROM=mailtrap@yourdomain.com
EMAIL_NAME="LinkedIn Clone"
```

---

## 🚀 초보자를 위한 셋업 및 구동 순서

프로젝트를 내 로컬 컴퓨터에서 처음부터 순서대로 구동하는 자세한 가이드입니다.

### 1단계: 백엔드 서버(Express) 셋업 및 실행
백엔드가 켜져 있어야 웹과 모바일 앱이 데이터베이스와 통신할 수 있습니다.
1. 터미널을 열고 `backend` 디렉토리로 이동합니다.
   ```bash
   cd backend
   ```
2. 필요한 패키지 라이브러리들을 설치합니다.
   ```bash
   npm install
   ```
3. 백엔드 개발 서버를 구동합니다.
   ```bash
   npm run dev
   ```
   * 백엔드가 `http://localhost:3000`에서 실행되며, MongoDB 데이터베이스에 정상 연결되었다는 메시지가 뜹니다.

### 2단계: 웹 프론트엔드(React + Vite) 실행
1. 새로운 터미널 창을 열고 `frontend` 디렉토리로 이동합니다.
   ```bash
   cd frontend
   ```
2. 관련 패키지들을 설치합니다.
   ```bash
   npm install
   ```
3. 웹 개발 서버를 실행합니다.
   ```bash
   npm run dev
   ```
   * 브라우저에서 `http://localhost:5173` 주소를 입력하여 예쁘게 다듬어진 링크드인 웹 화면을 테스트해보세요.

### 3단계: 모바일 프론트엔드(Expo) 실행
1. 세 번째 터미널 창을 열고 `mobile` 디렉토리로 이동합니다.
   ```bash
   cd mobile
   ```
2. 모바일 전용 패키지 라이브러리들을 설치합니다.
   ```bash
   npm install
   ```
3. Expo 개발 서버를 시작합니다.
   ```bash
   npx expo start
   ```
4. 터미널에 표시된 QR 코드를 모바일 기기(Expo Go 앱 설치 후 카메라 스캔)로 인식시키거나, 에뮬레이터(Simulator)를 켜서 모바일 앱 화면을 실행합니다.
   * **꿀팁**: `mobile/lib/api.ts` 내부의 `customFetch` 로직이 내 로컬 컴퓨터의 IP를 동적으로 탐색하여 백엔드와 연결해주므로, 별도 설정 없이 바로 연동됩니다.

---

## 💡 개발 단계별 핵심 구현 내용 요약

초보 개발자분들이 이 프로젝트의 설계 방식을 이해하기 쉽도록 핵심 구조를 요약해 둡니다.

### A. 하이브리드 인증 흐름 (Web Cookie & Mobile Bearer Header)
* 웹 프론트엔드에서는 브라우저의 쿠키(`jwt-linkedin`)에 자동으로 담기는 JWT를 통해 로그인 상태를 인증합니다.
* 모바일 앱에서는 쿠키를 직접 제어하기 어렵기 때문에 로그인 성공 시 JWT 토큰 문자열을 응답받아 모바일 저장소(`AsyncStorage`)에 보관하고, API 요청 시 `Authorization: Bearer <token>` 헤더로 백엔드에 전송합니다.
* 백엔드의 **[protectRoute.js](file:///Users/guniluk/Desktop/CLI/webMobile-Linkedin/backend/src/middleware/protectRoute.js)** 미들웨어는 쿠키와 Bearer 헤더 인증 방식을 모두 지원하도록 유연하게 짜여 있습니다.

### B. 이미지 인코딩 및 클라우드 업로드
* 모바일 기기 갤러리에서 선택된 이미지(`expo-image-picker` 활용)는 안전한 전송을 위해 `Base64` 문자열로 변환됩니다.
* 백엔드로 전달된 Base64 문자열은 **[cloudinary.js](file:///Users/guniluk/Desktop/CLI/webMobile-Linkedin/backend/src/lib/cloudinary.js)** 헬퍼 모듈을 통해 클라우드 스토리지에 업로드되고, 최적화된 URL을 반환받아 데이터베이스에 저장됩니다.

### C. 화면 전환 시 데이터 실시간 갱신 (`useFocusEffect` 기법)
* 모바일 앱의 탭 브라우징(하단 탭 메뉴 전환)은 화면이 새로 고쳐지지 않고 단순히 포커스만 이동합니다.
* 알림 탭이나 홈 피드 탭으로 복귀했을 때 즉시 최신 정보를 반영하도록, Expo Router의 **`useFocusEffect`** 훅을 이용하여 화면 포커스 획득 시 관련 React Query 캐시를 강제로 리패치(`refetch`)해 줍니다.

### D. 모바일 노치(Notch) 및 상태 표시줄 회피 스페이서
* 기기 상단 영역의 시간/배터리 표시줄과 화면이 겹치는 것을 막기 위해, 전체 화면 모달 최상단에 **물리적인 Status Bar Spacer**(`height: Platform.OS === 'ios' ? 52 : 32`)를 배치하여 닫기 단추가 가려지거나 터치가 안 되는 현상을 원천 방어합니다.

---

## 🛠️ 문제 해결 (Troubleshooting)

### Q. 모바일 앱 구동 시 `babel-preset-expo` 모듈 에러가 납니다.
* **원인**: Expo 바벨 트랜스파일러 셋업 중 설정이 일시적으로 꼬였을 때 발생합니다.
* **조치**: `mobile/` 폴더에서 `npm install babel-preset-expo --save-dev` 명령어를 실행하여 설치해 주면 말끔히 해결됩니다.

### Q. 모바일 기기(실제 폰)에서 API 서버와 통신이 되지 않습니다.
* **원인**: 백엔드가 구동 중인 로컬 컴퓨터와 모바일 기기가 서로 다른 Wi-Fi 네트워크에 연결되어 있을 가능성이 높습니다.
* **조치**: 로컬 컴퓨터와 스마트폰이 **동일한 Wi-Fi 네트워크**에 연결되어 있는지 확인하고, 백엔드 서버 방화벽이 3000번 포트를 허용하는지 점검해 주세요.
