const fetch = require('node-fetch')
const { capricornTemplateAddress, capricornModuleAddress } = require('../data/init')

const getTemplateTypes = () => {
	const api = 'https://api.github.com/repos/' + capricornTemplateAddress + '/branches'
	return fetch(api, { method: 'GET' }).then(response => {
		const { status } = response
		return status !== 200 ? Promise.reject(new Error('获取html模版列表失败.')) : response.json()
	})
}

const getModuleTypes = () => {
	const api = 'https://api.github.com/repos/' + capricornModuleAddress + '/branches'
	return fetch(api, { method: 'GET' }).then(response => {
		const { status } = response
		return status !== 200 ? Promise.reject(new Error('获取功能模版列表失败.')) : response.json()
	})
}

module.exports = {
	getTemplateTypes,
	getModuleTypes
}
