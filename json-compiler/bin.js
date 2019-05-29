/************************************************************************* 
 * Libraries / Requires / Constants
 *************************************************************************/
const JSON_COMPILER = require('./compile.js');
const [fs] = [require("fs")];

/************************************************************************* 
 * Input Function
 * If it is complicated, consider move it to a seperate file.
 *************************************************************************/
function getInput(callback) {
    var input = Array.from(process.argv).slice(2);
    callback(null, input);
    return;
}

/************************************************************************* 
 * Output Function
 * If it is complicated, consider move it to a seperate file.
 *************************************************************************/
function makeOutput(data, callback) {
    // How to output data, eg. to csv, to json, to console, etc.
    // call the callback only if there is an error
    callback(null);
    return;
}

/************************************************************************* 
 * Handle Error Function
 * If it is complicated, consider moving it to a seperate file.
 *************************************************************************/
function errorHandling(error) {
    console.error(error.length);
    return;
}

function getJsonData(path, callback) {
    fs.readFile(path, "utf8", function (err, jsonFile) {
        if (err) callback(err);
        var jsonData = JSON.parse(jsonFile);
        callback(null, jsonData);
    });
}

function writeToJsonFile(path, data, callback) {
    fs.writeFileSync(path, JSON.stringify(data), function (err) {
        if (err) callback(err);
        callback();
    });
}


function splitJSONData(pathOfJsonFile, pathOfOutputs) {
    getJsonData(pathOfJsonFile, (parseError, jsonData) => {
        if (parseError) errorHandling(parseError);
        JSON_COMPILER.splitJSONFile(jsonData, (splitError, jsonFiles) => {
            if (splitError) errorHandling(splitError);
            jsonFiles.forEach((fileData) => writeToJsonFile(pathOfOutputs + "/" + fileData[0], fileData[1], () => {}))
        });

    });
}


/************************************************************************* 
 * Start
 *************************************************************************/
// call input
getInput(function (errInput, inputData) {
    if (errInput) {
        errorHandling(errInput);
        return;
    }

    const opperations = {
        split: function () {
            splitJSONData(inputData[1], inputData[2]);
        }
    }

    opperations[inputData[0]]();


});