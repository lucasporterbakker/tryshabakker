const path = require('path')

module.exports = {
    mode: 'development',
    // mode: 'production',
    entry: './src/app.jsx',
    output: {
        path: path.resolve(__dirname, 'dist'),
        filename: 'bundle.js'
    },
    devtool: '#sourcemap',
    watch: true,
    module: {
        rules: [
            {test: /\.scss$/, loader: 'style-loader!css-loader!sass-loader'},
            {
                test: /\.jsx?$/,
                exclude: /(node_modules)/,
                loaders: ['babel-loader']
            }
        ]
    }
}
