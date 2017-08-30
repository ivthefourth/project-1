const path = require('path');
const CleanWebpackPlugin = require('clean-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = {
   entry: {
      app: './src/app.js'
   },
   devtool: 'inline-source-map',
   devServer: {
      contentBase: './dist'
   },
   plugins: [
      new CleanWebpackPlugin(['dist']),
      new HtmlWebpackPlugin({
         template: 'src/components/layout/main.ejs'
      })
   ],
   output: {
      filename: '[name].bundle.js',
      path: path.resolve(__dirname, 'dist')
   },
   module: {
      rules: [
         {
            test: /\.css$/,
            use: [
               'style-loader',
               'css-loader'
            ]
         },
         {
            test: /\.(png|svg|jpg|gif)$/,
            use: [
               'file-loader'
            ]
         }
      ]
   }
};

