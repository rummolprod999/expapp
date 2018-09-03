const createError = require('http-errors');
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
let fun = require('./fun_tools');
const indexRouter = require('./routes/index');
const usersRouter = require('./routes/users');
const tendersRouter = require('./routes/tenders');
const graphRouter = require('./routes/graph');

const app = express();
const hbs = require("hbs");
hbs.registerHelper('getTenCounts', fun.getTenCounts);
hbs.registerHelper('GetTenList', fun.GetTenList);
hbs.registerHelper('getFile', fun.getFile);
hbs.registerHelper('getGraph', fun.getGraph);
hbs.registerHelper('getGraphA', fun.getGraphA);
hbs.registerHelper('getDescription', fun.getDescription);
// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hbs');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/users', usersRouter);
app.use('/tenders', tendersRouter);
app.use('/graph', graphRouter);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
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
module.exports = app;
app.listen(3000);