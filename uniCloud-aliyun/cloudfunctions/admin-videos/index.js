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
	
	const collection = db.collection('db-video')
	
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
			const where = {
				deleted: dbCmd.neq(1)
			}
			if (keyword) {
				where.$or = [{
					title: {
						$regex: keyword,
						$options: 'i'
					}
				}, {
					description: {
						$regex: keyword,
						$options: 'i'
					}
				}]
			}
			
			const countResult = await collection.where(where).count()
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
			const addResult = await collection.add({
				...data,
				thumbnail_url: data.thumbnail_url || '',
				view_count: 0,
				like_count: 0,
				download_count: 0,
				user_id: userInfo.data[0]._id,
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
				title: data.title,
				description: data.description,
				thumbnail_url: data.thumbnail_url || '',
				video_url: data.video_url,
				tags: data.tags
			})
			
			return {
				code: 0,
				msg: '更新成功',
				data: updateResult
			}
			
		case 'delete':
			const deleteResult = await collection.doc(id).update({
				deleted: 1
			})
			
			return {
				code: 0,
				msg: '删除成功',
				data: deleteResult
			}
			
		default:
			return {
				code: -1,
				msg: '未知操作'
			}
	}
} 