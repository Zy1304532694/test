<template>
	<view class="apps-container">
		<uni-card :is-full="true">
			<view class="card-title">应用管理</view>
			<view class="content-wrapper">
				<!-- 搜索和操作栏 -->
				<view class="action-bar">
					<view class="search-box">
						<view class="search-form">
							<uni-easyinput v-model="searchKeyword" placeholder="搜索应用名称/编号" :inputBorder="false"
								prefixIcon="search" @input="handleSearchInput" />
							<button class="search-btn" type="primary" size="mini" :disabled="!searchKeyword"
								@click="handleSearch">搜索</button>
							<button class="reset-btn" size="mini" :disabled="!searchKeyword"
								@click="handleResetSearch">重置</button>
						</view>
					</view>
					<button type="primary" size="mini" @click="handleAdd">添加应用</button>
				</view>

				<!-- 应用列表 -->
				<uni-table stripe emptyText="暂无数据" :loading="loading" border>
					<uni-tr>
						<uni-th width="100" align="center">编号</uni-th>
						<uni-th width="180" align="left">应用名称</uni-th>
						<uni-th width="180" align="left">AppID</uni-th>
						<uni-th width="100" align="center">应用状态</uni-th>
						<uni-th width="100" align="center">广告状态</uni-th>
						<uni-th width="180" align="center">创建时间</uni-th>
						<uni-th width="200" align="center">操作</uni-th>
					</uni-tr>
					<uni-tr v-for="item in appList" :key="item._id">
						<uni-td align="center">{{ item.code }}</uni-td>
						<uni-td align="left">{{ item.app_name }}</uni-td>
						<uni-td align="left">{{ item.appid }}</uni-td>
						<uni-td align="center">
							<uni-tag :text="item.app_status === 1 ? '正常' : '禁用'"
								:type="item.app_status === 1 ? 'success' : 'error'" size="small" />
						</uni-td>
						<uni-td align="center">
							<uni-tag :text="item.ad_status === 1 ? '开启' : '关闭'"
								:type="item.ad_status === 1 ? 'success' : 'warning'" size="small" />
						</uni-td>
						<uni-td align="center">{{ formatDate(item.create_time) }}</uni-td>
						<uni-td align="center">
							<view class="table-actions">
								<button type="primary" size="mini" @click="handleEdit(item)">编辑</button>
								<button :type="item.app_status === 1 ? 'warn' : 'primary'" size="mini"
									@click="handleToggleStatus(item)">
									{{ item.app_status === 1 ? '禁用' : '启用' }}
								</button>
								<button type="warn" size="mini" @click="handleDelete(item)">删除</button>
							</view>
						</uni-td>
					</uni-tr>
				</uni-table>

				<!-- 分页器 -->
				<view class="pagination">
					<uni-pagination show-icon :total="total" :pageSize="pageSize" :current="currentPage"
						@change="handlePageChange" />
				</view>
			</view>
		</uni-card>

		<!-- 应用表单弹窗 -->
		<uni-popup ref="formPopup" type="dialog">
			<uni-popup-dialog style="width: 600px;" :title="formData._id ? '编辑应用' : '添加应用'" :before-close="true"
				@close="handleFormClose" @confirm="handleFormSubmit">
				<uni-forms ref="form" :model="formData" :rules="rules" label-width="80px">
					<uni-forms-item label="编号" name="code" required>
						<uni-easyinput v-model="formData.code" placeholder="请输入应用编号" :disabled="!!formData._id" />
					</uni-forms-item>
					<uni-forms-item label="应用名称" name="app_name" required>
						<uni-easyinput v-model="formData.app_name" placeholder="请输入应用名称" />
					</uni-forms-item>
					<uni-forms-item label="AppID" name="appid" required>
						<uni-easyinput v-model="formData.appid" placeholder="请输入AppID" />
					</uni-forms-item>
					<uni-forms-item label="Secret" name="secret" required>
						<uni-easyinput v-model="formData.secret" type="password" placeholder="请输入Secret" />
					</uni-forms-item>
					<uni-forms-item label="插屏广告" name="interstitialId">
						<uni-easyinput v-model="formData.interstitialId" placeholder="请输入插屏广告ID" />
					</uni-forms-item>
					<uni-forms-item label="激励广告" name="rewardedVideoId">
						<uni-easyinput v-model="formData.rewardedVideoId" placeholder="请输入激励视频广告ID" />
					</uni-forms-item>
					<uni-forms-item label="应用状态" name="app_status">
						<uni-data-checkbox v-model="formData.app_status" :localdata="[
								{ text: '启用', value: 1 },
								{ text: '禁用', value: 0 }
							]" />
					</uni-forms-item>
					<uni-forms-item label="广告状态" name="ad_status">
						<uni-data-checkbox v-model="formData.ad_status" :localdata="[
								{ text: '开启', value: 1 },
								{ text: '关闭', value: 0 }
							]" />
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
				appList: [],
				total: 0,
				currentPage: 1,
				pageSize: 10,
				formData: {
					code: '',
					app_name: '',
					appid: '',
					secret: '',
					interstitialId: '',
					rewardedVideoId: '',
					app_status: 1,
					ad_status: 1
				},
				rules: {
					code: {
						rules: [{
							required: true,
							errorMessage: '请输入应用编号'
						}]
					},
					app_name: {
						rules: [{
							required: true,
							errorMessage: '请输入应用名称'
						}]
					},
					appid: {
						rules: [{
							required: true,
							errorMessage: '请输入AppID'
						}]
					},
					secret: {
						rules: [{
							required: true,
							errorMessage: '请输入Secret'
						}]
					}
				}
			}
		},
		mounted() {
			this.loadData()
		},
		methods: {
			// 加载应用列表
			async loadData() {
				this.loading = true
				try {
					const res = await uniCloud.callFunction({
						name: 'admin-apps',
						data: {
							action: 'list',
							page: this.currentPage,
							pageSize: this.pageSize,
							keyword: this.searchKeyword,
							token: uni.getStorageSync('token')
						}
					})
					if (res.result.code === 0) {
						this.appList = res.result.data
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

			// 搜索相关方法
			handleSearchInput(value) {
				if (!value) {
					this.handleResetSearch()
				}
			},
			handleSearch() {
				if (!this.searchKeyword) return
				this.currentPage = 1
				this.loadData()
			},
			handleResetSearch() {
				this.searchKeyword = ''
				this.currentPage = 1
				this.loadData()
			},

			// 分页
			handlePageChange(e) {
				this.currentPage = e.current
				this.loadData()
			},

			// 表单操作
			handleAdd() {
				this.formData = {
					code: '',
					app_name: '',
					appid: '',
					secret: '',
					interstitialId: '',
					rewardedVideoId: '',
					app_status: 1,
					ad_status: 1
				}
				this.$refs.formPopup.open()
			},
			handleEdit(item) {
				this.formData = {
					...item
				}
				this.$refs.formPopup.open()
			},
			handleFormClose() {
				this.$refs.formPopup.close()
			},
			async handleFormSubmit() {
				this.$refs.form.validate().then(async res => {
					try {
						const action = this.formData._id ? 'update' : 'add'
						const result = await uniCloud.callFunction({
							name: 'admin-apps',
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

			// 状态操作
			async handleToggleStatus(item) {
				try {
					const result = await uniCloud.callFunction({
						name: 'admin-apps',
						data: {
							action: 'updateStatus',
							id: item._id,
							app_status: item.app_status === 1 ? 0 : 1,
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

			// 删除
			handleDelete(item) {
				uni.showModal({
					title: '提示',
					content: '确定要删除该应用吗？',
					success: async (res) => {
						if (res.confirm) {
							try {
								const result = await uniCloud.callFunction({
									name: 'admin-apps',
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
	.apps-container {
		:deep(.uni-card) {
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
			margin: 0 auto;
			background-color: #fff;
			border-radius: 4px;

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

				>button {
					height: 35px;
					line-height: 33px;
					padding: 0 20px;
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
			padding: 24px 30px;
			min-height: 600px;
		}

		.uni-forms-item {
			margin-bottom: 22px;

			.uni-forms-item__label {
				font-weight: normal;
				color: #666;
				width: 100px !important;
			}

			.uni-easyinput__content {
				min-width: 350px;
			}

			.uni-data-checklist {
				min-width: 350px;

				.checklist-row {
					justify-content: flex-start;
					gap: 30px;
				}
			}
		}

		.uni-dialog__footer {
			padding: 15px 30px;

			button {
				min-width: 80px;
				font-size: 14px;
			}
		}
	}
</style>