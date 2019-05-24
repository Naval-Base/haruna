const gulp = require('gulp');
const fsn = require('fs-nextra');
const ts = require('gulp-typescript');
const sourcemaps = require('gulp-sourcemaps');
const project = ts.createProject('tsconfig.json');

async function clean() {
	await fsn.emptydir('dist');
}

function scripts() {
	return project.src()
		.pipe(sourcemaps.init())
		.pipe(project())
		.js
		.pipe(sourcemaps.write('.', { sourceRoot: '../src' }))
		.pipe(gulp.dest('dist'));
}

async function build() {
	await clean();
	return scripts();
}

function watch() {
	gulp.watch('src/**/*.ts', scripts);
}

gulp.task('default', build);
gulp.task('build', build);
gulp.task('watch', watch);
