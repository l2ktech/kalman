<template>
	<div class="ik-container">
		<h1 class="title">机械臂逆运动学演示</h1>
		<h3 class="subtitle">CCD 迭代求解 - 目标位置自动控制</h3>

		<mu-row gutter class="stats">
			<mu-col style="font-size:16px;" sm="0" md="1" lg="2" span="12"></mu-col>
			<mu-col style="font-size:18px;" sm="12" md="10" lg="8" span="12">
				<center>
					<div style="background-color:#f5f5f5; padding:15px; border-radius:8px; margin:15px 0;">
						<h4 style="margin-top:0;">💡 什么是逆运动学？</h4>
						<p style="line-height: 1.8; text-align: left;">
							<strong>逆运动学 (Inverse Kinematics, IK)</strong> 是正运动学的逆问题。<br><br>
							<strong>正运动学：</strong>已知关节角度 → 计算末端位置<br>
							<strong>逆运动学：</strong>已知末端位置 → 求解关节角度 ⭐<br><br>
							<strong>🎯 为什么重要？</strong><br>
							在实际应用中，我们通常知道想让机械臂到达的位置（比如抓取物体），但需要计算出各关节应该如何运动。这就是逆运动学的用途！<br><br>
							<strong>🔧 CCD 算法 (Cyclic Coordinate Descent)：</strong><br>
							从末端关节开始，依次调整每个关节，使末端逐渐接近目标。<br>
							循环迭代多次，直到误差足够小或达到最大迭代次数。
						</p>
					</div>

					<p style="font-size:16px; background-color:#e3f2fd; padding:10px; border-radius:5px;">
						<strong>👆 操作提示：</strong>在画布上拖动红色目标点，机械臂会自动调整姿态跟随！
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

					<mu-button @click="toggleSolving" :color="autoSolve ? 'orange' : 'primary'" full-width>
						<mu-icon :value="autoSolve ? 'pause' : 'play_arrow'"></mu-icon>
						{{ autoSolve ? '暂停求解' : '自动求解' }}
					</mu-button>
					<br /><br />

					<mu-button @click="stepSolve" color="secondary" full-width :disabled="autoSolve">
						<mu-icon value="skip_next"></mu-icon> 单步迭代
					</mu-button>
					<br /><br />

					<mu-button @click="resetArm" color="warning" full-width>
						<mu-icon value="refresh"></mu-icon> 重置机械臂
					</mu-button>

					<br><br>
					<div class="control-group">
						<strong>最大迭代次数：</strong> <b>{{ maxIterations }}</b>
						<mu-slider :min="1" :max="50" :step="1" v-model="maxIterations"></mu-slider>
						<small style="display:block; margin-top:-10px; color:#666;">每次求解的最大迭代次数</small>
					</div>

					<div class="control-group">
						<strong>收敛阈值：</strong> <b>{{ threshold }}</b> px
						<mu-slider :min="0.1" :max="10" :step="0.1" v-model="threshold"></mu-slider>
						<small style="display:block; margin-top:-10px; color:#666;">误差小于此值时停止迭代</small>
					</div>

					<div class="control-group">
						<strong>关节数量：</strong> <b>{{ jointCount }}</b>
						<mu-slider :min="2" :max="6" :step="1" v-model="jointCount" @change="resetArm"></mu-slider>
						<small style="display:block; margin-top:-10px; color:#666;">机械臂的关节数量</small>
					</div>

					<br>
					<div class="info-box">
						<strong>📍 目标位置</strong><br>
						X: <code>{{ target.x.toFixed(1) }}</code> px<br>
						Y: <code>{{ target.y.toFixed(1) }}</code> px<br><br>

						<strong>📍 末端位置</strong><br>
						X: <code>{{ endEffector.x.toFixed(1) }}</code> px<br>
						Y: <code>{{ endEffector.y.toFixed(1) }}</code> px<br><br>

						<strong>📏 误差距离：</strong><br>
						<code>{{ error.toFixed(2) }}</code> px<br><br>

						<strong>🔄 迭代次数：</strong><br>
						<code>{{ iterations }}</code><br><br>

						<strong>状态：</strong>
						<span :style="{color: error < threshold ? '#4CAF50' : '#FF9800'}">
							{{ error < threshold ? '✓ 已收敛' : '○ 未收敛' }}
						</span>
					</div>

					<div class="preset-buttons">
						<h5>⚙️ 快速操作</h5>
						<mu-button @click="randomTarget" size="small" color="primary">随机目标</mu-button>
						<mu-button @click="centerTarget" size="small" color="success">居中目标</mu-button>
					</div>

					<br>
					<div style="background-color:#fff3e0; padding:10px; border-radius:5px; font-size:0.9rem;">
						<strong>💡 使用说明：</strong><br>
						• 拖动红色圆点设置目标位置<br>
						• 启用"自动求解"实时跟踪<br>
						• 或使用"单步迭代"观察过程<br>
						• 调整关节数量体验不同配置
					</div>
				</div>
			</mu-col>

			<mu-col sm="12" md="12" lg="8" span="12">
				<div class="grid-cell">
					<canvas
						ref="ikCanvas"
						:width="canvasWidth"
						:height="canvasHeight"
						class="ik-canvas"
						@mousedown="handleMouseDown"
						@mousemove="handleMouseMove"
						@mouseup="handleMouseUp"
					></canvas>
					<div class="legend">
						<span class="legend-item"><span class="dot" style="background:#2196F3;"></span> 基座</span>
						<span class="legend-item"><span class="dot" style="background:#4CAF50;"></span> 关节</span>
						<span class="legend-item"><span class="dot" style="background:#FF9800;"></span> 末端</span>
						<span class="legend-item"><span class="dot" style="background:#f44336;"></span> 目标</span>
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
						<h4 style="margin-top:0;">📚 逆运动学的应用</h4>
						<div style="line-height: 1.8; text-align:left;">
							<strong>🦾 工业机械臂</strong>：抓取、焊接、装配任务<br>
							<strong>🎮 游戏动画</strong>：角色手臂、腿部的自然运动<br>
							<strong>🎬 电影特效</strong>：CG 角色的真实动作捕捉<br>
							<strong>🏥 手术机器人</strong>：精准定位手术工具<br>
							<strong>🎨 动画制作</strong>：骨骼绑定、动作设计<br>
							<strong>🤖 人形机器人</strong>：行走、抓取等复杂动作
						</div>
					</div>

					<br>
					<div style="background-color:#e8f5e9; padding:20px; border-radius:8px; border-left:4px solid #4CAF50;">
						<h4 style="margin-top:0;">🔧 CCD 算法步骤</h4>
						<div style="line-height: 1.8; text-align:left;">
							<strong>1. 从末端关节开始</strong><br>
							• 计算从当前关节到末端的向量<br>
							• 计算从当前关节到目标的向量<br><br>

							<strong>2. 计算旋转角度</strong><br>
							• 求两个向量之间的夹角<br>
							• 调整该关节使末端向目标旋转<br><br>

							<strong>3. 向前遍历</strong><br>
							• 依次处理每个关节（从末端到基座）<br>
							• 每个关节都做微调<br><br>

							<strong>4. 迭代收敛</strong><br>
							• 重复步骤 1-3<br>
							• 直到误差小于阈值或达到最大迭代次数
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
	name: 'InverseKinematicsView',
	data: () => ({
		canvasWidth: 800,
		canvasHeight: 600,
		ctx: null,

		// Arm configuration
		jointCount: 4,
		linkLength: 80,
		joints: [],
		angles: [],

		// Target
		target: { x: 500, y: 300 },
		endEffector: { x: 0, y: 0 },

		// IK solving
		autoSolve: true,
		maxIterations: 10,
		threshold: 2,
		iterations: 0,
		error: 0,

		// Mouse interaction
		draggingTarget: false,

		// Animation
		animationId: null
	}),

	mounted() {
		const canvas = this.$refs.ikCanvas;
		this.ctx = canvas.getContext('2d');
		this.resetArm();
		if (this.autoSolve) {
			this.startAnimation();
		}
	},

	beforeDestroy() {
		if (this.animationId) {
			cancelAnimationFrame(this.animationId);
		}
	},

	methods: {
		resetArm() {
			const baseX = this.canvasWidth / 2;
			const baseY = this.canvasHeight - 100;

			this.joints = [{ x: baseX, y: baseY }];
			this.angles = [];

			for (let i = 0; i < this.jointCount; i++) {
				this.angles.push(0);
				const prevJoint = this.joints[this.joints.length - 1];
				this.joints.push({
					x: prevJoint.x,
					y: prevJoint.y - this.linkLength
				});
			}

			this.updateFK();
			this.drawArm();
		},

		updateFK() {
			const baseX = this.canvasWidth / 2;
			const baseY = this.canvasHeight - 100;

			this.joints = [{ x: baseX, y: baseY }];

			let cumulativeAngle = 0;
			for (let i = 0; i < this.jointCount; i++) {
				cumulativeAngle += this.angles[i];
				const prevJoint = this.joints[i];

				this.joints.push({
					x: prevJoint.x + this.linkLength * Math.cos(cumulativeAngle),
					y: prevJoint.y + this.linkLength * Math.sin(cumulativeAngle)
				});
			}

			this.endEffector = this.joints[this.joints.length - 1];
			this.error = Math.sqrt(
				(this.endEffector.x - this.target.x) ** 2 +
				(this.endEffector.y - this.target.y) ** 2
			);
		},

		solveCCD() {
			this.iterations = 0;

			for (let iter = 0; iter < this.maxIterations; iter++) {
				this.iterations++;

				for (let i = this.jointCount - 1; i >= 0; i--) {
					const joint = this.joints[i];
					const endEff = this.joints[this.jointCount];

					// Vector from joint to end effector
					const dx1 = endEff.x - joint.x;
					const dy1 = endEff.y - joint.y;

					// Vector from joint to target
					const dx2 = this.target.x - joint.x;
					const dy2 = this.target.y - joint.y;

					// Calculate angle between vectors
					const angle1 = Math.atan2(dy1, dx1);
					const angle2 = Math.atan2(dy2, dx2);

					let deltaAngle = angle2 - angle1;

					// Normalize angle to [-π, π]
					while (deltaAngle > Math.PI) deltaAngle -= 2 * Math.PI;
					while (deltaAngle < -Math.PI) deltaAngle += 2 * Math.PI;

					// Apply rotation
					this.angles[i] += deltaAngle;

					// Update forward kinematics
					this.updateFK();
				}

				// Check if converged
				if (this.error < this.threshold) {
					break;
				}
			}
		},

		stepSolve() {
			// Single iteration of CCD
			for (let i = this.jointCount - 1; i >= 0; i--) {
				const joint = this.joints[i];
				const endEff = this.joints[this.jointCount];

				const dx1 = endEff.x - joint.x;
				const dy1 = endEff.y - joint.y;
				const dx2 = this.target.x - joint.x;
				const dy2 = this.target.y - joint.y;

				const angle1 = Math.atan2(dy1, dx1);
				const angle2 = Math.atan2(dy2, dx2);
				let deltaAngle = angle2 - angle1;

				while (deltaAngle > Math.PI) deltaAngle -= 2 * Math.PI;
				while (deltaAngle < -Math.PI) deltaAngle += 2 * Math.PI;

				this.angles[i] += deltaAngle * 0.5; // Damped for smoother animation

				this.updateFK();
			}
			this.iterations++;
			this.drawArm();
		},

		startAnimation() {
			const animate = () => {
				if (this.autoSolve && this.error > this.threshold) {
					this.solveCCD();
				}
				this.drawArm();
				this.animationId = requestAnimationFrame(animate);
			};
			animate();
		},

		toggleSolving() {
			this.autoSolve = !this.autoSolve;
			if (this.autoSolve && !this.animationId) {
				this.startAnimation();
			}
		},

		drawArm() {
			const ctx = this.ctx;
			const canvas = this.$refs.ikCanvas;

			// Clear canvas
			ctx.fillStyle = '#1a1a2e';
			ctx.fillRect(0, 0, canvas.width, canvas.height);

			// Draw grid
			ctx.strokeStyle = 'rgba(255, 255, 255, 0.05)';
			ctx.lineWidth = 1;
			for (let i = 0; i < canvas.width; i += 50) {
				ctx.beginPath();
				ctx.moveTo(i, 0);
				ctx.lineTo(i, canvas.height);
				ctx.stroke();
			}
			for (let i = 0; i < canvas.height; i += 50) {
				ctx.beginPath();
				ctx.moveTo(0, i);
				ctx.lineTo(canvas.width, i);
				ctx.stroke();
			}

			// Draw links
			for (let i = 0; i < this.jointCount; i++) {
				const j1 = this.joints[i];
				const j2 = this.joints[i + 1];

				ctx.strokeStyle = `hsl(${i * (360 / this.jointCount)}, 70%, 60%)`;
				ctx.lineWidth = 12;
				ctx.lineCap = 'round';
				ctx.beginPath();
				ctx.moveTo(j1.x, j1.y);
				ctx.lineTo(j2.x, j2.y);
				ctx.stroke();
			}

			// Draw joints
			this.joints.forEach((joint, i) => {
				if (i === 0) {
					// Base
					ctx.fillStyle = '#2196F3';
					ctx.beginPath();
					ctx.arc(joint.x, joint.y, 20, 0, Math.PI * 2);
					ctx.fill();
				} else if (i === this.jointCount) {
					// End effector
					ctx.fillStyle = '#FF9800';
					ctx.beginPath();
					ctx.arc(joint.x, joint.y, 15, 0, Math.PI * 2);
					ctx.fill();
				} else {
					// Regular joint
					ctx.fillStyle = '#4CAF50';
					ctx.beginPath();
					ctx.arc(joint.x, joint.y, 10, 0, Math.PI * 2);
					ctx.fill();
				}
			});

			// Draw target
			ctx.fillStyle = 'rgba(244, 67, 54, 0.3)';
			ctx.beginPath();
			ctx.arc(this.target.x, this.target.y, 25, 0, Math.PI * 2);
			ctx.fill();

			ctx.fillStyle = '#f44336';
			ctx.beginPath();
			ctx.arc(this.target.x, this.target.y, 15, 0, Math.PI * 2);
			ctx.fill();

			// Draw connection line
			ctx.strokeStyle = this.error < this.threshold ? '#4CAF50' : '#FF9800';
			ctx.lineWidth = 2;
			ctx.setLineDash([5, 5]);
			ctx.beginPath();
			ctx.moveTo(this.endEffector.x, this.endEffector.y);
			ctx.lineTo(this.target.x, this.target.y);
			ctx.stroke();
			ctx.setLineDash([]);
		},

		handleMouseDown(event) {
			const rect = this.$refs.ikCanvas.getBoundingClientRect();
			const x = event.clientX - rect.left;
			const y = event.clientY - rect.top;

			const dist = Math.sqrt((x - this.target.x) ** 2 + (y - this.target.y) ** 2);
			if (dist < 25) {
				this.draggingTarget = true;
			}
		},

		handleMouseMove(event) {
			if (!this.draggingTarget) return;

			const rect = this.$refs.ikCanvas.getBoundingClientRect();
			this.target.x = event.clientX - rect.left;
			this.target.y = event.clientY - rect.top;
		},

		handleMouseUp() {
			this.draggingTarget = false;
		},

		randomTarget() {
			const maxReach = this.linkLength * this.jointCount;
			const centerX = this.canvasWidth / 2;
			const centerY = this.canvasHeight - 100;

			const angle = Math.random() * Math.PI * 2;
			const distance = Math.random() * maxReach * 0.8;

			this.target.x = centerX + Math.cos(angle) * distance;
			this.target.y = centerY + Math.sin(angle) * distance;
		},

		centerTarget() {
			this.target.x = this.canvasWidth / 2;
			this.target.y = this.canvasHeight / 2;
		}
	}
}
</script>

<style scoped>
.ik-container {
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
	margin-bottom: 25px;
}

.ik-canvas {
	width: 100%;
	max-width: 800px;
	height: auto;
	border-radius: 12px;
	box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
	background: #1a1a2e;
	cursor: move;
}

.info-box {
	background: #f5f5f5;
	padding: 15px;
	border-radius: 8px;
	border-left: 4px solid #4CAF50;
	font-size: 0.95rem;
	line-height: 1.8;
}

.legend {
	margin-top: 15px;
	display: flex;
	justify-content: center;
	gap: 20px;
	flex-wrap: wrap;
}

.legend-item {
	display: flex;
	align-items: center;
	gap: 8px;
	font-size: 0.9rem;
	color: #546e7a;
}

.dot {
	width: 12px;
	height: 12px;
	border-radius: 50%;
	display: inline-block;
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
