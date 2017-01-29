var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');

var index = require('./routes/index');
var users = require('./routes/users');

var router = express.Router();
var pg = require('pg');
const connectionString = process.env.DATABASE_URL || 'postgres://localhost:5432/postgres';

var app = express();

router.post('/api/v1/add', (req, res, next) => {
  console.warn("in post add")
  const results = [];
  // Grab data from http request
  var data = {gifname: req.body.gifname, username: req.body.username, targerurl: req.body.targeturl};
  console.warn(data)
  // Get a Postgres client from the connection pool
  pg.connect(connectionString, (err, client, done) => {
    // Handle connection errors
    if(err) {
      done();
      console.log(err);
      return res.status(500).json({success: false, data: err});
    }
    console.warn("got connection")
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
