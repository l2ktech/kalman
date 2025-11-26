# 🎓 控制算法学习平台

> **在线交互式算法演示平台** - 让算法学习变得可视化、可交互、易理解

一个专注于控制算法、机器人算法和具身智能的在线学习平台。通过实时可视化和交互式操作，让复杂的算法变得触手可及。

### 🌐 [在线体验](https://www.l2k.tech/)

---

## ✨ 特性

- 🎯 **实时可视化** - 所有算法都有实时动画演示
- 🎮 **交互式控制** - 可调节参数，立即看到效果
- 📚 **详细说明** - 通俗易懂的中文解释，普通人也能看懂
- 🎨 **现代化界面** - 渐变设计，响应式布局，支持移动端
- 🔬 **实践导向** - 边测试边学习，从实践中理解理论

---

## 📊 已实现的算法

### 1️⃣ 卡尔曼滤波器 (Kalman Filter)

**用途：** 噪声过滤、状态估计

**功能：**
- 实时 2D 轨迹追踪演示
- 可视化噪声数据和过滤结果
- 可调节噪声强度、预测步数等参数
- 支持多种运动模式（鼠标、方形路径、随机路径等）

**应用场景：**
- GPS 定位优化
- 自动驾驶传感器融合
- 手机陀螺仪数据处理
- 目标追踪系统

### 2️⃣ PID 控制器 (PID Controller)

**用途：** 闭环控制、系统稳定

**功能：**
- 机械臂角度控制演示
- 实时可视化 P、I、D 三个分量的作用
- 可调节 Kp、Ki、Kd 参数
- 干扰测试和快速预设
- 动力学模型模拟（惯性、摩擦）

**应用场景：**
- 工业机器人控制
- 无人机姿态稳定
- 汽车巡航控制
- 温度/压力控制系统

---

## 🚀 快速开始

### 在线体验

直接访问 [https://www.l2k.tech/](https://www.l2k.tech/)

### 本地开发

```bash
# 克隆仓库
git clone https://github.com/q442333521/kalman.git
cd kalman

# 安装依赖
npm install

# 启动开发服务器
npm run serve

# 访问 http://localhost:8080
```

### 构建部署

```bash
# 构建生产版本
NODE_OPTIONS=--openssl-legacy-provider npm run build

# 部署到 GitHub Pages
npm run deploy
```

---

## 📁 项目结构

```
kalman/
├── public/               # 静态资源
│   ├── index.html       # HTML 模板
│   ├── CNAME            # 自定义域名配置
│   └── sylvester.js     # 矩阵数学库
├── src/
│   ├── App.vue          # 主应用
│   ├── main.js          # 入口文件
│   ├── router/          # 路由配置
│   │   └── index.js
│   ├── components/      # 组件
│   │   ├── NavBar.vue   # 导航栏
│   │   └── Kalman.vue   # 卡尔曼组件（旧）
│   └── views/           # 页面视图
│       ├── KalmanView.vue   # 卡尔曼滤波器页面
│       └── PIDView.vue      # PID 控制器页面
├── package.json
└── vue.config.js        # Vue CLI 配置
```

---

## 🛠️ 技术栈

- **前端框架:** [Vue.js 2](https://v2.vuejs.org/)
- **路由:** [Vue Router](https://router.vuejs.org/)
- **UI 框架:** [Muse UI](https://muse-ui.org)
- **图形渲染:** Canvas API
- **数学库:** [Sylvester](http://sylvester.jcoglan.com/) - 向量和矩阵运算
- **构建工具:** Vue CLI 3

---

## 📝 开发计划 (TODO)

### 🔥 近期计划

- [ ] **机械臂运动学** (Robotic Arm Kinematics)
  - [ ] 正运动学 (Forward Kinematics) 可视化
  - [ ] 逆运动学 (Inverse Kinematics) 求解演示
  - [ ] 多关节机械臂交互式控制
  - [ ] 工作空间可达性分析

- [ ] **路径规划算法** (Path Planning)
  - [ ] A* 寻路算法可视化
  - [ ] RRT (Rapidly-exploring Random Tree)
  - [ ] 势场法 (Artificial Potential Field)
  - [ ] Dijkstra 算法对比

### 🎯 中期规划

- [ ] **轨迹规划** (Trajectory Planning)
  - [ ] 五次多项式轨迹
  - [ ] 梯形速度曲线
  - [ ] S 型加减速曲线
  - [ ] B 样条曲线

- [ ] **控制算法进阶**
  - [ ] MPC (模型预测控制)
  - [ ] LQR (线性二次调节器)
  - [ ] 滑模控制 (Sliding Mode Control)
  - [ ] 自适应控制

- [ ] **传感器融合**
  - [ ] 扩展卡尔曼滤波 (EKF)
  - [ ] 粒子滤波 (Particle Filter)
  - [ ] 互补滤波器
  - [ ] 多传感器数据融合

### 🚀 长期愿景

- [ ] **具身智能 (Embodied AI)**
  - [ ] VLA (Vision-Language-Action) 模型演示
  - [ ] 视觉-语言理解交互
  - [ ] 动作策略可视化
  - [ ] 端到端学习演示

- [ ] **强化学习**
  - [ ] Q-Learning 可视化
  - [ ] DQN 训练过程
  - [ ] Policy Gradient 演示
  - [ ] 机械臂抓取学习

- [ ] **计算机视觉**
  - [ ] 目标检测实时演示
  - [ ] 视觉伺服控制
  - [ ] SLAM 可视化
  - [ ] 深度估计

- [ ] **动力学仿真**
  - [ ] 刚体动力学
  - [ ] 碰撞检测
  - [ ] 物理引擎集成
  - [ ] 多体系统仿真

### 🎨 功能优化

- [ ] 添加更多语言支持（英文、日文等）
- [ ] 性能优化和代码分割
- [ ] 添加算法性能对比模块
- [ ] 用户自定义参数保存功能
- [ ] 导出仿真数据和图表
- [ ] 添加教学视频和文档
- [ ] 社区贡献算法模块

---

## 🎯 设计理念

### 为什么创建这个平台？

传统的算法学习往往停留在理论层面，公式和代码让很多人望而却步。这个平台的目标是：

1. **可视化优先** - 所见即所得，直观理解算法原理
2. **交互式学习** - 动手调参数，从实践中学习
3. **通俗易懂** - 用生活化的比喻解释复杂概念
4. **实用导向** - 展示真实应用场景和案例

### 适合谁使用？

- 📚 **学生** - 学习控制理论、机器人学、具身智能
- 👨‍🏫 **教师** - 教学演示和课堂互动
- 🔬 **研究人员** - 快速验证算法思路
- 💼 **工程师** - 理解算法原理和调参技巧
- 🤔 **好奇者** - 对算法和机器人感兴趣的任何人

---

## 🤝 贡献指南

欢迎贡献新的算法演示！

1. Fork 本仓库
2. 创建特性分支 (`git checkout -b feature/NewAlgorithm`)
3. 在 `src/views/` 创建新的算法页面
4. 在 `src/router/index.js` 添加路由
5. 提交更改 (`git commit -m 'Add NewAlgorithm demo'`)
6. 推送到分支 (`git push origin feature/NewAlgorithm`)
7. 创建 Pull Request

### 贡献建议

- **代码规范:** 遵循 ESLint 配置
- **中文优先:** 界面和说明使用中文
- **详细注释:** 关键算法添加注释
- **性能考虑:** 确保动画流畅（60 FPS）
- **响应式设计:** 支持移动端访问

---

## 📄 许可证

MIT License - 详见 [LICENSE](LICENSE) 文件

---

## 🙏 致谢

### 原始项目

本项目基于 [avivace/kalman](https://github.com/avivace/kalman) 扩展开发

- **原作者:** [Antonio Vivace](https://github.com/avivace)
- **贡献者:** [Manuele Rota](https://github.com/dubvulture)

### 参考资料

**卡尔曼滤波器:**
- [An introduction to the Kalman Filter](http://www.cs.utexas.edu/~pstone/Courses/393Rfall13/readings/Welch+Bishop-TR-95.pdf)
- [Understanding the Basis of the Kalman Filter](https://courses.engr.illinois.edu/ece420/sp2017/UnderstandingKalmanFilter.pdf)
- [Implementation of Kalman Filter with Python](https://arxiv.org/pdf/1204.0375.pdf)

**PID 控制:**
- [PID Controller Tuning: A Short Tutorial](https://www.google.com/search?q=pid+controller+tutorial)
- [Understanding PID Control](https://www.mathworks.com/help/control/getstart/understanding-pid-control.html)

**具身智能:**
- [RT-1: Robotics Transformer](https://arxiv.org/abs/2212.06817)
- [PaLM-E: An Embodied Multimodal Language Model](https://arxiv.org/abs/2303.03378)
- [OpenVLA: Open-Source Vision-Language-Action Model](https://arxiv.org/abs/2406.09246)

---

## 📮 联系方式

- **项目地址:** [https://github.com/q442333521/kalman](https://github.com/q442333521/kalman)
- **在线演示:** [https://www.l2k.tech/](https://www.l2k.tech/)
- **问题反馈:** [GitHub Issues](https://github.com/q442333521/kalman/issues)

---

<p align="center">
  <b>让算法学习变得简单有趣 🚀</b><br>
  从卡尔曼滤波到具身智能，一站式学习平台
</p>

<p align="center">
  <a href="https://www.l2k.tech/">立即体验</a> •
  <a href="https://github.com/q442333521/kalman/issues">反馈建议</a> •
  <a href="#-贡献指南">参与贡献</a>
</p>
