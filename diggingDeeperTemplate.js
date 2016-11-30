var diggingDeeper = (function () {
    'use strict';
    var currentScript = document.getElementById('diggingDeeperTemplate'),
        dataFile = currentScript.dataset.file,
        dataJs = document.createElement("script"),
        cssFiles = [
            "diggingDeeper.css",
            "https://cdn.rawgit.com/noelboss/featherlight/1.6.1/release/featherlight.min.css",
            "https://cdn.rawgit.com/noelboss/featherlight/1.6.1/release/featherlight.gallery.min.css"
        ],
        jsFiles = [
            dataFile,
            "https://ajax.googleapis.com/ajax/libs/jquery/3.1.1/jquery.min.js",
            "https://cdn.rawgit.com/noelboss/featherlight/1.6.1/release/featherlight.min.js",
            "https://cdn.rawgit.com/noelboss/featherlight/1.6.1/release/featherlight.gallery.min.js"
        ];
    
    console.log(currentScript.dataset);

    function injectCSS(url) {
        var linkTag = document.createElement('link');
        linkTag.rel = "stylesheet";
        linkTag.href = url;
        document.head.appendChild(linkTag);
    }

    function injectJS() {
        var scriptTag = document.createElement('script');
        scriptTag.src = jsFiles.shift();
        if (jsFiles.length > 0) {
            scriptTag.onload = injectJS;
        } else {
            scriptTag.onload = build;
        }
        document.body.appendChild(scriptTag);
    }

    function insertVideo(info) {
        var html =
            `<a href="${info.frameURL}" data-featherlight="iframe">
                <img src="${info.imageURL}" alt="">
                <p>${info.title}</p>
            </a>`;
        document.getElementById('flex-container').insertAdjacentHTML('beforeend', html);
    }

    function build() {
        var wrapper = '<div id="flex-container" data-featherlight-gallery data-featherlight-filter="a"></div>';
        currentScript.insertAdjacentHTML('afterend', wrapper);
        diggingDeeperVideos.forEach(insertVideo);
    }

    // Inject required files
    cssFiles.forEach(injectCSS);
    injectJS();

    
    return {
        build: build
    };
}());