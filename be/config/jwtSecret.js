function getJwtSecret() {
  const secret = process.env.JWT_SECRET;
  if (!secret || secret === 'change_me_in_production') {
    throw new Error('JWT_SECRET chưa được cấu hình. Copy be/.env.example → be/.env và đặt khóa ngẫu nhiên.');
  }
  return secret;
}

function getJwtExpiresIn() {
  return process.env.JWT_EXPIRES_IN || '1d';
}

module.exports = { getJwtSecret, getJwtExpiresIn };