# Webpack Custom Hot Update Strategy

Документация на [русском](./README.RU.md)

Webpack plugin that allows you to change the strategy for [Hot Module Replacement](https://webpack.js.org/guides/hot-module-replacement/) to receive updated modules when `hot: true` is enabled.

## Installation

`npm install --save-dev webpack-custom-hot-update-strategy`

In Webpack config file [webpack.config.js](./webpack.config.js):

```js
const CustomHotUpdateStrategy = require('webpack-custom-hot-update-strategy');

module.exports = {
    // ... Other Webpack config

    devServer: {
        // ... Other Webpack Dev Server config

        hot: true
    },
    plugins: [
        // ... Other Webpack plugins

        new CustomHotUpdateStrategy()
    ]
};
```

## Configuration

A plugin can take an object with keys `update` and `manifest` as an argument:

```js
new CustomHotUpdateStrategy({
    manifest: require('./path_to_implementation'),
    update: require('./path_to_implementation')
});
```

This plugin contains several options for implementing these functions:

-   `manifest`: require a function _template_ that loads the module update manifest `[publicPath][hash].hot-update.json`.

    -   [hotDownloadManifest](./strategies/manifest/hotDownloadManifest.js):

        ```js
        require('webpack-custom-hot-update-strategy/strategies/manifest/hotDownloadManifest');
        ```

        **_Applies by default_**, if no key is specified `manifest`. This function corresponds to the native function `Hot Module Replacement`.

-   `update`: require a function _template_ which takes an argument `chunkId`, на его основе specifies the path to the file (`[publicPath][chunkId].[hash].hot-update.js`) and adds the module script to the page.

    -   [hotDownloadUpdateChunk](./strategies/update/hotDownloadUpdateChunk.js):

        ```js
        require('webpack-custom-hot-update-strategy/strategies/update/hotDownloadUpdateChunk');
        ```

        **_Applies by default_**, if no key is specified `update`. This function corresponds to the native function `Hot Module Replacement`: specifies the path to the updated module, creates a new tag `<script>`, assigns the path as `src` and append this tag in `head`.

    -   [hotDownloadUpdateChunkFetch](./strategies/update/hotDownloadUpdateChunkFetch.js):

        ```js
        require('webpack-custom-hot-update-strategy/strategies/update/hotDownloadUpdateChunkFetch');
        ```

        Specifies the path to the updated module, makes a request for it using `fetch`, creates a new tag `<script>`, inserts the content received from the query and append this tag in `head`.

    -   [hotDownloadUpdateChunkFetchEval](./strategies/update/hotDownloadUpdateChunkFetchEval.js):

        ```js
        require('webpack-custom-hot-update-strategy/strategies/update/hotDownloadUpdateChunkFetchEval');
        ```

        Specifies the path to the updated module, makes a request for it using `fetch`, and executes the content, retrieved from the query with `eval()`.

## Your own implementation

To write your own implementation of these functions, you need to follow some rules by which the template will be converted into a working function that will fall into the module wrapper.

-   Function wrapper:

    The module should wrap the working functions in an anonymous one, which it returns.

    ```js
    module.exports = function() {
        // Implementation of the working function
    };
    ```

-   The names of the main functions and their arguments must be strictly defined.

    -   `manifest`:

        ```js
        module.exports = function() {
            function hotDownloadManifest(requestTimeout) {
                // Implementation of the working function
            }
        };
        ```

    -   `update`:
        ```js
        module.exports = function() {
            function hotDownloadUpdateChunk(chunkId) {
                // Implementation of the working function
            }
        };
        ```

-   Since many of the values used in these functions are custom, you must replace them with special `$expressions$` in the template, which will be replaced with the desired values at compile time.

List of special expressions:

-   `$require$` -> [`__webpack_require__`](https://webpack.js.org/api/module-variables/#__webpack_require__-webpack-specific)

-   `$crossOriginLoading$` -> [`output.crossOriginLoading`](https://webpack.js.org/configuration/output/#outputcrossoriginloading)

-   `$hotMainFilename$` -> [`output.hotUpdateMainFilename`](https://webpack.js.org/configuration/output/#outputhotupdatemainfilename)

-   `$hotChunkFilename$` -> [`output.hotUpdateChunkFilename`](https://webpack.js.org/configuration/output/#outputhotupdatechunkfilename)

-   `$hash$` -> Current module hash

With all of the above in mind, the standard function template for `update` prop will look like this:

```js
module.exports = function() {
    function hotDownloadUpdateChunk(chunkId) {
        var script = document.createElement('script');
        script.charset = 'utf-8';
        script.src = $require$.p + $hotChunkFilename$;
        if ($crossOriginLoading$) script.crossOrigin = $crossOriginLoading$;
        document.head.appendChild(script);
    }
};
```
