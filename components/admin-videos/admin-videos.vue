<template>
	<view class="videos-container">
		<uni-card :is-full="true">
			<view class="card-title">视频管理</view>
			<view class="content-wrapper">
				<!-- 搜索和操作栏 -->
				<view class="action-bar">
					<view class="search-box">
						<view class="search-form">
							<uni-easyinput v-model="searchKeyword" placeholder="搜索视频标题/描述" :inputBorder="false"
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
							<text>添加视频</text>
						</button>
					</view>
				</view>

				<!-- 视频列表 -->
				<uni-table stripe emptyText="暂无数据" :loading="loading" border>
					<uni-tr>
						<uni-th width="300" align="left">视频信息</uni-th>
						<uni-th width="100" align="center">浏览量</uni-th>
						<uni-th width="100" align="center">点赞数</uni-th>
						<uni-th width="100" align="center">下载量</uni-th>
						<uni-th width="120" align="center">标签</uni-th>
						<uni-th width="180" align="center">创建时间</uni-th>
						<uni-th width="200" align="center">操作</uni-th>
					</uni-tr>
					<uni-tr v-for="item in videoList" :key="item._id">
						<uni-td align="left" class="video-info-cell">
							<view class="video-info">
								<image :src="item.thumbnail_url" mode="aspectFill" class="thumbnail"
									@click="previewImage(item.thumbnail_url)"></image>
								<view class="info-content">
									<view class="video-title">
										<text class="title-text">{{ item.title }}</text>
										<view class="video-preview" @click="previewVideo(item)">
											<uni-icons type="videocam-filled" size="16"></uni-icons>
											<text>预览</text>
										</view>
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

		<!-- 视频表单弹窗 -->
		<uni-popup ref="formPopup" type="dialog">
			<uni-popup-dialog class="form-dialog" :title="formData._id ? '编辑视频' : '添加视频'" :before-close="true"
				:loading="submitting" @close="handleFormClose" @confirm="handleFormSubmit">
				<uni-forms ref="form" :model="formData" :rules="rules" label-width="80px">
					<uni-forms-item label="标题" name="title" required>
						<uni-easyinput v-model="formData.title" placeholder="请输入视频标题" />
					</uni-forms-item>
					<uni-forms-item label="描述" name="description">
						<uni-easyinput v-model="formData.description" type="textarea" placeholder="请输入视频描述"
							:maxlength="200" :autoHeight="true" />
					</uni-forms-item>
					<uni-forms-item label="视频" name="video_url" required>
						<uni-file-picker v-model="formData.video_url" file-mediatype="video" mode="grid" :limit="1"
							:image-styles="filePickerStyles" />
					</uni-forms-item>
					<uni-forms-item label="封面图" name="thumbnail_url">
						<view class="upload-box">
							<uni-file-picker v-model="formData.thumbnail_url" file-mediatype="image" mode="grid" :limit="1"
								:image-styles="imageStyles" />
							<view class="upload-tips">建议上传16:9的图片作为视频封面</view>
						</view>
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

		<!-- 视频预览弹窗 -->
		<uni-popup ref="videoPreview" type="dialog">
			<view class="video-player">
				<video :src="currentVideo?.video_url" controls autoplay object-fit="fill" show-mute-btn
					@error="handleVideoError"></video>
			</view>
		</uni-popup>
	</view>
</template>

<script>
	export default {
		data() {
			return {
				submitting: false,
				currentVideo: null,
				searchKeyword: '',
				loading: false,
				videoList: [],
				total: 0,
				currentPage: 1,
				pageSize: 10,
				formData: {
					title: '',
					description: '',
					video_url: [],
					tags: []
				},
				filePickerStyles: {
					width: 200,
					height: 200
				},
				imageStyles: {
					width: 120,
					height: 120
				},
				rules: {
					title: {
						rules: [{
							required: true,
							errorMessage: '请输入视频标题'
						}]
					},
					video_url: {
						rules: [{
							required: true,
							errorMessage: '请上传视频'
						}]
					}
				},
				tagOptions: [{
						text: '热门',
						value: 'hot'
					},
					{
						text: '推荐',
						value: 'recommend'
					},
					{
						text: '新品',
						value: 'new'
					}
				]
			}
		},
		mounted() {
			this.loadData()
		},
		methods: {
			// 加载视频列表
			async loadData() {
				this.loading = true
				try {
					const res = await uniCloud.callFunction({
						name: 'admin-videos',
						data: {
							action: 'list',
							page: this.currentPage,
							pageSize: this.pageSize,
							keyword: this.searchKeyword,
							token: uni.getStorageSync('token')
						}
					})
					if (res.result.code === 0) {
						this.videoList = res.result.data
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
					video_url: [],
					tags: []
				}
				this.$refs.formPopup.open()
			},
			handleEdit(item) {
				this.formData = {
					...item,
					tags: Array.isArray(item.tags) ? item.tags : [],
					video_url: item.video_url ? [{
						url: item.video_url,
						name: '视频',
						extname: 'mp4'
					}] : [],
					thumbnail_url: item.thumbnail_url ? [{
						url: item.thumbnail_url,
						name: '封面图',
						extname: item.thumbnail_url.split('.').pop() || 'png'
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
						const submitData = {
							...this.formData,
							video_url: this.formData.video_url[0]?.url || '',
							thumbnail_url: Array.isArray(this.formData.thumbnail_url) && this.formData.thumbnail_url.length > 0 
								? this.formData.thumbnail_url[0].url 
								: (typeof this.formData.thumbnail_url === 'string' ? this.formData.thumbnail_url : '')
						}

						const result = await uniCloud.callFunction({
							name: 'admin-videos',
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

			// 删除
			handleDelete(item) {
				uni.showModal({
					title: '提示',
					content: '确定要删除该视频吗？',
					success: async (res) => {
						if (res.confirm) {
							try {
								const result = await uniCloud.callFunction({
									name: 'admin-videos',
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

			// 图片预览
			previewImage(url) {
				uni.previewImage({
					urls: [url]
				})
			},

			// 格式化日期
			formatDate(timestamp) {
				if (!timestamp) return '-'
				const date = new Date(timestamp)
				return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')} ${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`
			},

			// 视频预览
			previewVideo(video) {
				this.currentVideo = video
				this.$refs.videoPreview.open()
			},
			handleVideoPreviewClose() {
				this.currentVideo = null
				this.$refs.videoPreview.close()
			},
			handleVideoError() {
				uni.showToast({
					title: '视频加载失败',
					icon: 'none'
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
			}
		}
	}
</script>

<style lang="scss">
	.videos-container {
		// background-color: #fa0004;
		min-height: 100vh;
		// padding: 20px;

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

			.uni-card__content {
				padding: 20px;
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

		.pagination {
			margin-top: 20px;
			display: flex;
			justify-content: flex-end;
		}

		.video-info-cell {
			padding: 12px !important;
		}

		.video-info {
			display: flex;
			gap: 15px;
			align-items: flex-start;
		}

		.info-content {
			flex: 1;
			min-width: 0;
		}

		.thumbnail {
			width: 45px;
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

		.video-title {
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

			.video-preview {
				display: flex;
				align-items: center;
				gap: 4px;
				padding: 2px 8px;
				border-radius: 4px;
				background-color: #f4f4f5;
				cursor: pointer;
				font-size: 12px;
				color: #666;
				flex-shrink: 0;
				transition: all 0.2s;

				&:hover {
					background-color: #ecf5ff;
					color: #409eff;
					transform: translateY(-1px);
				}
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

		:deep(.uni-file-picker__container) {
			.is-add {
				border: 1px dashed #dcdfe6;
				transition: all 0.2s;

				&:hover {
					border-color: #409eff;
					background-color: #f5f7fa;
				}
			}
		}

		.video-player {
			height: 640px;
			width: 360px;
			background-color: #000000;
			border-radius: 8px;
			overflow: hidden;
			box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);

			video {
				width: 100%;
				height: 100%;
			}
		}

		// 视频预览弹窗
		:deep(.uni-popup-dialog) {
			.uni-dialog {
				padding: 0;
			}

			.uni-dialog__title {
				display: none;
			}

			.uni-dialog__footer {
				.uni-dialog-button-group {
					.uni-button-color {
						&.uni-button-color--primary {
							&.is-loading {
								background-color: #a0cfff;
								cursor: not-allowed;

								&::before {
									content: '';
									display: inline-block;
									width: 12px;
									height: 12px;
									margin-right: 5px;
									border: 2px solid #fff;
									border-top-color: transparent;
									border-radius: 50%;
									animation: btn-spin 0.6s linear infinite;
								}
							}
						}
					}
				}
			}
		}

		@keyframes btn-spin {
			0% {
				transform: rotate(0);
			}

			100% {
				transform: rotate(360deg);
			}
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