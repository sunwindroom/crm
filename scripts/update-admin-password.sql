-- 更新管理员密码为 admin123456
-- bcrypt 哈希值（成本因子 10）
UPDATE users
SET password = '$2a$10$N.zmdr9k7uOCQb376NoUnuTJ8iAt6Z5EHsM8lE9lBOsl7iAt6Z5EH'
WHERE username = 'admin';

-- 验证更新
SELECT username, name, phone, status FROM users WHERE username = 'admin';
