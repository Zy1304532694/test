export const getSystemSettings = async () => {
	try {
		const res = await uniCloud.callFunction({
			name: 'admin-settings',
			data: {
				action: 'get',
				token: uni.getStorageSync('token')
			}
		})
		if (res.result.code === 0) {
			return res.result.data || {}
		}
		return {}
	} catch (e) {
		console.error('获取系统设置失败：', e)
		return {}
	}
} 