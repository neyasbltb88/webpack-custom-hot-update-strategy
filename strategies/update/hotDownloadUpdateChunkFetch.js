module.exports = function() {
    function hotDownloadUpdateChunk(chunkId) {
        let script = document.createElement('script');
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
            .then(scriptContent => {
                script.textContent = scriptContent;
                document.head.appendChild(script);
            });
    }
};
