const { log, renderAscii } = require('../core/util')
const { addModule } = require('../server/release')
const Spinner = require('../core/spinner')
const path = require('path')
const fs = require('fs')

const releaseHandler = {
	init () {
		this.getInfo()
	},
	
	moduleInfo: {
		name: '',
		description: '',
		packageName: '',
		configDeclare: ''
	},
	
	getInfo () {
		const packagePath = './package.json'
		fs.readFile(packagePath, { encoding: 'utf8' }, (err, data) => {
			if (err) throw err
			let packageObj = JSON.parse(data.toString())
			this.moduleInfo.name = __filename
			this.moduleInfo.description = packageObj.description
			this.moduleInfo.packageName = packageObj.name
			console.log(this.moduleInfo)
		})
	},
	
	// 提交
	submit () {
		const spinner = new Spinner('提交module...')
		spinner.start()
		addModule().then(() => {
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
