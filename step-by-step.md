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

## 增加 MongoDB及对应的 model

1、官网注册账号并创建应用

2、增加配置MongoDB数据库地址

```env
// .env.local
...
MONGODB_URL=mongodb+srv://eagle:<replace>5@cluster0.wgjvgpd.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0
...
```

3、安装MongoDB和客户端库

```bash
npm install mongodb mongoose
```

4、 新增相对应的model文件

在 `lib/database/models` 下新建 user, image, transaction 文件，并填充对应的内容。

## 增加actions

在 `lib/actions` 下新建 user, image, transaction 文件, 并填充对应的内容。

## 新建github 仓库并push

## 注册 Vercel 并部署应用

1. 通过 https://vercel.com/new 注册后
2. 导入GitHub对应账号的项目，
3. 配置项目，主要是项目名称和环境变量，其他默认
4. 最后点击 Deploy, 等待部署完成
5. Congratulations! 如果部署成功会进入到 success 页面
6. 点击 `Continue to  Dashboard` 进入到管理页面

> 部署详情可以查看：[Next.js deployment documentation](https://nextjs.org/docs/deployment)

## 配置回调地址

上面部署完以后，vercel 会给分配一个域名

1.将完整回调填入到 clerk Webhooks 里 `https://xxxxx.vercel.app/api/webhooks/clerk`
2.在 `.evn.local` 或 环境变量(vercel)里添加配置 `WEBHOOK_SECRET=xxxx`
3.安装 `svix` 用于回调校验

```bash
npm install svix
```

4.创建回调路由

新建 `app/api/webhooks/clerk/route.ts`，并填入内容，参考：[route.ts](https://clerk.com/docs/integrations/webhooks/sync-data#create-the-endpoint-in-your-application)

5.在中间件里新增 `api/webhooks/clerk`

```typescript
// middleware.ts
export default authMiddleware({
  publicRoutes: ['/', '/api/webhooks/clerk']
});
```

6.校验

可以在 `dashboard` 的 `webhooks` 里进行校验，具体可以找 `Endpoints` -> `Testing` tab。

这样，clerk 的数据可以调用项目的回调接口来同步到后端数据库里。

7.提交git

提交到GitHub后，vercel会自动检测更新并重新构建。

具体可以看 [Sync Clerk data to your backend with webhooks](https://clerk.com/docs/integrations/webhooks/sync-data#enable-webhooks)

## 添加处理图片form

1、添加 `form`

```bash
npx shadcn-ui@latest add form input select toast
```

新增form `components/shared/TransformationForm` 并新增相应内容

2、添加图片上传处理

安装sdk

```bash
# 此sdk由社区维护，官方有 node 和 react sdk
npm install next-cloudinary
```

> 官方文档：https://next.cloudinary.dev/

添加配置

```env
// env.local
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=
CLOUNDINARY_API_KEY=
CLOUNDINARY_API_SECRET=
```

新增 `components/shared/MediaUploader.tsx` 及对应内容

```bash
npx shadcn-ui@latest add toast
```

> 如果想使用对应的功能，需要在 Coludinary 里进行配置

## 新增转换后的图片组件

新增 `components/shared/TransformedImage.tsx` 及对应内容

## 保存图片

安装 cloudinary

```bash
npm install cloudinary
```

1. 保存图片id到 cloudinary
2. 保存图片信息到 MongoDB
3. 修改图片时增加积分检查

## 新增图片详情、更新和删除

## 增加结算和支付

这里主要使用 `stripe`

1.安装 stripe

```bash
npm install stripe @stripe/stripe-js
```

2.配置 API Key

```env
# .env.local
STRIPE_SECRET_KEY=xxx
STRIPE_WEBHOOK_SECRET=xxx
```

3.增加webhook

在 `strpie` 后台配置定义好的 `webhook` 地址，当支付成功时 `scripe` 可以通知业务方,

业务方监听响应的事件event, 这里主要监听 `checkout.session.completed` 记录相应的流水信息等。

> 更多帮助可以查看官方文档：https://docs.stripe.com/payments/checkout

4.在中间件增加stripe路由

```typescript
...
export default authMiddleware({
  publicRoutes: ['/', '/api/webhooks/clerk', '/api/webhooks/stripe']
});
...
```

## 完善个人资料页

## 部署

更新环境变量，重新构建即可

1. 完善环境变量
2. redeloy

## FAQ

## References

- https://www.youtube.com/watch?v=Ahwoks_dawU
- https://cloud.mongodb.com/
- https://console.cloudinary.com/
- https://upstash.com/ for Redis
- https://docs.stripe.com/payments/checkout
