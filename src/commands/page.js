const { log, renderAscii } = require('../core/util')
const Inquire = require('inquirer')
const path = require('path')
const fs = require('fs')
const getGitUser = require('../core/git-user')
const Spinner = require('../core/spinner')
const download = require('download-git-repo')
const uid = require('uid')
const exec = require('child_process').execSync
const { capricornTemplateAddress } = require('../data/init')
const { getTemplateTypes } = require('../server/init')

const page = {
	init () {
		this.getGitConfig().then(this.getInfo.bind(this))
	},
	
	htmlInfo: {},
	projectName: `capricorn-${uid()}`,
	moduleList: [],
	capricornTemplates: [],
	
	// 获取基础html模版和模块初始化模版列表
	getGitConfig () {
		const spinner = new Spinner('拉取html模版列表...')
		spinner.start()
		return getTemplateTypes().then(res => {
			spinner.stop()
			res.forEach(v => {
				if (v.name !== 'master') {
					this.capricornTemplates.push((v.name))
				}
			})
			return res
		}).catch(e => {
			log.error(e)
			spinner.stop()
		})
	},
	
	getInfo () {
		this.moduleInfo = Object.assign({}, this.moduleInfo, getGitUser())
		let prompts = []
		
		prompts.push({
			type: 'list',
			name: 'templateType',
			message: '请选择你要使用的基础html模版',
			choices: this.capricornTemplates
		})
		
		prompts.push({
			type: 'input',
			name: 'modules',
			message: '请输入要使用的功能模块(格式：module-a|module-b|module-c)',
			validate (val) {
				if (val) {
					return true
				} else {
					return '功能模块不能为空，请输入功能模块！'
				}
			}
		})
		
		prompts.push({
			type: 'input',
			name: 'title',
			message: '请输入页面title',
			validate (val) {
				if (val) {
					return true
				} else {
					return '页面title不能为空，请输入页面title！'
				}
			}
		})
		
		prompts.push({
			type: 'input',
			name: 'description',
			message: '请输入页面的描述信息',
			validate (val) {
				if (val) {
					return true
				} else {
					return '页面的描述信息不能为空，请输入描述信息！'
				}
			}
		})
		
		Inquire.prompt(prompts).then(answers => {
			this.htmlInfo = Object.assign(this.htmlInfo, answers)
			this.moduleList = this.htmlInfo.modules.split('|')
			this.downloadHtml()
		})
	},
	
	downloadHtml () {
		const { templateType } = this.htmlInfo
		const spinner = new Spinner('正在初始化页面...')
		spinner.start()
		
		download(`${capricornTemplateAddress}#${templateType}`, `./${this.projectName}`, function (err) {
			spinner.stop()
			if (err) {
				log.error(err)
			}
			log.success(`${this.projectName} 项目初始化成功!`)
			this.updatePackage()
			this.updateHtml()
		}.bind(this))
	},
	
	// 更新package.json的依赖
	updatePackage () {
		const packagePath = `./${this.projectName}/package.json`
		fs.readFile(packagePath, { encoding: 'utf8' }, (err, data) => {
			if (err) throw err
			let packageObj = JSON.parse(data.toString())
			const { description } = this.htmlInfo
			packageObj.name = this.projectName
			packageObj.description = description
			
			this.moduleList.forEach(v => {
				const module = v.split('@')
				if (module.length === 1) {
					// 安装最新版本
					packageObj.dependencies[`@capricorn/${module[0]}`] = 'latest'
				} else if (module.length === 2) {
					// 带版本的
					packageObj.dependencies[`@capricorn/${module[0]}`] = module[1]
				}
			})
			fs.writeFile(packagePath, JSON.stringify(packageObj, null, 4), 'utf8', (err) => {
				if (err) throw err
				log.success('package.json更新成功！')
			})
		})
	},
	
	// 更新index.html
	updateHtml () {
		const htmlPath = `./${this.projectName}/index.html`
		fs.readFile(htmlPath, { encoding: 'utf8' }, (err, data) => {
			if (err) throw err
			let htmlString = data.toString()
			let scriptString = ''
			let styleString = ''
			this.moduleList.forEach(v => {
				const module = v.split('@')
				scriptString += `<script src="./node_modules/@capricorn/${module[0]}/assets/app.js"></script>
`
				styleString += `<link rel="stylesheet" href="./node_modules/@capricorn/${module[0]}/assets/app.css">
`
			})
			scriptString += '</body>'
			styleString += '</head>'
			htmlString = htmlString.replace('</body>', scriptString)
			htmlString = htmlString.replace('</head>', styleString)
			htmlString = htmlString.replace('<title>capricorn</title>', `<title>${this.htmlInfo.title}</title>`)
			fs.writeFile(htmlPath, htmlString, 'utf8', (err) => {
				if (err) throw err
				log.success('index.html更新成功！')
			})
		})
	}
}

exports.handler = () => {
	page.init()
}
