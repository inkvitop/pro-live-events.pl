const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const TerserPlugin = require('terser-webpack-plugin');
const CssMinimizerPlugin = require('css-minimizer-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');

module.exports = (env, argv) => {
  const isProduction = argv.mode === 'production';
  const isGitHubPages = process.env.NODE_ENV === 'github-pages';

  return {
    entry: './src/index.js',
    
    output: {
      filename: isProduction ? 'js/main.[contenthash:8].js' : 'js/main.js',
      path: path.resolve(__dirname, 'dist'),
      clean: true,
      // ✅ ВАЖНО: Для GitHub Pages используем относительные пути
      publicPath: isGitHubPages ? './' : '',
    },

    mode: isProduction ? 'production' : 'development',
    devtool: isProduction ? 'source-map' : 'eval-cheap-module-source-map',

    devServer: {
      static: {
        directory: path.resolve(__dirname, 'dist'),
        watch: true,
      },
      compress: true,
      port: 9000,
      hot: true,
      liveReload: true,
      open: true,
      client: {
        overlay: true,
        progress: true,
      },
      proxy: [
        {
          context: ['/api'],
          target: 'https://flashpro.pl',
          changeOrigin: true,
          secure: false,
          logLevel: 'debug',
          pathRewrite: {
            '^/api': '/en/api'
          },
          headers: {
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, PATCH, OPTIONS",
            "Access-Control-Allow-Headers": "X-Requested-With, content-type, Authorization, X-Api-Key"
          },
          onProxyReq: (proxyReq, req, res) => {
            console.log('🔁 PROXY:', req.method, req.url, '→', proxyReq.path);
            proxyReq.setHeader('Origin', 'https://flashpro.pl');
            proxyReq.setHeader('Referer', 'https://flashpro.pl/');
          },
          onProxyRes: (proxyRes, req, res) => {
            console.log('📡 PROXY RESPONSE:', proxyRes.statusCode, req.url);
            proxyRes.headers['Access-Control-Allow-Origin'] = '*';
            proxyRes.headers['Access-Control-Allow-Methods'] = 'GET, POST, PUT, DELETE, PATCH, OPTIONS';
            proxyRes.headers['Access-Control-Allow-Headers'] = 'X-Requested-With, content-type, Authorization, X-Api-Key';
          },
          onError: (err, req, res) => {
            console.log('❌ PROXY ERROR:', err.message);
          }
        }
      ],
      setupMiddlewares: (middlewares, devServer) => {
        if (!devServer) {
          throw new Error('webpack-dev-server is not defined');
        }

        devServer.app.use((req, res, next) => {
          res.header('Access-Control-Allow-Origin', '*');
          res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
          res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization, X-Api-Key');
          next();
        });

        return middlewares;
      },
    },

    module: {
      rules: [
        {
          test: /\.css$/,
          use: [
            isProduction ? MiniCssExtractPlugin.loader : 'style-loader',
            'css-loader'
          ],
        },
        {
          test: /\.scss$/,
          use: [
            isProduction ? MiniCssExtractPlugin.loader : 'style-loader',
            'css-loader',
            'sass-loader'
          ],
        },
        {
          test: /\.(png|jpe?g|gif|svg|webp)$/i,
          type: 'asset/resource',
          generator: {
            filename: 'assets/[name].[contenthash:8][ext]'
          }
        },
        {
          test: /\.(woff2?|ttf|otf|eot)$/i,
          type: 'asset/resource',
          generator: {
            filename: 'fonts/[name].[contenthash:8][ext]'
          }
        },
        {
          test: /\.html$/i,
          use: 'raw-loader'
        },
        {
          test: /\.json$/,
          type: 'javascript/auto',
          use: [
            {
              loader: 'json-loader'
            }
          ],
        },
      ],
    },

    plugins: [
      new HtmlWebpackPlugin({
        template: './src/index.html',
        minify: isProduction ? {
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
        } : false,
        cache: false,
      }),

      new CopyWebpackPlugin({
        patterns: [
          {
            from: 'src/assets',
            to: 'assets',
            noErrorOnMissing: true
          },
          // ✅ Добавляем CNAME файл если используем свой домен
          {
            from: 'CNAME',
            to: '',
            noErrorOnMissing: true
          }
        ],
      }),

      ...(isProduction ? [
        new MiniCssExtractPlugin({
          filename: 'css/[name].[contenthash:8].css',
          chunkFilename: 'css/[name].[contenthash:8].chunk.css',
        })
      ] : []),
    ],

    resolve: {
      alias: {
        '@': path.resolve(__dirname, 'src'),
      },
      extensions: ['.js', '.json']
    },

    optimization: {
      minimize: isProduction,
      minimizer: [
        new TerserPlugin({
          terserOptions: {
            parse: {
              ecma: 8,
            },
            compress: {
              ecma: 5,
              warnings: false,
              comparisons: false,
              inline: 2,
              drop_console: true,
            },
            mangle: {
              safari10: true,
            },
            output: {
              ecma: 5,
              comments: false,
              ascii_only: true,
            },
          },
          parallel: true,
        }),
        new CssMinimizerPlugin({
          minimizerOptions: {
            preset: [
              'default',
              {
                discardComments: { removeAll: true },
              },
            ],
          },
        }),
      ],
      splitChunks: {
        chunks: 'all',
        cacheGroups: {
          vendor: {
            test: /[\\/]node_modules[\\/]/,
            name: 'vendors',
            chunks: 'all',
          },
          styles: {
            name: 'styles',
            type: 'css/mini-extract',
            chunks: 'all',
            enforce: true,
          },
        },
      },
      runtimeChunk: {
        name: 'runtime',
      },
    },

    performance: {
      hints: isProduction ? 'warning' : false,
      maxEntrypointSize: 512000,
      maxAssetSize: 512000,
    },
  };
};