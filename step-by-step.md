# 从0到1开发步骤

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
