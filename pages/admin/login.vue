<template>
	<view class="login-page">
		<!-- 背景动画 -->
		<view class="wave-box">
			<view class="wave-line"></view>
			<view class="wave-line"></view>
			<view class="wave-line"></view>
		</view>
		
		<!-- 系统标题 -->
		<view class="system-title">
			<!-- <image src="/static/logo.png" mode="heightFix" class="logo"></image> -->
			<text>{{ settings.site_name || '小程序后台系统' }}</text>
			<view class="sub-title">Mini Program Management System</view>
		</view>

		<view class="login-box">
			<view class="title">管理员登录</view>
			<uni-forms ref="form" :model="formData" :rules="rules">
				<uni-forms-item name="username">
					<view class="input-box">
						<uni-icons type="person" size="20" color="#666"></uni-icons>
						<uni-easyinput v-model="formData.username" placeholder="请输入用户名" />
					</view>
				</uni-forms-item>
				<uni-forms-item name="password">
					<view class="input-box">
						<uni-icons type="locked" size="20" color="#666"></uni-icons>
						<uni-easyinput v-model="formData.password" type="password" placeholder="请输入密码" />
					</view>
				</uni-forms-item>
				<button class="login-btn" @click="handleLogin">登录</button>
			</uni-forms>
		</view>
	</view>
	<!-- <view class="">
		<button size="mini" @click="initadmin">初始化管理员账号</button>
	</view> -->
</template>

<script>
	import { getSystemSettings } from '@/common/utils/settings.js'

	export default {
		data() {
			return {
				formData: {
					username: '',
					password: ''
				},
				rules: {
					username: {
						rules: [{
							required: true,
							errorMessage: '请输入用户名'
						}]
					},
					password: {
						rules: [{
							required: true,
							errorMessage: '请输入密码'
						}]
					}
				},
				settings: {}
			}
		},
		onLoad() {
			uni.$on('settingsUpdated', this.refreshSettings)
			this.refreshSettings()
		},
		onUnload() {
			uni.$off('settingsUpdated', this.refreshSettings)
		},
		methods: {
			// initadmin() {
			// 	uniCloud.callFunction({
			// 		name: 'admin-init'
			// 	}).then(res => {
			// 		console.log('初始化结果：', res)
			// 	}).catch(() => {
			// 		console.log("初始化失败");
			// 	})

			// },
			async refreshSettings() {
				this.settings = await getSystemSettings()
			},
			handleLogin() {
				this.$refs.form.validate().then(res => {
					// 这里添加登录逻辑
					uni.showLoading({
						title: '登录中...'
					})
					console.log("表单数据：", this.formData);
					// 调用云函数验证登录
					uniCloud.callFunction({
						name: 'admin-login',
						data: this.formData
					}).then(res => {
						uni.hideLoading()
						if (res.result.code === 0) {
							uni.setStorageSync('token', res.result.token)
							uni.setStorageSync('userInfo', res.result.userInfo)
							uni.redirectTo({
								url: '/pages/admin/index'
							})
						} else {
							uni.showToast({
								title: '用户名或密码错误',
								icon: 'none'
							})
						}
					}).catch(err => {
						uni.hideLoading()
						uni.showToast({
							title: '登录失败',
							icon: 'none'
						})
					})
				})
			}
		}
	}
</script>

<style lang="scss">
	.login-page {
		height: 100vh;
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		background-color: #0d1538;
		position: relative;
		overflow: hidden;
		
		// 波浪动画
		.wave-box {
			position: absolute;
			left: 0;
			right: 0;
			bottom: 0;
			height: 100%;
			
			.wave-line {
				position: absolute;
				left: -1000px;
				right: -1000px;
				bottom: 0;
				background: rgba(255,255,255,0.2);
				height: 2400px;
				border-radius: 43%;
				animation: wave 15s infinite linear;
				transform-origin: center bottom;
				
				&:nth-child(2) {
					bottom: 10px;
					opacity: 0.6;
					animation: wave 30s infinite linear;
				}
				
				&:nth-child(3) {
					bottom: 20px;
					opacity: 0.3;
					animation: wave 60s infinite linear;
				}
			}
		}
		
		// 系统标题
		.system-title {
			position: absolute;
			top: 15vh;
			text-align: center;
			display: flex;
			flex-direction: column;
			align-items: center;
			gap: 15px;
			
			.logo {
				height: 64px;
				width: auto;
				margin-bottom: 5px;
			}
			
			text {
				font-size: 36px;
				color: #fff;
				font-weight: bold;
				text-shadow: 0 2px 12px rgba(0,0,0,0.3);
				letter-spacing: 2px;
			}
			
			.sub-title {
				color: rgba(255,255,255,0.8);
				font-size: 16px;
				letter-spacing: 1px;
				text-transform: uppercase;
			}
		}

		.login-box {
			width: 360px;
			padding: 40px 30px;
			background-color: #fff;
			border-radius: 2px;
			box-shadow: 0 8px 30px rgba(0,0,0,0.25);
			position: relative;
			z-index: 1;
			margin-top: 0;
			backdrop-filter: blur(10px);
			border: 1px solid rgba(255,255,255,0.1);

			.title {
				text-align: center;
				font-size: 20px;
				color: #333;
				font-weight: 500;
				margin-bottom: 35px;
				position: relative;
				
				&::after {
					content: '';
					position: absolute;
					bottom: -12px;
					left: 50%;
					transform: translateX(-50%);
					width: 40px;
					height: 3px;
					background: linear-gradient(90deg, #409eff, #66b1ff);
					border-radius: 2px;
				}
			}
			
			.input-box {
				display: flex;
				align-items: center;
				background-color: #f5f7fa;
				border: 1px solid #dcdfe6;
				border-radius: 4px;
				padding: 0 15px;
				height: 45px;
				transition: all 0.3s;
				
				&:hover {
					border-color: #c0c4cc;
				}
				
				&:focus-within {
					border-color: #409eff;
					box-shadow: 0 0 0 2px rgba(64,158,255,0.1);
				}
				
				:deep(.uni-easyinput__content) {
					border: none;
					background: none;
				}
				
				.uni-icons {
					margin-right: 8px;
				}
			}

			.login-btn {
				margin-top: 30px;
				background-color: #409eff;
				color: #fff;
				height: 45px;
				line-height: 45px;
				font-size: 16px;
				letter-spacing: 1px;
				transition: all 0.3s;
				border-radius: 4px;
				
				&:hover {
					background-color: #66b1ff;
					transform: translateY(-1px);
					box-shadow: 0 4px 12px rgba(64,158,255,0.3);
				}
				
				&:active {
					background-color: #3a8ee6;
					transform: translateY(0);
				}
			}
		}
	}

	@keyframes wave {
		from { transform: rotate(0deg); }
		to { transform: rotate(360deg); }
	}
</style>