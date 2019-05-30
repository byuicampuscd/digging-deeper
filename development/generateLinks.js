const fs = require("fs");
var links = [
    ["WEEK", "PAGE LINK, REPLACE TO REPLACE, REPLACEMENT LINK "]
];
for (var i = 2; i <= 14; i++) {
    var tmp = [`Week ${i}`];
    tmp.push(`https://byui.instructure.com/courses/17648/pages/w${(i < 10) ? "0"+i : i}-study-digging-deeper`);
    var activeLink = "https://content.byui.edu/integ/gen/7a262da4-897d-47fc-a0ac-4b07a1f1e964/0/digging-deeper-iframe.html";
    var testLink = "http://127.0.0.1:8080/production/iframe.html";
    var testing = false;
    var link = (!testing) ? activeLink : testLink;
    tmp.push(link);
    tmp.push(`${link.replace(".html", "-latest.html")}?course=122&module=${i-1}`);
    links.push(tmp);
}

fs.writeFile("./csvs/links122.csv", links.map(function (links) {
    return links.join(",");
}).join("\n"), (err) => {
    if (err)
        console.log(err);
});