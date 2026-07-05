export const createWelcomeEmailTemplate = (name, profileUrl) => {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Welcome to UnLinked</title>
</head>
<body style="margin: 0; padding: 0; background-color: #f3f2ef; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; -webkit-font-smoothing: antialiased;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background-color: #f3f2ef; padding: 20px 0; width: 100%;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" style="max-width: 600px; background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08); border-collapse: collapse;" cellspacing="0" cellpadding="0" border="0">
          
          <!-- Welcome to UnLinked 파란색 카드 영역 (페이지 약 1/4 차지) -->
          <tr>
            <td style="background-color: #0A66C2; padding: 40px 30px; text-align: center; color: #ffffff;">
              <div style="display: inline-block; background-color: #ffffff; padding: 8px 18px; border-radius: 6px; margin-bottom: 20px; box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);">
                <span style="font-size: 24px; font-weight: 800; color: #0A66C2; letter-spacing: -0.5px; font-family: sans-serif;">
                  Un<span style="background-color: #0A66C2; color: #ffffff; padding: 2px 6px; border-radius: 4px; margin-left: 2px;">Linked</span>
                </span>
              </div>
              <h1 style="font-size: 28px; font-weight: 700; margin: 0; letter-spacing: -0.5px; line-height: 1.3; color: #ffffff; font-family: sans-serif;">Welcome to UnLinked</h1>
            </td>
          </tr>

          <!-- 본문 영역 -->
          <tr>
            <td style="padding: 40px 30px;">
              <!-- 이름 출력 -->
              <h2 style="font-size: 20px; font-weight: 700; color: #1d1d1f; margin-top: 0; margin-bottom: 16px; font-family: sans-serif;">Hi ${name},</h2>
              
              <!-- 가입 감사 인사 -->
              <p style="font-size: 16px; line-height: 1.6; color: #43434f; margin-top: 0; margin-bottom: 30px; font-family: sans-serif;">
                Thank you for joining UnLinked! We are absolutely thrilled to welcome you to our professional community. Here, you can connect with colleagues, share your career milestones, and discover exciting new career opportunities.
              </p>

              <!-- How to get started 시작 안내 -->
              <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 24px; margin-bottom: 35px;">
                <h3 style="font-size: 18px; font-weight: 700; color: #0A66C2; margin-top: 0; margin-bottom: 16px; font-family: sans-serif;">How to get started:</h3>
                <ul style="margin: 0; padding-left: 20px; color: #4b5563; font-size: 14px; font-family: sans-serif;">
                  <li style="margin-bottom: 12px; line-height: 1.6;">
                    <strong style="font-weight: 700; color: #1f2937;">Complete Your Profile:</strong> Add your professional experience, key skills, and education details to attract recruiters and network connections.
                  </li>
                  <li style="margin-bottom: 12px; line-height: 1.6;">
                    <strong style="font-weight: 700; color: #1f2937;">Connect with Colleagues:</strong> Search for classmates, coworkers, and industry experts to grow your professional network.
                  </li>
                  <li style="margin-bottom: 0; line-height: 1.6;">
                    <strong style="font-weight: 700; color: #1f2937;">Explore Opportunities:</strong> Find job recommendations tailored to your profile and apply with a single click.
                  </li>
                </ul>
              </div>

              <!-- Complete Your Profile 파란색 버튼 -->
              <div style="text-align: center; margin-bottom: 20px;">
                <a href="${profileUrl}" style="background-color: #0A66C2; color: #ffffff !important; text-decoration: none; padding: 14px 32px; font-size: 16px; font-weight: bold; border-radius: 28px; display: inline-block; box-shadow: 0 4px 10px rgba(10, 102, 194, 0.25); font-family: sans-serif;">
                  Complete your profile
                </a>
              </div>
            </td>
          </tr>

          <!-- 푸터 영역 -->
          <tr>
            <td style="border-top: 1px solid #e2e8f0; padding: 24px 30px; text-align: center; color: #8e8e93; font-size: 12px; line-height: 1.5; font-family: sans-serif;">
              <p style="margin: 0 0 8px 0;">This is an automated message sent to ${name}. Please do not reply directly to this email.</p>
              <p style="margin: 0;">&copy; 2026 UnLinked Corporation, 1600 Amphitheatre Parkway, Mountain View, CA 94043, USA</p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `;
};

export const connectionAcceptedEmailTemplate = (
  senderName,
  recipientName,
  profileUrl,
) => {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Connection Request Accepted</title>
</head>
<body style="margin: 0; padding: 0; background-color: #f3f2ef; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; -webkit-font-smoothing: antialiased;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background-color: #f3f2ef; padding: 20px 0; width: 100%;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" style="max-width: 600px; background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08); border-collapse: collapse;" cellspacing="0" cellpadding="0" border="0">
          
          <!-- Connection Accepted 파란색 카드 영역 (페이지 약 1/4 차지) -->
          <tr>
            <td style="background-color: #0A66C2; padding: 40px 30px; text-align: center; color: #ffffff;">
              <div style="display: inline-block; background-color: #ffffff; padding: 8px 18px; border-radius: 6px; margin-bottom: 20px; box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);">
                <span style="font-size: 24px; font-weight: 800; color: #0A66C2; letter-spacing: -0.5px; font-family: sans-serif;">
                  Un<span style="background-color: #0A66C2; color: #ffffff; padding: 2px 6px; border-radius: 4px; margin-left: 2px;">Linked</span>
                </span>
              </div>
              <h1 style="font-size: 28px; font-weight: 700; margin: 0; letter-spacing: -0.5px; line-height: 1.3; color: #ffffff; font-family: sans-serif;">Connection Accepted!</h1>
            </td>
          </tr>

          <!-- 본문 영역 -->
          <tr>
            <td style="padding: 40px 30px;">
              <!-- 받는 사람 이름 출력 -->
              <h2 style="font-size: 20px; font-weight: 700; color: #1d1d1f; margin-top: 0; margin-bottom: 16px; font-family: sans-serif;">Hi ${recipientName},</h2>
              
              <!-- 수락 메시지 -->
              <p style="font-size: 16px; line-height: 1.6; color: #43434f; margin-top: 0; margin-bottom: 25px; font-family: sans-serif;">
                Great news! <strong style="color: #1d1d1f;">${senderName}</strong> has accepted your connection request on UnLinked.
              </p>

              <!-- 추가 안내 정보 -->
              <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 20px; margin-bottom: 30px; text-align: left;">
                <p style="margin: 0; color: #4b5563; font-size: 14px; line-height: 1.6; font-family: sans-serif;">
                  You are now connected in each other's professional networks. You can now view their updates, check their shared posts, and send messages directly to collaborate on opportunities.
                </p>
              </div>

              <!-- View Profile 파란색 버튼 -->
              <div style="text-align: center; margin-bottom: 20px;">
                <a href="${profileUrl}" style="background-color: #0A66C2; color: #ffffff !important; text-decoration: none; padding: 14px 32px; font-size: 16px; font-weight: bold; border-radius: 28px; display: inline-block; box-shadow: 0 4px 10px rgba(10, 102, 194, 0.25); font-family: sans-serif;">
                  View ${senderName}'s Profile
                </a>
              </div>
            </td>
          </tr>

          <!-- 푸터 영역 -->
          <tr>
            <td style="border-top: 1px solid #e2e8f0; padding: 24px 30px; text-align: center; color: #8e8e93; font-size: 12px; line-height: 1.5; font-family: sans-serif;">
              <p style="margin: 0 0 8px 0;">This is an automated notification. You are receiving this because you enabled connection notifications.</p>
              <p style="margin: 0;">&copy; 2026 UnLinked Corporation, 1600 Amphitheatre Parkway, Mountain View, CA 94043, USA</p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `;
};

export const newCommentEmailTemplate = (
  senderName,
  recipientName,
  content,
  postUrl,
) => {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>New Comment on Your Post</title>
</head>
<body style="margin: 0; padding: 0; background-color: #f3f2ef; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; -webkit-font-smoothing: antialiased;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background-color: #f3f2ef; padding: 20px 0; width: 100%;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" style="max-width: 600px; background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08); border-collapse: collapse;" cellspacing="0" cellpadding="0" border="0">
          
          <!-- New Comment 알림 영역 (페이지 약 1/4 차지) -->
          <tr>
            <td style="background-color: #0A66C2; padding: 40px 30px; text-align: center; color: #ffffff;">
              <div style="display: inline-block; background-color: #ffffff; padding: 8px 18px; border-radius: 6px; margin-bottom: 20px; box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);">
                <span style="font-size: 24px; font-weight: 800; color: #0A66C2; letter-spacing: -0.5px; font-family: sans-serif;">
                  Un<span style="background-color: #0A66C2; color: #ffffff; padding: 2px 6px; border-radius: 4px; margin-left: 2px;">Linked</span>
                </span>
              </div>
              <h1 style="font-size: 28px; font-weight: 700; margin: 0; letter-spacing: -0.5px; line-height: 1.3; color: #ffffff; font-family: sans-serif;">New Comment Added!</h1>
            </td>
          </tr>

          <!-- 본문 영역 -->
          <tr>
            <td style="padding: 40px 30px;">
              <!-- 받는 사람 이름 출력 -->
              <h2 style="font-size: 20px; font-weight: 700; color: #1d1d1f; margin-top: 0; margin-bottom: 16px; font-family: sans-serif;">Hi ${recipientName},</h2>
              
              <!-- 코멘트 알림 메시지 -->
              <p style="font-size: 16px; line-height: 1.6; color: #43434f; margin-top: 0; margin-bottom: 25px; font-family: sans-serif;">
                Great news! <strong style="color: #1d1d1f;">${senderName}</strong> has left a comment on your post.
              </p>

              <!-- 코멘트 내용 강조 -->
              <div style="background-color: #f8fafc; border-left: 4px solid #0A66C2; padding: 20px; margin-bottom: 30px; text-align: left;">
                <p style="margin: 0; color: #4b5563; font-size: 16px; line-height: 1.6; font-family: sans-serif;">
                  <strong style="font-weight: 700; color: #1d1d1f;">${senderName} commented:</strong> "${content}"
                </p>
              </div>

              <!-- 추가 안내 정보 -->
              <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 20px; margin-bottom: 30px; text-align: left;">
                <p style="margin: 0; color: #4b5563; font-size: 14px; line-height: 1.6; font-family: sans-serif;">
                  Your post is generating engagement! Click the button below to view the comment and continue the conversation with ${senderName}.
                </p>
              </div>

              <!-- View Post 파란색 버튼 -->
              <div style="text-align: center; margin-bottom: 20px;">
                <a href="${postUrl}" style="background-color: #0A66C2; color: #ffffff !important; text-decoration: none; padding: 14px 32px; font-size: 16px; font-weight: bold; border-radius: 28px; display: inline-block; box-shadow: 0 4px 10px rgba(10, 102, 194, 0.25); font-family: sans-serif;">
                  View Post
                </a>
              </div>
            </td>
          </tr>

          <!-- 푸터 영역 -->
          <tr>
            <td style="border-top: 1px solid #e2e8f0; padding: 24px 30px; text-align: center; color: #8e8e93; font-size: 12px; line-height: 1.5; font-family: sans-serif;">
              <p style="margin: 0 0 8px 0;">This is an automated notification. You are receiving this because you enabled comment notifications.</p>
              <p style="margin: 0;">&copy; 2026 UnLinked Corporation, 1600 Amphitheatre Parkway, Mountain View, CA 94043, USA</p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `;
};
