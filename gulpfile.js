var gulp     = require('gulp');
var clean    = require('gulp-clean');
var include  = require('gulp-include');
var rename   = require('gulp-rename');
var insert   = require('gulp-insert');
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
  var build_path = './build/chrome';

  es.merge(
    pipe('./img/**/*',                            build_path + '/img'),
    pipe('./css/**/*',                            build_path + '/css'),
    pipe('./html/**/*',                           build_path),
    pipe('./vendor/chrome/manifest.json',         build_path)
  );

  gulp.src('js/hnprofile.js')
    .pipe(include())
    .pipe(insert.prepend("var HNProfileBrowser = 'chrome';\n"))
    .pipe(gulp.dest(build_path + '/js'));
});

gulp.task('firefox', function() {
  var build_path = './build/firefox';

  es.merge(
    pipe('./img/**/*',                              build_path + '/data/img'),
    pipe('./css/**/*',                              build_path + '/data/css'),
    pipe('./html/**/*',                             build_path + '/data'),
    pipe('./vendor/firefox/main.js',                build_path + '/data'),
    pipe('./vendor/firefox/package.json',           build_path)
  );

  gulp.src('js/hnprofile.js')
    .pipe(include())
    .pipe(insert.prepend("var HNProfileBrowser = 'firefox';\n"))
    .pipe(gulp.dest(build_path + '/data/js'));
});

gulp.task('safari', function() {
  var build_path = './build/safari/hnprofile.safariextension';

  es.merge(
    pipe('./img/**/*',                             build_path + '/img'),
    pipe('./css/**/*',                             build_path + '/css'),
    pipe('./html/**/*',                            build_path),
    pipe('./vendor/safari/Info.plist',             build_path),
    pipe('./vendor/safari/Settings.plist',         build_path)
  );

  gulp.src('img/icon/128.png')
    .pipe(rename("Icon.png"))
    .pipe(gulp.dest(build_path))

  gulp.src('js/hnprofile.js')
    .pipe(include())
    .pipe(insert.prepend("var HNProfileBrowser = 'safari';\n"))
    .pipe(gulp.dest(build_path + '/js'));
});
