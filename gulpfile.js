var gulp = require('gulp'),
  coffee = require('gulp-coffee'),
  connect = require('gulp-connect'),
  plumber = require('gulp-plumber');

var paths = {
  src: './src/**/*',
  dst: './dst'
};

gulp.task('coffee', function(){
  return gulp.src(paths.src)
    .pipe(plumber())
    .pipe(coffee({literate: true}))
    .pipe(gulp.dest(paths.dst))
    .pipe(connect.reload());
});

gulp.task('default', function(){
  gulp.watch(paths.src, ['coffee']);
  connect.server({
    port: 1277,
    livereload: true
  });
});

