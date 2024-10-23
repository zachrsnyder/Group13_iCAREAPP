const { template } = require( '@babel/core' );
const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = {
  // Entry point for your React app or JavaScript code
  entry: './src/index.js', // Change this to where your React components start
  output: {
    //TODO: to run with backend, place the bundle.js file in 'wwwroot/dist' !
    path: path.resolve(__dirname, 'dist'), // Where the bundled files will be saved
    filename: 'bundle.js', // Output file name
    publicPath: '/', // Public path for loading assets in the app
  },
  //TODO: comment out when adding backend!!! Thsi is purely for frontend dev.
  devServer: {
    static: {
      directory: path.join(__dirname, 'dist'), // Serve static files
    },
    compress: true, // Gzip compression
    port: 3000, // Port number for dev server (can be changed)
    hot: true, // Enable hot module reloading
    historyApiFallback: true, // Fallback to index.html for SPA routing
  },
  plugins: [
      // Automatically inject the bundle.js into index.html for both dev and prod
    new HtmlWebpackPlugin({
      template: './public/index.html', // Path to your index.html
    }),
  ],
  module: {
    rules: [
      {
        test: /\.jsx?$/, // Handle JavaScript/React files
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: ['@babel/preset-env', '@babel/preset-react'],
          },
        },
      },
      {
        test: /\.css$/, // Handle CSS imports
        use: ['style-loader', 'css-loader'],
      },
    ],
  },
  resolve: {
    extensions: ['.js', '.jsx'], // Auto-resolve file extensions
  },
  mode: 'development', // Switch to 'production' for production builds
};


