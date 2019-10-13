module.exports = function() {
    function hotDownloadUpdateChunk(chunkId) {
        var script = document.createElement('script');
        script.charset = 'utf-8';
        script.src = $require$.p + $hotChunkFilename$;
        if ($crossOriginLoading$) script.crossOrigin = $crossOriginLoading$;
        document.head.appendChild(script);
    }
};
