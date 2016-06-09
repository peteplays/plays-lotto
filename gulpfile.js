var gulp        = require('gulp'),
    rename      = require('gulp-rename'),
    browserify  = require('gulp-browserify'),
    uglify      = require('gulp-uglify'),
    less        = require('gulp-less'),
    prefix      = require('gulp-autoprefixer'),
    minifyCSS   = require('gulp-clean-css'),
    PORT        = 7777;

//-- build css and js
gulp.task('css', function() {
  return gulp.src('app/app.less')
    .pipe(less())
    .pipe(prefix({
      cascade: true
    }))
    .pipe(rename('bundle.css'))
    .pipe(gulp.dest('www/css'))
});

gulp.task('js', function() {
  return gulp.src('app/app.js')
    .pipe(browserify({
      insertGlobals: true
    }))
    .pipe(rename('bundle.js'))
    .pipe(gulp.dest('www/js'))
});

//-- get fa and bootstrap icons
gulp.task('fa-icons', function() { 
  return gulp.src('node_modules/font-awesome/fonts/**.*') 
    .pipe(gulp.dest('www/fonts')); 
});

gulp.task('bs-icons', function() { 
  return gulp.src('node_modules/bootstrap/fonts/**.*') 
    .pipe(gulp.dest('www/fonts')); 
});

//-- minify css and uglify js
gulp.task('minify', ['css'], function() {
  return gulp.src('www/css/bundle.css')
    .pipe(minifyCSS({
      processImport: false
    }))
    .pipe(rename('bundle.min.css'))
    .pipe(gulp.dest('www/css'));
});

gulp.task('uglify', ['js'], function() {
  return gulp.src('www/js/bundle.js')
    .pipe(uglify())
    .pipe(rename('bundle.min.js'))
    .pipe(gulp.dest('www/js'));
});

//-- run tasks
gulp.task('default', ['uglify', 'minify']);
gulp.task('build', ['uglify', 'fa-icons', 'bs-icons', 'minify']);
