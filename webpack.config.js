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
      filename: isProduction ? 'js/[name].[contenthash:8].js' : 'js/[name].js',
      chunkFilename: isProduction
        ? 'js/[name].[contenthash:8].chunk.js'
        : 'js/[name].chunk.js',
      path: path.resolve(__dirname, 'dist'),
      clean: true,

      // ✔ универсальный вариант для реального хостинга
      publicPath: './'
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
      }
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
          use: ['json-loader'],
        },
      ],
    },

    plugins: [
      new HtmlWebpackPlugin({
        template: './src/index.html',
        minify: isProduction
          ? {
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
            }
          : false,
        cache: false,
      }),

      new CopyWebpackPlugin({
        patterns: [
          { from: 'src/assets', to: 'assets', noErrorOnMissing: true },

          // ✔ добавлено: partials теперь попадут в dist
          { from: 'src/html/partials', to: 'html/partials', noErrorOnMissing: true },

          // ✔ копирование локализаций
          { from: 'src/lang', to: 'lang', noErrorOnMissing: true }
        ],
      }),

      ...(isProduction
        ? [
            new MiniCssExtractPlugin({
              filename: 'css/[name].[contenthash:8].css',
              chunkFilename: 'css/[name].[contenthash:8].chunk.css',
            })
          ]
        : []),
    ],

    resolve: {
      alias: {
        '@': path.resolve(__dirname, 'src'),
      },
      extensions: ['.js', '.json'],
    },

    optimization: {
      minimize: isProduction,
      minimizer: [
        new TerserPlugin({
          terserOptions: {
            compress: { drop_console: isProduction },
            output: { comments: false }
          },
          parallel: true,
        }),
        new CssMinimizerPlugin(),
      ],

      splitChunks: {
        chunks: 'all',
        cacheGroups: {
          vendor: {
            test: /[\\/]node_modules[\\/]/,
            name: 'vendors',
            chunks: 'all',
          },
          ...(isProduction
            ? {
                styles: {
                  name: 'styles',
                  type: 'css/mini-extract',
                  chunks: 'all',
                  enforce: true,
                },
              }
            : {}),
        },
      },

      ...(isProduction
        ? {
            runtimeChunk: { name: 'runtime' }
          }
        : {}),
    },

    performance: {
      hints: false
    }
  };
};
