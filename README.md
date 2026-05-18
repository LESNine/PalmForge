<div align="center">

# 🌬️ PalmForge / 风铸

**PALM Large-Eddy Simulation Parameter Configurator**

**PALM 大涡模拟参数配置器**

[![License](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![PALM](https://img.shields.io/badge/PALM-4U-orange.svg)](https://palm.muk.uni-hannover.de/)

</div>

---

## English

### Overview

PalmForge is a web-based parameter configuration tool for the **PALM** (Parallelized Large-Eddy Simulation Model) atmospheric simulation system. It provides an intuitive visual interface for browsing, selecting, and configuring PALM's 874 parameters, and supports importing/exporting standard `.p3d` parameter files with nested domain management.

### Features

- **Required Parameters Framework** — Pre-configured essential parameters: grid spacing (dx/dy/dz), grid points (nx/ny/nz), simulation time, boundary conditions
- **Parameter Search & Add** — Search by parameter name (priority) or description in both English and Chinese; filter by 31 categories; keyboard navigation (↑↓/Enter/Esc)
- **Parameter Details Panel** — View type, default value, English description, and Chinese academic translation for each parameter
- **Dropdown Selection** — 270 parameters with known options (logical: .TRUE./.FALSE.; character: enumerated values) have dropdown selectors
- **Nested Domain Management** — Parent domain (N01) + child domains (N02, N03, ...); automatic `domain_layouts` and `nesting_parameters` generation; real-time update when grid parameters change
- **P3D Import/Export** — Import existing `.p3d` files (auto-detect parent/child domains); export to standard Fortran namelist format; child domains follow `_N0X` naming convention
- **Chinese Translation** — All 874 parameter descriptions translated to academic Chinese

### Quick Start

#### Option 1: Pre-built Package (Recommended)

1. Download the latest release zip
2. Extract to any folder
3. Open `index.html` in a modern browser (Chrome/Edge/Firefox)

#### Option 2: Development Mode

```bash
# Clone the repository
git clone https://github.com/YOUR_USERNAME/PalmForge.git
cd PalmForge

# Install dependencies
npm install

# Start development server
npm run dev

# Or use the launcher script (Windows)
start.bat
```

### P3D File Format

#### Parent Domain: `example.p3d`

```fortran
&initialization_parameters
 dx = 10.0,
 dy = 10.0,
 dz = 10.0,
 nx = 99,
 ny = 99,
 nz = 49,
 end_time = 3600.0,
/

&nesting_parameters
 domain_layouts = 'N01', 1, -1, 4, 0.0, 0.0, 0.0,
                  'N02', 2, 1, 4, 320.0, 128.0, 0.0,
/
```

#### Child Domain: `example_N02.p3d`

```fortran
&initialization_parameters
 dx = 5.0,
 dy = 5.0,
 dz = 5.0,
 nx = 49,
 ny = 49,
 nz = 49,
/

&nesting_parameters
 nesting = .T.,
/
```

### domain_layouts Specification

| Field | Description |
|-------|-------------|
| name | Domain name ('N01', 'N02', ...) |
| id | Domain ID (1=root, 2+=child) |
| parent_id | Parent domain ID (-1=root, 1=child of N01) |
| npe_total | Total MPI processes (auto-calculated, npex × npey must divide nx/ny) |
| lower_left_x | Lower-left x coordinate in parent frame (m), auto-centered |
| lower_left_y | Lower-left y coordinate in parent frame (m), auto-centered |
| nest_shift_z | Vertical offset from root domain (m) |

### Tech Stack

- React 18 + TypeScript + Vite
- Tailwind CSS 3
- Zustand (state management)
- lucide-react (icons)

---

## 中文

### 概述

PalmForge 是一个基于 Web 的 **PALM**（并行大涡模拟模型）大气模拟系统参数配置工具。它提供直观的可视化界面，帮助研究人员高效浏览、选择和配置 PALM 的 874 个参数，并支持标准 `.p3d` 参数文件的导入/导出与嵌套域管理。

### 功能特性

- **必选参数框架** — 预配置核心参数：网格间距 (dx/dy/dz)、网格点数 (nx/ny/nz)、模拟时间、边界条件
- **参数搜索添加** — 优先匹配参数名，其次匹配中英文描述；支持 31 个分类筛选；键盘导航 (↑↓/Enter/Esc)
- **参数详情面板** — 查看参数类型、默认值、英文说明及中文学术翻译
- **下拉选择框** — 270 个有已知选项的参数（logical: .TRUE./.FALSE.；character: 枚举值）提供下拉选择器
- **嵌套域管理** — 父域 (N01) + 子域 (N02, N03, ...)；自动生成 `domain_layouts` 和 `nesting_parameters`；网格参数修改时实时更新
- **P3D 导入导出** — 导入已有 `.p3d` 文件（自动识别父域/子域）；导出标准 Fortran namelist 格式；子域遵循 `_N0X` 命名规范
- **中文翻译** — 全部 874 个参数描述已翻译为中文学术语言

### 快速开始

#### 方式一：预构建包（推荐）

1. 下载最新 release 的 zip 文件
2. 解压至任意文件夹
3. 用现代浏览器（Chrome/Edge/Firefox）打开 `index.html`

#### 方式二：开发模式

```bash
# 克隆仓库
git clone https://github.com/YOUR_USERNAME/PalmForge.git
cd PalmForge

# 安装依赖
npm install

# 启动开发服务器
npm run dev

# 或使用启动脚本（Windows）
start.bat
```

### P3D 文件格式

#### 父域：`example.p3d`

```fortran
&initialization_parameters
 dx = 10.0,
 dy = 10.0,
 dz = 10.0,
 nx = 99,
 ny = 99,
 nz = 49,
 end_time = 3600.0,
/

&nesting_parameters
 domain_layouts = 'N01', 1, -1, 4, 0.0, 0.0, 0.0,
                  'N02', 2, 1, 4, 320.0, 128.0, 0.0,
/
```

#### 子域：`example_N02.p3d`

```fortran
&initialization_parameters
 dx = 5.0,
 dy = 5.0,
 dz = 5.0,
 nx = 49,
 ny = 49,
 nz = 49,
/

&nesting_parameters
 nesting = .T.,
/
```

### domain_layouts 规范

| 字段 | 说明 |
|------|------|
| name | 域名称 ('N01', 'N02', ...) |
| id | 域编号 (1=根域, 2+=子域) |
| parent_id | 父域编号 (-1=根域无父域, 1=嵌套在N01中) |
| npe_total | MPI 进程总数（自动计算，npex × npey 须能整除 nx/ny） |
| lower_left_x | 在父域坐标系中南左角 x 坐标 (m)，自动居中 |
| lower_left_y | 在父域坐标系中南左角 y 坐标 (m)，自动居中 |
| nest_shift_z | 相对根域的垂直偏移 (m) |

### 技术栈

- React 18 + TypeScript + Vite
- Tailwind CSS 3
- Zustand（状态管理）
- lucide-react（图标库）

---

## License / 许可证

MIT License
