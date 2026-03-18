# TypeScript类型安全最佳实践

## 问题回顾

### 原始错误
```
Type 'string | null | undefined' is not assignable to type 'string | undefined'.
Type 'null' is not assignable to type 'string | undefined'.
```

### 错误原因
在TypeScript严格模式下，`null` 和 `undefined` 是不同的类型：
- `string | undefined`：可以是字符串或undefined
- `string | null`：可以是字符串或null
- `string | null | undefined`：可以是字符串、null或undefined

## 解决方案对比

### ❌ 方案1：使用any类型（不推荐）
```typescript
async findAll(queryDto: QueryUserDto): Promise<{ users: any[]; total: number }> {
  // ...
}
```

**缺点：**
- 失去类型检查
- 容易引入运行时错误
- 不符合TypeScript最佳实践
- IDE无法提供智能提示

### ✅ 方案2：统一使用undefined（推荐）
```typescript
// User实体定义
@Expose()
superiorName?: string; // 等同于 string | undefined

// 服务中使用
return {
  users: users.map(user => ({
    ...user,
    superiorName: user.superiorId ? superiorMap.get(user.superiorId) : undefined,
  })),
  total,
};
```

**优点：**
- 保持类型安全
- 符合TypeScript最佳实践
- IDE提供完整的智能提示
- 编译时捕获潜在错误

### ✅ 方案3：修改实体定义支持null（可选）
```typescript
// User实体定义
@Expose()
superiorName?: string | null;

// 服务中使用
return {
  users: users.map(user => ({
    ...user,
    superiorName: user.superiorId ? superiorMap.get(user.superiorId) : null,
  })),
  total,
};
```

**适用场景：**
- 需要区分"未设置"和"设置为空"的情况
- 与数据库NULL值对应

## 最佳实践建议

### 1. 统一使用undefined表示"缺失"
在TypeScript中，推荐使用`undefined`表示"值不存在"：
```typescript
interface User {
  name: string;
  email?: string; // 可选属性，类型为 string | undefined
}
```

### 2. 避免使用any
```typescript
// ❌ 不推荐
function process(data: any) {
  return data.value; // 没有类型检查
}

// ✅ 推荐
function process(data: { value?: string }) {
  return data.value; // 有类型检查
}
```

### 3. 使用类型守卫
```typescript
function isUser(obj: any): obj is User {
  return obj && typeof obj.id === 'string' && typeof obj.name === 'string';
}

if (isUser(data)) {
  console.log(data.name); // TypeScript知道data是User类型
}
```

### 4. 使用非空断言操作符（谨慎使用）
```typescript
// 只有在确定值不为null/undefined时使用
const name = user.name!;
```

## 本项目的类型规范

### 实体定义规范
```typescript
@Entity('users')
export class User {
  // 必填字段
  @Column()
  name: string;

  // 可选字段（数据库可为NULL）
  @Column({ nullable: true })
  email?: string;

  // 虚拟属性（不存储在数据库）
  @Expose()
  superiorName?: string;
}
```

### DTO定义规范
```typescript
export class UpdateUserDto {
  // 所有字段都应该是可选的
  @IsString()
  @IsOptional()
  name?: string;

  @IsEmail()
  @IsOptional()
  email?: string;
}
```

### 服务返回值规范
```typescript
// 使用具体类型，避免any
async findAll(): Promise<{ users: User[]; total: number }> {
  // ...
}

// 单个对象返回
async findOne(id: string): Promise<User> {
  // ...
}

// 可能不存在的返回
async findByEmail(email: string): Promise<User | null> {
  // ...
}
```

## 总结

1. **永远不要使用`any`**，除非有非常特殊的理由
2. **统一使用`undefined`**表示可选值
3. **保持类型定义的一致性**
4. **让TypeScript帮助您捕获错误**，而不是绕过类型检查

通过遵循这些最佳实践，您的代码将更加健壮、可维护，并且能够充分利用TypeScript的类型系统优势。
