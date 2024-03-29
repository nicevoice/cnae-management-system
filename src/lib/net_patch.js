/**
 * Module dependencies.
 *
 */

var net = require('net')
  , path = require('path')
  , util = require('util')
  , config = require('../config');

//hack remoteAddress and remotePort for NAE proxy
var Socket = net.Socket;
Socket.prototype.__defineSetter__('remoteAddress', function(address) {
    this._nae_address = address;
});
Socket.prototype.__defineGetter__('remoteAddress', function() {
    return this._nae_address || this._getpeername().address;
});

Socket.prototype.__defineSetter__('remotePort', function(port) {
    this._nae_port = port;
});
Socket.prototype.__defineGetter__('remotePort', function() {
    return this._nae_port || this._getpeername().port;
});

var Server = net.Server;

var __listen_ports = {};
var __listen = Server.prototype.listen;

function proxy_command(args, callback) {
    var client  = net.createConnection(config.proxy_sock);
    client.on('data', function(data) {
        // data: status_code [message_length]\r\n[message]\r\n
        var lines = data.toString().split('\r\n');
        var status = lines[0].split(' ')[0];
        callback(null, status, lines[1]);
    });
    client.on('error', callback);
    client.write(args.join(' '));
    client.end();
};

function proxy_register(app, port, sock, callback) {
    console.log('proxy_register', app, port, sock);
    proxy_command(['REGISTER', app, port, sock], callback);
};

function proxy_unregister(app, port, callback) {
    console.log('proxy_unregister', app, port);
    proxy_command(['UNREGISTER', app, port], callback);
};

/**
 * wrap net listen, change to listen local unix sock.
 *
 * @param {Number|String} port or unix sock path
 * @param {Function} optional, listening callback
 * @api public
 */
Server.prototype.listen = function() {
    var port = arguments[0], sock = null;
    if(arguments.length === 0 || typeof port === 'function') {
        port = config.port;
    }
    if(typeof port !== 'number') {
        // listen to unix sock, port is a path
        // sock: /xxx/basedir/sockpath
        // sock = require.resolve(port);
        throw new Error('Unsupport unix sock, please use port to listen.');
    }

    // only allow to listen 10 port in one app
    if(Object.keys(__listen_ports).length > 10) {
        throw new Error('Open too many(' + __listen_count + ') Server.');
    } else if(__listen_ports[port]) {
        throw new Error('EADDRINUSE, Address already in use');
    // port deny check
    }

    this._fake_port = port;

    // sock: /xxx/appname/port.sock
    var app = config.domain, self = this;
    sock = path.join(config.listen_sock_dir, app + '.' + port + '.sock');
    __listen_ports[port] = sock;

    var args = [sock];
    var last_arg = arguments[arguments.length - 1];
    if(typeof last_arg === 'function') {
        args.push(last_arg);
    }
    __listen.apply(this, args);
    this.on('connection', function(s) {
        // hack socket for get the real client address and port
        // ADDR\tip:port\nREALDATAS
        var ondata = s.ondata, buffer_data = null;
        s.ondata = function(buffer, start, end) {
            var data = buffer.slice(start, end);
            if(!buffer_data) {
                buffer_data = data;
            } else {
                var b = new Buffer(buffer_data.length + data.length);
                buffer_data.copy(b);
                data.copy(b, buffer_data.length);
                buffer_data = b;
            }
            var key = buffer_data.toString('ascii', 0, 5).toString(), start = 0;
            if(key === 'ADDR\t') {
                for(var i = 5, l = buffer_data.length; i < l; i++) {
                    if(data[i] === 0x0a) { // \n
                        start = i + 1;
                        var ip_port = buffer_data.toString('ascii', 5, i).split('\t');
                        s.remoteAddress = ip_port[0];
                        s.remotePort = parseInt(ip_port[1]);
                        break;
                    }
                }
            }
            if(s.remoteAddress) {
                s.ondata = ondata;
//                console.log(buffer_data.toString(), start, buffer_data.length)
                if(start < buffer_data.length) {
//                    console.log('ondata', start, buffer_data.length)
                    s.ondata(buffer_data, start, buffer_data.length);
                }
            }
        };
    });


    // tell proxy I want to listen (port => sock)
    proxy_register(app, port, sock, function(error) {
        if(error) {
            throw error;
        }
    });
    
    // bind www.domain => domain
    if(app.indexOf('www.') !== 0) {
        proxy_register('www.' + app, port, sock, function(error) {
            if(error) {
                throw error;
            }
        });
    }
};

Server.prototype.__listen = __listen;  //保留http listen
var __address = Server.prototype.address;
Server.prototype.address = function() {
    if(this.fd === null) {
        throw new TypeError('Bad file descriptor argument');
    }
    if(this._fake_port) {
        return {address: "0.0.0.0", port: this._fake_port};
    } else {
        return __address.call(this);
    }
};
