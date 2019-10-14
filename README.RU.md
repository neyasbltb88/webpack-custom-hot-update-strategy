# Webpack Custom Hot Update Strategy

Плагин Webpack, позволяющий изменять стратегию получения функцией [Hot Module Replacement](https://webpack.js.org/guides/hot-module-replacement/) обновленных модулей при включенной настройке `hot: true`.

## Подключение плагина

`npm install --save-dev webpack-custom-hot-update-strategy`

В файле конфигурации [webpack.config.js](./webpack.config.js):

```js
const CustomHotUpdateStrategy = require('webpack-custom-hot-update-strategy');

module.exports = {
    // ... Другие настройки Webpack

    devServer: {
        // ... Другие настройки Webpack Dev Server

        hot: true
    },
    plugins: [
        // ... Другие плагины Webpack

        new CustomHotUpdateStrategy()
    ]
};
```

## Настройка плагина

Плагин может принимать в качестве аргумента объект с ключами `update` и `manifest`:

```js
new CustomHotUpdateStrategy({
    manifest: require('./путь_к_реализации'),
    update: require('./путь_к_реализации')
});
```

Плагин содержит несколько вариантов реализации этих функций:

-   `manifest`: require _шаблона_ функции, которая загружает манифест обновления модуля `[publicPath][hash].hot-update.json`.

    -   [hotDownloadManifest](./strategies/manifest/hotDownloadManifest.js):

        ```js
        require('webpack-custom-hot-update-strategy/strategies/manifest/hotDownloadManifest');
        ```

        **_Применяется по умолчанию_**, если не задан ключ `manifest`. Эта функция соответствует родной функции `Hot Module Replacement`.

-   `update`: require _шаблона_ функции, которая принимает `chunkId`, на его основе составляет путь к файлу (`[publicPath][chunkId].[hash].hot-update.js`) с обновленным модулем и добавляет скрипт модуля на страницу.

    -   [hotDownloadUpdateChunk](./strategies/update/hotDownloadUpdateChunk.js):

        ```js
        require('webpack-custom-hot-update-strategy/strategies/update/hotDownloadUpdateChunk');
        ```

        **_Применяется по умолчанию_**, если не задан ключ `update`. Эта функция соответствует родной функции `Hot Module Replacement`: составляет путь до обновившегося модуля, создает новый тег `<script>`, указывает путь в качестве `src`и добавляет тег в `head` страницы.

    -   [hotDownloadUpdateChunkFetch](./strategies/update/hotDownloadUpdateChunkFetch.js):

        ```js
        require('webpack-custom-hot-update-strategy/strategies/update/hotDownloadUpdateChunkFetch');
        ```

        Составляет путь до обновившегося модуля, делает запрос на него с помощью `fetch`, создает новый тег `<script>`, вставляет в него контент, полученный из запроса и добавляет тег в `head` страницы.

    -   [hotDownloadUpdateChunkFetchEval](./strategies/update/hotDownloadUpdateChunkFetchEval.js):

        ```js
        require('webpack-custom-hot-update-strategy/strategies/update/hotDownloadUpdateChunkFetchEval');
        ```

        Составляет путь до обновившегося модуля, делает запрос на него с помощью `fetch`, и выполняет контент, полученный из запроса через функцию `eval()`.

## Написание собственной реализации

Чтобы написать собственную реализацию этих функций, необходимо придерживаться некоторых правил, по которым шаблон будет преобразован в рабочую функцию, которая попадет в обертку модуля.

-   Обертка функции:

    Модуль должен оборачивать рабочие функции в анонимную, которую возвращает

    ```js
    module.exports = function() {
        // Реализация рабочей функции
    };
    ```

-   Имена главных функций и их аргументов должны быть строго определенными.

    -   `manifest`:

        ```js
        module.exports = function() {
            function hotDownloadManifest(requestTimeout) {
                // Реализация рабочей функции
            }
        };
        ```

    -   `update`:
        ```js
        module.exports = function() {
            function hotDownloadUpdateChunk(chunkId) {
                // Реализация рабочей функции
            }
        };
        ```

-   Так как многие значения, используемые в этих функциях, являются настраиваемыми, в шаблоне необходимо заменять их на специальные `$выражения$`, которые будут заменены на нужные значения уже на этапе компиляции.

Список специальных выражений:

-   `$require$` -> [`__webpack_require__`](https://webpack.js.org/api/module-variables/#__webpack_require__-webpack-specific)

-   `$crossOriginLoading$` -> [`output.crossOriginLoading`](https://webpack.js.org/configuration/output/#outputcrossoriginloading)

-   `$hotMainFilename$` -> [`output.hotUpdateMainFilename`](https://webpack.js.org/configuration/output/#outputhotupdatemainfilename)

-   `$hotChunkFilename$` -> [`output.hotUpdateChunkFilename`](https://webpack.js.org/configuration/output/#outputhotupdatechunkfilename)

-   `$hash$` -> Текущий hash модуля

С учетом всего вышесказанного, шаблон стандартной функции для `update` будет выглядеть следующим образом:

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
