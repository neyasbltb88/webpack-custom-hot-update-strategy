const path = require('path');

const CustomHotUpdateStrategy = require('./index');
const strategies = require('./strategies');

const NODE_ENV = process.env.NODE_ENV || 'development';

module.exports = {
    mode: NODE_ENV,
    watch: NODE_ENV === 'development',
    devtool: NODE_ENV === 'development' ? 'inline-source-map' : false,
    context: path.resolve(__dirname, './src-example'),
    entry: {
        index: './index'
    },
    output: {
        path: path.resolve(__dirname, './dist-example'),
        filename: '[name].js'
    },
    devServer: {
        hot: NODE_ENV === 'development',
        contentBase: path.join(__dirname, './dist-example'),
        port: 3000,
        open: true
    },
    plugins: [
        new CustomHotUpdateStrategy({
            update: strategies.update.hotDownloadUpdateChunkFetchEval,
            manifest: strategies.manifest.hotDownloadManifest
        })
    ]
};
