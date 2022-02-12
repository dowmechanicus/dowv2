const path = require('path');
const nodeExternals = require('webpack-node-externals');

module.exports = {
  mode: 'development',
  entry: {
    'index': './index.js',
  },
  target: 'node',
  resolve: {
    extensions: ['.js']
  },
  externals: [nodeExternals()],
  output: {
    filename: '[name].js',
    path: path.resolve(__dirname, '.js'),
  },
  module: {
    rules: [
      {
        test: /\.(js)$/,
        exclude: /node_modules/,
        use: ['babel-loader']
      }
    ]
  }
};
