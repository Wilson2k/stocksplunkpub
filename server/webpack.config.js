const path = require('path');
const webpack = require('webpack');

const environment = process.env.ENVIRONMENT;

let ENVIRONMENT_VARIABLES = {
  'process.env.ENVIRONMENT': JSON.stringify('development'),
  'process.env.PORT': JSON.stringify('8080'),
  'process.env.MONGO_CONNECTION_STRING': JSON.stringify('mongodb://mongo-db:27017'),
  'process.env.ALPHA_KEY': JSON.stringify('KEY_HERE')
};

if (environment === 'production') {
  ENVIRONMENT_VARIABLES = {
    'process.env.ENVIRONMENT': JSON.stringify('production'),
    'process.env.PORT': JSON.stringify('80'),
    'process.env.MONGO_CONNECTION_STRING': JSON.stringify('MONGO_DB_CONNECTION_STRING'),
    'process.env.ALPHA_KEY': JSON.stringify('KEY_HERE')
  };
}

module.exports = {
  entry: './server.js',
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'api.bundle.js',
  },
  target: 'node',
  plugins: [
    new webpack.DefinePlugin(ENVIRONMENT_VARIABLES),
  ],
};