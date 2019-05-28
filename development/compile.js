const compressor = require('node-minify');
const base64Img = require('base64-img');
const download = require('image-downloader')
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


function downloadImages(imageURL, destination, callback) {

    // Download to a directory and save with the original filename
    const options = {
        url: imageURL,
        dest: destination // Save to /path/to/dest/image.jpg
    }

    download.image(options)
        .then(({
            filename,
            image
        }) => {

            callback(null, filename);
        })
        .catch((err) => {
            callback(err);
        })
}

function convertImageToBase64EncodedString(imagePath, callback) {
    base64Img.base64(imagePath, function (err, data) {
        if (err) {
            callback(err);
            return;
        }
        var image = data;
        callback(null, image);
    });
}


function replaceImagesInJson(json, imageData) {

};

function handleError(e) {
    console.error(e);
}


function getJsonData(path, callback) {
    fs.readFile(path, "utf8", function (err, jsonFile) {
        if (err) callback(e);
        var jsonData = JSON.parse(jsonFile);
        callback(null, jsonData);
    });
}

function getImageFromVideoObject(videoObject, downloadDestination, callback) {
    downloadImages(videoObject.imageURL, downloadDestination, (err, destination) => {
        console.log(videoObject.imageURL);
        if (err) callback(err);
        convertImageToBase64EncodedString(destination, (error, base64Data) => {
            if (error) callback(error);
            videoObject.imageURL = base64Data;
            callback(null, videoObject);
        })
    });

}


function writeToJsonFile(path, data, callback) {
    fs.writeFileSync(path, JSON.stringify(data), function (err) {
        if (err) callback(err);
        callback();
    });
}

function base64EncodeJsonImages() {
    var jsonFile = "./digging-deeper-video-data-2.json";
    var downloadDestination = "./imagez";
    getJsonData(jsonFile, (err, jsonVideoData) => {

        if (err) handleError(err);
        var courses = [];
        for (var course in jsonVideoData) {
            courses.push([jsonVideoData[course], course]);
        }
        async.map(courses, (course, courseDataCallback) => {
            async.map(course[0], (Module, moduleDataCallback) => {
                async.map(Module.videos, (videoObject, videoDataCallback) => {
                    getImageFromVideoObject(videoObject, downloadDestination, videoDataCallback);
                }, (error, videoData) => {
                    if (error) moduleDataCallback(err);
                    Module.videos = videoData;
                    moduleDataCallback(null, Module);
                });
            }, (err, modifiedCourseData) => {
                if (err) courseDataCallback(err);
                console.flag(modifiedCourseData.length);
                course[0] = modifiedCourseData;
                courseDataCallback(null, course);
            });
        }, function (errorMessage, courseData) {
            if (errorMessage) handleError(errorMessage);
            courseData.map(function (course) {
                jsonVideoData[course[1]] = course[0];
            });

            writeToJsonFile("./base64JSONTest.json", jsonVideoData, function (err) {
                if (err) handleError(err);
                console.flag("Finished Process");
            });


        });



    });

};

(function splitJSONFile() {
    var jsonFile = "./base64JSONTest.json";
    getJsonData(jsonFile, function (err, jsonData) {
        if (err) handleError(err);
        for (var course in jsonData) {
            writeToJsonFile(`./JSON Files/${course}VideoData.json`, jsonData[course], function (error) {
                if (error) handleError(error);
                console.flag("Complete!");
            });
        }
    })
})();

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