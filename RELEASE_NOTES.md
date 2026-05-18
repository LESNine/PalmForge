# PalmForge v1.0.0 Release Notes

## Overview / 概述

PalmForge is a web-based parameter configuration tool for the **PALM** (Parallelized Large-Eddy Simulation Model) atmospheric simulation system. This release provides a complete visual interface for configuring PALM's 874 parameters with full support for nested domain management and standard `.p3d` file import/export.

PalmForge 是一个基于 Web 的 **PALM**（并行大涡模拟模型）大气模拟系统参数配置工具。本版本提供了完整的可视化界面，支持配置 PALM 的 874 个参数，并全面支持嵌套域管理与标准 `.p3d` 文件导入/导出。

---

## Key Features / 核心功能

### 1. Parameter Database / 参数数据库
- **874 PALM parameters** indexed across 31 categories
- **Full Chinese academic translations** for all parameter descriptions
- Real-time search with priority ranking (parameter name > Chinese description > English description)
- Category filtering with parameter counts

- **874 个 PALM 参数**，分布在 31 个分类中
- 全部参数描述已翻译为**中文学术语言**
- 实时搜索，优先匹配参数名，其次匹配中英文描述
- 分类筛选，显示各分类参数数量

### 2. Required Parameters Framework / 必选参数框架
- Pre-configured essential parameters: dx/dy/dz, nx/ny/nz, end_time, boundary conditions
- Two-column layout: grid spacing (left) | grid points (right)
- Dropdown selectors for parameters with known options (bc_lr, bc_ns, initializing_actions, etc.)

- 预配置核心参数：dx/dy/dz、nx/ny/nz、end_time、边界条件
- 双列布局：网格间距（左）| 网格点数（右）
- 有已知选项的参数提供下拉选择器（bc_lr、bc_ns、initializing_actions 等）

### 3. Parameter Search & Selection / 参数搜索与选择
- **270 parameters** with dropdown options (182 logical + 88 character)
- Keyboard navigation: ↑↓ to navigate, Enter to add, Esc to close
- Duplicate detection — already-added parameters are grayed out
- Chinese description preview in search results

- **270 个参数**提供下拉选项（182 个 logical + 88 个 character）
- 键盘导航：↑↓ 导航、Enter 添加、Esc 关闭
- 重复检测 — 已添加参数置灰显示
- 搜索结果中显示中文描述预览

### 4. Nested Domain Management / 嵌套域管理
- Parent domain (N01) + child domains (N02, N03, ...)
- Automatic `domain_layouts` generation with correct `pmc_layout` format:
  ```
  'N01', 1, -1, npe, 0.0, 0.0, 0.0,
  'N02', 2, 1, npe, llx, lly, 0.0
  ```
- Automatic `nesting = .T.` added to child domains
- Real-time update: modifying grid parameters instantly recalculates domain_layouts
- Auto-centered child domains (llx/lly calculated to place child in parent center)
- MPI process count auto-calculated to ensure npex/npey divides nx/ny

- 父域 (N01) + 子域 (N02, N03, ...)
- 自动生成符合 `pmc_layout` 格式的 `domain_layouts`：
  ```
  'N01', 1, -1, npe, 0.0, 0.0, 0.0,
  'N02', 2, 1, npe, llx, lly, 0.0
  ```
- 子域自动添加 `nesting = .T.`
- 实时更新：修改网格参数即时重新计算 domain_layouts
- 子域自动居中（自动计算 llx/lly 使子域位于父域中心）
- MPI 进程数自动计算，确保 npex/npey 能整除 nx/ny

### 5. P3D Import/Export / P3D 导入导出
- **Import**: Drag-and-drop or select `.p3d` files; auto-detect parent/child domains from filename
  - `example.p3d` → parent domain (N01)
  - `example_N02.p3d` → child domain (N02)
- **Export**: Standard Fortran namelist format
  - nx/ny automatically decremented by 1 (PALM convention)
  - Child domains exported with `_N0X` suffix

- **导入**：拖拽或选择 `.p3d` 文件；根据文件名自动识别父域/子域
  - `example.p3d` → 父域 (N01)
  - `example_N02.p3d` → 子域 (N02)
- **导出**：标准 Fortran namelist 格式
  - nx/ny 自动减 1（符合 PALM 规范）
  - 子域文件以 `_N0X` 后缀导出

### 6. UI Design / 界面设计
- Industrial-tech dark theme (#0a0f1a background)
- Amber highlights for required parameters, cyan for optional
- JetBrains Mono for parameter names, Noto Sans SC for Chinese text
- Responsive layout with slide-in detail panel

- 工业科技风深色主题（#0a0f1a 背景）
- 琥珀色标记必选参数，青色标记可选参数
- JetBrains Mono 显示参数名，Noto Sans SC 显示中文
- 响应式布局，带滑入详情面板

---

## Installation / 安装方式

### Option 1: Standalone Package (No Node.js Required) / 免安装版（无需 Node.js）
1. Download `PalmForge_v1.0.zip` from Releases
2. Extract to any folder
3. Double-click `start.bat` — a built-in HTTP server will start and open your browser
4. Press **Q** in the terminal to stop the server

> ⚠️ Do NOT open `index.html` directly — browsers block ES modules from `file://` protocol.

1. 从 Releases 下载 `PalmForge_v1.0.zip`
2. 解压至任意文件夹
3. 双击 `start.bat` — 内置 HTTP 服务器会启动并自动打开浏览器
4. 在终端按 **Q** 键关闭服务器

> ⚠️ 请勿直接打开 `index.html`——浏览器会因安全策略显示空白页。

### Option 2: Developer Package (Requires Node.js) / 完整开发版（需要 Node.js）
1. Download `PalmForge_Full_v1.0.zip` from Releases
2. Extract to any folder
3. Make sure [Node.js](https://nodejs.org/) (LTS) is installed
4. Double-click `start.bat` — it will auto-detect Node.js, install dependencies, and launch the dev server

1. 从 Releases 下载 `PalmForge_Full_v1.0.zip`
2. 解压至任意文件夹
3. 确保已安装 [Node.js](https://nodejs.org/)（推荐 LTS 版本）
4. 双击 `start.bat` — 自动检测 Node.js、安装依赖并启动开发服务器

### Option 3: Build from Source / 从源码构建
```bash
git clone https://github.com/YOUR_USERNAME/PalmForge.git
cd PalmForge
npm install
npm run dev
```

---

## File Structure / 文件结构

```
PalmForge/
├── dist/                          # Pre-built static files (standalone version)
│   ├── index.html
│   ├── start.bat                  # Launcher (built-in HTTP server)
│   ├── server.ps1                 # PowerShell HTTP server (no Node.js needed)
│   ├── README.txt                 # Usage instructions
│   └── assets/
├── src/
│   ├── components/                # React components
│   │   ├── Header.tsx
│   │   ├── DomainTabs.tsx
│   │   ├── RequiredParams.tsx
│   │   ├── AddedParamsList.tsx
│   │   ├── ParamSearchModal.tsx
│   │   ├── ParamDetailPanel.tsx
│   │   └── AddParamButton.tsx
│   ├── store/                     # Zustand state management
│   │   ├── configStore.ts
│   │   └── uiStore.ts
│   ├── utils/                     # Utilities
│   │   ├── parseP3d.ts
│   │   ├── generateP3d.ts
│   │   └── domainUtils.ts
│   ├── data/                      # Parameter data
│   │   ├── palm_params_index.json      # 874 parameters
│   │   └── palm_param_options.json     # 270 parameters with options
│   └── types/
│       └── index.ts
├── start.bat / start.ps1          # Windows launcher (developer version)
├── README.md
├── LICENSE (MIT)
└── package.json
```

---

## Known Limitations / 已知限制

- Pure frontend application — no server-side persistence (configurations saved in browser session only)
- Domain layouts auto-calculation assumes child domains are centered in parent; manual adjustment of llx/lly may be needed for off-center placements
- Some character-type parameters may have incomplete option extraction from descriptions

- 纯前端应用 — 无服务端持久化（配置仅在浏览器会话中保存）
- domain_layouts 自动计算假设子域在父域中心；非居中放置可能需要手动调整 llx/lly
- 部分 character 类型参数可能未完整提取描述中的可选值

---

## Tech Stack / 技术栈

- React 18 + TypeScript + Vite
- Tailwind CSS 3
- Zustand (state management)
- lucide-react (icons)

---

## License / 许可证

MIT License — see [LICENSE](LICENSE) for details.
