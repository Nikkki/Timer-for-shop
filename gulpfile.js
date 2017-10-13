var gulp = require('gulp'),
    //sass = require('gulp-sass'),
    connect = require('gulp-connect'),
    livereload = require('gulp-livereload');
    //browserify = require('gulp-browserify'),
    // diagramVennBrowserify = require('gulp-browserify'),
    // testControllers = require('gulp-browserify'),
    // networkTest = require('gulp-browserify'),
    // rename = require('gulp-rename'),
    // fileinclude = require('gulp-file-include');

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
// gulp.task('css', function () {
//     gulp.src('public/stylesheets/main.scss')
//         .pipe(sass())
//         .pipe(gulp.dest('dist/styles'))
//         .pipe(connect.reload());
// });


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
    return gulp.src('./dist/src/js/*.js')
        // .pipe(browserify({ debug: true }))
        // .pipe(gulp.dest('dist/js'))
        .pipe(connect.reload());
});

/*Venn`s diagram*/
// gulp.task('diagramVennBrowserify', function () {
//     return gulp.src('./public/svg-js/diagramVenn/diagramVenn.js')
//         .pipe(rename('diagramVenn.js'))
//         .pipe(browserify({ debug: true }))
//         .pipe(gulp.dest('dist/js'))
//         .pipe(connect.reload());
// });

/*test controllers*/

// gulp.task('testControllers', function () {
//     return gulp.src('./public/testControllers/index.js')
//         .pipe(rename('testControllers.js'))
//         .pipe(browserify({ debug: true }))
//         .pipe(gulp.dest('dist/js'))
//         .pipe(connect.reload());
// });

/*Network Test*/

// gulp.task('networkTest', function () {
//     return gulp.src('./public/testControllers/network/index.js')
//         .pipe(rename('networkTest.js'))
//         .pipe(browserify({ debug: true }))
//         .pipe(gulp.dest('dist/js'))
//         .pipe(connect.reload());
// });

gulp.task('watch', function () {
    // gulp.watch(['./public/quiz.html'], ['html']);
    // gulp.watch(['./public/quiz.html'], ['gulp_file_include']);
    gulp.watch('./dist/src/js/**/*.js', ['browserify']);
    // gulp.watch('./public/testControllers/js/*.js', ['testControllers']);
    // gulp.watch('./public/svg-js/diagramVenn/diagramVenn/js/*.js', ['diagramVennBrowserify']);
    // gulp.watch('./public/testControllers/network/js/*.js', ['networkTest']);
    // gulp.watch(['./public/stylesheets/**/*.scss'], ['css', 'sass']);
});
// gulp.task('diagramVenn', ['watch', 'diagramVennBrowserify', 'testControllers']);
gulp.task('build', ['connect', /*'html', 'sass', 'css',  'gulp_file_include', */'browserify', 'watch']);
