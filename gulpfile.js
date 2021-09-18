const path = require('path');
const os = require('os');

const { src, dest, series, watch } = require('gulp');
const del = require('delete');
const rollup = require('gulp-better-rollup');
const { nodeResolve } = require('@rollup/plugin-node-resolve');
const json = require('@rollup/plugin-json');
const sourcemaps = require('gulp-sourcemaps');
const merge = require('merge-stream');
const cwebp = require('gulp-cwebp');
const concat = require('gulp-concat-util');
const terser = require('gulp-terser');
const kontra = require('rollup-plugin-kontra');
const { Packer } = require('roadroller');
const htmlmin = require('gulp-htmlmin');
const gulpZip = require('gulp-zip');
const advzip = require('gulp-advzip');
const intermediate = require('gulp-intermediate');
const through2 = require('through2');
const childProcess = require('child_process');
const PluginError = require('plugin-error');
const debug = require('gulp-debug');
const { name: pkgName } = require('./package.json');

const rollupConfig = {
  plugins: [
    nodeResolve(),
    json(),
    kontra({
      gameObject: {
        anchor: true,
        group: true,
        opacity: true,
        rotation: true,
        scale: true,
        // for some reason this is needed by the building menubar
        // grid to correctly update the width of the top-level
        // menu items and the expanded the submenu
        velocity: true
      },
      sprite: {
        image: true
      },
      text: {
        autoNewline: true
      }
    })
  ]
};

// a gulp plugin for ect based on gulp-advzip. ect can help save bytes
// when using zip
// @see https://github.com/elliot-nelson/gulp-advzip/blob/master/index.js
function ect() {
  // Because the ect tool does not currently support streaming/piping, we will use
  // the gulp-intermediate wrapper write the current zip buffer to the file system, run
  // the ect tool on it, and then suck it back in.
  return intermediate({}, (tempDir, cb, files) => {
    const args = ['-9', '-zip'];
    files.forEach(file => args.push(path.join(tempDir, file.relative)));

    const ectPath = os.platform() === 'win32' ? './ect-0.8.3.exe' : './ect';
    const p = childProcess.spawn(ectPath, args, {
      stdio: ['inherit', 'pipe', 'inherit']
    });
    p.stdout.on('data', buffer => {
      let string = buffer.toString();
      while (string.indexOf(tempDir) > -1) {
        string = string.replace(tempDir + path.sep, '');
      }
      process.stdout.write(string);
    });
    p.on('close', code => {
      if (code === 0) {
        cb();
      } else {
        cb(new PluginError('gulp-ect', 'Unexpected error while running ect'));
      }
    });
    p.on('error', error => {
      cb(new PluginError('gulp-ect', String(error)));
    });
  });
}

function clean(cb) {
  del(['dist'], cb);
}

function build() {
  const jsStream = src('src/index.js')
    .pipe(sourcemaps.init())
    .pipe(rollup(rollupConfig, 'iife'))
    .pipe(sourcemaps.write());

  const htmlStream = src('src/index.html').pipe(
    concat.footer('\n</script><script src="index.js"></script>')
  );

  const assetStream = src('src/assets/*.png')
    // webp images can save a lot of bytes
    .pipe(cwebp({ z: 9 }));

  // sourcemaps only seem to work when it's not a single html file
  return merge(jsStream, htmlStream, assetStream).pipe(dest('dist'));
}

function dist() {
  const jsStream = src('src/index.js')
    .pipe(rollup(rollupConfig, 'iife'))
    .pipe(
      terser({
        ecma: 2016,
        module: true,
        toplevel: true,
        compress: {
          keep_fargs: false,
          passes: 4,
          pure_funcs: ['assert', 'debug'],
          pure_getters: true,
          unsafe: true,
          unsafe_arrows: true,
          unsafe_comps: true,
          unsafe_math: true,
          unsafe_methods: true
        },
        mangle: true
      })
    )
    // compress js even further before zip
    // @see https://github.com/lifthrasiir/roadroller
    .pipe(
      through2.obj(async function (file, _, cb) {
        if (file.isBuffer()) {
          const inputs = [
            {
              data: file.contents.toString(),
              type: 'js',
              action: 'eval'
            }
          ];
          const packer = new Packer(inputs);
          await packer.optimize();
          const { firstLine, secondLine } = packer.makeDecoder();
          file.contents = Buffer.from(firstLine + '\n' + secondLine);
        }
        cb(null, file);
      })
    );

  const assetStream = src('src/assets/*.png')
    .pipe(cwebp({ z: 9 }))
    .pipe(dest('dist'));

  // zip works best on a single html file
  // (multiple files = more overhead of zip headers)
  const htmlStream = merge(jsStream, src('src/index.html'))
    .pipe(concat('index.html'))
    .pipe(concat.footer('\n</script>'))
    .pipe(
      htmlmin({
        collapseWhitespace: true,
        minifyCSS: true,
        removeComments: true,
        removeAttributeQuotes: true
      })
    );

  return merge(htmlStream, assetStream).pipe(dest('dist'));
}

function zip() {
  return src(['dist/index.html'])
    .pipe(debug())
    .pipe(gulpZip(`${pkgName}.zip`))
    .pipe(
      advzip({
        optimizationLevel: 4
      })
    )
    .pipe(ect())
    .pipe(dest('dist'));
}

exports.clean = clean;
exports.build = series(clean, build);
exports.dist = series(clean, dist);
exports.zip = zip;
exports.default = function () {
  watch('src/**/*.*', series(clean, build));
};
