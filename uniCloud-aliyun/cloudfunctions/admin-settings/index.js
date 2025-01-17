'use strict';
const db = uniCloud.database()

exports.main = async (event, context) => {
	const {
		action,
		data,
		token
	} = event
	
	const collection = db.collection('system-settings')
	
	// 验证管理员权限
	const userInfo = await db.collection('db-user').where({
		token: token,
		role: 'admin',
		status: 1
	}).limit(1).get()
	console.log("权限：",userInfo);
	if (!userInfo.data.length) {
		return {
			code: 403,
			msg: '无权限操作'
		}
	}
	
	switch (action) {
		case 'get':
			const getResult = await collection.limit(1).get()
			return {
				code: 0,
				data: getResult.data[0] || {}
			}
			
		case 'save':
			let saveResult
			const settings = await collection.limit(1).get()
			
			// 从提交数据中移除 _id 字段
			const { _id, ...submitData } = data
			
			// 处理 site_logo 字段
			let processedData = { ...submitData }
			if (!submitData.site_logo) {
				processedData.site_logo = ''
			}
			
			// 添加更新时间和操作人信息
			const updateData = {
				...processedData,
				update_time: Date.now(),
				update_by: userInfo.data[0]._id
			}
			
			if (settings.data.length > 0) {
				saveResult = await collection.doc(settings.data[0]._id).update(updateData)
			} else {
				saveResult = await collection.add(updateData)
			}
			
			return {
				code: 0,
				msg: '保存成功',
				data: saveResult
			}
			
		default:
			return {
				code: -1,
				msg: '未知操作'
			}
	}
} 