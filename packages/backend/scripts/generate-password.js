const bcrypt = require('bcrypt');

async function generatePasswordHash(password) {
  const saltRounds = 10;
  const hash = await bcrypt.hash(password, saltRounds);
  console.log(`Password: ${password}`);
  console.log(`Hash: ${hash}`);
  return hash;
}

// 生成 admin123456 的哈希值
generatePasswordHash('admin123456');
