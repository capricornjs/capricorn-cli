#!/usr/bin/env node

const program = require('@monajs/commander')

const cmds = [{
	command: 'module',
	module: require('../src/commands/module.js'),
	desc: '创建一个新的功能模版'
}, {
	command: 'page',
	module: require('../src/commands/page.js'),
	desc: '创建一个页面'
}, {
	command: 'release',
	module: require('../src/commands/release.js'),
	desc: '提交module'
}]

program({
	version: require('../package.json').version,
	desc: '欢迎使用 capricorn-cli',
	cmds
})
