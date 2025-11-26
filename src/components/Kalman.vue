<template>
	<div>
		<h1 class="title">卡尔曼滤波器 2D 演示</h1>
		<h3 class="subtitle">交互式噪声过滤演示 - 实时可视化</h3>
		<mu-row gutter class="stats">
			<mu-col style="font-size:16px;" sm="0" md="1" lg="2" span="12"></mu-col>
			<mu-col style="font-size:18px;" sm="12" md="10" lg="8" span="12">
				<center>
					<h3 style="color:#388e3c; font-weight: 600;">🟢 绿色点 = 带噪声的轨迹</h3>
					<p style="line-height: 1.8;">程序会给真实路径人为添加随机噪声（就像信号干扰），生成绿色的"脏数据"点。这些点看起来会很杂乱抖动。</p>

					<h3 style="color:#dd2c00; font-weight: 600;">🔴 红色点 = 过滤后的轨迹</h3>
					<p style="line-height: 1.8;">卡尔曼滤波算法会分析绿色的噪声数据，通过数学计算"猜测"出真实的轨迹，最终生成平滑的红色路径。这就像从嘈杂的录音中还原清晰的声音。</p>

					<div style="background-color:#f5f5f5; padding:15px; border-radius:8px; margin:15px 0;">
						<h4 style="margin-top:0;">💡 简单理解卡尔曼滤波器</h4>
						<p style="line-height: 1.8; text-align: left;">
							想象你在雾天开车，视线模糊（噪声干扰）。卡尔曼滤波器就像一个聪明的副驾驶：<br>
							✓ 它记住之前的路线（历史数据）<br>
							✓ 观察当前模糊的路况（当前测量）<br>
							✓ 结合两者推测出最可能的真实路径（最优估计）<br><br>
							这个算法在1960年代被用于阿波罗登月计划的导航系统，现在广泛应用于GPS定位、自动驾驶、手机陀螺仪等领域。
						</p>
					</div>

					<p style="font-size:16px; background-color:#e3f2fd; padding:10px; border-radius:5px;">
						<strong>👆 操作提示：</strong>选择"鼠标"模式，然后在画布上移动鼠标，就可以亲手绘制路径，观察过滤效果！
					</p>
					<p style="font-size:14px; margin-top:10px;">
						<a href="https://courses.engr.illinois.edu/ece420/sp2017/UnderstandingKalmanFilter.pdf">点击这里</a> 查看算法的详细数学解释（英文PDF）
					</p>
				</center>
			</mu-col>
			<mu-col style="font-size:16px;" sm="0" md="1" lg="2" span="12"></mu-col>
		</mu-row><br>
		<br>
		<mu-row gutter class="stats">
			<mu-col style="padding-left:5%;padding-right:2.5%; padding: 15px" sm="12" md="12" lg="4" span="12">
				<div class="grid-cell">
					<mu-button @click="handleStartButton" :color="startBtnColor">
						<mu-icon :value="startBtnIcon"></mu-icon>{{ startBtnText }}
					</mu-button>&nbsp;
					<mu-button @click="init" color="red">
						<mu-icon value="undo"></mu-icon> 重置
					</mu-button>
					<br /><br />
					<h4 style="margin-bottom: 10px;">🎮 控制面板</h4>
					<strong>运动模式：</strong>
					<mu-select @change="init" v-model="mode">
						<mu-option v-for="(option, index) in options" :key="option" :label="option" :value="index"></mu-option>
					</mu-select>
					<small style="display:block; margin-top:5px; color:#666;">选择不同的路径生成方式</small>
					<br />
					<strong>目标帧率：</strong> <b>{{ framerate }}</b> FPS
					<mu-slider type="range" :min="0" :max="80" :step="1" value="50" class="slider" v-model="framerate" />
					<small style="display:block; margin-top:-10px; color:#666;">数值越高动画越流畅</small>

					<strong>轨迹保留时长：</strong> <b>{{ ttl }}</b> 帧
					<mu-slider type="range" :min="0" :max="200" :step="1" value="50" class="slider" v-model="ttl" />
					<small style="display:block; margin-top:-10px; color:#666;">每个点在画布上保留的帧数</small>

					<strong>噪声强度 σ：</strong> <b>{{ sigma }}</b>
					<mu-slider :min="0" :max="width / 3" :step="1" class="demo-slider" v-model="sigma"></mu-slider>
					<small style="display:block; margin-top:-10px; color:#666;">数值越大，绿色点越杂乱（噪声越大）</small>

					<strong>预测步数：</strong> <b>{{ predSteps }}</b>
					<mu-slider :min="1" :max="50" :step="1" class="demo-slider" v-model="predSteps"></mu-slider>
					<small style="display:block; margin-top:-10px; color:#666;">算法向未来预测的步数</small>
					<!--
					<mu-checkbox
						v-model="traj"
						label="Trajectory"
					></mu-checkbox>-->
					<br><strong>显示选项：</strong><br>
					<mu-checkbox v-model="drawReal" label="真实路径（蓝色）"></mu-checkbox>
					<mu-checkbox v-model="drawNoisy" label="噪声点（绿色）"></mu-checkbox>
					<mu-checkbox v-model="drawNoisyTraj" label="噪声轨迹线"></mu-checkbox><br>
					<mu-checkbox v-model="drawFiltered" label="过滤后的点（红色）"></mu-checkbox>
					<mu-checkbox v-model="drawFilteredTraj" label="过滤后的轨迹线"></mu-checkbox>
					<mu-checkbox v-model="prediction" label="未来预测（白色）"></mu-checkbox>
					<br><br>
					<strong>画布信息</strong><br>
					宽度：{{ width }}px<br />
					<mu-slider v-if="showCanvasControls" type="range" :min="0" :max="1800" :step="1" value="75" class="slider" v-model="widthC" />
					高度：{{ height }}px<br />
					<mu-slider v-if="showCanvasControls" type="range" :min="0" :max="1000" :step="1" value="75" class="slider" v-model="height" /><br>
					状态：<code>{{ status }}</code><br />
					已绘制 <code>{{ states.length }}</code> 个状态<br />
					每帧耗时 <code>{{ Math.round(ms) }}</code> 毫秒
				</div>
			</mu-col>
			<mu-col sm="12" md="12" lg="8" span="12">
				<div class="grid-cell">
					<canvas class="kalmandemo" @mouseleave="mouseLeave" @pointermove="mouseOver" ref="ccont" :width="widthC" :height="heightC"></canvas></div>
			</mu-col>
		</mu-row>
		<br />
		<br />
		<span class="stats"> </span>
		<mu-row gutter class="stats">
			<mu-col style="font-size:16px;" sm="0" md="1" lg="2" span="12"></mu-col>
			<mu-col style="font-size:16px;" sm="12" md="10" lg="8" span="12">
				<center>
					<div style="background-color:#fff3e0; padding:20px; border-radius:8px; border-left:4px solid #ff6f00;">
						<h4 style="margin-top:0;">📚 什么是卡尔曼滤波器？</h4>
						<i style="line-height: 1.8;">卡尔曼滤波器是一种算法，它通过分析一系列包含噪声和误差的测量数据，估算出比单次测量更准确的真实值。它会为每个时间点的变量估算一个联合概率分布。最早的应用包括 <a href="https://github.com/chrislgarry/Apollo-11/blob/master/Luminary099/KALMAN_FILTER.agc">1969年阿波罗11号登月软件</a>。<br><br>
						<strong>现实应用举例：</strong><br>
						🛰️ <strong>GPS定位</strong>：你的手机GPS信号有误差，卡尔曼滤波让导航更准确<br>
						🚗 <strong>自动驾驶</strong>：汽车传感器数据有噪声，算法帮助判断真实位置<br>
						📱 <strong>手机陀螺仪</strong>：游戏中的运动检测需要过滤掉手抖动的干扰<br>
						🎯 <strong>导弹追踪</strong>：军事雷达数据有干扰，需要准确预测目标位置
						</i>
					</div>
				</center>
			</mu-col>
			<mu-col style="font-size:16px;" sm="0" md="1" lg="2" span="12"></mu-col>
		</mu-row>
		<mu-col style="font-size:14px; padding-left: 15%;padding-right: 15%" sm="12" md="12" lg="12" span="12"> <br><br></mu-col>
		<small style="font-size:1rem">
			<p>
				<a style="color:#2c3e50;" href="https://github.com/q442333521/kalman">
					<img style="vertical-align: text-bottom;" height="24px" src="https://akveo.github.io/eva-icons/outline/svg/github-outline.svg" />&nbsp;源代码</a> | <a style="color:#2c3e50;" href="https://github.com/avivace/kalman/blob/develop/slides.pdf">演示文稿</a> | <a style="color:#2c3e50;" href="https://github.com/avivace/kalman#references-and-papers">参考文献</a>
			</p>
			<p style="font-size:0.85rem; color:#888;">
				原作者：Antonio Vivace | 中文汉化版
			</p>
		</small>
	</div>
</template>
<script>
// randomGaussian taken from http://www.ollysco.de/2012/04/gaussian-normal-functions-in-javascript.html
(function() {
	/**
	 * Returns a Gaussian Random Number around a normal distribution defined by the mean
	 * and standard deviation parameters.
	 *
	 * Uses the algorithm used in Java's random class, which in turn comes from
	 * Donald Knuth's implementation of the BoxÐMuller transform.
	 *
	 * @param {Number} [mean = 0.0] The mean value, default 0.0
	 * @param {Number} [standardDeviation = 1.0] The standard deviation, default 1.0
	 * @return {Number} A random number
	 */
	Math.randomGaussian = function(mean, standardDeviation) {
		mean = defaultTo(mean, 0.0);
		standardDeviation = defaultTo(standardDeviation, 1.0);

		if (Math.randomGaussian.nextGaussian !== undefined) {
			var nextGaussian = Math.randomGaussian.nextGaussian;
			delete Math.randomGaussian.nextGaussian;
			return nextGaussian * standardDeviation + mean;
		} else {
			var v1, v2, s, multiplier;
			do {
				v1 = 2 * Math.random() - 1; // between -1 and 1
				v2 = 2 * Math.random() - 1; // between -1 and 1
				s = v1 * v1 + v2 * v2;
			} while (s >= 1 || s == 0);
			multiplier = Math.sqrt((-2 * Math.log(s)) / s);
			Math.randomGaussian.nextGaussian = v2 * multiplier;
			return v1 * multiplier * standardDeviation + mean;
		}
	};

	/**
	 * Returns a normal probability density function for the given parameters.
	 * The function will return the probability for given values of X
	 *
	 * @param {Number} [mean = 0] The center of the peak, usually at X = 0
	 * @param {Number} [standardDeviation = 1.0] The width / standard deviation of the peak
	 * @param {Number} [maxHeight = 1.0] The maximum height of the peak, usually 1
	 * @returns {Function} A function that will return the value of the distribution at given values of X
	 */
	Math.getGaussianFunction = function(mean, standardDeviation, maxHeight) {
		mean = defaultTo(mean, 0.0);
		standardDeviation = defaultTo(standardDeviation, 1.0);
		maxHeight = defaultTo(maxHeight, 1.0);

		return function getNormal(x) {
			return (
				maxHeight *
				Math.pow(
					Math.E,
					-Math.pow(x - mean, 2) /
					(2 * (standardDeviation * standardDeviation))
				)
			);
		};
	};

	function defaultTo(value, defaultValue) {
		return isNaN(value) ? defaultValue : value;
	}
})();

export default {
	data: () => ({
		// Canvas size
		width: 350,
		height: 350,
		heightC: 700,
		widthC: 700,
		ctx: null,
		// Performance
		lastCalledTime: null,
		fps: 0, // (Measured) framerate
		framecount: 0,
		status: "paused",
		states: [],
		framerate: 60,
		lastPoint: null,
		A: null,
		B: null,
		H: null,
		Q: null,
		R: null,
		B: null,
		c: null,
		last: null,
		ms: 0,
		mode: 1,
		options: ["鼠标", "方形路径", "一维运动", "随机路径"],
		realPoint: null,
		drawPhase: 0,
		sigma: 15,
		startBtnText: "开始",
		startBtnIcon: "play_arrow",
		startBtnColor: "blue",
		traj: false,
		drawReal: false,
		drawNoisy: true,
		drawNoisyTraj: false,
		drawFiltered: true,
		drawFilteredTraj: true,
		drawPrediction: false,
		prediction: false,
		predSteps: 7,
		ttl: 50,
		oldmov: null,
		oldoldmov: null,
		cscale: 1,
		showCanvasControls: false
	}),
	mounted() {
		var c = this.$refs.ccont;
		this.ctx = c.getContext("2d", { alpha: false });
		this.ctx.scale(2, 2);
		this.handleStartButton();
	},
	methods: {
		handleStartButton() {
			this.init();
			this.frame();
			this.showCanvasControls = false;
			if (this.status == "paused") {
				this.status = "running";
				this.startBtnText = "暂停";
				this.startBtnIcon = "pause";
			} else {
				this.status = "paused";
				this.startBtnText = "开始";
				this.startBtnIcon = "play_arrow";
			}
		},
		getRandomInt(max) {
			return Math.floor(Math.random() * Math.floor(max));
		},
		mouseLeave() {
			//this.status = "paused";
		},
		mouseOver(event) {
			let canvas = this.$refs.ccont;
			var rect = canvas.getBoundingClientRect();

			this.clientX = event.clientX - rect.left;
			this.clientY = event.clientY - rect.top;
		},
		init() {
			this.drawPhase = 0;
			this.states = [];
			this.realPoint = null;

			// Sylvester is available under the window context, since we imported
			//  it globally in the html template.
			let m = window.$M;
			let v = window.$V;

			this.c = v([0, 0, 0, 0]);

			// State Transition
			this.A = m([
				[1, 0, 0.2, 0],
				[0, 1, 0, 0.2],
				[0, 0, 1, 0],
				[0, 0, 0, 1]
			]);

			// Input Control Matrix is ignored
			this.B = m([
				[1, 0, 0, 0],
				[0, 1, 0, 0],
				[0, 0, 1, 0],
				[0, 0, 0, 1]
			]);


			this.H = m([
				[1, 0, 1, 0],
				[0, 1, 0, 1],
				[0, 0, 0, 0],
				[0, 0, 0, 0]
			]);

			// Process Noise
			this.Q = m([
				[0, 0, 0, 0],
				[0, 0, 0, 0],
				[0, 0, 0.1, 0],
				[0, 0, 0, 0.1]
			]);

			// Measurement Noise
			this.R = m([
				[this.sigma, 0, 0, 0],
				[0, this.sigma, 0, 0],
				[0, 0, this.sigma, 0],
				[0, 0, 0, this.sigma]
			]);

			this.lastPoint = v([0, 0, 0, 0]);

			this.last = m([
				[0, 0, 0, 0],
				[0, 0, 0, 0],
				[0, 0, 0, 0],
				[0, 0, 0, 0]
			]);

			this.height = this.heightC / 2;
			this.width = this.widthC / 2;
			this.ctx.fillStyle = "#37474f";
			this.ctx.fillRect(0, 0, this.width, this.height);

			this.State = class State {
				constructor(realInput, noisyInput, kalmanPoint) {
					this.realInput = realInput;
					this.noisyInput = noisyInput;
					this.kalmanPoint = kalmanPoint;
					this.dead = false;
				}

				get() {
					return [
						this.noisyInput.x,
						this.noisyInput.y,
						this.noisyInput.ttl
					];
				}
				getK() {
					return [this.kalmanPoint.x, this.kalmanPoint.y];
				}
				displayReal() {
					this.realInput.display("#0d47a1");
				}
				displayFiltered() {
					this.kalmanPoint.display("#dd2c00");
				}
				displayNoisy() {
					this.noisyInput.display("#388e3c");
				}
				displayPrediction() {
					//
				}

				update() {
					this.realInput.update();
					this.noisyInput.update();
					this.kalmanPoint.update();
					if (this.realInput.ttl == 0) this.dead = true;
				}
			};

			var self = this;
			this.Point = class Point {
				constructor(x, y, ctx) {
					this.x = x;
					this.y = y;
					this.ttl = self.ttl;
					this.ctx = ctx;
				}

				display(color) {
					// Map remaining TTL to 0-255, convert it to two hex digits
					//  and use it as Alpha channel (ttl -> 0, alpha -> 1)

					let alpha = Math.round(
						(this.ttl * 255) / self.ttl
					).toString(16);
					this.ctx.beginPath();
					this.ctx.arc(this.x, this.y, 1.25, 0, 2 * Math.PI);
					this.ctx.fillStyle = color + alpha;

					this.ctx.fill();

					//this.ctx.fillRect(this.x, this.y, 4, 4);
				}

				update() {
					this.ttl--;
				}
			};
		},
		frame() {
			let start = performance.now();
			if (this.status == "running") {
				let v = window.$V;

				let ctx = this.ctx;
				this.ctx.fillStyle = "#1f1f31";
				this.ctx.fillRect(0, 0, this.width, this.height);

				let step = 4;
				// Real point
				if (this.mode == 0) {
					this.realPoint = new this.Point(
						this.clientX / 2,
						this.clientY / 2,
						ctx
					);
				} else if (this.mode == 1) {
					if (this.realPoint == null) {
						this.realPoint = new this.Point(180, 180, ctx);
					}

					if (this.drawPhase == 0) {
						this.realPoint = new this.Point(
							this.realPoint.x + step,
							this.realPoint.y,
							ctx
						);
						if (
							this.realPoint.x >
							this.width - Math.round(this.width / 5)
						) {
							this.drawPhase = 1;
						}
					} else if (this.drawPhase == 1) {
						this.realPoint = new this.Point(
							this.realPoint.x,
							this.realPoint.y + step,
							ctx
						);
						if (
							this.realPoint.y >
							this.height - Math.round(this.height / 5)
						) {
							this.drawPhase = 2;
						}
					} else if (this.drawPhase == 2) {
						this.realPoint = new this.Point(
							this.realPoint.x - step,
							this.realPoint.y,
							ctx
						);
						if (this.realPoint.x < Math.round(this.width / 5)) {
							this.drawPhase = 3;
						}
					} else if (this.drawPhase == 3) {
						this.realPoint = new this.Point(
							this.realPoint.x,
							this.realPoint.y - step,
							ctx
						);
						if (this.realPoint.y < Math.round(this.height / 5)) {
							this.drawPhase = 0;
						}
					}
				} else if (this.mode == 2) {
					if (this.realPoint == null) {
						this.realPoint = new this.Point(
							0,
							this.height / 2,
							ctx
						);
						this.drawPhase = 0;
					} else {
						this.realPoint = new this.Point(
							this.realPoint.x + 5,
							this.realPoint.y,
							ctx
						);
						if (this.realPoint.x == this.width) {
							this.realPoint.x = 0;
							this.states = [];
							this.lastPoint = v([
								this.realPoint.x,
								this.realPoint.y,
								0,
								0
							]);
						}
					}
				} else if (this.mode == 3) {
					if (this.realPoint == null) {
						this.realPoint = new this.Point(
							this.width / 2,
							this.height / 2,
							ctx
						);
					}
					let step = 10;
					do {
						var mov = Math.floor(Math.random() * 4);
						if (mov == 1) {
							var newX = this.realPoint.x + step;
							var newY = this.realPoint.y;
						} else if (mov == 2) {
							var newX = this.realPoint.x - step;
							var newY = this.realPoint.y;
						} else if (mov == 3) {
							var newX = this.realPoint.x;
							var newY = this.realPoint.y + step;
						} else {
							var newX = this.realPoint.x;
							var newY = this.realPoint.y - step;
						}
					} while (
						newX >= this.width ||
						newX <= 0 ||
						newY >= this.height ||
						newY <= 0 ||
						this.oldmov == mov
					);
					this.oldmov = mov;

					this.realPoint = new this.Point(newX, newY, ctx);
				}

				// Add noise to the clean input
				if (this.mode != 2) {
					var noisyX = Math.round(
						this.realPoint.x + Math.randomGaussian(0, this.sigma)
					);
				} else {
					var noisyX = this.realPoint.x;
				}

				let noisyY = Math.round(
					this.realPoint.y + Math.randomGaussian(0, this.sigma)
				);

				let n = new this.Point(noisyX, noisyY, ctx);

				/* 

				KALMAN FILTER implementation

				We ignore the control vector (c) and the Input Control Matrix (B)

				*/

				// m = [noisyX, noisyY, deltaX, deltaY]
				let deltaX = noisyX - this.lastPoint.elements[0];
				let deltaY = noisyY - this.lastPoint.elements[1];
				let measurement = v([noisyX, noisyY, deltaX, deltaY]);

				// PREDICTION step
				// x = (A * x) + (B * c)
				var x = this.A.multiply(this.lastPoint).add(
					this.B.multiply(this.c)
				);
				// P = (A * P * AT) + Q
				var P = this.A.multiply(this.last)
					.multiply(this.A.transpose())
					.add(this.Q);

				// CORRECTION step
				// S = (H * P * HT) + R
				var S = this.H.multiply(P)
					.multiply(this.H.transpose())
					.add(this.R);
				// K = P * HT * S-1
				var K = P.multiply(this.H.transpose()).multiply(S.inverse());
				// y = m - (H * x)
				var y = measurement.subtract(this.H.multiply(x));

				// x = x + (K * y)
				//  this is the final filtered point for this iteration
				this.lastPoint = x.add(K.multiply(y));
				// P = (I - (K * H)) * P
				this.last = window.Matrix.I(4)
					.subtract(K.multiply(this.H))
					.multiply(P);

				// ---

				let k = new this.Point(
					this.lastPoint.elements[0],
					this.lastPoint.elements[1],
					ctx
				);

				if (this.prediction) {
					var predX = this.lastPoint;
					var count = this.predSteps;
					var pPoints = Array();
					for (var i = 0; i < count; i++) {
						predX = this.A.multiply(predX).add(
							this.B.multiply(this.c)
						);
						let x = predX.elements[0];
						let y = predX.elements[1];
						pPoints.push(new this.Point(x, y, ctx));
						//var P = ((A.multiply(last_P)).multiply(A.transpose())).add(Q);
					}
				}
				// Push the final state (real, noisy, filtered)
				this.states.push(new this.State(this.realPoint, n, k));

				// Draw every state in the stack, and kill the older ones
				for (let i = this.states.length - 1; i > 0; --i) {
					let state = this.states[i];
					//state.display();
					if (this.drawReal) {
						state.displayReal();
					}

					if (this.drawNoisy) {
						state.displayNoisy();
					}
					if (this.drawFiltered) {
						state.displayFiltered();
					}

					state.update();

					if (i > 1) {
						var p1 = state.get();
						let alpha = Math.round(
							(p1[2] * 255) / this.ttl
						).toString(16);
						if (this.drawNoisyTraj) {
							var p2 = this.states[i - 1].get();
							ctx.strokeStyle = "#229922" + alpha;
							ctx.lineWidth = 1;
							ctx.beginPath();
							ctx.moveTo(p1[0], p1[1]);
							ctx.lineTo(p2[0], p2[1]);
							ctx.stroke();
						}

						if (this.drawFilteredTraj) {
							var p1 = state.getK();
							var p2 = this.states[i - 1].getK();
							ctx.strokeStyle = "#993399" + alpha;
							ctx.lineWidth = 1.5;
							ctx.beginPath();
							ctx.moveTo(p1[0], p1[1]);
							ctx.lineTo(p2[0], p2[1]);
							ctx.stroke();
						}
					}

					if (state.dead) {
						this.states.splice(i, 1);
					}
				}
				if (this.prediction) {
					for (var i = 0; i < pPoints.length; i++) {
						pPoints[i].display("#ffffff");
					}
				}
			}

			// See ya in 1000/desiredFramerate milliseconds
			this.lastCalledTime = performance.now();
			let ms = performance.now() - start;
			this.ms = ms;
			setTimeout(this.frame, 1000 / this.framerate - ms);
		}
	}
};
</script>
<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
a {
	text-decoration: none;
}

.stats {
	font-size: 1.2rem;
}

.title {
	font-weight: 700;
	font-size: 3rem;
	letter-spacing: -0.06em;
	line-height: 1;
	margin-bottom: 0.1em;
}

.subtitle {
	font-weight: 500;
	font-size: 1.6rem;
	letter-spacing: -0.05em;
	line-height: 1;
	margin-top: 0;
}

.kalmandemo {
	box-shadow: 0 27.125px 50px -12.125px rgba(0, 0, 0, 0.4);
}
</style>