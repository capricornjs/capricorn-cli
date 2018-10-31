const fetch = require('node-fetch')

const addModule = (body) => {
	const api = 'http://localhost:3000/module/add'

	return fetch(api, {
		method: 'POST',
		body: JSON.stringify(body),
		headers: { 'Content-Type': 'application/json' }
	}).then(response => {
		const { status } = response
		return status !== 200 ? Promise.reject(new Error('同步module失败')) : response.json()
	})
}

module.exports = {
	addModule
}
