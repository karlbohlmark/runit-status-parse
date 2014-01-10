var assert = require('assert');
var path = require('path');

module.exports = Parser

function Parser (buffer) {
	this.buffer = buffer.split('');
}

Parser.prototype.expect = function (literal) {
	var head = this.buffer.splice(0, literal.length);
	assert(head.join('') == literal)
}

Parser.prototype.parse = function () {
	var services = []
	while (this.buffer.length) {
		var serviceStatus = this.readServiceStatus()

		this.skip(';')
		this.skip(' ')
		this.skip('\n')

		services.push(serviceStatus);
	}
	return services;
}

Parser.prototype.readServiceStatus = function () {
	this.expect('run:')
	this.skip(' ')
	var serviceName = this.readStringUntil(':')
	this.expect(' (pid ')
	var pid = this.readInt()
	this.expect(') ')
	var seconds = this.readInt()
	this.expect('s')
	return {
		name: serviceName.split('/').pop(),
		pid: pid,
		seconds: seconds
	}
}

Parser.prototype.readStringUntil = function (char) {
	var sub = [], next = ''
	while (this.buffer.length && 
		(next = this.buffer.shift())
			!== char) {
		sub.push(next);
	}
	return sub.join('');
}

Parser.prototype.readInt = function () {
	var sub = [], next;
	while (this.buffer.length && 
		(next = parseInt(this.buffer[0]))) {
		sub.push(this.buffer.shift());
	}
	return sub.join('');
}

Parser.prototype.skip = function (char) {
	var next
	while ((next = this.buffer[0]) === char) {
		this.buffer.shift()
	}
}

if (!module.parent) {
	var status = '';
	process.stdin.on('data', function (d) {
		status += d;
	})

	process.stdin.on('end', function() {
		var parser = new Parser(status)
		var result = parser.parse();

		console.log(result)
		process.exit();
	})

	process.stdin.resume();
}