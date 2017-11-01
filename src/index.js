import dgram from 'dgram'
import util from 'util'
import os from 'os'
import winston from 'winston'
import common from 'winston/lib/winston/common'

const UDPTransport = exports.UDPTransport = function(options) {
    winston.Transport.call(this, options);
    options = options || {};

    this.name = 'UDPTransport';
    this.level = options.level || 'info';
    this.serverName = options.node_name || os.hostname();
    this.host = options.host || (options.udpType === 'udp6' ? '::1' : '127.0.0.1');
    this.port = options.port || 9999;
    this.application = options.appName || process.title;
    this.pid = options.pid || process.pid;
    this.trailingLineFeed = options.trailingLineFeed === true;
    this.trailingLineFeedChar = options.trailingLineFeedChar || os.EOL;
    this.udpType = options.udpType === 'udp6' ? 'udp6' : 'udp4';

    this.client = null;

    this.connect();
};

util.inherits(UDPTransport, winston.Transport);

winston.transports.UDPTransport = UDPTransport;

UDPTransport.prototype.connect = function() {
    this.client = dgram.createSocket(this.udpType);

    if (this.client.unref) {
        this.client.unref();
    }
};

UDPTransport.prototype.log = function(level, msg, meta, callback) {
    const self = this;
    let logEntry;

    meta = winston.clone(meta || {});

    callback = (callback || function () {});

    if (self.silent) {
        return callback(null, true);
    }

    meta.pid = self.pid;
    logEntry = common.log({
        level: level,
        message: msg,
        meta: {
            process: meta.process,
            application: self.application,
            serverName: self.serverName,
            stack: meta.stack
        },
        timestamp: new Date(),
        json: true
    });
    logEntry = JSON.stringify(JSON.parse(logEntry), null, '\t');

    self.sendLog(logEntry, function (err) {
        self.emit('logged', !err);

        callback(err, !err);
    });
};

UDPTransport.prototype.sendLog = function(message, callback) {
    const self = this;
    if (this.trailingLineFeed === true) {
        message = message.replace(/\s+$/, '') + this.trailingLineFeedChar;
    }
    const buf = new Buffer(message);
    callback = (callback || function () {});
    self.client.send(buf, 0, buf.length, self.port, self.host, callback);
};
