var gulp = require('gulp');
// var sass = require('gulp-sass'),
var connect = require('gulp-connect');
// var livereload = require('gulp-livereload');
var browserify = require('gulp-browserify');
var rename = require('gulp-rename');
var mocha = require('gulp-mocha');
// var fileinclude = require('gulp-file-include');

// html includes
// gulp.task('gulp_file_include', function () {
//     gulp.src('public/**/*.html')
//         .pipe(fileinclude({
//             prefix: '@@',
//             basepath: '@file'
//         }))
//         .pipe(gulp.dest('dist'));
// });

//sass
// gulp.task('sass', function () {
//     gulp.src('public/stylesheets/**/*.scss')
//         .pipe(connect.reload());
// });

//css
gulp.task('css', function () {
    gulp.src('./src/styles/style.css')
        // .pipe(sass())
        .pipe(rename('style.css'))
        .pipe(gulp.dest('dist/css'))
        .pipe(connect.reload());
});


/* connect */
gulp.task('connect', function () {
    connect.server({
        root: 'dist',
        livereload: true,
        port: 1337
    });
});

/*html*/
// gulp.task('html', function () {
//     gulp.src('public/dist.html')
//         .pipe(connect.reload());
// });

/*browserify*/
gulp.task('browserify', function () {
    return gulp.src('./src/js/code/index.js')
        .pipe(browserify({ debug: true }))
        .pipe(gulp.dest('dist/js'))
        .pipe(connect.reload());
});

gulp.task('browserifyLib', function () {
    return gulp.src('./src/js/lib/**/*.js')
        .pipe(browserify({ debug: true }))
        .pipe(rename('libs.js'))
        .pipe(gulp.dest('dist/js'))
        .pipe(connect.reload());
});

gulp.task('mocha', () =>
    gulp.src(['test/**/*.js'], { read: false })
        .pipe(mocha({ reporter: 'list', exit: true }))
        .on('error', console.error)
);

gulp.task('watch', function () {
    // gulp.watch(['./public/quiz.html'], ['html']);
    // gulp.watch(['./public/quiz.html'], ['gulp_file_include']);
    gulp.watch('./src/js/code/**/*.js', ['browserify']);
    gulp.watch('./src/js/lib/**/*.js', ['browserifyLib']);
    gulp.watch(['./src/styles/**/*.css'], ['css']);
});
gulp.task('build', ['connect', 'css', /*'html', 'sass', 'css',  'gulp_file_include', */'browserify', 'browserifyLib', 'watch']);

gulp.task('test', () => {
    gulp.watch('./src/js/code/**/*.js', ['mocha']);
    gulp.watch('./test/**/*.js', ['mocha']);
});