var express = require('express');
var app = express();
var path = require('path');

var sassMiddleware = require('node-sass-middleware');
var compressor = require('node-minify');
var config = require('./lib/config');
var morgan = require('morgan');
var ejs = require('ejs');
var routes = require('./controllers/routes');
var api = require('./controllers/API');


var bodyParser = require('body-parser');
var cookieParser = require('cookie-parser');
var session = require('cookie-session');

app.use(morgan('default'));

compressor.minify(config.scripts);
compressor.minify(config.vendors);

app.use(sassMiddleware({
    src: __dirname +'/assets/scss',
    dest: __dirname,
}));

app.use(bodyParser.json());
app.use(bodyParser.urlencoded());
app.use(session({
  secret: config.sessionSecret,
  resave: false,
  saveUninitialized: true,
  cookie: { secure: true },
}));
app.use(cookieParser());

app.use('/api', api);
app.use('/', routes);

app.set('view engine', 'ejs');

app.set('views', './views');

app.use('/public', express.static('public'));

app.listen(config.port, () => {
  console.log('Listening on port: ' + config.port);
});

var https = require('https');
var fs = require('fs');
var privateKey = fs.readFileSync(config.sslKey).toString();
var certificate = fs.readFileSync(config.sslCert).toString();
var credentials = { key: privateKey, cert: certificate };
var httpsServer = https.createServer(credentials, app);

httpsServer.listen(config.sslPort, function () {
  console.log('Listening on port: ', config.sslPort);
});
