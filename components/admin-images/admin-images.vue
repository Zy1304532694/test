<template>
	<view class="images-container">
		<uni-card :is-full="true">
			<view class="card-title">图片管理</view>
			<view class="content-wrapper">
				<!-- 搜索和操作栏 -->
				<view class="action-bar">
					<view class="search-box">
						<view class="search-form">
							<uni-easyinput v-model="searchKeyword" placeholder="搜索图片标题/描述" :inputBorder="false"
								prefixIcon="search" class="search-input" @input="handleSearchInput" />
							<view class="search-buttons">
								<button class="search-btn" type="primary" size="mini" :disabled="!searchKeyword"
									@click="handleSearch">搜索</button>
								<button class="reset-btn" size="mini" :disabled="!searchKeyword"
									@click="handleResetSearch">重置</button>
							</view>
						</view>
					</view>
					<view class="action-buttons">
						<button type="primary" size="mini" @click="handleAdd">
							<uni-icons type="plusempty" size="14"></uni-icons>
							<text>添加图片</text>
						</button>
					</view>
				</view>

				<!-- 图片列表 -->
				<uni-table stripe emptyText="暂无数据" :loading="loading" border>
					<uni-tr>
						<uni-th width="300" align="left">图片信息</uni-th>
						<uni-th width="100" align="center">浏览量</uni-th>
						<uni-th width="100" align="center">点赞数</uni-th>
						<uni-th width="100" align="center">下载量</uni-th>
						<uni-th width="120" align="center">标签</uni-th>
						<uni-th width="180" align="center">创建时间</uni-th>
						<uni-th width="200" align="center">操作</uni-th>
					</uni-tr>
					<uni-tr v-for="item in imageList" :key="item._id">
						<uni-td align="left" class="image-info-cell">
							<view class="image-info">
								<image :src="item.url" mode="aspectFill" class="thumbnail"
									@click="previewImage(item.url)"></image>
								<view class="info-content">
									<view class="image-title">
										<text class="title-text">{{ item.title }}</text>
									</view>
									<view class="description-text">{{ item.description || '-' }}</view>
								</view>
							</view>
						</uni-td>
						<uni-td align="center">{{ item.view_count }}</uni-td>
						<uni-td align="center">{{ item.like_count }}</uni-td>
						<uni-td align="center">{{ item.download_count }}</uni-td>
						<uni-td align="center">
							<view class="tag-list">
								<text v-for="(tag, index) in (Array.isArray(item.tags) ? item.tags : [])" :key="index"
									class="tag-item">
									{{ getTagText(tag) }}
								</text>
							</view>
						</uni-td>
						<uni-td align="center">{{ formatDate(item.create_time) }}</uni-td>
						<uni-td align="center">
							<view class="table-actions">
								<button type="primary" size="mini" @click="handleEdit(item)">编辑</button>
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

		<!-- 图片表单弹窗 -->
		<uni-popup ref="formPopup" type="dialog">
			<uni-popup-dialog class="form-dialog" :title="formData._id ? '编辑图片' : '添加图片'" :before-close="true"
				:loading="submitting" @close="handleFormClose" @confirm="handleFormSubmit">
				<uni-forms ref="form" :model="formData" :rules="rules" label-width="80px">
					<uni-forms-item label="标题" name="title" required>
						<uni-easyinput v-model="formData.title" placeholder="请输入图片标题" />
					</uni-forms-item>
					<uni-forms-item label="描述" name="description">
						<uni-easyinput v-model="formData.description" type="textarea" placeholder="请输入图片描述"
							:maxlength="200" :autoHeight="true" />
					</uni-forms-item>
					<uni-forms-item label="图片" name="url" required>
						<uni-file-picker v-model="formData.url" file-mediatype="image" mode="grid" :limit="1"
							:image-styles="filePickerStyles" />
					</uni-forms-item>
					<uni-forms-item label="标签" name="tags">
						<view class="tag-selector">
							<view v-for="(tag, index) in tagOptions" :key="index" class="tag-option"
								:class="{ active: isTagSelected(tag.value) }" @click="toggleTag(tag.value)">
								{{ tag.text }}
							</view>
						</view>
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
				submitting: false,
				searchKeyword: '',
				loading: false,
				imageList: [],
				total: 0,
				currentPage: 1,
				pageSize: 10,
				formData: {
					title: '',
					description: '',
					url: [],
					tags: []
				},
				filePickerStyles: {
					width: 120,
					height: 120
				},
				rules: {
					title: {
						rules: [{
							required: true,
							errorMessage: '请输入图片标题'
						}]
					},
					url: {
						rules: [{
							required: true,
							errorMessage: '请上传图片'
						}]
					}
				},
				tagOptions: [{
						text: '头像',
						value: 'avatar'
					},
					{
						text: '壁纸',
						value: 'wallpaper'
					}
				]
			}
		},
		mounted() {
			this.loadData()
		},
		methods: {
			// 加载图片列表
			async loadData() {
				this.loading = true
				try {
					const res = await uniCloud.callFunction({
						name: 'admin-images',
						data: {
							action: 'list',
							page: this.currentPage,
							pageSize: this.pageSize,
							keyword: this.searchKeyword,
							token: uni.getStorageSync('token')
						}
					})
					if (res.result.code === 0) {
						this.imageList = res.result.data
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
					title: '',
					description: '',
					url: [],
					tags: []
				}
				this.$refs.formPopup.open()
			},
			handleEdit(item) {
				this.formData = {
					...item,
					tags: Array.isArray(item.tags) ? item.tags : [],
					url: item.url ? [{
						url: item.url,
						name: '图片',
						extname: item.url.split('.').pop() || 'png'
					}] : []
				}
				this.$refs.formPopup.open()
			},
			handleFormClose() {
				if (this.submitting) return
				this.$refs.formPopup.close()
			},
			async handleFormSubmit() {
				if (this.submitting) return

				this.$refs.form.validate().then(async res => {
					try {
						this.submitting = true
						const action = this.formData._id ? 'update' : 'add'
						
						// 处理图片数据
						let submitData = {
							_id: this.formData._id,
							title: this.formData.title,
							description: this.formData.description,
							tags: this.formData.tags,
							url: Array.isArray(this.formData.url) && this.formData.url.length > 0 ? 
								this.formData.url[0].url : ''
						}

						// 如果是编辑模式且没有新上传的图片，保持原有url
						if (this.formData._id && !submitData.url && this.formData.url) {
							submitData.url = Array.isArray(this.formData.url) ? 
								this.formData.url[0].url : this.formData.url
						}

						const result = await uniCloud.callFunction({
							name: 'admin-images',
							data: {
								action,
								data: submitData,
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
					} finally {
						this.submitting = false
					}
				})
			},

			// 删除图片
			handleDelete(item) {
				uni.showModal({
					title: '提示',
					content: '确定要删除该图片吗？',
					success: async (res) => {
						if (res.confirm) {
							try {
								const result = await uniCloud.callFunction({
									name: 'admin-images',
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

			// 预览图片
			previewImage(url) {
				uni.previewImage({
					urls: [url]
				})
			},

			// 标签相关方法
			getTagText(value) {
				const tag = this.tagOptions.find(t => t.value === value)
				return tag ? tag.text : ''
			},
			isTagSelected(value) {
				if (!Array.isArray(this.formData.tags)) {
					return false
				}
				return this.formData.tags.includes(value)
			},
			toggleTag(value) {
				if (!Array.isArray(this.formData.tags)) {
					this.formData.tags = []
				}
				const index = this.formData.tags.indexOf(value)
				if (index === -1) {
					this.formData.tags.push(value)
				} else {
					this.formData.tags.splice(index, 1)
				}
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
	.images-container {
		min-height: 100vh;

		:deep(.uni-card) {
			margin: 0;

			.card-title {
				margin: 30px 0;
				font-size: 18px;
				font-weight: 800;
				color: #333;
			}

			.uni-card__header {
				padding: 15px 20px;
				border-bottom: 1px solid #ebeef5;
			}
		}

		.content-wrapper {
			margin: 0 auto;
			background-color: #fff;
			border-radius: 4px;

			:deep(.uni-table) {
				border-radius: 4px;
				overflow: hidden;
				box-shadow: 0 1px 4px rgba(0, 0, 0, 0.1);

				.uni-table-tr {
					&:hover {
						background-color: #f5f7fa;
					}

					&:first-child {
						background-color: #f5f7fa;

						.uni-table-th {
							font-weight: 500;
							color: #606266;
						}
					}
				}

				.table-actions {
					display: flex;
					justify-content: center;
					gap: 8px;

					button {
						min-width: 60px;

						&.button-warn {
							background-color: #f56c6c;

							&:hover {
								background-color: #f78989;
							}
						}
					}
				}
			}

			.action-bar {
				display: flex;
				justify-content: space-between;
				align-items: center;
				margin-bottom: 20px;

				.search-box {
					flex: 1;
					max-width: 600px;

					.search-form {
						display: flex;
						align-items: center;
						gap: 10px;

						.search-input {
							flex: 1;

							:deep(.uni-easyinput__content) {
								background-color: #fff;
								border-radius: 4px;
								border: 1px solid #dcdfe6;

								&:hover {
									border-color: #c0c4cc;
								}
							}
						}

						.search-buttons {
							display: flex;
							gap: 8px;

							button {
								padding: 0 15px;
								height: 32px;
								line-height: 32px;
							}
						}
					}
				}

				.action-buttons {
					button {
						display: flex;
						align-items: center;
						gap: 4px;
						padding: 0 15px;
						height: 32px;
						line-height: 32px;
					}
				}
			}

			.pagination {
				margin-top: 20px;
				display: flex;
				justify-content: flex-end;
			}
		}

		.image-info-cell {
			padding: 12px !important;
		}

		.image-info {
			display: flex;
			gap: 15px;
			align-items: flex-start;
		}

		.info-content {
			flex: 1;
			min-width: 0;
		}

		.thumbnail {
			width: 80px;
			height: 80px;
			border-radius: 4px;
			cursor: pointer;
			object-fit: cover;
			flex-shrink: 0;
			transition: transform 0.2s;

			&:hover {
				transform: scale(1.05);
			}
		}

		.image-title {
			display: flex;
			align-items: center;
			gap: 8px;
			margin-bottom: 8px;

			.title-text {
				font-weight: 500;
				color: #333;
				overflow: hidden;
				text-overflow: ellipsis;
				white-space: nowrap;
			}
		}

		.description-text {
			display: -webkit-box;
			-webkit-box-orient: vertical;
			-webkit-line-clamp: 2;
			overflow: hidden;
			font-size: 13px;
			color: #666;
			line-height: 1.4;
			margin-right: 20px;
		}

		// 标签样式
		.tag-list {
			display: flex;
			gap: 4px;
			justify-content: center;
			flex-wrap: wrap;

			.tag-item {
				padding: 2px 8px;
				background-color: #ecf5ff;
				color: #409eff;
				border-radius: 4px;
				font-size: 12px;
			}
		}

		// 表单弹窗样式
		.form-dialog {
			width: 680px !important;

			:deep(.uni-forms-item) {
				margin-bottom: 22px;

				.uni-forms-item__label {
					font-weight: 500;
				}

				.uni-easyinput__content {
					background-color: #f5f7fa;
					border: 1px solid #dcdfe6;
					border-radius: 0px;

					&:hover {
						border-color: #c0c4cc;
					}

					&-textarea {
						min-height: 80px;
					}
				}
			}

			.tag-selector {
				display: flex;
				flex-wrap: wrap;
				gap: 8px;

				.tag-option {
					padding: 6px 12px;
					border-radius: 4px;
					background-color: #f5f7fa;
					border: 1px solid #dcdfe6;
					cursor: pointer;
					transition: all 0.2s;

					&:hover {
						border-color: #409eff;
						color: #409eff;
					}

					&.active {
						background-color: #409eff;
						border-color: #409eff;
						color: #fff;
					}
				}
			}
		}
	}
</style> 