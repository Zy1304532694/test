<template>
	<view class="dashboard-container">
		<view class="dashboard-header">
			<view class="welcome">欢迎使用后台管理系统</view>
			<view class="date">{{ currentDate }}</view>
		</view>
		<view class="stats-cards">
			<view class="stat-card" v-for="(stat, index) in statistics" :key="index">
				<view class="stat-value">{{ stat.value }}</view>
				<view class="stat-label">{{ stat.label }}</view>
			</view>
		</view>
	</view>
</template>

<script>
	export default {
		name: 'admin-dashboard',
		data() {
			return {
				currentDate: '',
				statistics: [{
					label: '总用户数',
					value: '1,234'
				}, {
					label: '今日活跃',
					value: '123'
				}, {
					label: '总订单数',
					value: '456'
				}, {
					label: '待处理',
					value: '10'
				}]
			}
		},
		created() {
			this.getCurrentDate()
		},
		methods: {
			getCurrentDate() {
				const date = new Date()
				this.currentDate = `${date.getFullYear()}年${date.getMonth() + 1}月${date.getDate()}日`
			}
		}
	}
</script>

<style lang="scss">
	.dashboard-container {
		padding: 20px;
		
		.dashboard-header {
			display: flex;
			justify-content: space-between;
			align-items: center;
			margin-bottom: 20px;
			
			.welcome {
				font-size: 20px;
				font-weight: bold;
			}
			
			.date {
				color: #666;
			}
		}
		
		.stats-cards {
			display: grid;
			grid-template-columns: repeat(4, 1fr);
			gap: 20px;
			
			.stat-card {
				background-color: #fff;
				padding: 20px;
				border-radius: 8px;
				box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
				
				.stat-value {
					font-size: 24px;
					font-weight: bold;
					color: #409EFF;
					margin-bottom: 10px;
				}
				
				.stat-label {
					color: #666;
				}
			}
		}
	}
</style> 