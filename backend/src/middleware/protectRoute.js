import jwt from 'jsonwebtoken';
import User from '../models/user.model.js';

export const protectRoute = async (req, res, next) => {
  try {
    // 1. 쿠키 또는 헤더에서 토큰 추출
    let token = req.cookies['jwt-linkedin'];
    if (!token && req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      return res
        .status(401)
        .json({ message: 'Unauthorized - No Token Provided' });
    }

    // 2. 토큰 검증
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    if (!decoded) {
      return res.status(401).json({ message: 'Unauthorized - Invalid Token' });
    }

    // 3. 토큰의 userId로 사용자 조회 (비밀번호 필드는 제외)
    const user = await User.findById(decoded.userId).select('-password');

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // 4. 요청 객체(req)에 사용자 정보 첨부 후 다음 핸들러로 이동
    req.user = user;
    next();
  } catch (error) {
    console.log('Error in protectRoute middleware: ', error.message);

    // JWT 토큰이 만료되었거나 변조된 경우 에러 처리
    if (
      error.name === 'JsonWebTokenError' ||
      error.name === 'TokenExpiredError'
    ) {
      return res
        .status(401)
        .json({ message: 'Unauthorized - Invalid or Expired Token' });
    }

    res.status(500).json({ message: 'Internal server error' });
  }
};
