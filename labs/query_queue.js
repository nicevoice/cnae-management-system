var events = require("events"),
	util = require("util"),
	_slice = Array.prototype.slice;

var QueryQueue = function(size, unique){
	events.EventEmitter.call(this);
	if (size === undefined) {
		this.size = 4096;
	} else if (size <= 0) {
		this.size = -1;
	} else {
		this.size = parseInt(size, 10);
	}
	this.queue = [];
	this.map = {};
	this.unique = unique ? true : false;
	this.closed = false;
	this.destroyed = false;
	this.running = false;
	this.pausing = false;
};
util.inherits(QueryQueue, events.EventEmitter);
QueryQueue.prototype.fetch = function(){
	var self = this;
	process.nextTick(function(){
		self._fetch();
	});
};
QueryQueue.prototype.pause = function(){
	this.pausing = true;
	this.emit('pause');
};
QueryQueue.prototype.resume = function(){
	this.pausing = false;
	this.emit('resume');
	this.fetch();
};
QueryQueue.prototype._fetch = function(){
	if (this.pausing === true || this.running === true || this.queue.length === 0) {
		return;
	}
	this.running = true;
	var key = this.queue.shift();
	if (this.unique) {
		args = this.map[key];
		//console.log(args);
		delete this.map[key];
		var self = this;
		this.emit.call(this, 'fetch', args[0], args[1]);
	} else {
		this.emit.apply(this, ['fetch'].concat(key));
	}
};
QueryQueue.prototype.next = function(){
	this.running = false;
	if (this.queue.length === 0) {
		this.emit('drain');
	} else {
		this.fetch();
	}
};
QueryQueue.prototype.add = function(key) {
	if (this.closed) {
		this.emit.apply(this, ["error", new Error("Query queue is closed.")].concat(_slice.call(arguments, 0)));
		return;
	} else if (this.queue.length >= this.size) {
		this.emit.apply(this,  ["error", new Error("Query queue is out of space.")].concat(_slice.call(arguments, 0)));
		return;
	}

	if (this.unique) {
		var _key, args = arguments.length > 1 ? _slice.call(arguments, 1) : [];
		if (typeof key === 'object') {
			_key = JSON.stringify(key);
		} else {
			_key = key;
		}
		if (_key in this.map) {
			this.map[_key][1].push(args);
		} else {
			this.map[_key] = [key,[args]];
			this.queue.push(_key);
		}
	} else {
		this.queue.push(_slice.call(arguments, 0));
	}
	this.fetch();
	return this;
};

QueryQueue.prototype.close = function() {
	this.closed = true;
	this.emit('close');
};

QueryQueue.prototype.destory = function() {
	this.closed = true;
	this.destroyed = true;
	delete this.map;
	delete this.queue;
	this.map = {};
	this.queue = [];
	this.emit('destory');
};

exports.QueryQueue = QueryQueue;
exports.create = function(size, unique){
	return new QueryQueue(size, unique);
};
