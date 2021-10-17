const path = require('path');

module.exports = {
  context: path.resolve(__dirname, './src'),
  entry: './index.ts',
  mode: 'production',
  module: {
    rules: [{
      test: /\.(t|j)s$/,
      use: 'ts-loader',
      exclude: /node_modules/
    }]
  },
  output: {
    filename: 'web-component.js',
    path: path.resolve(__dirname, './dist')
  },
  resolve: {
    extensions: ['.ts', '.js']
  },
};