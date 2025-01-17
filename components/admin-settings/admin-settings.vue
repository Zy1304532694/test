<template>
	<view class="settings-container">
		<uni-card :is-full="true">
			<view class="card-header">
				<view class="title">
					<uni-icons type="gear" size="20"></uni-icons>
					<text>系统设置</text>
				</view>
				<view class="description">配置系统的基本信息和参数</view>
			</view>
			<view class="form-wrapper">
				<uni-forms ref="form" :model="formData" :rules="rules" label-width="80px">
					<view class="form-content">
						<uni-forms-item label="系统名称" name="site_name" required>
							<view class="input-box">
								<uni-easyinput 
									v-model="formData.site_name" 
									placeholder="请输入系统名称"
									:styles="{
										backgroundColor: '#f5f7fa',
										width: '400px'
									}"
								/>
							</view>
						</uni-forms-item>
						
						<uni-forms-item label="系统LOGO" name="site_logo">
							<view class="upload-box">
								<uni-file-picker
									v-model="formData.site_logo" 
									file-mediatype="image"
									return-type="object"
									:auto-upload="true"
									limit="1"
									mode="grid"
									:image-styles="imageStyles"
								/>
								<view class="upload-tips">建议上传比例1:1的PNG格式图片</view>
							</view>
						</uni-forms-item>
						
						<uni-forms-item label="系统描述" name="site_desc">
							<uni-easyinput 
								v-model="formData.site_desc" 
								type="textarea" 
								placeholder="请输入系统描述"
								:styles="{
									backgroundColor: '#f5f7fa',
									width: '400px',
									minHeight: '80px'
								}"
								:maxlength="200"
								:autoHeight="true"
							/>
						</uni-forms-item>
						
						<uni-forms-item label="联系邮箱" name="contact_email">
							<uni-easyinput 
								v-model="formData.contact_email" 
								placeholder="请输入联系邮箱"
								:styles="{
									backgroundColor: '#f5f7fa',
									width: '400px'
								}"
							/>
						</uni-forms-item>
						
						<uni-forms-item label="联系电话" name="contact_phone">
							<uni-easyinput 
								v-model="formData.contact_phone" 
								placeholder="请输入联系电话"
								:styles="{
									backgroundColor: '#f5f7fa',
									width: '400px'
								}"
							/>
						</uni-forms-item>
						
						<uni-forms-item label="ICP备案" name="icp_code">
							<view class="input-box">
								<uni-easyinput 
									v-model="formData.icp_code" 
									placeholder="请输入ICP备案号"
									:styles="{
										backgroundColor: '#f5f7fa',
										width: '400px'
									}"
								/>
							</view>
						</uni-forms-item>
					</view>

					<view class="form-actions">
						<button class="submit-btn" type="primary" @click="handleSubmit">
							<uni-icons type="save" size="16"></uni-icons>
							<text>保存设置</text>
						</button>
					</view>
				</uni-forms>
			</view>
		</uni-card>
	</view>
</template>

<script>
	export default {
		data() {
			return {
				imageStyles: {
					width: 120,
					height: 120
				},
				formData: {
					site_name: '',
					site_logo: null,
					site_desc: '',
					contact_email: '',
					contact_phone: '',
					icp_code: ''
				},
				rules: {
					site_name: {
						rules: [{
							required: true,
							errorMessage: '请输入站点名称'
						}]
					},
					site_logo: {
						rules: [{
							format: 'file'
						}]
					},
					contact_email: {
						rules: [{
							format: 'email',
							errorMessage: '请输入正确的邮箱格式'
						}]
					}
				}
			}
		},
		mounted() {
			this.loadSettings()
		},
		methods: {
			// 加载设置
			async loadSettings() {
				try {
					const res = await uniCloud.callFunction({
						name: 'admin-settings',
						data: {
							action: 'get',
							token: uni.getStorageSync('token')
						}
					})
					if (res.result.code === 0 && res.result.data) {
						// 处理 site_logo 数据格式
						const data = res.result.data
						if (data.site_logo) {
							data.site_logo = [{
								url: data.site_logo,
								name: 'logo',
								extname: data.site_logo.split('.').pop() || 'png'
							}]
						}
						this.formData = data
					} else if (res.result.code === 401) {
						// token过期，跳转登录页
						uni.showToast({
							title: '请重新登录',
							icon: 'none'
						})
						setTimeout(() => {
							uni.redirectTo({
								url: '/pages/admin/login'
							})
						}, 1500)
					}
				} catch (e) {
					uni.showToast({
						title: '加载设置失败',
						icon: 'none'
					})
				}
			},
			
			// 提交表单
			handleSubmit() {
				this.$refs.form.validate().then(async res => {
					try {
						const result = await uniCloud.callFunction({
							name: 'admin-settings',
							data: {
								action: 'save',
								data: this.formData,
								token: uni.getStorageSync('token')
							}
						})
						
						if (result.result.code === 0) {
							uni.showToast({
								title: '保存成功'
							})
							// 触发全局事件，通知其他组件更新设置
							uni.$emit('settingsUpdated')
						} else if (result.result.code === 401) {
							// token过期，跳转登录页
							uni.showToast({
								title: '请重新登录',
								icon: 'none'
							})
							setTimeout(() => {
								uni.redirectTo({
									url: '/pages/admin/login'
								})
							}, 1500)
						} else {
							uni.showToast({
								title: result.result.msg || '保存失败',
								icon: 'none'
							})
						}
					} catch (e) {
						uni.showToast({
							title: '保存失败',
							icon: 'none'
						})
					}
				})
			},
			
			// 文件选择
			selectFile(e) {
				console.log('选择文件：', e)
			},
			
			// 上传进度
			uploadProgress(e) {
				console.log('上传进度：', e)
			},
			
			// 上传成功
			uploadSuccess(e) {
				console.log('上传成功：', e.tempFiles[0])
				// 保存文件对象信息
				this.formData.site_logo = {
					name: e.tempFiles[0].name,
					extname: e.tempFiles[0].extname,
					url: e.tempFiles[0].url
				}
			},
			
			// 上传失败
			uploadFail(e) {
				console.log('上传失败：', e)
				uni.showToast({
					title: '图片上传失败',
					icon: 'none'
				})
			}
		}
	}
</script>

<style lang="scss">
.settings-container {
	.card-header {
		padding: 24px 0;
		border-bottom: 1px solid #ebeef5;
		margin-bottom: 40px;
		text-align: center;
		
		.title {
			display: flex;
			align-items: center;
			gap: 8px;
			margin-bottom: 8px;
			justify-content: center;
			
			text {
				font-size: 18px;
				font-weight: 500;
				color: #303133;
			}
		}
		
		.description {
			color: #909399;
			font-size: 14px;
		}
	}

	.form-wrapper {
		padding: 0 20px;
		
		.form-content {
			max-width: 600px;
			margin: 0 auto;
		}
		
		.input-box {
			border-radius: 4px;
			transition: all 0.3s;
			
			&:hover {
				border-color: #c0c4cc;
			}
			
			&:focus-within {
				border-color: #409eff;
				box-shadow: 0 0 0 2px rgba(64,158,255,0.1);
			}
		}
		
		:deep(.uni-forms-item) {
			margin-bottom: 25px;
			
			.uni-forms-item__label {
				font-weight: 500;
				color: #606266;
			}
			
			.uni-easyinput__content {
				background-color: #f5f7fa;
				border: 1px solid #dcdfe6;
				
				&:hover {
					border-color: #c0c4cc;
				}
				
				&:focus-within {
					border-color: #409eff;
					box-shadow: 0 0 0 2px rgba(64,158,255,0.1);
				}
			}
		}
		
		.form-actions {
			margin-top: 30px;
			padding-top: 30px;
			border-top: 1px solid #ebeef5;
			display: flex;
			justify-content: center;
			
			.submit-btn {
				min-width: 120px;
				height: 40px;
				display: flex;
				align-items: center;
				justify-content: center;
				gap: 6px;
				font-size: 14px;
				transition: all 0.3s;
				
				&:hover {
					transform: translateY(-1px);
					box-shadow: 0 4px 12px rgba(64,158,255,0.3);
				}
				
				&:active {
					transform: translateY(0);
				}
			}
		}
	}
}
</style> 