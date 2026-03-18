# 数据库迁移说明

## 问题背景

部署时报错：`column "username" of relation "users" contains null values`

原因：数据库中已存在旧版本的 `users` 表（没有 `username` 列），TypeORM 尝试添加 NOT NULL 列时失败。

## 解决方案

使用数据库迁移来安全地添加 `username` 列：

1. 先添加可为空的列
2. 为现有记录生成唯一的 username
3. 设置 NOT NULL 约束

## 使用方法

### 自动迁移（推荐）

应用启动时会自动运行迁移：

```bash
npm run start:dev
```

### 手动迁移

如果需要手动运行迁移：

```bash
# 生成迁移文件（如果需要新的迁移）
npm run migration:generate -- -n MigrationName

# 运行迁移
npm run migration:run

# 回滚迁移
npm run migration:revert
```

## 迁移文件

- `src/migrations/1710123456789-AddUsernameToUsers.ts` - 添加 username 列的迁移

## 注意事项

- 生产环境请确保先备份数据库
- 迁移会为现有用户生成形如 `user_0013800` 的 username（基于 phone 字段）
- 如果数据库已经是最新结构，迁移会自动跳过
