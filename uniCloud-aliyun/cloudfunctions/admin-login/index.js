'use strict';
const passwordUtil = require('uni-crypto')

exports.main = async (event, context) => {
	const { username, password } = event
	const db = uniCloud.database()
	
	try {
		// 查询用户
		const userResult = await db.collection('db-user')
			.where({
				username,
				password: passwordUtil.encrypt(password),
				status: 1,  // 状态正常
				role: 'admin'  // 必须是管理员角色
			})
			.field({
				_id: true,
				username: true,
				nickName: true,
				avatarUrl: true,
				role: true
			})
			.limit(1)
			.get()
			
		if (userResult.data.length > 0) {
			const userInfo = userResult.data[0]
			const timestamp = Date.now()
			const token = timestamp + '_' + Math.random().toString(36).substr(2)
			
			// 更新用户token和登录时间
			await db.collection('db-user').doc(userInfo._id).update({
				token: token,
				last_login_time: timestamp,
				token_expired: timestamp + (24 * 60 * 60 * 1000) // token 24小时后过期
			})
			
			return {
				code: 0,
				token,
				userInfo,
				msg: '登录成功'
			}
		}
		
		return {
			code: -1,
			msg: '用户名或密码错误'
		}
	} catch (e) {
		console.error(e)
		return {
			code: -2,
			msg: '登录失败'
		}
	}
} 