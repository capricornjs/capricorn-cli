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
const { capricornModules, capricornTemplates } = require('../data/init')

const initProject = {
	init (argvs) {
		const { _ } = argvs
		this.getInfo()
	},
	
	moduleInfo: {},
	
	getInfo () {
		this.moduleInfo = Object.assign({}, this.moduleInfo, getGitUser())
		let prompts = []
		
		const templateChoice = Object.keys(capricornTemplates)
		prompts.push({
			type: 'list',
			name: 'templateType',
			message: '请选择你要使用的基础html模版',
			choices: templateChoice
		})
		
		const moduleChoices = Object.keys(capricornModules)
		prompts.push({
			type: 'list',
			name: 'moduleType',
			message: '请选择你要生成的功能模块模板',
			choices: moduleChoices
		})
		
		prompts.push({
			type: 'input',
			name: 'moduleName',
			message: '请输入新建功能模块的名称(格式：module-***)',
			validate (val) {
				if (val) {
					if (val.indexOf('module-') !== 0) {
						return '模块名称格式有误，请重新输入'
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
		
		download(capricornModules[moduleType], tmp, function (err) {
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
		download(capricornTemplates[templateType], moduleName + '/template', function (err) {
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
	initProject.init(argvs)
}
