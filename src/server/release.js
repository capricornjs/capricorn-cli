const fetch = require('node-fetch')

const addModule = () => {
	const api = 'http://devm.meitun.com:3000/module/list'
	return fetch(api, { method: 'GET' }).then(response => {
		const { status } = response
		return status !== 200 ? Promise.reject(new Error('同步module失败')) : response.json()
	})
}

module.exports = {
	addModule
}
