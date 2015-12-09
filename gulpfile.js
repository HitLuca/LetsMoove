;// FOUNDATION FOR APPS TEMPLATE GULPFILE
// -------------------------------------
// This file processes all of the assets in the "client" folder, combines them with the Foundation for Apps assets, and outputs the finished files in the "build" folder as a finished app.

// 1. LIBRARIES
// - - - - - - - - - - - - - - -

var $ = require('gulp-load-plugins')();
var argv = require('yargs').argv;
var gulp = require('gulp');
var rimraf = require('rimraf');
var router = require('front-router');
var sequence = require('run-sequence');

// Check for --production flag
var isProduction = !!(argv.production);

// 2. FILE PATHS
// - - - - - - - - - - - - - - -
var buildDir = "./build";
var testDir = "./test";

var paths = {
    assets: [
        './client/**/*.*',
        '!./client/templates/**/*.*',
        '!./client/assets/{scss,js}/**/*.*'
    ],
    // Sass will check these folders for files when you use @import.
    sass: [
        'client/assets/scss',
        'bower_components/foundation-apps/scss/vendor',
        'bower_components/angular-material'
    ],
    // These files include Foundation for Apps and its dependencies
    angularJS: [
        'bower_components/jquery/dist/jquery.js',
        'bower_components/fastclick/lib/fastclick.js',
        //'bower_components/viewport-units-buggyfill/viewport-units-buggyfill.js',
        //'bower_components/tether/tether.js',
        //'bower_components/hammerjs/hammer.js',
        'bower_components/angular/angular.js',
        'bower_components/angular-aria/angular-aria.js',
        'bower_components/angular-resource/angular-resource.js',
        'bower_components/angular-animate/angular-animate.js',
        'bower_components/angular-material/angular-material.js',
        //DynamicRouting di foundation apps
        'bower_components/angular-ui-router/release/angular-ui-router.js',
        'bower_components/foundation-apps/js/angular/services/*.js',
        //'bower_components/foundation-apps/js/vendor/**/*.js',
        //'bower_components/foundation-apps/js/angular/**/*.js',
        //'!bower_components/foundation-apps/js/angular/app.js'
        //Google maps
        'bower_components/lodash/lodash.js',
        'bower_components/angular-simple-logger/dist/angular-simple-logger.js',
        'bower_components/angular-google-maps/dist/angular-google-maps.js',
        'bower_components/angular-material-icons/angular-material-icons.js',
        'bower_components/svg-morpheus/compile/unminified/svg-morpheus.js'
    ],
    // These files are for your app's JavaScript
    appJS: [
        'client/assets/js/**/*.js'
    ],
    appTest: [
        'client/assets/js/**/*.js',
        '!client/assets/js/app.js'
    ],
    angularTest: [
        'bower_components/jasmine/lib/jasmine-core/jasmine.js',
        'bower_components/jasmine/lib/jasmine-core/jasmine-html.js',
        'bower_components/jasmine/lib/jasmine-core/boot.js',
        'bower_components/angular/angular.js',
        'bower_components/angular-mocks/angular-mocks.js',
        'bower_components/angular-resource/angular-resource.js',
        'spec/mocks/*.js'
    ]
};

// 3. TASKS
// - - - - - - - - - - - - - - -

// Cleans the build directory
gulp.task('clean:build', function (cb) {
    rimraf(buildDir, cb);
});

gulp.task('clean:test', function (cb) {
    rimraf(testDir, cb);
});

// Copies everything in the client folder except templates, Sass, and JS
gulp.task('copy', function () {
    return gulp.src(paths.assets, {
            base: './client/'
        })
        .pipe(gulp.dest(buildDir))
        ;
});

// Copies your app's page templates and generates URLs for them
gulp.task('copy:templates', function () {
    return gulp.src('./client/templates/**/*.html')
        .pipe(router({
            path: buildDir + '/assets/js/routes.js',
            root: 'client'
        }))
        .pipe(gulp.dest(buildDir + '/templates'))
        ;
});

// Compiles the Foundation for Apps directive partials into a single JavaScript file
gulp.task('copy:foundation', function (cb) {
    gulp.src('bower_components/foundation-apps/js/angular/components/**/*.html')
        .pipe($.ngHtml2js({
            prefix: 'components/',
            moduleName: 'foundation',
            declareModule: false
        }))
        .pipe($.uglify())
        .pipe($.concat('templates.js'))
        .pipe(gulp.dest(buildDir + '/assets/js'))
    ;

    // Iconic SVG icons
    gulp.src('./bower_components/foundation-apps/iconic/**/*')
        .pipe(gulp.dest(buildDir + '/assets/img/iconic/'))
    ;

    cb();
});

// Compiles Sass
gulp.task('sass', function () {
    return gulp.src('client/assets/scss/app.scss')
        .pipe($.sass({
            includePaths: paths.sass,
            outputStyle: (isProduction ? 'compressed' : 'nested'),
            errLogToConsole: true
        }))
        .pipe($.autoprefixer({
            browsers: ['last 2 versions', 'ie 10']
        }))
        .pipe(gulp.dest(buildDir + '/assets/css/'))
        ;
});

// Compiles and copies the Foundation for Apps JavaScript, as well as your app's custom JS
gulp.task('uglify', ['uglify:angular', 'uglify:app']);

gulp.task('uglify:angular', function (cb) {
    var uglify = $.if(isProduction, $.uglify()
        .on('error', function (e) {
            console.log(e);
        }));

    return gulp.src(paths.angularJS)
        .pipe(uglify)
        .pipe($.concat('angular.js'))
        .pipe(gulp.dest(buildDir + '/assets/js/'))
        ;
});

gulp.task('uglify:app', function () {
    var uglify = $.if(isProduction, $.uglify()
        .on('error', function (e) {
            console.log(e);
        }));

    return gulp.src(paths.appJS)
        .pipe(uglify)
        .pipe($.concat('app.js'))
        .pipe(gulp.dest(buildDir + '/assets/js/'))
        ;
});

// Starts a test server, which you can view at http://localhost:8079
gulp.task('server', ['build'], function () {
    gulp.src(buildDir)
        .pipe($.webserver({
            port: 8079,
            host: 'localhost',
            fallback: 'index.html',
            livereload: true
        }))
    ;
});

// Builds your entire app once, without starting a server
gulp.task('build', function (cb) {
    sequence('clean:build', ['copy', 'sass', 'uglify'], 'copy:templates', cb);
});

gulp.task('appTest', function (cb) {
    gulp.src(paths.appTest)
        .pipe($.concat('app.js'))
        .pipe(gulp.dest(testDir))
    ;
    gulp.src('./spec/*.js')
        .pipe($.concat('spec.js'))
        .pipe(gulp.dest(testDir))
    ;
    gulp.src('./spec/SpecRunner.html')
        .pipe(gulp.dest(testDir))
    ;
    cb();
});

gulp.task('angularTest', function (cb) {
    gulp.src(paths.angularTest, {})
        .pipe($.concat('angular.js'))
        .pipe(gulp.dest(testDir));
    gulp.src('./bower_components/jasmine/lib/jasmine-core/jasmine.css')
        .pipe(gulp.dest(testDir))
    ;
    cb();
});

gulp.task('buildTest', function () {
    sequence('clean:test', ['angularTest', 'appTest'])
});

// Default task: builds your app, starts a server, and recompiles assets when they change
gulp.task('default', ['build', 'buildTest'], function () {
    // Watch Sass
    gulp.watch(['./client/assets/scss/**/*', './scss/**/*'], ['sass']);

    // Watch JavaScript
    gulp.watch(['./client/assets/js/**/*', './js/**/*'], ['uglify:app']);

    // Watch static files
    gulp.watch(['./client/**/*.*', '!./client/templates/**/*.*', '!./client/assets/{scss,js}/**/*.*'], ['copy']);

    // Watch app templates
    gulp.watch(['./client/templates/**/*.html'], ['copy:templates']);

    gulp.watch(['./spec/*'], ['appTest']);
});
