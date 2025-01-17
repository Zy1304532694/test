'use strict';
const db = uniCloud.database()
const dbCmd = db.command
const {
	close
} = require('inspector');
const passwordUtil = require('uni-crypto')

const dbjql = uniCloud.databaseForJQL()
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
	console.log("搜索：", keyword);
	const collection = db.collection('db-user')

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
				role: 'user' // 只查询普通用户
			}
			if (keyword) {
				where.$or = [{
					username: {
						$regex: keyword,
						$options: 'i'
					}
				}, {
					nickName: {
						$regex: keyword,
						$options: 'i'
					}
				}]
			}

			console.log('查询条件：', where)

			// 获取总数
			const countResult = await collection.where(where).count()

			// 使用getTemp先过滤处理获取临时表再联表查询，推荐用法
			const app = dbjql.collection('db-app').field('appid,app_name')
			.getTemp() // 注意结尾的方法是getTemp，对app表过滤得到临时表
			const user = dbjql.collection('db-user').getTemp() // 临时表field方法内需要包含关联字段，否则无法建立关联关系
			const result = await dbjql.collection(user, app).where(where)
				.field({
					password: 0, // 不返回密码字段
					token: 0 // 不返回token字段
				})
				.orderBy('create_time', 'desc')
				.skip((page - 1) * pageSize)
				.limit(pageSize)
				.get()

			return {
				code: 0,
					data: result.data,
					total: countResult.total
			}

		case 'add':
			// 检查用户名是否已存在
			const existUser = await collection.where({
				username: data.username
			}).get()

			if (existUser.data.length > 0) {
				return {
					code: -1,
					msg: '用户名已存在'
				}
			}

			// 添加用户
			const addResult = await collection.add({
				...data,
				password: passwordUtil.encrypt(data.password),
				status: 1,
				create_time: Date.now(),
				create_by: userInfo.data[0]._id
			})

			return {
				code: 0,
					msg: '添加成功',
					data: addResult
			}

		case 'update':
			const updateData = {
				nickName: data.nickName,
				role: data.role,
				update_time: Date.now(),
				update_by: userInfo.data[0]._id
			}

			// 如果提供了新密码，则更新密码
			if (data.password) {
				updateData.password = passwordUtil.encrypt(data.password)
			}

			const updateResult = await collection.doc(data._id).update(updateData)

			return {
				code: 0,
					msg: '更新成功',
					data: updateResult
			}

		case 'updateStatus':
			// 不允许禁用自己
			if (id === userInfo.data[0]._id) {
				return {
					code: -1,
					msg: '不能修改自己的状态'
				}
			}

			const statusResult = await collection.doc(id).update({
				status: event.status,
				update_time: Date.now(),
				update_by: userInfo.data[0]._id
			})

			return {
				code: 0,
					msg: '操作成功',
					data: statusResult
			}

		case 'delete':
			// 检查是否为管理员
			const checkAdmin = await collection.doc(id).get()
			if (checkAdmin.data[0].role === 'admin') {
				return {
					code: -1,
					msg: '不能删除管理员账号'
				}
			}

			const deleteResult = await collection.doc(id).remove()

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