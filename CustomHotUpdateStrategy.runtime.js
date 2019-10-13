/*globals hotAddUpdateChunk parentHotUpdateCallback document XMLHttpRequest $require$ $hotChunkFilename$ $hotMainFilename$ $crossOriginLoading$ */
module.exports = function() {
    // eslint-disable-next-line no-unused-vars
    function webpackHotUpdateCallback(chunkId, moreModules) {
        hotAddUpdateChunk(chunkId, moreModules);
        if (parentHotUpdateCallback) parentHotUpdateCallback(chunkId, moreModules);
    } //$semicolon

    // eslint-disable-next-line no-unused-vars
    // $hotDownloadUpdateChunk$

    // eslint-disable-next-line no-unused-vars
    // $hotDownloadManifest$
};
