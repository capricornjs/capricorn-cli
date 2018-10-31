const { log, renderAscii } = require('../core/util')
const { addModule } = require('../server/release')
const Spinner = require('../core/spinner')
const compose = require('koa-compose')
const path = require('path')
const fs = require('fs')

const releaseHandler = {
	init () {
		compose([
			this.getInfo.bind(this),
			this.getDeclare.bind(this),
			this.submit.bind(this)
		])()
	},
	
	moduleInfo: {
		name: '',
		description: '',
		packageName: '',
		configDeclare: ''
	},
	
	getInfo (ctx, next) {
		const packagePath = './package.json'
		fs.readFile(packagePath, { encoding: 'utf8' }, (err, data) => {
			if (err) throw err
			let packageObj = JSON.parse(data.toString())
			this.moduleInfo.name = path.basename('./')
			this.moduleInfo.description = packageObj.description
			this.moduleInfo.packageName = packageObj.name
			next()
		})
	},
	
	getDeclare (ctx, next) {
		const declarePath = './module.config.json'
		fs.readFile(declarePath, { encoding: 'utf8' }, (err, data) => {
			if (err) throw err
			this.moduleInfo.configDeclare = JSON.stringify(data)
			next()
		})
	},
	
	// 提交
	submit () {
		const spinner = new Spinner('提交module...')
		spinner.start()
		addModule(this.moduleInfo).then(() => {
			log.success('提交module成功.')
			renderAscii()
			spinner.stop()
		}).catch(e => {
			log.error(e)
			spinner.stop()
		})
	}
}

exports.handler = argvs => {
	releaseHandler.init(argvs)
}
