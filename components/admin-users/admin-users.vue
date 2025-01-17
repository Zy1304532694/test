<template>
	<view class="users-container">
		<uni-card :is-full="true">
			<view class="card-title">用户管理</view>
			<view class="content-wrapper">
				<!-- 搜索和操作栏 -->
				<view class="action-bar">
					<view class="search-box">
						<view class="search-form">
							<uni-easyinput
								v-model="searchKeyword"
								placeholder="搜索用户名/昵称"
								:inputBorder="false"
								prefixIcon="search"
								@input="handleSearchInput"
							/>
							<button 
								class="search-btn" 
								type="primary" 
								size="mini" 
								:disabled="!searchKeyword"
								@click="handleSearch"
							>搜索</button>
							<button 
								class="reset-btn" 
								size="mini"
								:disabled="!searchKeyword" 
								@click="handleResetSearch"
							>重置</button>
						</view>
					</view>
					<button type="primary" size="mini" disabled="true" @click="handleAdd">添加用户</button>
				</view>
				
				<!-- 用户列表 -->
				<uni-table stripe emptyText="暂无数据" :loading="loading" border>
					<uni-tr>
						<uni-th width="80" align="center">应用</uni-th>
						<uni-th width="80" align="center">头像</uni-th>
						<uni-th width="120" align="left">用户名</uni-th>
						<uni-th width="120" align="left">昵称</uni-th>
						<uni-th width="100" align="center">状态</uni-th>
						<uni-th width="180" align="center">最后登录</uni-th>
						<uni-th width="200" align="center">操作</uni-th>
					</uni-tr>
					<uni-tr v-for="item in userList" :key="item._id">
						<uni-td align="center">{{ item.appid[0].app_name }}</uni-td>
						<uni-td align="center">
							<view class="avatar-box">
								<image v-if="item.avatarUrl" :src="item.avatarUrl" mode="aspectFill" class="avatar"></image>
								<view v-else class="avatar-placeholder">
									<uni-icons size="20" type="person-filled" />
								</view>
							</view>
						</uni-td>
						<uni-td align="left">{{ item.username }}</uni-td>
						<uni-td align="left">{{ item.nickName || '-' }}</uni-td>
						<uni-td align="center">
							<uni-tag :text="item.status === 1 ? '正常' : '禁用'" 
								:type="item.status === 1 ? 'success' : 'error'" 
								size="small"
							/>
						</uni-td>
						<uni-td align="center">{{ formatDate(item.last_login_time) }}</uni-td>
						<uni-td align="center">
							<view class="table-actions">
								<button type="primary" size="mini" @click="handleEdit(item)">编辑</button>
								<button 
									:type="item.status === 1 ? 'warn' : 'primary'" 
									size="mini" 
									@click="handleToggleStatus(item)"
								>
									{{ item.status === 1 ? '禁用' : '启用' }}
								</button>
								<button 
									v-if="item.role !== 'admin'"
									type="warn" 
									size="mini" 
									@click="handleDelete(item)"
								>删除</button>
							</view>
						</uni-td>
					</uni-tr>
				</uni-table>
				
				<!-- 分页器 -->
				<view class="pagination">
					<uni-pagination
						show-icon
						:total="total"
						:pageSize="pageSize"
						:current="currentPage"
						@change="handlePageChange"
					/>
				</view>
			</view>
		</uni-card>
		
		<!-- 用户表单弹窗 -->
		<uni-popup ref="formPopup" type="dialog">
			<uni-popup-dialog
				:title="formData._id ? '编辑用户' : '添加用户'"
				:before-close="true"
				@close="handleFormClose"
				@confirm="handleFormSubmit"
			>
				<uni-forms ref="form" :model="formData" :rules="rules" label-width="80px">
					<uni-forms-item label="用户名" name="username" required>
						<uni-easyinput 
							v-model="formData.username" 
							placeholder="请输入用户名"
							:disabled="!!formData._id"
						/>
					</uni-forms-item>
					<uni-forms-item label="密码" name="password" :required="!formData._id">
						<uni-easyinput 
							v-model="formData.password" 
							type="password"
							placeholder="请输入密码"
						/>
					</uni-forms-item>
					<uni-forms-item label="昵称" name="nickName">
						<uni-easyinput 
							v-model="formData.nickName" 
							placeholder="请输入昵称"
						/>
					</uni-forms-item>
				</uni-forms>
			</uni-popup-dialog>
		</uni-popup>
	</view>
</template>

<script>
	export default {
		data() {
			return {
				searchKeyword: '',
				loading: false,
				userList: [],
				total: 0,
				currentPage: 1,
				pageSize: 10,
				formData: {
					username: '',
					password: '',
					nickName: '',
					role: 'user'
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
				roleOptions: [{
					text: '普通用户',
					value: 'user'
				}]
			}
		},
		mounted() {
			this.loadData()
		},
		methods: {
			// 加载用户列表
			async loadData() {
				this.loading = true
				try {
					const res = await uniCloud.callFunction({
						name: 'admin-users',
						data: {
							action: 'list',
							page: this.currentPage,
							pageSize: this.pageSize,
							keyword: this.searchKeyword,
							token: uni.getStorageSync('token')
						}
					})
					console.log('搜索结果：', res.result)
					if (res.result.code === 0) {
						this.userList = res.result.data || []
						this.total = res.result.total
					}
				} catch (e) {
					console.error('加载失败：', e)
					uni.showToast({
						title: '加载失败',
						icon: 'none'
					})
				}
				this.loading = false
			},
			
			// 搜索框输入
			handleSearchInput(value) {
				if (!value) {
					this.handleResetSearch()
				}
			},
			
			// 搜索
			handleSearch() {
				if (!this.searchKeyword) {
					return
				}
				console.log('开始搜索：', this.searchKeyword)
				this.currentPage = 1
				this.loadData()
			},
			
			// 重置搜索
			handleResetSearch() {
				this.searchKeyword = ''
				this.currentPage = 1
				this.loadData()
			},
			
			// 分页变化
			handlePageChange(e) {
				this.currentPage = e.current
				this.loadData()
			},
			
			// 添加用户
			handleAdd() {
				this.formData = {
					username: '',
					password: '',
					nickName: '',
				}
				this.$refs.formPopup.open()
			},
			
			// 编辑用户
			handleEdit(item) {
				this.formData = {
					_id: item._id,
					username: item.username,
					password: '',
					nickName: item.nickName,
					role: item.role
				}
				this.$refs.formPopup.open()
			},
			
			// 表单关闭
			handleFormClose() {
				this.$refs.formPopup.close()
			},
			
			// 表单提交
			handleFormSubmit() {
				this.$refs.form.validate().then(async res => {
					try {
						const action = this.formData._id ? 'update' : 'add'
						const result = await uniCloud.callFunction({
							name: 'admin-users',
							data: {
								action,
								data: this.formData,
								token: uni.getStorageSync('token')
							}
						})
						
						if (result.result.code === 0) {
							uni.showToast({
								title: '保存成功'
							})
							this.$refs.formPopup.close()
							this.loadData()
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
			
			// 切换用户状态
			async handleToggleStatus(item) {
				try {
					const result = await uniCloud.callFunction({
						name: 'admin-users',
						data: {
							action: 'updateStatus',
							id: item._id,
							status: item.status === 1 ? 0 : 1,
							token: uni.getStorageSync('token')
						}
					})
					
					if (result.result.code === 0) {
						uni.showToast({
							title: '操作成功'
						})
						this.loadData()
					}
				} catch (e) {
					uni.showToast({
						title: '操作失败',
						icon: 'none'
					})
				}
			},
			
			// 删除用户
			handleDelete(item) {
				uni.showModal({
					title: '提示',
					content: '确定要删除该用户吗？',
					success: async (res) => {
						if (res.confirm) {
							try {
								const result = await uniCloud.callFunction({
									name: 'admin-users',
									data: {
										action: 'delete',
										id: item._id,
										token: uni.getStorageSync('token')
									}
								})
								
								if (result.result.code === 0) {
									uni.showToast({
										title: '删除成功'
									})
									this.loadData()
								}
							} catch (e) {
								uni.showToast({
									title: '删除失败',
									icon: 'none'
								})
							}
						}
					}
				})
			},
			
			// 格式化日期
			formatDate(timestamp) {
				if (!timestamp) return '-'
				const date = new Date(timestamp)
				return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')} ${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`
			}
		}
	}
</script>

<style lang="scss">
.users-container {
	:deep(.uni-card) {
		// background-color: transparent;
		border: none;
		margin: 0;
		padding: 0;
		.card-title {
			margin: 30px 0;
			font-size: 18px;
			font-weight: 800;
			color: #333;
		}
		.uni-card__header {
			padding: 10px 0;
			border-bottom: none;
		}
	}
	
	.content-wrapper {
		// max-width: 1200px;
		margin: 0 auto;
		background-color: #fff;
		border-radius: 4px;
		// box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.05);
		
		:deep(.uni-table) {
			.uni-table-tr {
				&:hover {
					background-color: #f5f7fa;
				}
			}
			
			.uni-table-th {
				font-weight: bold;
				background-color: #f5f7fa;
			}
			
			.uni-table-td {
				padding: 12px 8px;
			}
		}
		
		.action-bar {
			display: flex;
			justify-content: space-between;
			align-items: center;
			margin-bottom: 15px;
			padding: 15px;
			background-color: #f5f7fa;
			border-radius: 4px;
			
			.search-box {
				flex: 1;
				margin-right: 20px;
				
				.search-form {
					display: flex;
					align-items: center;
					gap: 10px;
					max-width: 500px;
					
					.uni-easyinput {
						flex: 1;
					}
					
					:deep(.uni-easyinput__content) {
						background-color: #fff;
						border-radius: 4px;
						height: 35px;
						border: 1px solid #dcdfe6;
						
						&:hover {
							border-color: #c0c4cc;
						}
						
						&.is-focus {
							border-color: #409eff;
						}
					}
					
					.search-btn {
						background-color: #409eff;
						height: 35px;
						line-height: 33px;
						
						&:disabled {
							opacity: 0.6;
							cursor: not-allowed;
						}
					}
					
					.reset-btn {
						border: 1px solid #dcdfe6;
						color: #606266;
						height: 35px;
						line-height: 33px;
						
						&:disabled {
							opacity: 0.6;
							cursor: not-allowed;
						}
						
						&:hover:not(:disabled) {
							color: #409eff;
							border-color: #c6e2ff;
							background-color: #ecf5ff;
						}
					}
				}
			}
			
			> button {
				height: 35px;
				line-height: 33px;
				padding: 0 20px;
			}
		}
		
		.avatar-box {
			width: 40px;
			height: 40px;
			margin: 0 auto;
			display: flex;
			align-items: center;
			justify-content: center;
			
			.avatar {
				width: 40px;
				height: 40px;
				border-radius: 50%;
				object-fit: cover;
			}
			
			.avatar-placeholder {
				width: 40px;
				height: 40px;
				border-radius: 50%;
				background-color: #1890ff;
				display: flex;
				align-items: center;
				justify-content: center;
				.uni-icons {
					color: #fff;
				}
			}
		}
		
		.table-actions {
			display: flex;
			gap: 8px;
			justify-content: center;
			
			button {
				font-size: 12px;
				margin: 0;
				padding: 0 12px;
				height: 26px;
				line-height: 24px;
			}
		}
		
		.pagination {
			margin-top: 20px;
			display: flex;
			justify-content: flex-end;
		}
	}
}

:deep(.uni-popup-dialog) {
	.uni-dialog-content {
		padding: 20px;
	}
	
	.uni-forms-item {
		margin-bottom: 15px;
		
		.uni-forms-item__label {
			font-weight: normal;
			color: #666;
		}
	}
}
</style> 