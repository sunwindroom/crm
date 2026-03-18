import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddUsernameToUsers1710123456789 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // 检查 username 列是否已存在
    const table = await queryRunner.getTable('users');
    const usernameColumn = table?.findColumnByName('username');

    if (!usernameColumn) {
      // 先添加可为空的 username 列
      await queryRunner.query(`
        ALTER TABLE "users" ADD "username" character varying
      `);

      // 为现有记录生成唯一的 username（使用 phone 作为基础）
      await queryRunner.query(`
        UPDATE "users" SET "username" = 'user_' || SUBSTRING("phone" FROM 4 FOR 7) WHERE "username" IS NULL
      `);

      // 设置 NOT NULL 约束和唯一约束
      await queryRunner.query(`
        ALTER TABLE "users" ALTER COLUMN "username" SET NOT NULL
      `);

      await queryRunner.query(`
        ALTER TABLE "users" ADD CONSTRAINT "UQ_username" UNIQUE ("username")
      `);
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "users" DROP CONSTRAINT "UQ_username"
    `);
    await queryRunner.query(`
      ALTER TABLE "users" DROP COLUMN "username"
    `);
  }
}
