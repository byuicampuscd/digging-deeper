const compressor = require('node-minify');
const https = require("https");
const base64Img = require('base64-img');
const async = require('async');
const fs = require("fs");

console = (function () {
    "use strict";
    //Grabs console for Web or Node
    var CONSOLE = console.prototype || console;

    /*
     Prints a star border around the specified text.
     There is an 80 character limit per line before it wraps.
     */
    function flag() {
        var me = this;
        var args = Array.prototype.slice.call(arguments);
        args.map(function (arg) {
            arg = arg.toString();
            var message = "";
            var length = ((arg.length < 80) ? arg.length : 80) + 4;
            for (var i = 0; i < length; i++) message += "*";
            var sections = arg.match(/.{1,80}/g);
            sections.map(function (section) {
                message += "\n*";
                var minlen = (length - section.length) - 2;
                for (var i = 0; i < minlen / 2; i++) message += " ";
                message += section;
                for (var i = 0; i < (minlen / 2) - minlen % 2; i++) message += " ";
                message += "*";
            });
            message += "\n";
            for (var i = 0; i < length; i++) message += "*";
            me.log(message);
        });
    }
    CONSOLE.flag = flag;
    return CONSOLE;
}());



function mergeObjects(acc, object) {
    for (var i in object)
        acc[i] = object[i];
    return acc;
}

function grabLinksFromJson(filePath, cb) {
    fs.readFile(filePath, function (err, data) {
        if (err) cb(err);
        var originalJSON = JSON.parse(data);
        var json = JSON.parse(data);
        var files = {}
        for (var i in json)
            json[i] = json[i].map((a) => {
                return a.videos.map(function (b, index) {
                    var placeholder = {};
                    placeholder[i + "-" + a.Module + "-" + index] = b.imageURL;
                    return placeholder;
                }).reduce(mergeObjects, {});
            }).reduce(mergeObjects, {});

        var merger = {};
        for (var i in json)
            json = mergeObjects(merger, json[i]);
        var arrayObject = [];
        for (var i in json)
            arrayObject.push([i, json[i]]);
        json = arrayObject;
        cb(null, {
            old: originalJSON,
            new: json
        });
    });
}

const download = require('image-downloader')

function downloadImages(IMG, callback) {
    //console.log(IMG);

    // Download to a directory and save with the original filename
    const options = {
        url: IMG[1],
        dest: 'imagez' // Save to /path/to/dest/image.jpg
    }

    download.image(options)
        .then(({
            filename,
            image
        }) => {
            //console.log('File saved to', filename)
            callback(null, [IMG[0], filename]);
        })
        .catch((err) => {
            callback(err);
        })
}


function replaceImagesInJson(json, imageData) {

};

function base64EncodeJsonImages() {
    var jsonFile = "./digging-deeper-video-data-2.json";
    grabLinksFromJson(jsonFile, function (err, data) {
        if (err) console.error(err);
        //console.log(data.new);
        async.map(data.new, function (a, callback) {
            downloadImages(a, callback);
        }, function (err, urlImages) {
            if (err) console.error(err);
            async.map(urlImages, function (image, callback) {
                base64Img.base64(image[1], function (err, data) {
                    if (err) {
                        callback(err);
                        return;
                    }
                    image[1] = data;
                    callback(null, image);
                });
            }, function (er, base64ImagePairs) {
                if (er) console.error(er);
                base64ImagePairs.forEach(function (item, index) {
                    var imgLoc = (item[0].split("-"));

                    //console.log(getIndexOfSubobject(data.old[imgLoc[0]], "week", imgLoc[1]));
                    try {

                        var moduleIndex = (imgLoc[1]);
                        console.log(data.old[imgLoc[0]][parseInt(moduleIndex) - 1].videos[imgLoc[2]].imageURL);
                        data.old[imgLoc[0]][parseInt(moduleIndex) - 1].videos[imgLoc[2]].imageURL = item[1];
                        //console.log(data.old[imgLoc[0]][index].videos[imgLoc[2]].imageURL);
                    } catch (e) {
                        console.flag("Could Not Process Image For Item:\n" + item[0]);
                    }
                });

                fs.writeFile("./new.json", JSON.stringify(data.old), function () {
                    console.log("Riab Roy Boss!");
                });

            });
        });
    });
}

function condenseScripts() {
    // Using Google Closure Compiler
    compressor.minify({
        compressor: 'uglifyjs',
        input: 'digging-deeper-renderer.js',
        output: '../production/digging-deeper-renderer-min.js',
        callback: function (err, min) {
            console.log(min);
        }
    });

    // compressor.minify({
    //     compressor: "html-minifier",
    //     input: 'iframe.html',
    //     output: '../production/iframe-min.html',
    //     options: {
    //         minifyJS: true,
    //         minifyCSS: true
    //     }
    // }).then(function (min) {
    //     console.log('html min');
    //     console.log(min);
    // });

    // // Using UglifyJS with wildcards
    // compressor.minify({
    //     compressor: 'uglifyjs',
    //     input: './**/*.js',
    //     output: 'bar.js',
    //     callback: function (err, min) {}
    // });

    // // With Promise
    // var promise = compressor.minify({
    //     compressor: 'uglifyjs',
    //     input: './**/*.js',
    //     output: 'bar.js'
    // });

    // promise.then(function (min) {});

}
condenseScripts();