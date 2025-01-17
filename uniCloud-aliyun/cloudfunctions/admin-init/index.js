'use strict';
const db = uniCloud.database()
const passwordUtil = require('uni-crypto')

// 初始管理员账号信息
const adminUser = {
	username: 'admin',
	password: 'admin123', // 初始密码
	nickName: '系统管理员',
	role: 'admin',
	status: 1,
	mobile: '',  // 根据需要设置
	email: '',   // 根据需要设置
	remark: '系统初始管理员账号'
}

exports.main = async (event, context) => {
	try {
		// 检查是否已存在管理员账号
		const existAdmin = await db.collection('db-user')
			.where({
				role: 'admin'
			})
			.limit(1)
			.get()
			
		if (existAdmin.data.length > 0) {
			return {
				code: -1,
				msg: '管理员账号已存在'
			}
		}
		
		// 创建管理员账号
		const result = await db.collection('db-user').add({
			...adminUser,
			password: passwordUtil.encrypt(adminUser.password), // 加密密码
			create_time: Date.now(),
			last_login_time: Date.now()
		})
		
		return {
			code: 0,
			msg: '管理员账号创建成功',
			data: {
				username: adminUser.username,
				password: adminUser.password // 返回初始密码
			}
		}
		
	} catch (e) {
		console.error(e)
		return {
			code: -2,
			msg: '创建管理员账号失败'
		}
	}
} 