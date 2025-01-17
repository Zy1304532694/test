'use strict';
const db = uniCloud.database()
const dbCmd = db.command

exports.main = async (event, context) => {
	const {
		action,
		data,
		token,
		page = 1,
		pageSize = 10,
		keyword = '',
		id
	} = event
	
	const collection = db.collection('db-app')
	
	// 验证管理员权限
	const userInfo = await db.collection('db-user').where({
		token: token,
		role: 'admin',
		status: 1
	}).limit(1).get()
	
	if (!userInfo.data.length) {
		return {
			code: 403,
			msg: '无权限操作'
		}
	}
	
	switch (action) {
		case 'list':
			// 构建查询条件
			const where = {
				deleted: dbCmd.neq(1) // 未删除的记录
			}
			if (keyword) {
				where.$or = [{
					app_name: {
						$regex: keyword,
						$options: 'i'
					}
				}, {
					code: {
						$regex: keyword,
						$options: 'i'
					}
				}]
			}
			
			// 获取总数
			const countResult = await collection.where(where).count()
			
			// 查询数据
			const result = await collection.where(where)
				.skip((page - 1) * pageSize)
				.limit(pageSize)
				.orderBy('create_time', 'desc')
				.get()
			
			return {
				code: 0,
				data: result.data,
				total: countResult.total
			}
			
		case 'add':
			// 检查编号是否已存在
			const existApp = await collection.where({
				code: data.code,
				deleted: dbCmd.neq(1)
			}).get()
			
			if (existApp.data.length > 0) {
				return {
					code: -1,
					msg: '应用编号已存在'
				}
			}
			
			// 添加应用
			const addResult = await collection.add({
				...data,
				create_time: Date.now(),
				deleted: 0
			})
			
			return {
				code: 0,
				msg: '添加成功',
				data: addResult
			}
			
		case 'update':
			const updateResult = await collection.doc(data._id).update({
				app_name: data.app_name,
				appid: data.appid,
				secret: data.secret,
				interstitialId: data.interstitialId,
				rewardedVideoId: data.rewardedVideoId,
				app_status: data.app_status,
				ad_status: data.ad_status
			})
			
			return {
				code: 0,
				msg: '更新成功',
				data: updateResult
			}
			
		case 'updateStatus':
			const statusResult = await collection.doc(id).update({
				app_status: event.app_status
			})
			
			return {
				code: 0,
				msg: '操作成功',
				data: statusResult
			}
			
		case 'delete':
			// 使用逻辑删除
			const deleteResult = await collection.doc(id).update({
				deleted: 1
			})
			
			return {
				code: 0,
				msg: '删除成功',
				data: deleteResult
			}
			
		case 'updateAdStatus':
			const adStatusResult = await collection.doc(id).update({
				ad_status: event.ad_status,
				update_time: Date.now(),
				update_by: userInfo.data[0]._id
			})
			
			return {
				code: 0,
				msg: '操作成功',
				data: adStatusResult
			}
			
		default:
			return {
				code: -1,
				msg: '未知操作'
			}
	}
} 