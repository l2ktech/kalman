<template>
	<div class="astar-container">
		<h1 class="title">A* 寻路算法演示</h1>
		<h3 class="subtitle">交互式路径规划 - 可视化搜索过程</h3>

		<mu-row gutter class="stats">
			<mu-col style="font-size:16px;" sm="0" md="1" lg="2" span="12"></mu-col>
			<mu-col style="font-size:18px;" sm="12" md="10" lg="8" span="12">
				<center>
					<div style="background-color:#f5f5f5; padding:15px; border-radius:8px; margin:15px 0;">
						<h4 style="margin-top:0;">💡 什么是 A* 算法？</h4>
						<p style="line-height: 1.8; text-align: left;">
							<strong>A* (A-Star)</strong> 是最经典的路径规划算法之一。<br><br>
							<strong>简单理解：</strong><br>
							就像导航软件找最短路线，A* 同时考虑两个因素：<br>
							<strong>1. g(n)</strong>：从起点到当前点的实际距离<br>
							<strong>2. h(n)</strong>：从当前点到终点的估计距离（启发式）<br><br>
							<strong>🔢 核心公式：</strong><br>
							<code>f(n) = g(n) + h(n)</code><br><br>
							算法总是选择 <code>f(n)</code> 最小的点继续探索，保证找到最优路径。<br><br>
							<strong>颜色含义：</strong><br>
							🟩 <strong>绿色</strong> = 起点 | 🔴 <strong>红色</strong> = 终点<br>
							⬛ <strong>黑色</strong> = 障碍物 | 🟦 <strong>蓝色</strong> = 已探索<br>
							🟨 <strong>黄色</strong> = 待探索 | 🟪 <strong>紫色</strong> = 最终路径
						</p>
					</div>

					<p style="font-size:16px; background-color:#e3f2fd; padding:10px; border-radius:5px;">
						<strong>👆 操作提示：</strong>在网格上点击设置障碍物，然后点击"开始寻路"观看算法运行！
					</p>
				</center>
			</mu-col>
			<mu-col style="font-size:16px;" sm="0" md="1" lg="2" span="12"></mu-col>
		</mu-row>

		<br>
		<mu-row gutter class="stats">
			<mu-col style="padding-left:5%;padding-right:2.5%; padding: 15px" sm="12" md="12" lg="4" span="12">
				<div class="grid-cell control-panel">
					<h4 style="margin-bottom: 10px;">🎮 控制面板</h4>

					<mu-button @click="startSearch" :color="searching ? 'orange' : 'primary'" full-width :disabled="searching">
						<mu-icon :value="searching ? 'hourglass_empty' : 'play_arrow'"></mu-icon>
						{{ searching ? '寻路中...' : '开始寻路' }}
					</mu-button>
					<br /><br />

					<mu-button @click="clearPath" color="secondary" full-width :disabled="searching">
						<mu-icon value="clear"></mu-icon> 清除路径
					</mu-button>
					<br /><br />

					<mu-button @click="clearObstacles" color="warning" full-width :disabled="searching">
						<mu-icon value="delete_sweep"></mu-icon> 清除障碍物
					</mu-button>
					<br /><br />

					<mu-button @click="resetGrid" color="red" full-width :disabled="searching">
						<mu-icon value="refresh"></mu-icon> 重置地图
					</mu-button>

					<br><br>
					<div class="control-group">
						<strong>动画速度：</strong> <b>{{ animationSpeed }}</b> ms
						<mu-slider :min="1" :max="100" :step="1" v-model="animationSpeed" :disabled="searching"></mu-slider>
						<small style="display:block; margin-top:-10px; color:#666;">数值越小动画越快</small>
					</div>

					<div class="control-group">
						<strong>启发式函数：</strong>
						<mu-select v-model="heuristic" full-width :disabled="searching">
							<mu-option value="manhattan" label="曼哈顿距离（推荐）"></mu-option>
							<mu-option value="euclidean" label="欧几里得距离"></mu-option>
							<mu-option value="chebyshev" label="切比雪夫距离"></mu-option>
						</mu-select>
						<small style="display:block; margin-top:5px; color:#666;">影响路径搜索策略</small>
					</div>

					<div class="control-group">
						<strong>对角线移动：</strong>
						<mu-switch v-model="allowDiagonal" :disabled="searching"></mu-switch>
						<small style="display:block; margin-top:5px; color:#666;">允许斜向移动</small>
					</div>

					<br>
					<div class="info-box">
						<strong>📊 统计信息</strong><br>
						起点：<code>({{ start.x }}, {{ start.y }})</code><br>
						终点：<code>({{ goal.x }}, {{ goal.y }})</code><br>
						障碍物：<code>{{ obstacles.length }}</code> 个<br>
						已探索：<code>{{ closedSet.length }}</code> 个节点<br>
						待探索：<code>{{ openSet.length }}</code> 个节点<br>
						路径长度：<code>{{ pathLength }}</code><br>
						状态：<code>{{ status }}</code>
					</div>

					<div class="preset-buttons">
						<h5>⚙️ 预设场景</h5>
						<mu-button @click="setPreset('maze')" size="small" color="primary" :disabled="searching">迷宫</mu-button>
						<mu-button @click="setPreset('rooms')" size="small" color="success" :disabled="searching">房间</mu-button>
						<mu-button @click="setPreset('diagonal')" size="small" color="secondary" :disabled="searching">对角</mu-button>
					</div>

					<br>
					<div style="background-color:#fff3e0; padding:10px; border-radius:5px; font-size:0.9rem;">
						<strong>💡 使用说明：</strong><br>
						• 点击网格添加/移除障碍物<br>
						• 拖动绿色/红色点移动起点/终点<br>
						• 调整速度观察算法过程<br>
						• 尝试不同的启发式函数
					</div>
				</div>
			</mu-col>

			<mu-col sm="12" md="12" lg="8" span="12">
				<div class="grid-cell">
					<canvas
						ref="gridCanvas"
						:width="canvasWidth"
						:height="canvasHeight"
						class="grid-canvas"
						@click="handleClick"
						@mousemove="handleMouseMove"
						@mousedown="handleMouseDown"
						@mouseup="handleMouseUp"
					></canvas>
					<div class="legend">
						<span class="legend-item"><span class="square" style="background:#4CAF50;"></span> 起点</span>
						<span class="legend-item"><span class="square" style="background:#f44336;"></span> 终点</span>
						<span class="legend-item"><span class="square" style="background:#424242;"></span> 障碍物</span>
						<span class="legend-item"><span class="square" style="background:#2196F3;"></span> 已探索</span>
						<span class="legend-item"><span class="square" style="background:#FFC107;"></span> 待探索</span>
						<span class="legend-item"><span class="square" style="background:#9C27B0;"></span> 最终路径</span>
					</div>
				</div>
			</mu-col>
		</mu-row>

		<br><br>
		<mu-row gutter class="stats">
			<mu-col style="font-size:16px;" sm="0" md="1" lg="2" span="12"></mu-col>
			<mu-col style="font-size:16px;" sm="12" md="10" lg="8" span="12">
				<center>
					<div style="background-color:#fff3e0; padding:20px; border-radius:8px; border-left:4px solid #ff6f00;">
						<h4 style="margin-top:0;">📚 A* 算法的应用</h4>
						<div style="line-height: 1.8; text-align:left;">
							<strong>🎮 游戏开发</strong>：NPC 移动、地图导航、AI 寻路<br>
							<strong>🤖 机器人</strong>：移动机器人路径规划、避障<br>
							<strong>🗺️ 地图导航</strong>：GPS 导航、最短路径计算<br>
							<strong>🚗 自动驾驶</strong>：车辆路径规划、轨迹优化<br>
							<strong>📦 物流配送</strong>：仓库机器人、配送路径优化<br>
							<strong>🏗️ 工程规划</strong>：管道布线、电路板设计
						</div>
					</div>

					<br>
					<div style="background-color:#e8f5e9; padding:20px; border-radius:8px; border-left:4px solid #4CAF50;">
						<h4 style="margin-top:0;">🧮 算法详解</h4>
						<div style="line-height: 1.8; text-align:left;">
							<strong>1. 初始化：</strong><br>
							• 将起点加入开放列表（待探索）<br>
							• 设置起点的 g 值为 0<br><br>

							<strong>2. 主循环：</strong><br>
							• 从开放列表选择 f 值最小的节点<br>
							• 如果是终点，搜索结束<br>
							• 否则，将其移至关闭列表（已探索）<br>
							• 探索其所有邻居节点<br><br>

							<strong>3. 更新邻居：</strong><br>
							• 计算经过当前点到邻居的新 g 值<br>
							• 如果更优，更新邻居的 g、f 和父节点<br>
							• 将邻居加入开放列表<br><br>

							<strong>4. 重建路径：</strong><br>
							• 从终点沿着父节点指针回溯到起点
						</div>
					</div>
				</center>
			</mu-col>
			<mu-col style="font-size:16px;" sm="0" md="1" lg="2" span="12"></mu-col>
		</mu-row>
	</div>
</template>

<script>
export default {
	name: 'AStarView',
	data: () => ({
		canvasWidth: 800,
		canvasHeight: 600,
		ctx: null,

		// Grid settings
		gridSize: 20,
		rows: 30,
		cols: 40,

		// Start and goal
		start: { x: 2, y: 15 },
		goal: { x: 37, y: 15 },

		// A* data structures
		openSet: [],
		closedSet: [],
		path: [],
		obstacles: [],

		// Algorithm state
		searching: false,
		status: '就绪',
		pathLength: 0,

		// Settings
		animationSpeed: 10,
		heuristic: 'manhattan',
		allowDiagonal: true,

		// Mouse interaction
		dragging: null,
		isDrawingObstacle: false
	}),

	mounted() {
		const canvas = this.$refs.gridCanvas;
		this.ctx = canvas.getContext('2d');
		this.drawGrid();
	},

	methods: {
		drawGrid() {
			const ctx = this.ctx;
			const cellSize = this.gridSize;

			// Clear canvas
			ctx.fillStyle = '#f5f5f5';
			ctx.fillRect(0, 0, this.canvasWidth, this.canvasHeight);

			// Draw grid lines
			ctx.strokeStyle = '#ddd';
			ctx.lineWidth = 1;

			for (let i = 0; i <= this.cols; i++) {
				ctx.beginPath();
				ctx.moveTo(i * cellSize, 0);
				ctx.lineTo(i * cellSize, this.rows * cellSize);
				ctx.stroke();
			}

			for (let i = 0; i <= this.rows; i++) {
				ctx.beginPath();
				ctx.moveTo(0, i * cellSize);
				ctx.lineTo(this.cols * cellSize, i * cellSize);
				ctx.stroke();
			}

			// Draw obstacles
			ctx.fillStyle = '#424242';
			this.obstacles.forEach(obs => {
				ctx.fillRect(obs.x * cellSize, obs.y * cellSize, cellSize, cellSize);
			});

			// Draw closed set (explored)
			ctx.fillStyle = 'rgba(33, 150, 243, 0.3)';
			this.closedSet.forEach(node => {
				ctx.fillRect(node.x * cellSize, node.y * cellSize, cellSize, cellSize);
			});

			// Draw open set (to explore)
			ctx.fillStyle = 'rgba(255, 193, 7, 0.5)';
			this.openSet.forEach(node => {
				ctx.fillRect(node.x * cellSize, node.y * cellSize, cellSize, cellSize);
			});

			// Draw path
			if (this.path.length > 0) {
				ctx.fillStyle = 'rgba(156, 39, 176, 0.6)';
				this.path.forEach(node => {
					ctx.fillRect(node.x * cellSize, node.y * cellSize, cellSize, cellSize);
				});
			}

			// Draw start
			ctx.fillStyle = '#4CAF50';
			ctx.fillRect(this.start.x * cellSize, this.start.y * cellSize, cellSize, cellSize);
			ctx.fillStyle = '#fff';
			ctx.font = 'bold 12px Inter';
			ctx.textAlign = 'center';
			ctx.fillText('S', (this.start.x + 0.5) * cellSize, (this.start.y + 0.6) * cellSize);

			// Draw goal
			ctx.fillStyle = '#f44336';
			ctx.fillRect(this.goal.x * cellSize, this.goal.y * cellSize, cellSize, cellSize);
			ctx.fillStyle = '#fff';
			ctx.fillText('G', (this.goal.x + 0.5) * cellSize, (this.goal.y + 0.6) * cellSize);
		},

		async startSearch() {
			if (this.searching) return;

			this.searching = true;
			this.status = '搜索中...';
			this.openSet = [];
			this.closedSet = [];
			this.path = [];
			this.pathLength = 0;

			// Initialize start node
			const startNode = {
				x: this.start.x,
				y: this.start.y,
				g: 0,
				h: this.calculateHeuristic(this.start, this.goal),
				f: 0,
				parent: null
			};
			startNode.f = startNode.g + startNode.h;

			this.openSet.push(startNode);

			// A* main loop
			while (this.openSet.length > 0) {
				// Find node with lowest f score
				let currentIndex = 0;
				for (let i = 1; i < this.openSet.length; i++) {
					if (this.openSet[i].f < this.openSet[currentIndex].f) {
						currentIndex = i;
					}
				}

				const current = this.openSet[currentIndex];

				// Check if we reached the goal
				if (current.x === this.goal.x && current.y === this.goal.y) {
					this.reconstructPath(current);
					this.status = '找到路径！';
					this.searching = false;
					return;
				}

				// Move current from open to closed
				this.openSet.splice(currentIndex, 1);
				this.closedSet.push(current);

				// Explore neighbors
				const neighbors = this.getNeighbors(current);
				for (const neighbor of neighbors) {
					// Skip if in closed set or is obstacle
					if (this.inClosedSet(neighbor) || this.isObstacle(neighbor)) {
						continue;
					}

					const tentativeG = current.g + this.getDistance(current, neighbor);

					const openNode = this.findInOpenSet(neighbor);
					if (!openNode) {
						// New node, add to open set
						neighbor.g = tentativeG;
						neighbor.h = this.calculateHeuristic(neighbor, this.goal);
						neighbor.f = neighbor.g + neighbor.h;
						neighbor.parent = current;
						this.openSet.push(neighbor);
					} else if (tentativeG < openNode.g) {
						// Better path found
						openNode.g = tentativeG;
						openNode.f = openNode.g + openNode.h;
						openNode.parent = current;
					}
				}

				// Animate
				this.drawGrid();
				await this.sleep(this.animationSpeed);
			}

			this.status = '未找到路径';
			this.searching = false;
		},

		reconstructPath(endNode) {
			this.path = [];
			let current = endNode;
			while (current) {
				this.path.unshift({ x: current.x, y: current.y });
				current = current.parent;
			}
			this.pathLength = this.path.length;
			this.drawGrid();
		},

		getNeighbors(node) {
			const neighbors = [];
			const directions = [
				{ x: 0, y: -1 },  // up
				{ x: 1, y: 0 },   // right
				{ x: 0, y: 1 },   // down
				{ x: -1, y: 0 }   // left
			];

			if (this.allowDiagonal) {
				directions.push(
					{ x: 1, y: -1 },  // up-right
					{ x: 1, y: 1 },   // down-right
					{ x: -1, y: 1 },  // down-left
					{ x: -1, y: -1 }  // up-left
				);
			}

			for (const dir of directions) {
				const x = node.x + dir.x;
				const y = node.y + dir.y;

				if (x >= 0 && x < this.cols && y >= 0 && y < this.rows) {
					neighbors.push({ x, y });
				}
			}

			return neighbors;
		},

		calculateHeuristic(a, b) {
			switch (this.heuristic) {
				case 'manhattan':
					return Math.abs(a.x - b.x) + Math.abs(a.y - b.y);
				case 'euclidean':
					return Math.sqrt((a.x - b.x) ** 2 + (a.y - b.y) ** 2);
				case 'chebyshev':
					return Math.max(Math.abs(a.x - b.x), Math.abs(a.y - b.y));
				default:
					return 0;
			}
		},

		getDistance(a, b) {
			const dx = Math.abs(a.x - b.x);
			const dy = Math.abs(a.y - b.y);
			return (dx + dy === 2) ? 1.414 : 1; // Diagonal vs straight
		},

		inClosedSet(node) {
			return this.closedSet.some(n => n.x === node.x && n.y === node.y);
		},

		findInOpenSet(node) {
			return this.openSet.find(n => n.x === node.x && n.y === node.y);
		},

		isObstacle(node) {
			return this.obstacles.some(obs => obs.x === node.x && obs.y === node.y);
		},

		sleep(ms) {
			return new Promise(resolve => setTimeout(resolve, ms));
		},

		handleClick(event) {
			if (this.searching) return;

			const rect = this.$refs.gridCanvas.getBoundingClientRect();
			const x = Math.floor((event.clientX - rect.left) / this.gridSize);
			const y = Math.floor((event.clientY - rect.top) / this.gridSize);

			// Don't place obstacle on start or goal
			if ((x === this.start.x && y === this.start.y) ||
			    (x === this.goal.x && y === this.goal.y)) {
				return;
			}

			// Toggle obstacle
			const obsIndex = this.obstacles.findIndex(obs => obs.x === x && obs.y === y);
			if (obsIndex >= 0) {
				this.obstacles.splice(obsIndex, 1);
			} else {
				this.obstacles.push({ x, y });
			}

			this.drawGrid();
		},

		handleMouseDown(event) {
			const rect = this.$refs.gridCanvas.getBoundingClientRect();
			const x = Math.floor((event.clientX - rect.left) / this.gridSize);
			const y = Math.floor((event.clientY - rect.top) / this.gridSize);

			if (x === this.start.x && y === this.start.y) {
				this.dragging = 'start';
			} else if (x === this.goal.x && y === this.goal.y) {
				this.dragging = 'goal';
			} else {
				this.isDrawingObstacle = true;
			}
		},

		handleMouseMove(event) {
			if (!this.dragging && !this.isDrawingObstacle) return;
			if (this.searching) return;

			const rect = this.$refs.gridCanvas.getBoundingClientRect();
			const x = Math.floor((event.clientX - rect.left) / this.gridSize);
			const y = Math.floor((event.clientY - rect.top) / this.gridSize);

			if (x < 0 || x >= this.cols || y < 0 || y >= this.rows) return;

			if (this.dragging === 'start') {
				if (x !== this.goal.x || y !== this.goal.y) {
					this.start = { x, y };
					this.drawGrid();
				}
			} else if (this.dragging === 'goal') {
				if (x !== this.start.x || y !== this.start.y) {
					this.goal = { x, y };
					this.drawGrid();
				}
			} else if (this.isDrawingObstacle) {
				if ((x !== this.start.x || y !== this.start.y) &&
				    (x !== this.goal.x || y !== this.goal.y)) {
					if (!this.obstacles.some(obs => obs.x === x && obs.y === y)) {
						this.obstacles.push({ x, y });
						this.drawGrid();
					}
				}
			}
		},

		handleMouseUp() {
			this.dragging = null;
			this.isDrawingObstacle = false;
		},

		clearPath() {
			this.openSet = [];
			this.closedSet = [];
			this.path = [];
			this.pathLength = 0;
			this.status = '就绪';
			this.drawGrid();
		},

		clearObstacles() {
			this.obstacles = [];
			this.clearPath();
		},

		resetGrid() {
			this.start = { x: 2, y: 15 };
			this.goal = { x: 37, y: 15 };
			this.clearObstacles();
		},

		setPreset(type) {
			this.clearObstacles();

			switch(type) {
				case 'maze':
					// Create maze pattern
					for (let i = 5; i < 35; i += 4) {
						for (let j = 3; j < 27; j++) {
							if (j !== 15) {
								this.obstacles.push({ x: i, y: j });
							}
						}
					}
					break;
				case 'rooms':
					// Create rooms
					for (let i = 10; i < 30; i++) {
						if (i !== 15 && i !== 20) {
							this.obstacles.push({ x: i, y: 10 });
							this.obstacles.push({ x: i, y: 20 });
						}
					}
					for (let j = 10; j < 20; j++) {
						if (j !== 15) {
							this.obstacles.push({ x: 20, y: j });
						}
					}
					break;
				case 'diagonal':
					// Diagonal wall
					for (let i = 0; i < 30; i++) {
						const x = i + 5;
						const y = i;
						if (x < this.cols && y < this.rows) {
							this.obstacles.push({ x, y });
						}
					}
					break;
			}

			this.drawGrid();
		}
	}
}
</script>

<style scoped>
.astar-container {
	padding: 20px;
	max-width: 1400px;
	margin: 0 auto;
}

.title {
	font-weight: 700;
	font-size: 2.8rem;
	letter-spacing: -0.06em;
	line-height: 1;
	margin-bottom: 0.1em;
	color: #2c3e50;
}

.subtitle {
	font-weight: 500;
	font-size: 1.5rem;
	letter-spacing: -0.05em;
	line-height: 1;
	margin-top: 0;
	color: #546e7a;
}

.control-panel {
	background: white;
	padding: 20px;
	border-radius: 12px;
	box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.control-group {
	margin-bottom: 20px;
}

.grid-canvas {
	width: 100%;
	max-width: 800px;
	height: auto;
	border-radius: 12px;
	box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
	cursor: pointer;
}

.info-box {
	background: #f5f5f5;
	padding: 15px;
	border-radius: 8px;
	border-left: 4px solid #2196F3;
	font-size: 0.95rem;
	line-height: 1.8;
}

.legend {
	margin-top: 15px;
	display: flex;
	justify-content: center;
	gap: 15px;
	flex-wrap: wrap;
}

.legend-item {
	display: flex;
	align-items: center;
	gap: 8px;
	font-size: 0.9rem;
	color: #546e7a;
}

.square {
	width: 16px;
	height: 16px;
	display: inline-block;
	border: 1px solid #999;
}

.preset-buttons {
	margin-top: 20px;
	padding: 15px;
	background: #f5f5f5;
	border-radius: 8px;
}

.preset-buttons h5 {
	margin-top: 0;
	margin-bottom: 10px;
}

.preset-buttons button {
	margin: 5px;
}
</style>
