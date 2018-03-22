var path = require('path'),
	fs = require('fs'),
	nconf = require('nconf'),
	morgan = require('morgan'),
	express = require('express'),
	async = require('async'),
	middleware = require('./middleware'),
	compression = require('compression'),
	winston = require('winston'),
	routes = require('./routes'),
	rfs = require('rotating-file-stream'),
	app = express(),
	server;
	require('winston-daily-rotate-file');

// Setup logger
/*app.use(morgan(':remote-addr - :remote-user [:date[clf]] ":method :url HTTP/:http-version" :status :res[content-length] :response-time ms'));
app.use(compression());*/

if (nconf.get('ssl')) {
	server = require('https').createServer({
		key: fs.readFileSync(nconf.get('ssl').key),
		cert: fs.readFileSync(nconf.get('ssl').cert)
	});
} else{
	server = require('http').createServer(app);
};

module.exports.server = server;


//If getting the same port available then exit starting
server.on('error', function (err) {
	if (err.code === 'EADDRINUSE'){
		winston.error('Traceroll address in use, exiting....');
		process.exit(0);
	} else{
		throw err;
	}
});

if (server.setTimeout){
	server.setTimeout(10000);
}



module.exports.listen = function () {
	middleware = middleware(app);
	log_configuration();
	listen();
	routes(app, middleware);
}

function listen(){
	var port = nconf.get('port');
	var args = [port];

	if (port !== 80 && port !== 443 && nconf.get('use_port') === false) {
		winston.info('Enabling trust proxy');
		app.enable('trust proxy');
	};

	args.push(function(err) {
		if (err) {
			winston.info('[startup] Server was unable to listen on: ' + port);
			process.exit();
		}

		winston.info('Server is now listening on: ' + port);

		
	});

	server.listen.apply(server, args);
}


function log_configuration(){
	// Setup logger
	var logDirectory = path.join(__dirname, 'log');
	var logFileName = path.join(logDirectory, '/log');
	// ensure log directory exists
	fs.existsSync(logDirectory) || fs.mkdirSync(logDirectory);

	// create a rotating write stream
	var accessLogStream = rfs('access.log', {
	  interval: '1d', // rotate daily
	  path: logDirectory
	});

	app.use(morgan(':remote-addr - :remote-user [:date[web]] ":method :url HTTP/:http-version" :status :res[content-length] :response-time ms',{stream: accessLogStream}));
	app.use(compression());


	
	var transport = new (winston.transports.DailyRotateFile)({
	    filename: logFileName,
	    datePattern: 'yyyy-MM-dd.',
	    prepend: true,
	    //level: process.env.ENV == 'development' ? 'debug' : 'info'
	    level: nconf.get('log_level') === 'info' ? 'info' : 'debug'
	  });
	var logger = new (winston.Logger)({
	    transports: [
	      transport
	    ]
	  });
	logger.debug('Hello World debug!');
	winston.dct_logger = logger;

	

}
