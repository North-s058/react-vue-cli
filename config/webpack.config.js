//生产版
const path = require("path"); //路径模块
const ESLintWebpackPlugin = require("eslint-webpack-plugin"); //代码规范插件
const MinimizerWebpackPlugin = require("mini-css-extract-plugin");
const HtmlWebpackPlugin = require("html-webpack-plugin"); //html兼容性插件
const { VueLoaderPlugin } = require("vue-loader");
const { DefinePlugin } = require("webpack");
const CopyPlugin = require("copy-webpack-plugin");
const { rules } = require("eslint-plugin-vue");
//复制文件插件(不通过webpack打包)
const isProduction = process.env.NODE_ENV === "production";

const getStyleLoaders = (preProcessor) => {
  return [
    isProduction ? MinimizerWebpackPlugin.loader : "vue-style-loader",
    "css-loader",
    {
      loader: "postcss-loader",
      options: {
        postcssOptions: {
          plugins: [
            "postcss-preset-env", //解决大多数兼容性问题
          ],
        },
      },
    },
    preProcessor,
  ].filter(Boolean);
}; //提升代码复用
module.exports = {
  //出入口配置
  entry: "./src/main.js",
  output: {
    path: isProduction ? path.resolve(__dirname, "../dist") : undefined, //开发模式为虚拟磁盘,不用指定
    filename: isProduction
      ? "static/js/[name].[contenthash:10].js"
      : "static/js/[name].js", //输出文件名
    chunkFilename: isProduction
      ? "static/js/[name].[contenthash:10].chunk.js"
      : "static/js/[name].chunk.js", //切割文件名
    assetModuleFilename: "static/js/[hash:10][ext][query]", //静态资源文件名
  },
  //模块配置
  module: {
    //各种样式loader
    rules: [
      {
        test: /\.css$/,
        use: getStyleLoaders(),
      },
      {
        test: /\.less$/,
        use: getStyleLoaders("less-loader"),
      },
      {
        test: /\.s[ac]ss$/,
        use: getStyleLoaders("sass-loader"),
      },
      {
        test: /\.styl$/,
        use: getStyleLoaders("stylus-loader"),
      },

      {
        test: /\.js$/,
        include: path.resolve(__dirname, "../src"),
        loader: "babel-loader",
        options: {
          cacheDirectory: true,
          cacheCompression: false,
          plugins: [
            // "@babel/plugin-transform-runtime" // presets中包含了
          ],
        },
      },
      {
        test: /\.vue$/,
        loader: "vue-loader", // 内部会给vue文件注入HMR功能代码
        options: {
          cacheDirectory: path.resolve(
            __dirname,
            "node_modules/.cache/vue-loader"
          ),
        },
      },
    ],
  },
  //插件
  plugins: [
    new ESLintWebpackPlugin({
      context: path.resolve(__dirname, "../src"),
      exclude: "node_modules",
      cache: true,
      cacheLocation: path.resolve(
        __dirname,
        "../node_modules/.cache/.eslintcache"
      ),
    }),
    new HtmlWebpackPlugin({
      template: path.resolve(__dirname, "../public/index.html"),
    }),
    isProduction &&
      new MinimizerWebpackPlugin({
        filename: "static/css/[name].[contenthash:10].css",
        chunkFilename: "static/css/[name].[contenthash:10].chunk.css",
      }),
    isProduction &&
      new CopyPlugin({
        patterns: [
          {
            from: path.resolve(__dirname, "../public"),
            to: path.resolve(__dirname, "../dist"),
            toType: "dir",
            noErrorOnMissing: true,
            globOptions: {
              ignore: ["**/index.html"],
            },
            info: {
              minimized: true,
            },
          },
        ],
      }),
    new VueLoaderPlugin(),
    new DefinePlugin({
      //定义环境变量,给源代码使用,. cross-env给打包工具使用的
      __VUE_OPTIONS_API__: "true",
      __VUE_PROD_DEVTOOLS: "false",
    }),
  ].filter(Boolean),
  //优化
  optimization: {
    //切割
    splitChunks: {
      chunks: "all",
    },
    //映射关系,提升缓存体验
    runtimeChunk: {
      name: (entrypoint) => `runtime~${entrypoint.name}`,
    },
    minimize: isProduction,
    minimizer: [],
  },
  //解析
  resolve: {
    //后缀
    extensions: [".vue", ".js", ".json"], // 自动补全文件扩展名，让vue可以使用
  },
  //服务器
  devServer: {
    open: true,
    host: "localhost",
    port: 3000,
    hot: true,
    compress: true,
    historyApiFallback: true, // 解决vue-router刷新404问题
  },
  mode: isProduction ? "production" : "development", //开发模式
  devtool: isProduction ? "source-map" : "cheap-module-source-map", //生成map文件,体现打包前后的文件的对应关系
};
