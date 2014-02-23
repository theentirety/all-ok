'use strict';
// Generated on 2014-02-22 using generator-browserify 0.2.2

var gulp = require('gulp');
var bower = 'app/bower_components';
var rootFolder = 'phonegap/www';
var fs = require('fs');
var replace = require('gulp-replace');

// Load plugins
var $ = require('gulp-load-plugins')();

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
    .pipe($.connect.reload());
});

// Vendor
gulp.task('vendor', function () {
  return gulp.src([
    'app/scripts/vendor/jquery-1.11.0.min.js',
    'app/scripts/vendor/bootstrap.min.js',
    'app/scripts/vendor/knockout-3.0.0.js',
    'app/scripts/vendor/parse-1.2.16.min.js'
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
    .pipe($.connect.reload());
});

// HTML
gulp.task('html', ['templates'], function () {
  return gulp.src('app/index.html')
    .pipe(replace('<!-- html templates -->', fs.readFileSync(rootFolder + '/templates.html', 'utf8')))
    .pipe(gulp.dest(rootFolder))
    .pipe($.size());
});

// HTML Templates
gulp.task('templates', function () {
  return gulp.src('app/templates/*.html')
    .pipe($.concat('templates.html'))
    .pipe(gulp.dest(rootFolder))
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
    return gulp.src([rootFolder + '/styles', rootFolder + '/scripts', rootFolder + '/images'], {read: false}).pipe($.clean());
});

// Build

gulp.task('build', ['html', 'styles', 'scripts', 'vendor', 'images']);

// Dev Server

gulp.task('dev', ['html', 'styles', 'scripts', 'vendor', 'images', 'connect', 'watch']);

// Default task
gulp.task('default', ['clean'], function () {
    gulp.start('dev');
});

// Connect
gulp.task('connect', $.connect.server({
  root: __dirname + '/phonegap/www',
  port: 9000,
  livereload:{
    port: 35729
  },
  open: {
    file: 'index.html',
    browser: 'Google Chrome'
  },
}));

// Watch
gulp.task('watch', ['connect'], function () {
    // Watch for changes in `app` folder
    gulp.watch([
        'app/less/**/*.less',
        'app/scripts/**/*.js',
        'app/images/**/*',
        'app/templates/**/*.html'
    ], $.connect.reload);

    
    // Watch .less files
    gulp.watch('app/less/**/*.less', ['styles']);

    // Watch .js files
    gulp.watch('app/scripts/**/*.js', ['scripts']);

    // Watch image files
    gulp.watch('app/images/**/*', ['images']);
    
    // Watch .html files
    gulp.watch('app/**/*.html', ['html']);
});
