# Mailtrap을 이용한 이메일 알림 연동 가이드 (무료 데모/Sandbox 시작 가이드)

이 문서는 개인 소유 도메인이 없더라도, Mailtrap에서 기본 제공하는 **무료 데모 도메인(`demomailtrap.co`)**과 **Sandbox(가상 사서함)** 환경을 활용하여 가입 및 변경사항에 대한 이메일 통보 기능을 5분 만에 간단히 테스트하고 연동하는 절차를 정리한 문서입니다.

---

## 💡 개인 도메인 없이 "무료"로 즉시 시작하는 원리
1. **발신(Send)**: 본인의 개인 이메일 대신 Mailtrap이 기본 제공하는 임시 발신 주소(`hello@demomailtrap.co`)를 사용합니다.
2. **수신(Receive)**: 실제 사용자의 이메일 사서함으로 메일이 전송되는 대신, Mailtrap 대시보드 내에 있는 **가상 사서함(Sandbox Inbox)**에 메일이 수집되어 화면상에서 템플릿과 발송 상태를 안전하게 테스트할 수 있습니다. (스팸 차단 걱정 없음)

---

## 1. Mailtrap 사이트 설정 및 정보 획득 단계

### 1단계: Mailtrap 무료 회원가입
1. [Mailtrap 공식 웹사이트](https://mailtrap.io/)로 접속합니다.
2. **Sign Up** 버튼을 클릭하여 무료 계정(Free Plan)으로 가입을 진행합니다. (구글이나 깃허브 계정으로 간편 가입 가능)
3. 가입 후 이메일 인증을 완료하고 대시보드에 접속합니다.

### 2단계: 테스트용 Sandbox 사서함 확인 및 API Token 획득
1. 대시보드 좌측 메뉴에서 **Inboxes** -> **My Inbox** (가입 시 자동으로 하나가 생성되어 있음)를 클릭합니다.
2. 화면 중앙의 **Show Credentials** 버튼을 클릭하여 설정 값을 확인합니다.
3. Node.js 환경에서 편리하게 API SDK로 연동할 예정이므로, **Integrations** 목록에서 **Node.js**를 선택합니다.
4. 화면에 나타나는 코드 예시에서 **`token: "..."`** 부분에 적힌 **API Token(32자리 알파벳/숫자 조합)**을 복사하여 보관합니다.

### 3단계: 데모 발신 정보 확인
- Mailtrap Sandbox 환경에서는 별도의 도메인 인증 없이 아래의 발신자 정보를 그대로 사용해 테스트할 수 있습니다.
  - **발신자 이메일(EMAIL_FROM)**: `hello@demomailtrap.co`
  - **발신자 이름(EMAIL_NAME)**: 본인이 원하는 자유로운 이름 (예: `UnLinked Team`)

---

## 2. Node.js 백엔드 설정 및 테스트 단계

현재 프로젝트(`Desktop/webMobile-Linkedin/backend`)에는 이미 테스트용 코드와 Mailtrap 패키지가 설치되어 있으므로 다음과 같이 손쉽게 테스트할 수 있습니다.

### 1단계: 환경 변수(`.env`) 설정
`backend/.env` 파일을 열고, 위에서 복사한 API 토큰과 데모 발송 주소를 적어줍니다.
```env
# backend/.env
PORT=3000
MAILTRAP_TOKEN=복사한_32자리_API_토큰_입력
EMAIL_FROM=hello@demomailtrap.co     # Mailtrap 기본 데모 발신 이메일
EMAIL_NAME="UnLinked 데모"            # 메일 수신 시 표시될 이름
```

### 2단계: 독립 테스트 스크립트로 동작 검증
터미널을 열고 `backend` 디렉토리로 이동한 뒤, 준비되어 있는 테스트 스크립트를 실행해 봅니다.
```bash
# 1. backend 디렉토리로 이동
cd backend

# 2. 테스트 스크립트 실행
node test.mailtrap.js
```
- **결과 확인**: 실행 후 에러 없이 완료되면, **Mailtrap 사이트의 My Inbox 화면**으로 돌아가 봅니다. 
- Inbox에 **"You are awesome!"**이라는 제목의 테스트 이메일이 정상적으로 도착해 있다면 연동 성공입니다!

---

## 3. 서비스 비즈니스 로직 연동

테스트가 확인되었다면 서비스의 변경사항(가입, 친구 수락 등)이 발생할 때 메일이 발송되도록 호출부를 연결합니다.

### 1단계: Mailtrap 클라이언트 설정 모듈 (`backend/src/lib/mailtrap.js`)
`.env` 파일에 기록한 토큰 정보를 바탕으로 클라이언트를 초기화합니다. (기존 작성 완료됨)
```javascript
import { MailtrapClient } from 'mailtrap';
import 'dotenv/config';

export const mailtrapClient = new MailtrapClient({
  token: process.env.MAILTRAP_TOKEN,
});

export const sender = {
  email: process.env.EMAIL_FROM, // hello@demomailtrap.co
  name: process.env.EMAIL_NAME,
};
```

### 2단계: 이메일 핸들러 함수 작성 (`backend/src/emails/emailHandler.js`)
이메일을 전송할 함수들을 작성합니다. 메일 수신 주소는 실제 사용자 이메일(예: 가입한 회원의 이메일)을 기입하면 되며, Sandbox 모드이므로 실제 메일함으로 가지 않고 Mailtrap Inbox로 알아서 안전하게 들어옵니다.
```javascript
import { mailtrapClient, sender } from '../lib/mailtrap.js';
import { createWelcomeEmailTemplate, connectionAcceptedEmailTemplate } from './emailTemplate.js';

// 1. 회원 가입 완료 시 통보 핸들러
export const sendWelcomeEmail = async (email, name, profileUrl) => {
  const recipients = [{ email }];
  try {
    await mailtrapClient.send({
      from: sender,
      to: recipients,
      subject: 'Welcome to UnLinked!',
      html: createWelcomeEmailTemplate(name, profileUrl),
      category: 'welcome',
    });
  } catch (error) {
    console.error("Welcome Email 전송 에러:", error);
  }
};

// 2. 친구등록(커넥션) 수락 시 통보 핸들러
export const sendConnectionAcceptedEmail = async (email, senderName, recipientName, profileUrl) => {
  const recipients = [{ email }];
  try {
    await mailtrapClient.send({
      from: sender,
      to: recipients,
      subject: `${senderName}님이 친구 요청을 수락했습니다!`,
      html: connectionAcceptedEmailTemplate(senderName, recipientName, profileUrl),
      category: 'connection_accepted',
    });
  } catch (error) {
    console.error("Connection Email 전송 에러:", error);
  }
};
```

### 3단계: 컨트롤러 호출부 연동 (예: 회원가입 시)
`backend/src/controllers/auth.controller.js` 파일 내 회원가입 로직 성공 영역에 이메일 발송 코드가 아래와 같이 연동되어 있습니다.
```javascript
// 회원가입 성공 처리 직후
const profileUrl = `${process.env.CLIENT_URL}/profile/${newUser.username}`;
try {
  // 메일 전송 실패가 회원가입에 영향을 주지 않도록 개별 try-catch로 비동기 실행
  await sendWelcomeEmail(newUser.email, newUser.name, profileUrl);
} catch (emailError) {
  console.log('Error sending welcome email', emailError);
}
```

---

## 4. 최종 요약: 이 방식으로 얻는 이점
- **비용 0원**: 카드 등록 없이 무료 플랜의 월 500통 한도 내에서 자유롭게 테스트가 가능합니다.
- **DNS 설정 생략**: 도메인을 구입하거나 복잡한 TXT/CNAME 레코드를 추가할 필요가 전혀 없습니다.
- **안전한 개발**: 개발 도중 오발송된 메일이 실제 사용자에게 발송되는 사고를 방지할 수 있습니다.
