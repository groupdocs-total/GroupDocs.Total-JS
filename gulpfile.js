var gulp        = require('gulp');
var browserSync = require('browser-sync').create();

gulp.task('css-watch', function(){
    return gulp.src("**/css/*.css")
        .pipe(browserSync.stream());
});

gulp.task('js-watch', function (done) {
    browserSync.reload();
    done();
});

gulp.task('browser-sync', function() {
    browserSync.init({
        server: {
            baseDir: "./"
        },
        plugins: ['bs-console-qrcode']
    });
    gulp.watch(["**/css/*.css"],gulp.series('css-watch'));
    gulp.watch(["**/js/*.js"], gulp.series('js-watch'));
});