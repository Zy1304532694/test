<template>
	<view class="user-form-container">
		<uni-forms ref="form" :model="formData" :rules="rules">
			<uni-forms-item label="用户名" name="username">
				<uni-easyinput v-model="formData.username" placeholder="请输入用户名" />
			</uni-forms-item>
			
			<uni-forms-item label="手机号" name="phone">
				<uni-easyinput v-model="formData.phone" placeholder="请输入手机号" />
			</uni-forms-item>
			
			<uni-forms-item label="密码" name="password" v-if="!formData._id">
				<uni-easyinput v-model="formData.password" type="password" placeholder="请输入密码" />
			</uni-forms-item>
			
			<uni-forms-item label="状态" name="status">
				<uni-data-checkbox
					v-model="formData.status"
					:localdata="statusOptions"
				/>
			</uni-forms-item>
			
			<view class="form-actions">
				<button type="primary" @click="handleSubmit">保存</button>
				<button @click="handleCancel">取消</button>
			</view>
		</uni-forms>
	</view>
</template>

<script>
	export default {
		data() {
			return {
				formData: {
					username: '',
					phone: '',
					password: '',
					status: 1
				},
				statusOptions: [{
					text: '正常',
					value: 1
				}, {
					text: '禁用',
					value: 0
				}],
				rules: {
					username: {
						rules: [{
							required: true,
							errorMessage: '请输入用户名'
						}]
					},
					phone: {
						rules: [{
							pattern: /^1[3-9]\d{9}$/,
							errorMessage: '请输入正确的手机号'
						}]
					},
					password: {
						rules: [{
							required: true,
							errorMessage: '请输入密码'
						}, {
							minLength: 6,
							errorMessage: '密码长度不能小于6位'
						}]
					}
				}
			}
		},
		onLoad(options) {
			if (options.id) {
				this.loadUserInfo(options.id)
			}
		},
		methods: {
			// 加载用户信息
			async loadUserInfo(id) {
				uni.showLoading({
					title: '加载中...'
				})
				try {
					const res = await uniCloud.callFunction({
						name: 'admin-users',
						data: {
							action: 'get',
							data: { _id: id }
						}
					})
					if (res.result.code === 0) {
						this.formData = {
							...this.formData,
							...res.result.data,
							password: '' // 清空密码字段
						}
					}
				} catch (e) {
					uni.showToast({
						title: '加载失败',
						icon: 'none'
					})
				}
				uni.hideLoading()
			},
			
			// 提交表单
			handleSubmit() {
				this.$refs.form.validate().then(async res => {
					uni.showLoading({
						title: '保存中...'
					})
					try {
						const action = this.formData._id ? 'update' : 'add'
						const res = await uniCloud.callFunction({
							name: 'admin-users',
							data: {
								action,
								data: this.formData
							}
						})
						if (res.result.code === 0) {
							uni.showToast({
								title: '保存成功'
							})
							setTimeout(() => {
								uni.navigateBack()
							}, 1500)
						}
					} catch (e) {
						uni.showToast({
							title: '保存失败',
							icon: 'none'
						})
					}
					uni.hideLoading()
				})
			},
			
			// 取消
			handleCancel() {
				uni.navigateBack()
			}
		}
	}
</script>

<style lang="scss">
	.user-form-container {
		background-color: #fff;
		padding: 20px;
		
		.form-actions {
			margin-top: 30px;
			display: flex;
			justify-content: center;
			gap: 20px;
			
			button {
				min-width: 120px;
			}
		}
	}
</style> 