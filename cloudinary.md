# Cloudinary를 이용한 이미지 업로드 연동 가이드 (최종 업데이트)

이 문서는 서비스 내 **프로필 이미지(`profilePicture`)**, **배너 이미지(`bannerImg`)**, **게시물 이미지(`image`)**를 클라우드에 업로드하고 영구적인 이미지 호스팅 URL을 획득하기 위해 Cloudinary 사이트 설정과 이 프로젝트(`Desktop/webMobile-Linkedin`) 백엔드 코드의 연동 절차를 정리한 문서입니다.

---

## 💡 이 프로젝트의 이미지 업로드 연동 특징
1. **듀얼 업로드 지원 (Base64 & Local File)**: 
   - 프론트엔드에서 모바일/웹 최적화를 위해 이미지를 Base64 스트링(`data:image/...`)으로 직렬화하여 JSON 바디로 전송하는 방식과,
   - Multer 등 파일 업로드 미들웨어를 통해 멀티파트 폼데이터(`multipart/form-data`)로 서버에 임시 파일을 생성해 전송하는 방식 두 가지를 모두 유연하게 자동 감지하여 지원합니다.
2. **자동 디스크 청소 (Memory Leak & Disk Overflow 방지)**:
   - 서버에 물리적으로 파일이 생성되는 로컬 임시 파일 업로드의 경우, 업로드 성공/실패 여부와 무관하게 **업로드가 끝나는 즉시 서버 디스크에서 임시 파일을 자동으로 안전하게 지워줍니다.** (서버 용량 부족 사태를 원천 차단)

---

## 1. Cloudinary 사이트 설정 및 정보 획득 단계 (일의 순서)

### 1단계: Cloudinary 회원가입 및 로그인
1. [Cloudinary 공식 홈페이지](https://cloudinary.com/)로 접속합니다.
2. **Sign Up for Free** 버튼을 클릭하여 무료 계정으로 회원가입을 진행합니다.
3. 가입 후 이메일 인증을 완료하고 대시보드에 로그인합니다.

### 2단계: API 자격 증명 획득
1. 대시보드 메인 화면의 **Product Environment Settings** 영역에서 아래의 3가지 정보를 복사합니다.
   - **Cloud name** (예: `d111111`)
   - **API Key** (예: `222222`)
   - **API Secret** (예: `33333`)

---

## 2. Node.js 백엔드 개발 및 연동 단계 (일의 순서)

### 1단계: 의존성 패키지 설치
```bash
npm install cloudinary
```

### 2단계: 환경 변수(`.env`) 등록
`backend/.env` 파일 맨 아래에 3가지 API 정보를 추가합니다.
```env
# backend/.env
CLOUDINARY_CLOUD_NAME=11111
CLOUDINARY_API_KEY=222222
CLOUDINARY_API_SECRET=33333
```

### 3단계: Cloudinary 설정 및 스마트 업로드 헬퍼 작성 (`backend/src/lib/cloudinary.js`)
로컬 임시 파일을 정리해 주는 파일 시스템(`fs`) 처리를 결합한 스마트 업로드 헬퍼 함수입니다.
```javascript
// backend/src/lib/cloudinary.js
import { v2 as cloudinary } from 'cloudinary';
import dotenv from 'dotenv';
import fs from 'fs';

dotenv.config();

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

/**
 * Cloudinary 업로드 헬퍼 함수 (자동 디스크 정리 지원)
 * @param {string} filePath - 로컬 임시 저장 파일의 절대 경로 또는 Base64 스트링
 * @param {string} folder - 저장할 폴더명 (예: 'profile', 'banner', 'posts')
 * @returns {Promise<string>} 업로드 완료 후 생성된 secure_url (HTTPS CDN 주소)
 */
export const uploadOnCloudinary = async (filePath, folder) => {
  try {
    if (!filePath) return null;

    // Cloudinary 서버에 업로드 요청
    const response = await cloudinary.uploader.upload(filePath, {
      folder: folder,
      resource_type: 'auto',
    });

    // 업로드 성공 후 로컬 임시 파일이 존재하면 자동 삭제 (Base64인 경우는 제외)
    if (!filePath.startsWith('data:image') && fs.existsSync(filePath)) {
      try {
        await fs.promises.unlink(filePath);
      } catch (unlinkError) {
        console.error('로컬 임시 파일 삭제 에러:', unlinkError);
      }
    }

    return response.secure_url;
  } catch (error) {
    console.error('Cloudinary 업로드 에러:', error);
    // 업로드 실패 시에도 디스크 누수 방지를 위해 로컬 임시 파일 강제 삭제
    if (filePath && !filePath.startsWith('data:image') && fs.existsSync(filePath)) {
      try {
        await fs.promises.unlink(filePath);
      } catch (unlinkError) {
        console.error('로컬 임시 파일 삭제 에러:', unlinkError);
      }
    }
    throw error;
  }
};

export default cloudinary;
```

### 4단계: 컨트롤러 비즈니스 로직 연동

#### 예시 A: 사용자 프로필 수정 시 (`backend/src/controllers/user.controller.js`)
컨트롤러에서는 클라이언트가 Base64로 이미지를 담아 보냈는지(`req.body`), 또는 파일 업로드를 수행했는지(`req.files`)를 판단하여 유연하게 처리합니다.
```javascript
// backend/src/controllers/user.controller.js
import User from '../models/user.model.js';
import { uploadOnCloudinary } from '../lib/cloudinary.js';

export const updateProfile = async (req, res) => {
  const allowedFields = [
    'name', 'headline', 'location', 'about', 'skills', 
    'profilePicture', 'bannerImg', 'experience', 'education'
  ];
  const updateData = {};

  for (const field of allowedFields) {
    if (req.body[field] !== undefined) {
      updateData[field] = req.body[field];
    }
  }

  // Cloudinary 이미지 업로드 처리 (Base64 및 로컬 파일 양쪽 모두 유연하게 지원)
  try {
    // 1. 프로필 이미지 업로드
    if (req.body.profilePicture && req.body.profilePicture.startsWith('data:image')) {
      const secureUrl = await uploadOnCloudinary(req.body.profilePicture, 'profile');
      updateData.profilePicture = secureUrl;
    } else if (req.files && req.files.profilePicture) {
      const file = req.files.profilePicture;
      const filePath = file.path || file.tempFilePath;
      if (filePath) {
        const secureUrl = await uploadOnCloudinary(filePath, 'profile');
        updateData.profilePicture = secureUrl;
      }
    }

    // 2. 배너 이미지 업로드
    if (req.body.bannerImg && req.body.bannerImg.startsWith('data:image')) {
      const secureUrl = await uploadOnCloudinary(req.body.bannerImg, 'banner');
      updateData.bannerImg = secureUrl;
    } else if (req.files && req.files.bannerImg) {
      const file = req.files.bannerImg;
      const filePath = file.path || file.tempFilePath;
      if (filePath) {
        const secureUrl = await uploadOnCloudinary(filePath, 'banner');
        updateData.bannerImg = secureUrl;
      }
    }
  } catch (uploadError) {
    console.error('Error uploading images to Cloudinary:', uploadError);
    return res.status(500).json({ message: 'Failed to upload images to cloud' });
  }

  try {
    const updatedUser = await User.findByIdAndUpdate(req.user._id, updateData, {
      new: true,
    }).select('-password');
    res.status(200).json(updatedUser);
  } catch (error) {
    console.log('Error in updateProfile controller: ', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};
```

#### 예시 B: 게시글 작성 시 이미지 연동 (추가 제안 - `backend/src/controllers/post.controller.js`)
게시글 생성 시 첨부된 이미지(`image`)가 있을 경우 Cloudinary에 업로드하여 주소를 확보한 뒤 DB에 저장하는 방식의 흐름입니다.
```javascript
import Post from '../models/post.model.js';
import { uploadOnCloudinary } from '../lib/cloudinary.js';

export const createPost = async (req, res) => {
  try {
    const { content, image } = req.body;
    const author = req.user._id; // req.user.id 대신 Mongoose ObjectId _id 권장
    
    if (!content && !image) {
      return res.status(400).json({ message: 'Post must have content or image' });
    }

    let imageUrl = '';
    // 이미지가 전달된 경우 (예: base64 포맷) Cloudinary 업로드
    if (image) {
      imageUrl = await uploadOnCloudinary(image, 'posts');
    }

    const post = await Post.create({ 
      content, 
      image: imageUrl, // 업로드된 CDN 주소 저장
      author 
    });
    
    res.status(201).json(post);
  } catch (error) {
    res.status(500).json({ message: 'Failed to create post', error });
  }
};
```

---

## 3. 업로드 이미지 확인 방법
1. 프로필 수정 또는 게시글 작성 API를 호출하여 이미지 업로드를 트리거합니다.
2. 반환되는 이미지 필드에 `https://res.cloudinary.com/...`로 시작하는 올바른 CDN URL이 들어가는지 확인합니다.
3. [Cloudinary Console - Media Library](https://cloudinary.com/console)에 접속하여 각 폴더(`profile`, `banner`, `posts`) 안에 파일들이 실시간으로 수집되는지 검사합니다.
