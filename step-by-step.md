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
