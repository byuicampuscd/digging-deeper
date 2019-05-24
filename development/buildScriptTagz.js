// const fs = require("fs");
// var cssFiles = ["https://content.byui.edu/integ/gen/7a262da4-897d-47fc-a0ac-4b07a1f1e964/0/diggingDeeper.css", "https://cdn.rawgit.com/noelboss/featherlight/1.6.1/release/featherlight.min.css", "https://cdn.rawgit.com/noelboss/featherlight/1.6.1/release/featherlight.gallery.min.css"],
//     jsFiles = ["https://ajax.googleapis.com/ajax/libs/jquery/3.1.1/jquery.min.js", "https://cdn.rawgit.com/noelboss/featherlight/1.6.1/release/featherlight.min.js", "https://cdn.rawgit.com/noelboss/featherlight/1.6.1/release/featherlight.gallery.min.js"];

// fs.writeFile("./cssTagz.html", cssFiles.map(a => `<link rel="stylesheet" type="text/css" href="${a}"/>`).reduce(function (acc, tag) {
//     acc += `${tag}\n`;
//     return acc;
// }, ""), function (err) {
//     console.error(err);
//     console.log("done")
// });

// fs.writeFile("./jsTagz.html", jsFiles.map(a => `<script type="text/javascript" src="${a}"></script>`).reduce(function (acc, tag) {
//     acc += `${tag}\n`;
//     return acc;
// }, ""), function (err) {
//     console.error(err);
//     console.log("done")
// });

/*
 * Takes the inputed seconds and exports it into the HHMMSS format
 * the format parameter accepts the following:
 * input : outputed time format
 * HHMMSS -> 00:00:00
 * MMSS -> 00:00
 * SS -> 00
 */
function splitHHMMSS(seconds, format) {
    if (!format) format = "HH:MM:SS";
    var formatIndex = {
        "HHMMSS": 2,
        "MMSS": 1,
        "SS": 0
    }
    var timeItems = [];
    /*
     * Converts seconds to an HH:MM:SS string
     */
    for (var i = formatIndex[format]; i >= 0; i--) {
        // determines the scale to reduce it by (3600 sorts hours, 60 minuets, 1 seconds)
        var scale = (Math.pow(60, i));
        // gets the remainder off so we can have a clean divide
        var remainder = seconds % scale;
        // devides it by the scale to find the respective hours, minuets, or seconds
        var timeFragment = (seconds - remainder) / scale;
        // removes the time segment off so we can keep reducing it.
        seconds -= timeFragment * scale;
        timeItems.push(timeFragment);
    }
    // adds the colons to separate hours minuets and seonds.
    return timeItems.map(a => convertIntToXBitString(a, 2)).reduce(function (acc, item, index) {
        return (index != 0) ? acc + ':' + item : item;
    }, "");

    /*
     * Appends floating 0s to the beginning of a number
     * number - number to add 0s to
     * bits - how big the number should be bit wise 
     * (ex: if you were to pass in 5 as the number and 3 as the bits it would return "005")
     * (ex2: if you were to pass in 2 as the number and 1 as the bits it would return "01" )
     */
    function convertIntToXBitString(number, bits) {
        var newNumber = (typeof number !== "string") ? number.toString() : number;
        var str = "";
        for (var i = 0; i < bits - newNumber.length; i++)
            str += "0";
        return str + newNumber;
    }
}

var seconds = 9;
console.log(`${splitHHMMSS(seconds, "SS")}`);