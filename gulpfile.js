var gulp     = require('gulp');
var clean    = require('gulp-clean');
var include  = require('gulp-include');
var es       = require('event-stream');
var rseq     = require('gulp-run-sequence');
var zip      = require('gulp-zip');
var shell    = require('gulp-shell');
var chrome   = require('./vendor/chrome/manifest');
var firefox  = require('./vendor/firefox/package');

function pipe(src, transforms, dest) {
  if (typeof transforms === 'string') {
    dest = transforms;
    transforms = null;
  }

  var stream = gulp.src(src);
  transforms && transforms.forEach(function(transform) {
    stream = stream.pipe(transform);
  });

  if (dest) {
    stream = stream.pipe(gulp.dest(dest));
  }

  return stream;
}

gulp.task('default', function(cb) {
  return rseq('clean', ['chrome', 'firefox', 'safari'], cb);
});

gulp.task('clean', function() {
  return pipe('./build', [clean()]);
});

gulp.task('watch', function() {
  gulp.watch(['./js/**/*', './css/**/*', './html/**/*', './vendor/**/*', './img/**/*'], ['default']);
});

gulp.task('chrome', function() {
  var build_path = './build/chrome'

  gulp.src('js/hnprofile.js')
    .pipe(include())
    .pipe(gulp.dest(build_path + '/js'))

  return es.merge(
    pipe('./img/**/*',                    build_path + '/img'),
    pipe('./css/**/*',                    build_path + '/css'),
    pipe('./html/**/*',                   build_path),
    pipe('./vendor/chrome/browser.js',    build_path + '/js'),
    pipe('./vendor/chrome/manifest.json', build_path)
  );
});

gulp.task('firefox', function() {
  var build_path = './build/firefox'

  gulp.src('js/hnprofile.js')
    .pipe(include())
    .pipe(gulp.dest(build_path + '/data/js'))

  return es.merge(
    pipe('./img/**/*',                    build_path + '/data/img'),
    pipe('./css/**/*',                    build_path + '/data/css'),
    pipe('./html/**/*',                   build_path + '/data'),
    pipe('./vendor/firefox/browser.js',   build_path + '/data/js'),
    pipe('./vendor/firefox/main.js',      build_path + '/data'),
    pipe('./vendor/firefox/package.json', build_path)
  );
});

gulp.task('safari', function() {
  var build_path = './build/safari/hnprofile.safariextension';

  gulp.src('js/hnprofile.js')
    .pipe(include())
    .pipe(gulp.dest(build_path + '/js'))

  return es.merge(
    pipe('./img/**/*',                     build_path + '/img'),
    pipe('./css/**/*',                     build_path + '/css'),
    pipe('./html/**/*',                    build_path),
    pipe('./vendor/safari/browser.js',     build_path + '/js'),
    pipe('./vendor/safari/Info.plist',     build_path),
    pipe('./vendor/safari/Settings.plist', build_path)
  );
});
