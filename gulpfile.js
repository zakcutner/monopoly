const gulp = require('gulp')
const rename = require('gulp-rename')

const sass = require('gulp-sass')
const autoprefixer = require('gulp-autoprefixer')
const uglify = require('gulp-uglify')

gulp.task('sass', () => {
	return gulp.src('./src/*.scss')
		.pipe(sass({ outputStyle: 'compressed' }))
		.pipe(autoprefixer())
		.pipe(rename({ suffix: '.min' }))
		.pipe(gulp.dest('./lib'))
})

gulp.task('js', () => {
	return gulp.src('./src/*.js')
		.pipe(uglify())
		.pipe(rename({ suffix: '.min' }))
		.pipe(gulp.dest('./lib'))
})

gulp.task('watch', () => {
	gulp.watch('./src/*.scss', ['sass'])
	gulp.watch('./src/*.js', ['js'])
})

gulp.task('build', ['sass', 'js'])
gulp.task('default', ['build', 'watch'])
