const { log, renderAscii } = require('../core/util')
const Inquire = require('inquirer')
const path = require('path')
const fs = require('fs')
const getGitUser = require('../core/git-user')
const Khaos = require('khaos-patched')
const Spinner = require('../core/spinner')
const download = require('download-git-repo')
const uid = require('uid')
const rm = require('rimraf').sync
const { capricornTemplateAddress, capricornModuleAddress } = require('../data/init')
const { getTemplateTypes, getModuleTypes } = require('../server/init')

const moduleHandler = {
	init () {
		this.getGitConfig().then(this.getInfo.bind(this))
	},
	
	moduleInfo: {},
	capricornTemplates: [],
	capricornModules: [],
	
	// 获取基础html模版和模块初始化模版列表
	getGitConfig () {
		const spinner = new Spinner('拉取模版列表...')
		spinner.start()
		return Promise.all([
			getModuleTypes(),
			getTemplateTypes()
		]).then(resList => {
			spinner.stop()
			resList[0].forEach(v => {
				if (v.name !== 'master') {
					this.capricornModules.push((v.name))
				}
			})
			resList[1].forEach(v => {
				if (v.name !== 'master') {
					this.capricornTemplates.push((v.name))
				}
			})
			return resList
		}).catch(e => {
			console.log(e)
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
			type: 'list',
			name: 'moduleType',
			message: '请选择你要生成的功能模块模板',
			choices: this.capricornModules
		})
		
		prompts.push({
			type: 'input',
			name: 'moduleName',
			message: '请输入新建功能模块的名称(格式：module-***)',
			validate (val) {
				if (val) {
					if (val.indexOf('module-') !== 0) {
						return '模块名称要以"module-"开头，请重新输入'
					}
					if (val.match(".*[A-Z]+.*")) {
						return '模块名称不能包含大写字母，请重新输入'
					}
					return true
				} else {
					return '模块名称不能为空，请输入模块名称！'
				}
			}
		})
		
		prompts.push({
			type: 'input',
			name: 'moduleDesc',
			message: '请输入新建模块的描述信息',
			validate (val) {
				if (val) {
					return true
				} else {
					return '功能模块的描述信息不能为空，请输入描述信息！'
				}
			}
		})
		
		Inquire.prompt(prompts).then(answers => {
			this.moduleInfo = Object.assign(this.moduleInfo, answers)
			this.ctrl()
		})
	},
	
	ctrl () {
		const { moduleType } = this.moduleInfo
		const tmp = './capricorn-module-' + uid()
		const spinner = new Spinner('正在初始化模块...')
		spinner.start()
		
		download(capricornModuleAddress + '#' + moduleType, tmp, function (err) {
			spinner.stop()
			if (err) {
				log.error(err)
			}
			this.generate(tmp)
		}.bind(this))
	},
	
	generate (tmp) {
		const { moduleName } = this.moduleInfo
		const khaos = new Khaos(tmp)
		khaos.schema(this.formatOptions())
		khaos.generate(`./${moduleName.trim()}`, (err) => {
			rm(tmp)
			if (err) {
				log.error(err)
				return
			}
			log.success('模块初始化成功！')
			this.downloadHtml()
		})
	},
	
	// 下载html模板
	downloadHtml () {
		const { moduleName, templateType } = this.moduleInfo
		const spinner = new Spinner('正在下载html模版...')
		spinner.start()
		download(capricornTemplateAddress + '#' + templateType, moduleName + '/template', function (err) {
			spinner.stop()
			if (err) {
				log.error(err)
				return
			}
			log.success('初始化完成！')
			renderAscii()
		}.bind(this))
	},
	
	formatOptions () {
		const keys = ['moduleName', 'moduleDesc', 'author', 'email']
		const options = {}
		
		keys.forEach(v => {
			options[v] = {
				type: 'string',
				default: this.moduleInfo[v]
			}
		})
		return options
	}
}

exports.handler = argvs => {
	moduleHandler.init(argvs)
}
