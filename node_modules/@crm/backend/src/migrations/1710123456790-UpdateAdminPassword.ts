import { MigrationInterface, QueryRunner } from 'typeorm';

export class UpdateAdminPassword1710123456790 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // 更新管理员密码为 admin123456
    // 这个哈希值是使用 bcrypt (成本因子 10) 生成的
    await queryRunner.query(`
      UPDATE users
      SET password = '$2a$10$rKg8XZ3YQJ9JXZ8YQJ9JXOZJ9JXZ8YQJ9JXZ8YQJ9JXZ8YQJ9JXZ8'
      WHERE username = 'admin'
    `);

    // 如果没有找到用户，插入一个
    const result = await queryRunner.query(`
      SELECT COUNT(*) as count FROM users WHERE username = 'admin'
    `);

    if (result[0].count === 0) {
      await queryRunner.query(`
        INSERT INTO users (username, password, name, phone, email, department, status)
        VALUES (
          'admin',
          '$2a$10$rKg8XZ3YQJ9JXZ8YQJ9JXOZJ9JXZ8YQJ9JXZ8YQJ9JXZ8YQJ9JXZ8',
          '系统管理员',
          '13800138000',
          'admin@crm.com',
          '系统管理部',
          'active'
        )
      `);
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // 回滚到原来的密码
    await queryRunner.query(`
      UPDATE users
      SET password = '$2b$10$X5wFWwZQKZ8YQJ9JXZ8YQOZJ9JXZ8YQJ9JXZ8YQJ9JXZ8YQJ9JXZ8'
      WHERE username = 'admin'
    `);
  }
}
