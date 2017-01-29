var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');

var bodyParser = require('body-parser')

var index = require('./routes/index');
var users = require('./routes/users');

var router = express.Router();
var pg = require('pg');
const connectionString = process.env.DATABASE_URL || 'postgres://localhost:5432/postgres';

var app = express();

const Gfycat = require('gfycat-sdk');
 
var gfycat = new Gfycat({clientId: process.env.CLIENT_ID, clientSecret: process.env.CLIENT_SECRET});

gfycat.authenticate().then(res => {
  //Your app is now authenticated
  console.log(gfycat)
  console.log('token', gfycat.access_token, res.access_token);
});

app.use( bodyParser.json() );       // to support JSON-encoded bodies
app.use(bodyParser.urlencoded({     // to support URL-encoded bodies
  extended: true
}));

app.post('/api/v1/add', function(req, res) {
  const results = [];
  // Grab data from http request
  var data = {gifname: req.body.gifname, username: req.body.username, targeturl: req.body.targeturl};
  // Get a Postgres client from the connection pool
  pg.connect(connectionString, (err, client, done) => {
    // Handle connection errors
    if(err) {
      done();
      console.log(err);
      return res.status(500).json({success: false, data: err});
    }
    // SQL Query > Insert Data
    client.query('INSERT INTO posts(gifname, username, targeturl) values($1, $2, $3)',
    [data.gifname, data.username, data.targeturl]);
    // SQL Query > Select Data
    var query = client.query('SELECT * FROM posts ORDER BY id ASC');
    // Stream results back one row at a time
    query.on('row', (row) => {
      results.push(row);
    });
    // After all data is returned, close connection and return results
    query.on('end', () => {
      done();
      return res.json(results);
    });
  });
});

app.get('/api/v1/searchByUser', function(req, res) {
  const results = [];
  // Get Data from http request
  var data = {username: req.query.username}
  // Get a Postgres client from the connection pool
  pg.connect(connectionString, (err, client, done) => {
    // Handle connection errors
    if(err) {
      done();
      console.log(err);
      return res.status(500).json({success: false, data: err});
    }
    // SQL Query > Select Data
    const query = client.query('SELECT * FROM posts WHERE username = $1 ORDER BY id ASC;',[data.username]);
    // Stream results back one row at a time
    query.on('row', (row) => {
      console.log(row)
      var str = {gfyId:row.gifname}
      console.log(str) 
      results.push({gifname:str,targeturl:row.targeturl})
    });
    // After all data is returned, close connection and return results
    query.on('end', () => {
      done();
      return res.json(results);
    });
  });
});

app.get('/api/v1/searchForPost', function(req, res) {
  console.log("in method")
  const results = [];
  global_rows=[];
  // Get Data from http request
  var data = {gifname: req.query.gifname}
  console.log(data)
  // Get a Postgres client from the connection pool
  pg.connect(connectionString, (err, client, done) => {
    // Handle connection errors
    if(err) {
      done();
      console.log(err);
      return res.status(500).json({success: false, data: err});
    }
    // SQL Query > Select Data
    const query = client.query('SELECT * FROM posts WHERE gifname = $1;',[data.gifname]);
    // Stream results back one row at a time
    query.on('row', (row) => {
      console.log(row)
      var str = {gfyId:row.gifname}
      console.log(str)
      results.push({gifname: row.gifname,targeturl: row.targeturl})
    });
    query.on('end', () => {
       done();
       return res.json(results);
    });
  });
});

app.get('/test', function(req, res) {
	console.log('query', req.query)
	console.log('body', req.body)
	res.json(req.query || 'nothing')
});

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', index);
app.use('/users', users);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

app.listen(process.env.PORT || 8080);

module.exports = app;
