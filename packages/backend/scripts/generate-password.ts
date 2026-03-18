import * as bcrypt from 'bcrypt';

async function generatePasswordHash(password: string) {
  const saltRounds = 10;
  const hash = await bcrypt.hash(password, saltRounds);
  console.log(`Password: ${password}`);
  console.log(`Hash: ${hash}`);
}

// 生成各种密码的哈希值
generatePasswordHash('admin123456');
generatePasswordHash('admin123');
