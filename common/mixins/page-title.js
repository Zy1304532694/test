import { getSystemSettings } from '@/common/utils/settings.js'

export default {
	onLoad() {
		uni.$on('settingsUpdated', this.updatePageTitle)
		this.updatePageTitle()
	},
	onUnload() {
		uni.$off('settingsUpdated', this.updatePageTitle)
	},
	methods: {
		async updatePageTitle() {
			const settings = await getSystemSettings()
			if (settings.site_name) {
				// 根据当前页面设置不同的标题
				const pages = getCurrentPages()
				const currentPage = pages[pages.length - 1].route
				
				let pageTitle = settings.site_name
				if (currentPage === 'pages/admin/login') {
					pageTitle += ' - 登录'
				} else if (currentPage === 'pages/admin/index') {
					pageTitle += ' - 后台管理'
				} else if (currentPage === 'pages/admin/user-form') {
					pageTitle += ' - 用户信息'
				}
				
				uni.setNavigationBarTitle({
					title: pageTitle
				})
			}
		}
	}
} 