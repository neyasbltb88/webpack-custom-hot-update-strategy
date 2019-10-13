module.exports = function() {
    var context = this;
    function evalCode(code, context) {
        return function() {
            return eval(code);
        }.call(context);
    }

    // eslint-disable-next-line no-unused-vars
    function hotDownloadUpdateChunk(chunkId) {
        let src = $require$.p + $hotChunkFilename$;
        let fetchParams = {};

        if ($crossOriginLoading$ && $crossOriginLoading$ === 'anonymous') {
            fetchParams.mode = 'no-cors';
        }

        if ($crossOriginLoading$ && $crossOriginLoading$ === 'use-credentials') {
            fetchParams.credentials = 'include';
        }

        fetch(src, fetchParams)
            .then(response => response.text())
            .then(scriptContent => evalCode(scriptContent, context));
    }
};
