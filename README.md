# Rift Outlast

一个运行在浏览器中的原创 2D 俯视角生存动作游戏原型，灵感来自自动攻击生存类玩法，但角色、命名、武器、美术表现和数值都为原创实现。

## 启动

```bash
npm run dev
```

然后打开 `http://localhost:5173`

如果你的环境里没有把 Node 加入 PATH，请先安装或修复 Node 环境。

## 操作

- `WASD` 或方向键移动
- `Esc` 暂停 / 继续
- 升级时点击卡牌选择强化
- 死亡后可重新开始或返回角色选择

## 内容清单

### 角色 / 开局路线

- 裂隙行者：高机动，初始武器为弧刃卫星
- 余烬术士：高伤害，初始武器为余烬长矛
- 棱镜守卫：高生存，初始武器为寒霜场

### 武器

- 弧刃卫星：近距离环绕型
- 余烬长矛：直线投射物型
- 花粉散射：扇形散射型
- 雷鸣脉冲：定时范围爆发型
- 追迹幽灯：追踪型
- 穿晶轨刺：穿透型
- 回返月镰：回旋 / 往返型
- 寒霜场：持续区域伤害型

### 被动升级

- 疾速回路
- 过载伤害
- 复数弹幕
- 加速发射
- 裂隙暴击
- 广域增幅
- 延展回响
- 迅捷步态
- 生命编织
- 引力采集
- 经验回路
- 应急修复
- 相位护甲

### 敌人

- 裂隙爬行者：普通追击型
- 尖啸突行者：高速脆皮型
- 厚甲巨躯：高血量缓慢型
- 酸液喷吐者：远程攻击型
- 折跃猎犬：冲刺型
- 裂生母体：分裂型
- 精英棱镜体：精英怪
- 裂冠巨像：Boss 原型

## 项目结构

```text
.
├─ index.html
├─ server.js
├─ package.json
├─ README.md
└─ src
   ├─ main.js
   ├─ styles.css
   ├─ data/config.js
   ├─ entities/Entities.js
   ├─ game/Game.js
   ├─ game/SceneManager.js
   ├─ scenes/ArenaScene.js
   ├─ systems/Systems.js
   └─ utils/math.js
```

## 架构说明

- `Game / SceneManager`：游戏入口、主循环、场景切换
- `ArenaScene`：单局运行逻辑、渲染、战斗状态
- `Player / Enemy / Projectile / Pickup`：实体层
- `SpawnSystem`：刷怪节奏与难度增长
- `UpgradeSystem`：升级池、武器获取与被动成长
- `CollisionSystem`：命中、伤害、拾取
- `UiController`：HUD、角色选择、升级、暂停、结算
- `data/config.js`：角色、武器、敌人、被动的配置驱动数据

## 开发阶段回顾

### 阶段1：设计与规划

- 技术栈选择：原生 JavaScript + HTML5 Canvas
- 目录与模块职责已经拆分完成
- 数据采用配置驱动，新增内容主要改 `config.js`

### 阶段2：稳定 MVP

已包含：

- 玩家移动
- 敌人追击
- 自动攻击
- 经验掉落与升级
- HUD
- Game Over 与重开

当前版本已可玩。

### 阶段3：扩展内容

已扩展到：

- 8 种武器
- 13 种被动升级
- 8 种敌人原型
- 3 个角色 / 开局路线
- 1 个 Boss 原型
- 难度曲线、暂停、击中反馈、本地最高分

## 如何继续扩展

### 新增武器

1. 在 `src/data/config.js` 的 `weapons` 中增加定义和等级数据
2. 如果复用现有 `kind`，无需额外逻辑
3. 如果是新行为类型，在 `src/scenes/ArenaScene.js` 中新增发射逻辑

### 新增敌人

1. 在 `src/data/config.js` 的 `enemies` 中增加配置
2. 在 `encounterSchedule` 中安排出场时间
3. 若是新 AI 行为，在 `src/entities/Entities.js` 中扩展 `Enemy.update`

### 新增被动

1. 在 `src/data/config.js` 的 `passives` 中增加条目
2. 若是新属性，在 `Player.levelUpPassive` 中增加应用方式

## 已知问题与建议

- 目前地图是无限战场，后续可以加入主题地图、障碍和事件
- 远程敌人的弹道仍较基础，后续可扩展更多弹幕变化
- 当前没有音效资源，后续可加入占位音效和设置菜单
- 终端环境里未检测到可执行的 `node` 命令，所以我本次没法本地实际启动验证，只完成了静态结构和逻辑自查
