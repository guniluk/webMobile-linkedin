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
 * Cloudinary 업로드 헬퍼 함수
 * @param {string} filePath - 로컬 임시 저장 파일의 절대 경로 또는 Base64 스트링
 * @param {string} folder - Cloudinary 미디어 라이브러리 내에 저장할 폴더명 (예: 'profile', 'banner')
 * @returns {Promise<string>} 업로드 완료 후 생성된 secure_url (HTTPS CDN 주소)
 */
export const uploadOnCloudinary = async (filePath, folder) => {
  try {
    if (!filePath) return null;

    // Cloudinary 서버에 파일 업로드 요청
    const response = await cloudinary.uploader.upload(filePath, {
      folder: folder,
      resource_type: 'auto',
    });

    // 업로드 성공 후 로컬 임시 파일이 존재하면 자동 삭제 (Base64 스트링인 경우 제외)
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
    // 업로드 실패 시에도 디스크 누수 방지를 위해 로컬 임시 파일 삭제
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

