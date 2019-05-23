const compressor = require('node-minify');
const https = require("https");
const base64Img = require('base64-img');
const async = require('async');
const fs = require("fs");

function grabAndCompressImages(links, callback) {
    base64Img.requestBase64(links[1], (err, res, dataString) => {
        if (err) {
            callback(err);
            return;
        }
        callback(null, dataString);
    });
}

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
                    placeholder[i + "-" + a.week + "-" + index] = b.imageURL;
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

(function () {
    var jsonFile = "./digging-deeper-video-data.json";
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

                    function getIndexOfSubobject(object, subkey, vaulez) {
                        for (var i in object) {
                            //console.log(object[i][subkey], vaulez);
                            if (object[i][subkey] === vaulez)
                                return i;
                        }
                        return -1;
                    }
                    //console.log(getIndexOfSubobject(data.old[imgLoc[0]], "week", imgLoc[1]));
                    var index = getIndexOfSubobject(data.old[imgLoc[0]]);
                    data.old[imgLoc[0]][index].videos[imgLoc[2]].imageURL = item[1];
                    //console.log(data.old[imgLoc[0]][index].videos[imgLoc[2]].imageURL);
                });

                fs.writeFile("./new.json", JSON.stringify(data.old), function () {
                    console.log("Riab Roy Boss!");
                });

            });
        });
    });
})();