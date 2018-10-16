#!/usr/bin/env node

const program = require('@monajs/commander')
const init = require('../src/commands/init.js')

const cmds = [{
	command: 'init',
	module: init,
	desc: '创建一个新的功能模版'
}]

program({
	version: require('../package.json').version,
	desc: '欢迎使用 capricorn-cli',
	cmds
})
