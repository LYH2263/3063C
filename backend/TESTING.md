# 作品生命周期集成测试说明

## 测试覆盖范围

本套集成测试覆盖作品的完整生命周期，包括：

### 1. 鉴权保护测试
- 无 token 访问管理端接口 → 401
- 非法 token 格式 → 403
- 普通用户 token 访问管理端 → 403

### 2. 管理员创建作品
- 必填字段校验（title/description/mediaUrl 缺失 → 400）
- 默认状态为 PUBLISHED
- 可指定 DRAFT/PUBLISHED 状态
- 字段空白字符自动 trim

### 3. 前台作品列表
- 仅返回 PUBLISHED 状态作品
- 分页功能（page/limit）
- 按分类筛选
- 按关键字搜索（标题、标签）
- 分类 + 关键字组合筛选

### 4. 作品详情与浏览量
- viewCount 正确自增（多次访问连续累加）
- 数据库持久化验证
- 无效 ID → 400
- DRAFT 作品不可访问 → 404

### 5. 点赞/收藏切换
- 首次调用添加（201）
- 二次调用删除（200 切换逻辑）
- 唯一约束保证不重复写入
- 不同用户独立互动
- 同一用户可同时点赞和收藏
- 并发请求处理
- 非法互动类型 → 400

### 6. 删除作品与数据清理
- 删除作品时关联互动数据一并清理
- 其他作品数据不受影响
- 用户记录保留
- 普通用户无删除权限 → 403

### 7. 端到端完整生命周期
- 创建 → 浏览 → 互动 → 删除 全链路验证

---

## 测试数据准备与清理策略

### 数据隔离方案
```
测试数据库: portfolio_test (独立于开发/生产库)
```

### 清理策略
1. **`beforeAll` (全局一次)**
   - 建立测试数据库连接
   - 验证数据库连通性

2. **`beforeEach` (每个测试用例前)**
   - 按顺序清空所有业务表（避免外键约束）
   - 重置 AUTO_INCREMENT 为 1
   - 清理顺序: Interaction → Work → Message → OperationLog → User → StyleConfig → SystemSetting

3. **`afterAll` (全局一次)**
   - 关闭 Prisma 数据库连接池

### 测试数据构造
- 使用 `createTestUser()` 创建不同角色用户
- 使用 `createTestWork()` 创建测试作品
- 使用 `createInteraction()` 创建互动记录
- 使用 `authHeader()` 生成认证头

---

## 本地运行测试

### 前置条件
- Node.js >= 16.20.2
- MySQL >= 5.7 或 8.0
- 已创建测试数据库: `portfolio_test`

### 步骤

1. **创建测试数据库**
```sql
CREATE DATABASE IF NOT EXISTS portfolio_test
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;
```

2. **配置环境变量** (已存在 `.env.test`)
```
NODE_ENV=test
PORT=8064
DATABASE_URL=mysql://root:password@localhost:3306/portfolio_test
JWT_SECRET=test_jwt_secret_key_1234567890
```

3. **安装依赖**
```bash
cd backend
npm install
```

4. **生成 Prisma Client**
```bash
npx prisma generate
```

5. **同步数据库 schema**
```bash
npx prisma db push
```

6. **运行测试**
```bash
# 运行所有测试
npm test

# 详细输出模式
npm run test:integration

# 监听模式
npm run test:watch
```

### 预期输出
```
 PASS  src/tests/work-lifecycle.integration.test.ts (32.456s)
  Work Lifecycle Integration Tests
    1. Authentication & Authorization Protection
      ✓ should reject access to admin endpoints without token (401) (45ms)
      ✓ should reject access to admin endpoints with invalid token format (403) (23ms)
      ✓ should reject access to admin endpoints with regular user token (403) (28ms)
      ✓ should reject access to admin GET endpoints with regular user token (403) (15ms)
    2. Admin Create Work
      ✓ should create work with default status PUBLISHED (38ms)
      ✓ should create work with specified status DRAFT (22ms)
      ✓ should create work with specified status PUBLISHED (19ms)
      ✓ should return 400 when title is missing (12ms)
      ✓ should return 400 when description is missing (11ms)
      ✓ should return 400 when mediaUrl is missing (10ms)
      ✓ should return 400 when multiple required fields are missing (11ms)
      ✓ should trim whitespace from title and description (21ms)
    3. Public Work Listing with Filters
      ✓ should only return PUBLISHED works in public listing (24ms)
      ✓ should return paginated results (18ms)
      ✓ should return second page correctly (15ms)
      ✓ should filter works by category (13ms)
      ✓ should filter works by keyword in title (14ms)
      ✓ should filter works by keyword in tags (12ms)
      ✓ should return empty array when no matches found (11ms)
      ✓ should combine category and search filters (13ms)
    4. Work Detail View Count Increment
      ✓ should increment viewCount on first access (23ms)
      ✓ should increment viewCount on second access (18ms)
      ✓ should increment viewCount on third access (16ms)
      ✓ should return 400 for invalid work ID (10ms)
      ✓ should not return DRAFT works in public detail view (21ms)
      ✓ should persist viewCount correctly in database (35ms)
    5. Toggle Like/Favorite Interaction
      Like Toggle
        ✓ should add like on first call (201) (25ms)
        ✓ should remove like on second call (toggle) (200) (22ms)
        ✓ should add like again on third call (201) (21ms)
      Favorite Toggle
        ✓ should add favorite on first call (201) (22ms)
        ✓ should remove favorite on second call (toggle) (200) (20ms)
      Unique Constraint Enforcement
        ✓ should allow different users to like the same work independently (45ms)
        ✓ should allow same user to like and favorite the same work (42ms)
        ✓ should handle concurrent toggle requests gracefully (unique constraint) (156ms)
      Validation
        ✓ should return 400 for invalid interaction type (12ms)
        ✓ should return 400 for invalid work ID (9ms)
        ✓ should return 401 when not authenticated (8ms)
    6. Delete Work with Interaction Cleanup
      ✓ should verify interactions exist before deletion (15ms)
      ✓ should delete work and all associated interactions (32ms)
      ✓ should preserve interactions for other works (12ms)
      ✓ should preserve user records after work deletion (10ms)
      ✓ should not allow regular user to delete work (18ms)
      ✓ should return 400 for invalid work ID on delete (9ms)
    7. Complete Work Lifecycle End-to-End
      ✓ should handle full lifecycle: create -> view -> interact -> delete (125ms)

Test Suites: 1 passed, 1 total
Tests:       41 passed, 41 total
Snapshots:   0 total
Time:        35.231s
Ran all test suites.
```

---

## CI 环境稳定运行策略

### GitHub Actions 配置 (`.github/workflows/tests.yml`)

关键设计点：

1. **服务容器**
   - MySQL 8.0 作为服务容器
   - 配置健康检查确保 MySQL 就绪
   - 自动创建 `portfolio_test` 数据库

2. **等待数据库就绪**
   - 使用 `mysqladmin ping` 循环探测
   - 最多等待 60 秒，避免超时

3. **依赖安装**
   - 使用 `npm ci` 而非 `npm install` 确保版本一致性
   - 利用 `actions/cache` 缓存 node_modules 加速

4. **测试执行**
   - `--runInBand` 单线程执行，避免数据库连接竞争
   - `--ci` 模式禁用交互式功能
   - 生成 JUnit XML 报告用于 CI 面板展示

5. **结果归档**
   - 测试结果作为 artifact 上传
   - 支持失败时调试

### CI 稳定性保障

| 措施 | 目的 |
|------|------|
| 独立测试数据库 | 与开发/生产环境完全隔离 |
| 每个用例前全表清理 | 保证用例间无数据依赖 |
| 单线程执行 (`--runInBand`) | 避免数据库死锁和连接耗尽 |
| 30s 超时配置 | 防止 CI 无限挂起 |
| MySQL 健康检查 | 确保数据库就绪后再运行测试 |
| `npm ci` + lockfile | 依赖版本可复现 |
| Prisma schema 同步 | 测试库结构与代码一致 |

---

## 测试关键分支覆盖说明

| 测试场景 | 覆盖分支 |
|----------|----------|
| 无 token | `authenticate` → 无 Authorization 头 |
| 非法 token | `jwt.verify()` 抛出异常分支 |
| 普通用户访问管理端 | `requireAdmin` → `isAdminRole()` 返回 false |
| 必填字段缺失 | `adminCreateWork` → `missingFields` 校验 |
| 默认状态 | `normalizeWorkPayload` → status 为 undefined |
| 指定 DRAFT | `normalizeWorkPayload` → status = 'DRAFT' |
| viewCount 自增 | `prisma.work.update` increment 操作 |
| DRAFT 作品访问 | `where: { status: 'PUBLISHED' }` → P2025 |
| 点赞切换-添加 | `existing` 为 null → create |
| 点赞切换-删除 | `existing` 存在 → delete |
| 并发请求 | 数据库唯一约束 `@@unique` 生效 |
| 删除清理 | `deleteMany` + `delete` 执行顺序 |

---

## 常见问题排查

### 1. 数据库连接失败
```
Error: Can't connect to MySQL server on 'localhost:3306'
```
- 确认 MySQL 服务运行
- 确认测试数据库已创建
- 检查 `.env.test` 中 DATABASE_URL 配置

### 2. Prisma Client 未生成
```
Error: @prisma/client did not initialize yet
```
```bash
npx prisma generate
```

### 3. 外键约束删除失败
确认清理顺序正确：先清 Interaction，再清 Work

### 4. 测试超时
- 增加 `testTimeout` 配置
- 检查数据库性能
- 确认无其他进程占用数据库
