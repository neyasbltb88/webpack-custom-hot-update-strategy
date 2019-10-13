const Template = require('webpack/lib/Template');
const RuntimeTemplate = Template.getFunctionContent(require('./CustomHotUpdateStrategy.runtime'));

class CustomHotUpdateStrategy {
    constructor({ update, manifest } = {}) {
        const updateFn = update ? update : require('./strategies/update/hotDownloadUpdateChunk');
        const updateFnTemplate = Template.getFunctionContent(updateFn);

        const manifestFn = manifest
            ? manifest
            : require('./strategies/manifest/hotDownloadManifest');
        const manifestFnTemplate = Template.getFunctionContent(manifestFn);

        this.runtimeSource = RuntimeTemplate.replace(
            /\/\/\s*\$hotDownloadUpdateChunk\$/g,
            updateFnTemplate
        ).replace(/\/\/\s*\$hotDownloadManifest\$/g, manifestFnTemplate);
    }

    makeCustomTemplateFn(mainTemplate) {
        // eslint-disable-next-line no-unused-vars
        return (source, chunk, hash) => {
            const globalObject = mainTemplate.outputOptions.globalObject;
            const hotUpdateChunkFilename = mainTemplate.outputOptions.hotUpdateChunkFilename;
            const hotUpdateMainFilename = mainTemplate.outputOptions.hotUpdateMainFilename;
            const crossOriginLoading = mainTemplate.outputOptions.crossOriginLoading;
            const hotUpdateFunction = mainTemplate.outputOptions.hotUpdateFunction;
            const currentHotUpdateChunkFilename = mainTemplate.getAssetPath(
                JSON.stringify(hotUpdateChunkFilename),
                {
                    hash: `" + ${mainTemplate.renderCurrentHashCode(hash)} + "`,
                    hashWithLength: length =>
                        `" + ${mainTemplate.renderCurrentHashCode(hash, length)} + "`,
                    chunk: {
                        id: '" + chunkId + "'
                    }
                }
            );
            const currentHotUpdateMainFilename = mainTemplate.getAssetPath(
                JSON.stringify(hotUpdateMainFilename),
                {
                    hash: `" + ${mainTemplate.renderCurrentHashCode(hash)} + "`,
                    hashWithLength: length =>
                        `" + ${mainTemplate.renderCurrentHashCode(hash, length)} + "`
                }
            );
            const runtimeSource = this.runtimeSource
                .replace(/\/\/\$semicolon/g, ';')
                .replace(/\$require\$/g, mainTemplate.requireFn)
                .replace(
                    /\$crossOriginLoading\$/g,
                    crossOriginLoading ? JSON.stringify(crossOriginLoading) : 'null'
                )
                .replace(/\$hotMainFilename\$/g, currentHotUpdateMainFilename)
                .replace(/\$hotChunkFilename\$/g, currentHotUpdateChunkFilename)
                .replace(/\$hash\$/g, JSON.stringify(hash));

            return `${source}
                function hotDisposeChunk(chunkId) {
                    delete installedChunks[chunkId];
                }
                var parentHotUpdateCallback = ${globalObject}[${JSON.stringify(hotUpdateFunction)}];
                ${globalObject}[${JSON.stringify(hotUpdateFunction)}] = ${runtimeSource}`;
        };
    }

    apply(compiler) {
        compiler.hooks.compilation.tap('CustomHotUpdateStrategy', compilation => {
            compilation.mainTemplate.hooks.hotBootstrap.intercept({
                register: tapInfo => {
                    if (tapInfo.name === 'JsonpMainTemplatePlugin') {
                        let newTap = {
                            name: 'CustomHotUpdateStrategy',
                            type: 'sync',
                            fn: this.makeCustomTemplateFn(compilation.mainTemplate)
                        };

                        return newTap;
                    }

                    return tapInfo;
                }
            });
        });
    }
}

module.exports = CustomHotUpdateStrategy;
