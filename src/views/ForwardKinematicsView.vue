<template>
	<div class="fk-container">
		<h1 class="title">机械臂正运动学演示</h1>
		<h3 class="subtitle">交互式多关节机械臂 - 实时计算末端位置</h3>

		<mu-row gutter class="stats">
			<mu-col style="font-size:16px;" sm="0" md="1" lg="2" span="12"></mu-col>
			<mu-col style="font-size:18px;" sm="12" md="10" lg="8" span="12">
				<center>
					<div style="background-color:#f5f5f5; padding:15px; border-radius:8px; margin:15px 0;">
						<h4 style="margin-top:0;">💡 什么是正运动学？</h4>
						<p style="line-height: 1.8; text-align: left;">
							<strong>正运动学 (Forward Kinematics, FK)</strong> 是机器人学的基础概念。<br><br>
							<strong>简单理解：</strong><br>
							想象你的手臂，当你知道肩膀、肘部、手腕的每个关节角度，就能准确计算出手指的位置。<br>
							这就是正运动学：<strong>已知关节角度 → 计算末端位置</strong><br><br>
							<strong>🔢 数学原理：</strong><br>
							使用齐次变换矩阵，将每个关节的旋转和平移累乘，最终得到末端执行器相对于基座的位置和姿态。<br><br>
							<strong>公式：</strong> T = T₁ × T₂ × T₃ × ... × Tₙ<br>
							其中每个 T 是 4×4 的齐次变换矩阵。
						</p>
					</div>

					<p style="font-size:16px; background-color:#e3f2fd; padding:10px; border-radius:5px;">
						<strong>👆 操作提示：</strong>拖动滑块调整每个关节的角度，观察末端执行器如何移动！
					</p>
				</center>
			</mu-col>
			<mu-col style="font-size:16px;" sm="0" md="1" lg="2" span="12"></mu-col>
		</mu-row>

		<br>
		<mu-row gutter class="stats">
			<mu-col style="padding-left:5%;padding-right:2.5%; padding: 15px" sm="12" md="12" lg="4" span="12">
				<div class="grid-cell control-panel">
					<h4 style="margin-bottom: 10px;">🎮 关节控制</h4>

					<div class="control-group">
						<strong style="color:#FF5722;">🔴 关节 1 (基座旋转)：</strong> <b>{{ joint1.toFixed(1) }}°</b>
						<mu-slider :min="-180" :max="180" :step="1" v-model="joint1"></mu-slider>
						<small style="display:block; margin-top:-10px; color:#666;">绕 Z 轴旋转</small>
					</div>

					<div class="control-group">
						<strong style="color:#FF9800;">🟠 关节 2 (肩部)：</strong> <b>{{ joint2.toFixed(1) }}°</b>
						<mu-slider :min="-90" :max="90" :step="1" v-model="joint2"></mu-slider>
						<small style="display:block; margin-top:-10px; color:#666;">控制大臂抬升</small>
					</div>

					<div class="control-group">
						<strong style="color:#FFC107;">🟡 关节 3 (肘部)：</strong> <b>{{ joint3.toFixed(1) }}°</b>
						<mu-slider :min="-135" :max="135" :step="1" v-model="joint3"></mu-slider>
						<small style="display:block; margin-top:-10px; color:#666;">控制小臂弯曲</small>
					</div>

					<div class="control-group">
						<strong style="color:#4CAF50;">🟢 关节 4 (腕部)：</strong> <b>{{ joint4.toFixed(1) }}°</b>
						<mu-slider :min="-90" :max="90" :step="1" v-model="joint4"></mu-slider>
						<small style="display:block; margin-top:-10px; color:#666;">控制末端角度</small>
					</div>

					<br>
					<mu-button @click="resetJoints" color="primary" full-width>
						<mu-icon value="refresh"></mu-icon> 重置为零位
					</mu-button>

					<br><br>
					<mu-button @click="randomPose" color="orange" full-width>
						<mu-icon value="shuffle"></mu-icon> 随机姿态
					</mu-button>

					<br><br>
					<div class="info-box">
						<strong>📍 末端位置 (End Effector)</strong><br>
						X: <code>{{ endEffector.x.toFixed(2) }}</code> mm<br>
						Y: <code>{{ endEffector.y.toFixed(2) }}</code> mm<br>
						Z: <code>{{ endEffector.z.toFixed(2) }}</code> mm<br><br>
						<strong>📏 到原点距离：</strong><br>
						<code>{{ Math.sqrt(endEffector.x**2 + endEffector.y**2 + endEffector.z**2).toFixed(2) }}</code> mm<br><br>
						<strong>🎯 末端姿态角：</strong><br>
						<code>{{ endEffectorAngle.toFixed(2) }}°</code>
					</div>

					<div class="preset-buttons">
						<h5>⚙️ 预设姿态</h5>
						<mu-button @click="setPreset('home')" size="small" color="primary">零位</mu-button>
						<mu-button @click="setPreset('reach')" size="small" color="success">前伸</mu-button>
						<mu-button @click="setPreset('up')" size="small" color="secondary">向上</mu-button>
						<mu-button @click="setPreset('side')" size="small" color="warning">侧面</mu-button>
					</div>

					<br>
					<div style="background-color:#fff3e0; padding:10px; border-radius:5px; font-size:0.9rem;">
						<strong>💡 提示：</strong><br>
						• 每个关节独立控制<br>
						• 红→橙→黄→绿 表示从基座到末端<br>
						• 末端位置实时计算更新
					</div>
				</div>
			</mu-col>

			<mu-col sm="12" md="12" lg="8" span="12">
				<div class="grid-cell">
					<canvas
						ref="armCanvas"
						:width="canvasWidth"
						:height="canvasHeight"
						class="arm-canvas"
					></canvas>
					<div class="legend">
						<span class="legend-item"><span class="dot" style="background:#FF5722;"></span> 基座</span>
						<span class="legend-item"><span class="dot" style="background:#FF9800;"></span> 大臂</span>
						<span class="legend-item"><span class="dot" style="background:#FFC107;"></span> 小臂</span>
						<span class="legend-item"><span class="dot" style="background:#4CAF50;"></span> 末端</span>
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
						<h4 style="margin-top:0;">📚 正运动学的应用</h4>
						<div style="line-height: 1.8; text-align:left;">
							<strong>🏭 工业机器人</strong>：计算焊枪、抓手的精确位置<br>
							<strong>🦾 医疗手术机器人</strong>：确保手术工具到达准确位置<br>
							<strong>🎮 动画制作</strong>：角色骨骼动画的实时计算<br>
							<strong>🚁 无人机机械臂</strong>：空中作业时的位置控制<br>
							<strong>🔬 实验室自动化</strong>：精密移液、样品处理<br>
							<strong>🎯 军事应用</strong>：炮塔、导弹发射器的指向计算
						</div>
					</div>

					<br>
					<div style="background-color:#e8f5e9; padding:20px; border-radius:8px; border-left:4px solid #4CAF50;">
						<h4 style="margin-top:0;">🔧 D-H 参数法</h4>
						<div style="line-height: 1.8; text-align:left;">
							<strong>Denavit-Hartenberg (D-H) 参数</strong>是描述机械臂的标准方法：<br><br>
							<strong>四个参数：</strong><br>
							• <strong>θ (theta)</strong>：关节角度（可变）<br>
							• <strong>d</strong>：沿 Z 轴的偏移<br>
							• <strong>a (alpha)</strong>：连杆长度<br>
							• <strong>α (alpha)</strong>：连杆扭角<br><br>
							<strong>本演示采用简化模型：</strong><br>
							• 4 个旋转关节<br>
							• 平面运动为主<br>
							• 直观展示核心概念
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
	name: 'ForwardKinematicsView',
	data: () => ({
		// Canvas
		canvasWidth: 800,
		canvasHeight: 600,
		ctx: null,

		// Joint angles (degrees)
		joint1: 0,   // Base rotation
		joint2: 30,  // Shoulder
		joint3: 45,  // Elbow
		joint4: 0,   // Wrist

		// Link lengths (mm)
		link1Length: 80,   // Base height
		link2Length: 150,  // Upper arm
		link3Length: 120,  // Forearm
		link4Length: 60,   // End effector

		// End effector position
		endEffector: { x: 0, y: 0, z: 0 },
		endEffectorAngle: 0
	}),

	mounted() {
		const canvas = this.$refs.armCanvas;
		this.ctx = canvas.getContext('2d');
		this.calculateForwardKinematics();
		this.drawArm();
	},

	watch: {
		joint1() { this.update(); },
		joint2() { this.update(); },
		joint3() { this.update(); },
		joint4() { this.update(); }
	},

	methods: {
		update() {
			this.calculateForwardKinematics();
			this.drawArm();
		},

		calculateForwardKinematics() {
			// Convert degrees to radians
			const θ1 = (this.joint1 * Math.PI) / 180;
			const θ2 = (this.joint2 * Math.PI) / 180;
			const θ3 = (this.joint3 * Math.PI) / 180;
			const θ4 = (this.joint4 * Math.PI) / 180;

			// Calculate cumulative angles
			const angle2 = θ2;
			const angle3 = θ2 + θ3;
			const angle4 = θ2 + θ3 + θ4;

			// Calculate 2D positions (in XY plane after base rotation)
			const x2 = this.link2Length * Math.cos(angle2);
			const y2 = this.link1Length + this.link2Length * Math.sin(angle2);

			const x3 = x2 + this.link3Length * Math.cos(angle3);
			const y3 = y2 + this.link3Length * Math.sin(angle3);

			const x4 = x3 + this.link4Length * Math.cos(angle4);
			const y4 = y3 + this.link4Length * Math.sin(angle4);

			// Apply base rotation to get 3D position
			const cos1 = Math.cos(θ1);
			const sin1 = Math.sin(θ1);

			this.endEffector.x = x4 * cos1;
			this.endEffector.y = y4;
			this.endEffector.z = x4 * sin1;
			this.endEffectorAngle = (angle4 * 180) / Math.PI;
		},

		drawArm() {
			const canvas = this.$refs.armCanvas;
			const ctx = this.ctx;

			// Clear canvas
			ctx.fillStyle = '#1a1a2e';
			ctx.fillRect(0, 0, canvas.width, canvas.height);

			const centerX = canvas.width / 2;
			const centerY = canvas.height - 100;
			const scale = 1.5;

			// Draw grid
			this.drawGrid(ctx, centerX, centerY);

			// Calculate joint positions
			const θ1 = (this.joint1 * Math.PI) / 180;
			const θ2 = (this.joint2 * Math.PI) / 180;
			const θ3 = (this.joint3 * Math.PI) / 180;
			const θ4 = (this.joint4 * Math.PI) / 180;

			const angle2 = θ2;
			const angle3 = θ2 + θ3;
			const angle4 = θ2 + θ3 + θ4;

			// Calculate 2D positions
			const x1 = 0;
			const y1 = -this.link1Length * scale;

			const x2 = x1 + this.link2Length * Math.cos(angle2) * scale;
			const y2 = y1 - this.link2Length * Math.sin(angle2) * scale;

			const x3 = x2 + this.link3Length * Math.cos(angle3) * scale;
			const y3 = y2 - this.link3Length * Math.sin(angle3) * scale;

			const x4 = x3 + this.link4Length * Math.cos(angle4) * scale;
			const y4 = y3 - this.link4Length * Math.sin(angle4) * scale;

			// Rotate by joint1 (base rotation)
			const cos1 = Math.cos(θ1);
			const sin1 = Math.sin(θ1);

			const rotateX = (x, z) => x * cos1 - z * sin1;
			const rotateZ = (x, z) => x * sin1 + z * cos1;

			// For 2D visualization, we'll show side view primarily
			// Draw base
			ctx.fillStyle = '#424242';
			ctx.beginPath();
			ctx.arc(centerX, centerY, 30, 0, Math.PI * 2);
			ctx.fill();

			// Draw base top
			ctx.fillStyle = '#FF5722';
			ctx.beginPath();
			ctx.arc(centerX, centerY, 25, 0, Math.PI * 2);
			ctx.fill();

			// Draw links
			this.drawLink(ctx, centerX, centerY, centerX + x1, centerY + y1, '#FF5722', 20);
			this.drawLink(ctx, centerX + x1, centerY + y1, centerX + x2, centerY + y2, '#FF9800', 16);
			this.drawLink(ctx, centerX + x2, centerY + y2, centerX + x3, centerY + y3, '#FFC107', 12);
			this.drawLink(ctx, centerX + x3, centerY + y3, centerX + x4, centerY + y4, '#4CAF50', 10);

			// Draw joints
			this.drawJoint(ctx, centerX, centerY, 25, '#FF5722', 'Base');
			this.drawJoint(ctx, centerX + x1, centerY + y1, 18, '#FF9800', 'J1');
			this.drawJoint(ctx, centerX + x2, centerY + y2, 15, '#FFC107', 'J2');
			this.drawJoint(ctx, centerX + x3, centerY + y3, 12, '#4CAF50', 'J3');

			// Draw end effector
			ctx.fillStyle = '#2196F3';
			ctx.beginPath();
			ctx.arc(centerX + x4, centerY + y4, 15, 0, Math.PI * 2);
			ctx.fill();

			ctx.fillStyle = '#fff';
			ctx.font = 'bold 12px Inter';
			ctx.textAlign = 'center';
			ctx.fillText('END', centerX + x4, centerY + y4 + 5);

			// Draw coordinate axes
			this.drawAxes(ctx, centerX, centerY);

			// Draw workspace circle
			const maxReach = (this.link2Length + this.link3Length + this.link4Length) * scale;
			ctx.strokeStyle = 'rgba(33, 150, 243, 0.2)';
			ctx.lineWidth = 2;
			ctx.setLineDash([10, 5]);
			ctx.beginPath();
			ctx.arc(centerX, centerY - this.link1Length * scale, maxReach, 0, Math.PI * 2);
			ctx.stroke();
			ctx.setLineDash([]);
		},

		drawGrid(ctx, cx, cy) {
			ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
			ctx.lineWidth = 1;

			// Horizontal lines
			for (let y = 0; y < 600; y += 50) {
				ctx.beginPath();
				ctx.moveTo(0, y);
				ctx.lineTo(800, y);
				ctx.stroke();
			}

			// Vertical lines
			for (let x = 0; x < 800; x += 50) {
				ctx.beginPath();
				ctx.moveTo(x, 0);
				ctx.lineTo(x, 600);
				ctx.stroke();
			}
		},

		drawLink(ctx, x1, y1, x2, y2, color, width) {
			// Shadow
			ctx.strokeStyle = 'rgba(0, 0, 0, 0.3)';
			ctx.lineWidth = width + 2;
			ctx.lineCap = 'round';
			ctx.beginPath();
			ctx.moveTo(x1 + 2, y1 + 2);
			ctx.lineTo(x2 + 2, y2 + 2);
			ctx.stroke();

			// Main link
			const gradient = ctx.createLinearGradient(x1, y1, x2, y2);
			gradient.addColorStop(0, color);
			gradient.addColorStop(1, this.lightenColor(color));

			ctx.strokeStyle = gradient;
			ctx.lineWidth = width;
			ctx.beginPath();
			ctx.moveTo(x1, y1);
			ctx.lineTo(x2, y2);
			ctx.stroke();
		},

		drawJoint(ctx, x, y, radius, color, label) {
			// Shadow
			ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
			ctx.beginPath();
			ctx.arc(x + 2, y + 2, radius, 0, Math.PI * 2);
			ctx.fill();

			// Joint
			ctx.fillStyle = '#424242';
			ctx.beginPath();
			ctx.arc(x, y, radius, 0, Math.PI * 2);
			ctx.fill();

			ctx.fillStyle = color;
			ctx.beginPath();
			ctx.arc(x, y, radius - 3, 0, Math.PI * 2);
			ctx.fill();

			// Label
			if (label) {
				ctx.fillStyle = '#fff';
				ctx.font = 'bold 10px Inter';
				ctx.textAlign = 'center';
				ctx.fillText(label, x, y + 4);
			}
		},

		drawAxes(ctx, cx, cy) {
			const axisLength = 60;

			// X axis (red)
			ctx.strokeStyle = '#f44336';
			ctx.lineWidth = 3;
			ctx.beginPath();
			ctx.moveTo(cx, cy);
			ctx.lineTo(cx + axisLength, cy);
			ctx.stroke();

			ctx.fillStyle = '#f44336';
			ctx.font = 'bold 14px Inter';
			ctx.fillText('X', cx + axisLength + 15, cy + 5);

			// Y axis (green)
			ctx.strokeStyle = '#4caf50';
			ctx.beginPath();
			ctx.moveTo(cx, cy);
			ctx.lineTo(cx, cy - axisLength);
			ctx.stroke();

			ctx.fillStyle = '#4caf50';
			ctx.fillText('Y', cx + 5, cy - axisLength - 10);
		},

		lightenColor(color) {
			// Simple color lightening
			return color + 'cc';
		},

		resetJoints() {
			this.joint1 = 0;
			this.joint2 = 0;
			this.joint3 = 0;
			this.joint4 = 0;
		},

		randomPose() {
			this.joint1 = Math.random() * 360 - 180;
			this.joint2 = Math.random() * 180 - 90;
			this.joint3 = Math.random() * 270 - 135;
			this.joint4 = Math.random() * 180 - 90;
		},

		setPreset(type) {
			switch(type) {
				case 'home':
					this.resetJoints();
					break;
				case 'reach':
					this.joint1 = 0;
					this.joint2 = 0;
					this.joint3 = 0;
					this.joint4 = 0;
					break;
				case 'up':
					this.joint1 = 0;
					this.joint2 = 90;
					this.joint3 = 0;
					this.joint4 = 0;
					break;
				case 'side':
					this.joint1 = 90;
					this.joint2 = 0;
					this.joint3 = 45;
					this.joint4 = -45;
					break;
			}
		}
	}
}
</script>

<style scoped>
.fk-container {
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

.arm-canvas {
	width: 100%;
	max-width: 800px;
	height: auto;
	border-radius: 12px;
	box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
	background: #1a1a2e;
}

.info-box {
	background: #f5f5f5;
	padding: 15px;
	border-radius: 8px;
	border-left: 4px solid #FF5722;
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
