//  General
const {
  gulp,
  src,
  dest,
  watch,
  series,
} = require("gulp");

const rename = require("gulp-rename");
const notify = require("gulp-notify");
const plumber = require("gulp-plumber");

// Styles
const postcss = require("gulp-postcss");
const postcssImport = require('postcss-import');
const postcssPresetEnv = require('postcss-preset-env')({
  stage: 1
})
const tailwindCss = require('tailwindcss')
const cleanCSS = require("gulp-clean-css");

// Scripts
const babel = require("gulp-babel");
const concat = require("gulp-concat");
const uglify = require("gulp-uglify");

/**
 * File paths
 */
const paths = {
  css: {
    source: ["./site/css/main.css"],
    dest: "./dist/css/"
  },
  js: {
    source: ["./site/js/*.js"],
    dest: "./dist/js/"
  }
}

/**
 * Errors function
 */
var onError = function (err) {
  notify.onError({
    title: "Gulp Error - Compile Failed",
    message: "Error: <%= error.message %>"
  })(err);

  this.emit("end");
};


/**
 * Compile CSS & Tailwind
 */
const compileCSS = done => {

  return src(paths.css.source)
    .pipe(plumber({
      errorHandler: onError
    }))
    .pipe(postcss([
      postcssImport,
      postcssPresetEnv,
      tailwindCss,
    ]))
    // ...
    .pipe(dest(paths.css.dest))
    .pipe(
      notify({
        message: "Tailwind Compile Success"
      })
    )
}

/**
 * Concatinate and compile scripts
 */
const compileJS = done => {
  return src(paths.js.source)
    .pipe(plumber({
      errorHandler: onError
    }))
    .pipe(
      babel({
        presets: ["@babel/env"],
        sourceType: "script"
      })
    )
    .pipe(concat("main.js"))
    .pipe(dest(paths.js.dest))
    .pipe(
      notify({
        message: "Javascript Compile Success"
      })
    );
  done();
};

/**
 * Minify scripts
 * This will be ran as part of our preflight task
 */
const minifyJS = done => {
  return src(paths.js.dest + "main.js")
    .pipe(
      rename({
        suffix: ".min"
      })
    )
    .pipe(uglify())
    .pipe(dest(paths.js.dest))
    .pipe(
      notify({
        message: "Javascript Minify Success"
      })
    );
  done();
};

/**
 * Watch files
 */
const watchFiles = done => {
  watch(["site/*.njk", "site/includes/**/*.njk"], series(compileCSS));
  watch("./tailwind.config.js", series(compileCSS));
  watch("./site/css/**/*.css", series(compileCSS));
  watch("./site/js/**/*.js", series(compileJS));
  done();
};

/**
 * Minify CSS [PREFLIGHT]
 */
const minifyCSSPreflight = done => {
  return src(paths.css.dest + "main.css")
    .pipe(cleanCSS())
    .pipe(
      rename({
        suffix: ".min"
      })
    )
    .pipe(dest(paths.css.dest))
    .pipe(
      notify({
        message: "Minify CSS [PREFLIGHT] Success"
      })
    );
};

/**
 * [BUILD] task
 * Run this once you're happy with your site and you want to prep the files for production.
 *
 * This will run the Preflight tasks to minify our CSS and scripts, as well as pass the CSS through PurgeCSS to remove any unused CSS.
 *
 * Always double check that everything is still working. If something isn't displaying correctly, it may be because you need to add it to the PurgeCSS whitelist.
 */
exports.build = series(compileCSS, minifyCSSPreflight, minifyJS);

/**
 * [DEFAULT] task
 * This should always be the last in the gulpfile
 * This will run while you're building the theme and automatically compile any changes.
 * This includes any html changes you make so that the PurgeCSS file will be updated.
 */
exports.default = series(compileCSS, compileJS, watchFiles);