'use strict';
// Generated on 2014-02-22 using generator-browserify 0.2.2

var gulp = require('gulp');
var bower = 'app/bower_components';
var fs = require('fs');
var replace = require('gulp-replace');
var connect = require('gulp-connect-multi');

var appServer = connect(),
    webServer = connect();

// Load plugins
var $ = require('gulp-load-plugins')();

/////////////////////////////////////////////
// App
/////////////////////////////////////////////

var rootFolder = 'phonegap/www';

// Styles
gulp.task('styles', function () {
  return gulp.src('app/less/app.less')
    // Leaving out recess support due to string interpolation missing in less v1.3 (which recess is dependent on)
    // .pipe($.recess())  
    .pipe($.less({
      style: 'expanded',
      loadPath: ['app/bower_components']
    }))
    .pipe($.autoprefixer('last 1 version'))
    .pipe($.csso())
    .pipe(gulp.dest(rootFolder + '/styles'))
    .pipe($.size())
    .pipe(appServer.reload())
});

// Vendor
gulp.task('vendor', function () {
  return gulp.src([
    'app/scripts/vendor/jquery-1.11.0.min.js',
    'app/scripts/vendor/parse.min.js',
    'app/scripts/vendor/underscore-min.js',
    'app/scripts/vendor/hammer.min.js',
    'app/scripts/vendor/knockout-3.0.0.js',
    'app/scripts/vendor/knockouch.min.js',
    'app/scripts/vendor/moment.min.js'
    ])
    .pipe($.concat('vendor.js'))
    .pipe($.uglify())
    .pipe(gulp.dest(rootFolder + '/scripts'))
    .pipe($.size());
});

// Scripts
gulp.task('scripts', function () {
  return gulp.src('app/scripts/main.js')
    .pipe($.browserify({
      debug: true,
      transform: [
        'debowerify'
      ],
      // Note: At this time it seems that you will also have to 
      // setup browserify-shims in package.json to correctly handle
      // the exclusion of vendor vendor libraries from your bundle
      external: ['lodash'],
      extensions: ['.js']
    }))
    // .pipe($.uglify())
    .pipe(gulp.dest(rootFolder + '/scripts'))
    .pipe($.size())
    .pipe(appServer.reload())
});

// HTML
gulp.task('html', ['templates'], function () {
  return gulp.src('app/index.html')
    .pipe(replace('<!-- html templates -->', fs.readFileSync(rootFolder + '/templates.html', 'utf8')))
    .pipe(gulp.dest(rootFolder))
    .pipe($.size())
    .pipe(appServer.reload())
});

// HTML Templates
gulp.task('templates', function () {
  return gulp.src('app/templates/*.html')
    .pipe($.concat('templates.html'))
    .pipe(gulp.dest(rootFolder))
});

// SVG
gulp.task('svg', function () {
  return gulp.src([
    'app/svg/*.svg',
    'app/svg/*.svgz'
    ])
    .pipe(gulp.dest(rootFolder + '/svg'))
});

// SVG
gulp.task('video', function () {
  return gulp.src([
    'app/video/*.mp4',
    'app/svg/*.ogv',
    'app/svg/*.webm'
    ])
    .pipe(gulp.dest(rootFolder + '/video'))
});

// Lint
gulp.task('lint', function () {
  return gulp.src('app/scripts/**/*.js')
    .pipe($.jshint('.jshintrc'))
    .pipe($.jshint.reporter(require('jshint-stylish')))
});

// Images
gulp.task('images', function () {
  return gulp.src('app/images/**/*')
    .pipe($.cache($.imagemin({
      optimizationLevel: 3,
      progressive: true,
      interlaced: true
    })))
    .pipe(gulp.dest(rootFolder + '/images'))
    .pipe($.size());
});

// Clean
gulp.task('clean', function () {
    return gulp.src([rootFolder + '/styles', rootFolder + '/scripts', rootFolder + '/images', rootFolder + '/svg'], {read: false}).pipe($.clean());
});

// Dev Server
gulp.task('dev', ['html', 'styles', 'scripts', 'vendor', 'images', 'connect', 'watch', 'svg', 'video']);

// Connect
gulp.task('connect', appServer.server({
  root: [__dirname + '/phonegap/www'],
  port: 9000,
  livereload: {
    port: 35729
  },
  open: {
    browser: 'Google Chrome' // if not working OS X browser: 'Google Chrome'
  }
}));

// Watch
gulp.task('watch', ['connect'], function () {
    gulp.watch('app/less/**/*.less', ['styles']);
    gulp.watch('app/scripts/**/*.js', ['scripts']);
    gulp.watch('app/images/**/*', ['images']);
    gulp.watch('app/templates/**/*.html', ['html']);
    gulp.watch('app/svg/*', ['svg']);
});


/////////////////////////////////////////////
// Start
/////////////////////////////////////////////

// Default task
gulp.task('default', ['clean'], function () {
    gulp.start('dev');
});
