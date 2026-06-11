# 独立个人站系统 (Indie Site System) - 完整交付文档

本项目是一个前后端分离构建的响应式独立内容管理和作品展示网站。本文档旨在提供详尽的技术方案、数据库设计、核心逻辑、部署教程与使用手册。

---

## 一、 技术方案选型

### 1. 前端 (Frontend)
- **核心框架**: HTML5 + CSS3 + React 18 (TypeScript)
- **构建工具**: Vite (极速热更与极简生产打包)
- **UI 及响应式方案**: TailwindCSS v4 + Shadcn UI组件库。此选型完美保证了对 PC 端 1080P 及以上宽屏分辨率的高清适配能力，配合 React Router 提供了平滑顺畅的无刷新交互体验。

### 2. 后端 (Backend)
- **核心框架**: Node.js + Express (TypeScript)
- **运行特征**: 使用异步中间件架构，天生支持高并发。
- **接口安全与规范**: 采用 RESTful API 规范，全链路集成 `JWT` (JSON Web Token) 会话与角色权限 (`requireAdmin`) 拦截体系。

### 3. 数据库 (Database)
- **关系型数据库**: MySQL 8.0
- **数据建模 (ORM)**: Prisma。采用 Prisma 取代手写 SQL，提升了多表关联和强类型的开发安全保障，支持 Schema 自动迁移 (`prisma db push`)。

---

## 二、 数据库表结构设计

系统合理划分了六大核心数据模型：

1. **用户表 (`User`)**: 
   - 字段：`id`, `username`, `passwordHash` (Bcrypt 加密), `roleType` (ADMIN/USER), `status` (ACTIVE/BANNED), `createdAt`
2. **作品表 (`Work`)**: 
   - 字段：`id`, `title`, `description`, `mediaUrl`, `tags`, `category`, `status` (PUBLISHED/DRAFT), `viewCount`
3. **互动记录表 (`Interaction`)**: 
   - 字段：`id`, `userId`, `workId`, `interactionType` (LIKE/FAVORITE)
4. **网站风格管理表 (`StyleConfig`)**: 
   - 字段：`id`, `name`, `primaryColor` (Hex), `fontFamily`, `layoutMode`, `backgroundImage`, `isActive`
5. **用户留言表 (`Message`)**: 
   - 字段：`id`, `userId`, `content`, `status` (PENDING/APPROVED/REJECTED)
6. **系统高级设置表 (`SystemSetting`)**: 
   - 字段：`id`, `siteTitle`, `logoUrl`, `icpInfo`, `enableWorkReview`, `enableRegistration` 等开关与拓展元数据。

---

## 三、 前后端开发核心逻辑与架构扩展性

### 1. 后台切换风格无刷新逻辑
- **逻辑**: 前端在 `StyleContext.tsx` 中全局监听活跃的风格数据。一旦管理员切换风格，前端 Context 立刻更新 `document.documentElement.style` 中的对应 CSS 变量 (如 `--color-primary`)，实现了全站样式的秒级自适应无刷新切换。

### 2. 身份防刷与权限校验 (数据安全)
- **加密**: 利用 `bcryptjs` 库在用户注册或修改时对密码实施哈希运算存储。
- **拦截**: 采用 Express 中间件 `authenticate` 效验 `Authotization: Bearer <Token>` 有效性。后台敏感操作进一步调用 `requireAdmin` 核实权柄，阻绝越权调用请求。

### 3. 代码可扩展性保证 
- **高弹性扩展**: `Work` 的分类和 `StyleConfig` 被设计为独立模型，后续若需新增一种风格维度（例如：背景动画模式）或作品分类（例如：文章资源类），只需向 Prisma 模型和 React 对应的类型库追加一个字段配置，并不破坏现存的数据关联结构，具有强大的向后兼容性。

---

## 四、 部署文档 (本地 / 服务器部署)

本项目代码全部容器化，无论本地或云端 Linux 服务器，均采用一条指令拉起所有环境。

### 环境准备：
1. 确保服务器/本地具备 `Docker` 以及 `Docker-Compose`。
2. 将此源码复制并在根目录 `label-3063` 内打开终端。

### 一键部署运行：
```bash
docker compose up --build -d
```
*执行会自动完成 Node.js 镜像构建、MySQL 数据库初始化、以及端口映射。*

### 服务访问：
- **💻 前台浏览与后台控制面板**: [http://localhost:3063](http://localhost:3063) 或 `服务器IP:3063`
- **🔌 后端服务级 API 接口**: [http://localhost:8063](http://localhost:8063) 
*(内置数据库持久挂载，重启不丢数据)*

---

## 五、 后台管理 - 操作使用手册

> **测试账号**: 用户名: `admin` | 密码: `123456`

登录账号后点击右上角“后台管理”：
1. **作品管理**: 点击“新增作品”上传媒体链接与内容；打勾作品左侧复选框，可执行**批量上架/下架/删除**操作。
2. **用户管理**: 查看所有注册用户；支持管理员针对一般普通用户进行点击“封禁/解封”以及操作**重置密码**，重置后新密码即时生效。
3. **界面风格配置**: 在这里添加如暗沉色系或是极简冷色系的模板。选中并点击“设为启用”，切换回前台将立刻发现全站的文字与背景按钮排版颜色同步变更。
4. **留言审核**: 阅读用户发布在“个人中心”的建议留言，执行通过、打回。
5. **系统设置**: 修改网站 `Logo`、顶部标题栏以及底部的 `ICP 备案号`。

---

## 六、 开发排期规划回顾

- **第 1 阶段（基础架构与 DB）**：梳理 Docker-Compose, Prisma 模型定义，核心 Express 接口联调。 (整体耗时: 1 天)
- **第 2 阶段（业务接口开发）**：落实作品、管理、互动与登录安全。 (整体耗时: 1 天)
- **第 3 阶段（后台及前台基石）**：完成 React 项目搭建设定，编写 Admin 框架、基础的浏览与操作表格。(整体耗时: 1.5 天)
- **第 4 阶段（功能突破与调试）**：攻克高难度需求，包含无刷新 Context 主题切换、复杂的复选修改及批量删除交互联动。 (整体耗时: 1.5 天)

总计约 **5个工作日** 内完成全量闭环交付。

---

## 七、 测试要点指引

交付后如果进行回归验证，请特别关注以下方向：
1. **浏览器兼容性验证**：在 Chrome 和 Edge 分别登录测试后台管理表格是否有内容错位。
2. **风格热更渲染验证**：修改背景色及主色后，在未刷新浏览器的情况下回到主页，所有按钮悬停色及 Logo 色应联动变为新配置模式。
3. **权限屏障测试**：使用普通账号（Role: USER）登录并携带其 Token 通过 Postman 向 `/api/admin/users` 等管理端接口发送请求，检验后端是否成功抛出 `403 Forbidden`。
4. **作品生命周期流转**：测试作品由新增草稿 - 批量上架 - 前台展示访问(`viewCount`+1) - 批量删除的完整功能状态追踪。
