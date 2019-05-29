/* 
 * Splits the large JSON File into multiple smaller ones and places it in the specified destination
 */
function splitJSONFile(jsonData, mainCallback) {
    var fileData = [];
    for (var course in jsonData)
        fileData.push([`${course}VideoData.json`, jsonData[course]]);
    mainCallback(null, fileData);
}

module.exports = {
    splitJSONFile: splitJSONFile
};