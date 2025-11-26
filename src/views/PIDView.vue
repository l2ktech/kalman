<template>
	<div class="pid-container">
		<h1 class="title">机械臂 PID 闭环控制演示</h1>
		<h3 class="subtitle">交互式 PID 控制器学习 - 实时可视化</h3>

		<mu-row gutter class="stats">
			<mu-col style="font-size:16px;" sm="0" md="1" lg="2" span="12"></mu-col>
			<mu-col style="font-size:18px;" sm="12" md="10" lg="8" span="12">
				<center>
					<div style="background-color:#f5f5f5; padding:15px; border-radius:8px; margin:15px 0;">
						<h4 style="margin-top:0;">💡 什么是 PID 控制器？</h4>
						<p style="line-height: 1.8; text-align: left;">
							<strong>PID</strong> 是 <strong>P</strong>roportional（比例）、<strong>I</strong>ntegral（积分）、<strong>D</strong>erivative（微分）的缩写。<br>
							就像骑自行车时保持平衡，你会根据当前倾斜程度、倾斜持续时间和倾斜速度来调整身体：<br><br>
							<strong>🎯 P - 比例控制</strong>：看现在离目标有多远 → 距离越大，修正力度越大<br>
							<strong>⏱️ I - 积分控制</strong>：累计误差，消除长期偏差 → 记住历史误差，防止一直差一点点<br>
							<strong>⚡ D - 微分控制</strong>：看误差变化速度 → 快到目标时提前减速，避免冲过头<br><br>
							三者配合，就能让机械臂精准、平稳地到达目标位置！
						</p>
					</div>

					<p style="font-size:16px; background-color:#e3f2fd; padding:10px; border-radius:5px;">
						<strong>👆 操作提示：</strong>拖动滑块调整目标角度，或点击"添加干扰"按钮，观察 PID 如何自动修正！
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

					<mu-button @click="handleStartButton" :color="startBtnColor" full-width>
						<mu-icon :value="startBtnIcon"></mu-icon>{{ startBtnText }}
					</mu-button>
					<br /><br />

					<div class="control-group">
						<strong>🎯 目标角度：</strong> <b style="color:#2196F3;">{{ targetAngle }}°</b>
						<mu-slider :min="-90" :max="90" :step="1" v-model="targetAngle"></mu-slider>
						<small style="display:block; margin-top:-10px; color:#666;">拖动设置机械臂的目标位置</small>
					</div>

					<div class="control-group">
						<strong style="color:#4CAF50;">📊 P - 比例系数 Kp：</strong> <b>{{ Kp }}</b>
						<mu-slider :min="0" :max="5" :step="0.1" v-model="Kp"></mu-slider>
						<small style="display:block; margin-top:-10px; color:#666;">控制响应强度，越大反应越激烈</small>
					</div>

					<div class="control-group">
						<strong style="color:#FF9800;">⏱️ I - 积分系数 Ki：</strong> <b>{{ Ki }}</b>
						<mu-slider :min="0" :max="0.5" :step="0.01" v-model="Ki"></mu-slider>
						<small style="display:block; margin-top:-10px; color:#666;">消除稳态误差，修正长期偏差</small>
					</div>

					<div class="control-group">
						<strong style="color:#E91E63;">⚡ D - 微分系数 Kd：</strong> <b>{{ Kd }}</b>
						<mu-slider :min="0" :max="2" :step="0.1" v-model="Kd"></mu-slider>
						<small style="display:block; margin-top:-10px; color:#666;">阻尼振荡，防止超调和震荡</small>
					</div>

					<br>
					<mu-button @click="addDisturbance" color="orange" full-width>
						<mu-icon value="flash_on"></mu-icon> 添加随机干扰
					</mu-button>
					<small style="display:block; margin-top:5px; text-align:center; color:#666;">模拟外力干扰</small>

					<br>
					<mu-button @click="resetPID" color="red" full-width>
						<mu-icon value="undo"></mu-icon> 重置参数
					</mu-button>

					<br><br>
					<div class="info-box">
						<strong>📈 实时数据</strong><br>
						当前角度：<code>{{ currentAngle.toFixed(2) }}°</code><br>
						当前误差：<code>{{ error.toFixed(2) }}°</code><br>
						角速度：<code>{{ velocity.toFixed(2) }}°/s</code><br>
						状态：<code>{{ status }}</code><br>
						FPS：<code>{{ Math.round(fps) }}</code>
					</div>

					<div class="preset-buttons">
						<h5>⚙️ 快速预设</h5>
						<mu-button @click="setPreset('fast')" size="small" color="primary">快速响应</mu-button>
						<mu-button @click="setPreset('smooth')" size="small" color="success">平滑稳定</mu-button>
						<mu-button @click="setPreset('damped')" size="small" color="secondary">阻尼优先</mu-button>
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
						<span class="legend-item"><span class="dot" style="background:#2196F3;"></span> 目标角度</span>
						<span class="legend-item"><span class="dot" style="background:#4CAF50;"></span> 当前角度</span>
						<span class="legend-item"><span class="dot" style="background:#FF5722;"></span> 机械臂</span>
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
						<h4 style="margin-top:0;">📚 PID 控制器的现实应用</h4>
						<div style="line-height: 1.8; text-align:left;">
							<strong>🏭 工业机器人</strong>：焊接、装配、搬运机器人的精确定位<br>
							<strong>🚁 无人机</strong>：姿态稳定、高度控制、航向保持<br>
							<strong>🚗 汽车</strong>：巡航控制、电子稳定系统、自动泊车<br>
							<strong>🌡️ 温度控制</strong>：空调、恒温箱、化工反应器<br>
							<strong>🛩️ 飞行控制</strong>：飞机自动驾驶仪、火箭姿态控制<br>
							<strong>🎮 游戏手柄</strong>：震动反馈、力反馈方向盘
						</div>
					</div>

					<br>
					<div style="background-color:#e8f5e9; padding:20px; border-radius:8px; border-left:4px solid #4CAF50;">
						<h4 style="margin-top:0;">🔧 调参技巧</h4>
						<div style="line-height: 1.8; text-align:left;">
							<strong>1️⃣ 先调 P</strong>：从 0 开始慢慢增大，直到系统开始振荡<br>
							<strong>2️⃣ 再加 D</strong>：增加 D 来抑制振荡，让系统更稳定<br>
							<strong>3️⃣ 最后调 I</strong>：如果有稳态误差（一直差一点点），加一点 I<br>
							<strong>⚠️ 注意</strong>：I 不要太大，否则会导致超调和振荡<br><br>
							<strong>💡 小贴士</strong>：试试把 Kp 调到 2.0，Kd 调到 0.5，看看效果！
						</div>
					</div>
				</center>
			</mu-col>
			<mu-col style="font-size:16px;" sm="0" md="1" lg="2" span="12"></mu-col>
		</mu-row>

		<mu-col style="font-size:14px; padding-left: 15%;padding-right: 15%" sm="12" md="12" lg="12" span="12"> <br><br></mu-col>
	</div>
</template>

<script>
export default {
	name: 'PIDView',
	data: () => ({
		// Canvas
		canvasWidth: 800,
		canvasHeight: 600,
		ctx: null,

		// Simulation state
		status: 'paused',
		startBtnText: '开始',
		startBtnIcon: 'play_arrow',
		startBtnColor: 'blue',

		// Arm properties
		armLength: 200,
		currentAngle: 0,  // 当前角度
		targetAngle: 45,  // 目标角度
		velocity: 0,      // 角速度

		// PID parameters
		Kp: 1.5,    // 比例系数
		Ki: 0.05,   // 积分系数
		Kd: 0.8,    // 微分系数

		// PID state
		error: 0,           // 当前误差
		lastError: 0,       // 上次误差
		integral: 0,        // 误差积分

		// Performance
		lastTime: null,
		fps: 60,

		// Animation
		animationId: null
	}),

	mounted() {
		const canvas = this.$refs.armCanvas;
		this.ctx = canvas.getContext('2d');
		this.drawScene();
	},

	beforeDestroy() {
		if (this.animationId) {
			cancelAnimationFrame(this.animationId);
		}
	},

	methods: {
		handleStartButton() {
			if (this.status === 'paused') {
				this.status = 'running';
				this.startBtnText = '暂停';
				this.startBtnIcon = 'pause';
				this.startBtnColor = 'orange';
				this.lastTime = performance.now();
				this.animate();
			} else {
				this.status = 'paused';
				this.startBtnText = '开始';
				this.startBtnIcon = 'play_arrow';
				this.startBtnColor = 'blue';
				if (this.animationId) {
					cancelAnimationFrame(this.animationId);
				}
			}
		},

		animate() {
			if (this.status !== 'running') return;

			const currentTime = performance.now();
			const dt = this.lastTime ? (currentTime - this.lastTime) / 1000 : 0.016;
			this.lastTime = currentTime;

			// 计算 FPS
			if (dt > 0) {
				this.fps = 1 / dt;
			}

			// PID 控制
			this.error = this.targetAngle - this.currentAngle;
			this.integral += this.error * dt;

			// 限制积分项防止积分饱和
			this.integral = Math.max(-100, Math.min(100, this.integral));

			const derivative = (this.error - this.lastError) / dt;

			// PID 输出（力矩）
			const output = this.Kp * this.error +
			               this.Ki * this.integral +
			               this.Kd * derivative;

			// 简化的动力学模型（考虑摩擦和惯性）
			const friction = -0.5 * this.velocity;  // 摩擦力
			const inertia = 2.0;  // 转动惯量

			const acceleration = (output + friction) / inertia;
			this.velocity += acceleration * dt;
			this.currentAngle += this.velocity * dt;

			this.lastError = this.error;

			// 绘制场景
			this.drawScene();

			// 继续动画
			this.animationId = requestAnimationFrame(this.animate);
		},

		drawScene() {
			const canvas = this.$refs.armCanvas;
			const ctx = this.ctx;

			// 清空画布
			ctx.fillStyle = '#1a1a2e';
			ctx.fillRect(0, 0, canvas.width, canvas.height);

			const centerX = canvas.width / 2;
			const centerY = canvas.height / 2;

			// 绘制网格
			this.drawGrid(ctx, centerX, centerY);

			// 绘制角度刻度
			this.drawAngleMarkers(ctx, centerX, centerY);

			// 绘制目标角度指示线
			this.drawTargetLine(ctx, centerX, centerY);

			// 绘制机械臂
			this.drawArm(ctx, centerX, centerY);

			// 绘制信息文本
			this.drawInfo(ctx);
		},

		drawGrid(ctx, cx, cy) {
			ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
			ctx.lineWidth = 1;

			// 画圆形网格
			for (let r = 50; r <= 250; r += 50) {
				ctx.beginPath();
				ctx.arc(cx, cy, r, 0, Math.PI * 2);
				ctx.stroke();
			}

			// 画径向线
			for (let angle = 0; angle < 360; angle += 30) {
				const rad = (angle * Math.PI) / 180;
				ctx.beginPath();
				ctx.moveTo(cx, cy);
				ctx.lineTo(cx + Math.cos(rad) * 250, cy + Math.sin(rad) * 250);
				ctx.stroke();
			}
		},

		drawAngleMarkers(ctx, cx, cy) {
			ctx.fillStyle = '#ffffff';
			ctx.font = '14px Inter';
			ctx.textAlign = 'center';

			const markers = [-90, -60, -30, 0, 30, 60, 90];
			markers.forEach(angle => {
				const rad = ((angle - 90) * Math.PI) / 180;
				const x = cx + Math.cos(rad) * 270;
				const y = cy + Math.sin(rad) * 270;
				ctx.fillText(angle + '°', x, y);
			});
		},

		drawTargetLine(ctx, cx, cy) {
			const rad = ((this.targetAngle - 90) * Math.PI) / 180;

			// 绘制目标扇形区域
			ctx.fillStyle = 'rgba(33, 150, 243, 0.1)';
			ctx.beginPath();
			ctx.moveTo(cx, cy);
			ctx.arc(cx, cy, this.armLength + 20, rad - 0.05, rad + 0.05);
			ctx.closePath();
			ctx.fill();

			// 绘制目标线
			ctx.strokeStyle = '#2196F3';
			ctx.lineWidth = 3;
			ctx.setLineDash([10, 5]);
			ctx.beginPath();
			ctx.moveTo(cx, cy);
			ctx.lineTo(
				cx + Math.cos(rad) * (this.armLength + 30),
				cy + Math.sin(rad) * (this.armLength + 30)
			);
			ctx.stroke();
			ctx.setLineDash([]);

			// 目标点
			ctx.fillStyle = '#2196F3';
			ctx.beginPath();
			ctx.arc(
				cx + Math.cos(rad) * this.armLength,
				cy + Math.sin(rad) * this.armLength,
				8,
				0,
				Math.PI * 2
			);
			ctx.fill();
		},

		drawArm(ctx, cx, cy) {
			const rad = ((this.currentAngle - 90) * Math.PI) / 180;
			const endX = cx + Math.cos(rad) * this.armLength;
			const endY = cy + Math.sin(rad) * this.armLength;

			// 绘制机械臂阴影
			ctx.strokeStyle = 'rgba(0, 0, 0, 0.3)';
			ctx.lineWidth = 16;
			ctx.lineCap = 'round';
			ctx.beginPath();
			ctx.moveTo(cx + 2, cy + 2);
			ctx.lineTo(endX + 2, endY + 2);
			ctx.stroke();

			// 绘制机械臂主体
			const gradient = ctx.createLinearGradient(cx, cy, endX, endY);
			gradient.addColorStop(0, '#FF5722');
			gradient.addColorStop(1, '#FF9800');

			ctx.strokeStyle = gradient;
			ctx.lineWidth = 14;
			ctx.beginPath();
			ctx.moveTo(cx, cy);
			ctx.lineTo(endX, endY);
			ctx.stroke();

			// 绘制关节
			ctx.fillStyle = '#424242';
			ctx.beginPath();
			ctx.arc(cx, cy, 20, 0, Math.PI * 2);
			ctx.fill();

			ctx.fillStyle = '#FF5722';
			ctx.beginPath();
			ctx.arc(cx, cy, 15, 0, Math.PI * 2);
			ctx.fill();

			// 绘制末端执行器
			ctx.fillStyle = '#4CAF50';
			ctx.beginPath();
			ctx.arc(endX, endY, 12, 0, Math.PI * 2);
			ctx.fill();

			// 绘制当前角度弧线
			ctx.strokeStyle = '#4CAF50';
			ctx.lineWidth = 2;
			ctx.beginPath();
			ctx.arc(cx, cy, 80, -Math.PI / 2, rad, this.currentAngle > 0);
			ctx.stroke();
		},

		drawInfo(ctx) {
			// 绘制误差显示
			const errorText = `误差: ${this.error.toFixed(2)}°`;
			ctx.fillStyle = Math.abs(this.error) < 1 ? '#4CAF50' : '#FF9800';
			ctx.font = 'bold 20px Inter';
			ctx.textAlign = 'left';
			ctx.fillText(errorText, 20, 40);

			// 绘制 PID 分量
			const p = this.Kp * this.error;
			const i = this.Ki * this.integral;
			const d = this.Kd * (this.error - this.lastError);

			ctx.font = '14px Inter';
			ctx.fillStyle = '#4CAF50';
			ctx.fillText(`P: ${p.toFixed(2)}`, 20, 70);
			ctx.fillStyle = '#FF9800';
			ctx.fillText(`I: ${i.toFixed(2)}`, 20, 90);
			ctx.fillStyle = '#E91E63';
			ctx.fillText(`D: ${d.toFixed(2)}`, 20, 110);
		},

		addDisturbance() {
			// 添加随机干扰
			const disturbance = (Math.random() - 0.5) * 60;
			this.currentAngle += disturbance;
			this.velocity += (Math.random() - 0.5) * 20;
		},

		resetPID() {
			this.Kp = 1.5;
			this.Ki = 0.05;
			this.Kd = 0.8;
			this.targetAngle = 45;
			this.currentAngle = 0;
			this.velocity = 0;
			this.error = 0;
			this.lastError = 0;
			this.integral = 0;
		},

		setPreset(type) {
			switch(type) {
				case 'fast':
					this.Kp = 3.0;
					this.Ki = 0.1;
					this.Kd = 0.5;
					break;
				case 'smooth':
					this.Kp = 1.2;
					this.Ki = 0.02;
					this.Kd = 1.5;
					break;
				case 'damped':
					this.Kp = 1.0;
					this.Ki = 0.01;
					this.Kd = 2.0;
					break;
			}
			this.integral = 0;
		}
	}
}
</script>

<style scoped>
.pid-container {
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
	border-left: 4px solid #2196F3;
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

@media (max-width: 768px) {
	.title {
		font-size: 2rem;
	}

	.subtitle {
		font-size: 1.2rem;
	}

	.canvasWidth {
		width: 100%;
	}
}
</style>
