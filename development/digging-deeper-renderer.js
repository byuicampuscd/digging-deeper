'use strict';
var videoDataFile = "./digging-deeper-video-data-2.json";
// const videoDataFile = "./new.json";
console.log(videoDataFile);
/*
 * This expects 2 queries from the url:
 * course - the course code for the course it is running from
 * module - what "week" you need to render the digging deeper videos for. This allows flexibility in the block courses. 
 * returns an object which has the query keys paired with their respective values passed into them.
 */
var moduleInfo = (window.location.search.slice(1).split("&").reduce(function (acc, query) {
    var keyValuePair = query.split("=");
    acc[keyValuePair[0]] = keyValuePair[1];
    return acc;
}, {}));

//defining variables at the top
var recievedDataFromQuery = (moduleInfo.course !== undefined && moduleInfo.module !== undefined),
    parentHref,
    urlChunks,
    pageUrl,
    course_module,
    course;
//if there were no queries passed through, assume that they are passing the information through the old method.

if (!recievedDataFromQuery) {
    // backwards compatibility
    parentHref = document.referrer;
    urlChunks = parentHref.split('/');
    pageUrl = urlChunks[urlChunks.length - 1].split('?')[0];
    course_module = parseInt(pageUrl[1] + pageUrl[2]) - 1;
    course = window.name;
} else {

    // implemented bugfix get the data straight through the query
    course = moduleInfo.course;
    course_module = moduleInfo.module;
}
// silly loading animation
var loading = true;
var loadingPhases = ["Loading", ".Loading.", "..Loading..", "...Loading...", "..Loading..", ".Loading."]
var phase = 0;

function loadAnimation() {
    if (loading)
        setTimeout(function () {
            $("#loadingSign").text(loadingPhases[phase]);
            phase = (phase >= loadingPhases.length) ? 0 : phase + 1;
            loadAnimation();
        }, 100);
}
loadAnimation();

// sets up the digging deeper object
(function (Course, Module) {
    'use strict';
    console.log(Course, Module);
    var size;

    function parseHHMMSS(seconds, format) {
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




    function allowFullscreen() {

        /*
         * This gets the videos start and end times. It then converts it from seconds into a more readable string
         * in the format Hours : Minuets : Seconds
         */
        var item = document.getElementsByTagName("iframe")[0];
        //gets the start time from the source

        function getStartEndTime(regex, defaultValue) {
            var duration = item.src.match(regex);
            console.log(typeof parseInt(duration), duration == NaN, duration);
            if (duration) {
                duration = parseInt(duration[1])
                var format = (duration < 3600) ? "MMSS" : "HHMMSS";
                duration = parseHHMMSS(duration, format);
            } else duration = defaultValue;

            return duration;
        }

        var start = getStartEndTime(/flashvars\[mediaProxy\.mediaPlayFrom\]=(\d+)/, "the beginning");
        var end = getStartEndTime(/flashvars\[mediaProxy\.mediaPlayTo\]=(\d+)/, "the end");



        item.setAttribute('allowFullScreen', '');
        item.setAttribute('webkitallowfullscreen', '');
        item.setAttribute('mozallowfullscreen', '');
        var defaultNotice = 'Note: Once you start the video, it will automatically bring you to the segment that you need to watch. The video will pause when the segment is finished playing. If the video does not function as described above, please start the video at ' + start + ' and you may close the video once you have reached ' + end + '. ';
        var notice = (start === "the beginning" && end === "the end") ? "Please watch the entire video." : defaultNotice;
        //creates the notice banner above the video
        if (!$("#videoLength").html()) {
            var div = $('<div>', {
                id: "videoLength"
            }).html(notice);
            $("div.featherlight-content").prepend(div);
        } else {
            $("#videoLength").html(notice);
        }
    }

    // dynamically add all of the video boxes
    function insertVideo(info) {
        $.featherlight.defaults.afterContent = allowFullscreen;

        var id = info.title.match(/[0-z]/g).join("").toLowerCase().match(/\d|\w/g).join("");

        var html = "";

        info.frameURL = info.frameURL.replace(/uiconf_id\/\d*\/partner_id/, 'uiconf_id/33020032/partner_id');

        if (info.frameURL.match(/kaltura|youtube/g)) {
            html = '<a id="' + id + '" class="internal" href="' + info.frameURL + '" data-featherlight="iframe" data-featherlight-variant="videoIframe">\n                    <p class="title">' + info.title + '</p>\n                </a>\n            ';
        } else {
            html = '<a id="' + id + '" class="external" href="' + info.frameURL + '" target="_blank"><p class="title">' + info.title + '</p>\n                </a>\n            ';
        }

        document.getElementById('flex-container').insertAdjacentHTML('beforeend', html);
        document.querySelector('#' + id).style.backgroundImage = 'url("' + info.imageURL + '")';
        document.querySelector('#' + id + ' p').style.fontSize = size;
        document.querySelector('#' + id + ' p').innerHTML = info.speaker + '<br><span class="sub">' + info.title + '</span>';
    }

    function build() {

        // get the video data JSON file data from the server
        $.getJSON(videoDataFile, function (data) {


            // when the video is ready to load, fade out of the loading screen.
            $("#videoFrameLoader").animate({
                opacity: 0
            }, 500, function () {
                //once the loading box is hidden, begin rendering the video boxes
                $("#videoFrameLoader").html('<div id="flex-container" data-featherlight-gallery data-featherlight-filter=".internal"></div>');

                // load the videos from the JSON data
                data[Course][parseInt(Module) - 1].videos.forEach(insertVideo);

                // Display the video boxes. It slowly fades in to buy some time for the image rendering.
                $(document).ready(function () {
                    loading = false;
                    setTimeout(function () {
                        $("#videoFrameLoader").animate({
                            opacity: 1
                        }, 500)
                    }, 500);
                });

            });
        });

    }
    $(document).ready(build);

})(course, course_module);