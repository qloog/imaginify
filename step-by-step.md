# 从0到1开发步骤

## develop tools

- VS Code
- VS Code 插件
  - Prettier
  - ESLint
  - ES7+ React/Redux/React-Native(dsznajder)
  - Tailwind CSS IntelliSense

## Project Setup

### 使用Nextjs初始化项目

```bash
❯ npx create-next-app@latest ./
Need to install the following packages:
create-next-app@14.1.0
Ok to proceed? (y)
✔ Would you like to use TypeScript? … No / Yes
✔ Would you like to use ESLint? … No / Yes
✔ Would you like to use Tailwind CSS? … No / Yes
✔ Would you like to use `src/` directory? … No / Yes
✔ Would you like to use App Router? (recommended) … No / Yes
✔ Would you like to customize the default import alias (@/*)? … No / Yes
```

### 安装 shadcn/ui

```bash
❯ npx shadcn-ui@latest init

✔ Which style would you like to use? › Default
✔ Which color would you like to use as base color? › Slate
✔ Would you like to use CSS variables for colors? … no / yes

✔ Writing components.json...
✔ Initializing project...
✔ Installing dependencies...

Success! Project initialization completed. You may now add components.
```

## 修改字体及全局配置

### 修改配置站点信息和字体

修改默认字体 `Inter` 为 `IBM_Plex_Sans` 。

### 修改tailwind和globals.css

修改 `tailwind.config.ts`，增加 颜色、字体和背景图

修改 `globals.css`, 新增样式

### 增加静态资源 `public/assets`

## 增加目录结构(路由)

1、新增 `auth` 路由并增加基本布局

```typescript
// 新增layout
// app/(auth)/layout.tsx
import React from 'react'

const Layout = () => {
  return (
    <div>layout</div>
  )
}

export default Layout
```

```typescript
// 完善布局
import React from 'react'

const Layout = ({ children}: { children: React.ReactNode }) => {
  return (
    <main className='auth'>{children}</main>
  )
}

export default Layout
```

> rafce + tab 可创建基本结构

2、新增 `root` 基本布局

```typescript
// 新增layout
// app/(root)/layout.tsx
import React from 'react'

const Layout = ({ children}: { children: React.ReactNode }) => {
  return (
    <main className='root'>
      <div className='root-container'>
        <div className='wrapper'>
          {children}
        </div>
      </div>
    </main>
  )
}

export default Layout
```

3、移动 `app/page.tsx` 到 `app/(root)`  
4、新增功能目录

```bash
|-- (root)
|   |-- credits
|   |   `-- page.tsx
|   |-- layout.tsx
|   |-- page.tsx
|   |-- profile
|   |   `-- page.tsx
|   `-- transformations
|       |-- [id]
|       |   |-- page.tsx
|       |   `-- update
|       |       `-- page.tsx
|       `-- add
|           `-- [type]
|               `-- page.tsx
```

## 增加登录注册功能

1、在 `dashboard.clerk.com` 创建新应用

主要配置: Email, Username, Email, Google 和 Github

2、新增 clerk 配置

```env
// .env.local
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_xxxxx
CLERK_SECRET_KEY=sk_test_xxxxxx
```

3、根据文档安装 `clerk` SDK

文档地址：https://clerk.com/docs/quickstarts/nextjs

```bash
# 安装 clerk
npm install @clerk/nextjs
```

4、 配置 ClerkProvider

```typescript
// app/layout.tsx
import { ClerkProvider } from '@clerk/nextjs'
import './globals.css'
 
export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (        
    <ClerkProvider>
      <html lang="en">
        <body>{children}</body>
      </html>
    </ClerkProvider>
  )
}
```

5、增加中间件

```typescript
// middleware.ts
import { authMiddleware } from "@clerk/nextjs";
 
export default authMiddleware({});
```

6、运行应用, 打开 http://localhost:3000 可以看到登录界面

```bash
npm run dev
```

7、建立注册和登录路由目录

建立注册和登录目录，添加 `page.tsx` 文件并分别补充内容。

```bash
.
|-- (auth)
|   |-- layout.tsx
|   |-- sign-in
|   |   `-- [[...sign-in]]
|   |       `-- page.tsx
|   `-- sign-up
|       `-- [[...sign-up]]
|           `-- page.tsx
```

注册

```typescript
// app/(auth)/sign-up/[[...sign-up]]/page.tsx
import { SignUp } from '@clerk/nextjs'
import React from 'react'

const SignUpPage = () => {
  return <SignUp />
}

export default SignUpPage
```

登录

```typescript
// app/(auth)/sign-in/[[...sign-in]]/page.tsx
import { SignIn } from '@clerk/nextjs'
import React from 'react'

const SignInPage = () => {
  return <SignIn />
}

export default SignInPage
```

8、增加配置

```env
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/
```

9、配置显示用户登录后按钮

```typescript
import { UserButton } from '@clerk/nextjs'
import React from 'react'

const Home = () => {
  return (
    <div>
      <p>Home</p>

      <UserButton afterSignOutUrl="/"/>
    </div>
  )
}

export default Home
```

9、定制外观样式

```typescript
// app/layout.tsx
<ClerkProvider appearance={{
  variables: { colorPrimary: '#624cf5'}
}}>
```

> https://clerk.com/docs/references/nextjs/custom-signup-signin-pages

## 增加导航

包括PC侧边栏和移动端导航

1、新增侧边栏组件 `components/shared/Sidebar.ts`
其中需要添加 `Button`组件

```bash
npx shadcn-ui@latest add button
```

新增常量定义文件 `constants/index.ts`

2、在中间件增加路由

新增无需登录认证的路由

```typescript
export default authMiddleware({
  publicRoutes: ['/', '/api/webhooks/clerk', '/api/webhooks/stripe']
});
```

此时可以看到 左侧显示的菜单列表，但移动端是看不到导航栏的，所以还需要针对移动端增加菜单栏。

3、增加移动端导航

安装 sheet 组件

```bash
npx shadcn-ui@latest add sheet
```

全部代码可以看 `components/shared/MobileNav.tsx`

## FAQ

1、SVG在Nextjs中不显示


## Reference2

- https://www.youtube.com/watch?v=Ahwoks_dawU
