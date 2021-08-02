/*
Windows 96 PackMan repository server.

Copyright (C) Windows 96 Team (windows96.net) 2021.
*/

const compiledRegexes = {};

/**
 * Processes a HTML template.
 * @param {String} html The HTML to process.
 * @param {*} vsub A key-value pair of variables to substitute.
 */
function process(html, vsub = {}) {
    if((!html) || (typeof html !== 'string'))
        throw new Error("Invalid HTML.");

    if(typeof vsub !== 'object')
        throw new Error("`vsub` must be an object.");

    let newHtml = html;
    const objectKeys = Object.keys(vsub);
    
    for(let objKey of objectKeys) {
        /** @type {RegExp} */
        let regExp = compiledRegexes[objKey];

        if(!regExp) {
            compiledRegexes[objKey] = new RegExp(`\\%${objKey}\\%`, "g");
            regExp = compiledRegexes[objKey];
        }
        
        newHtml = newHtml.replace(regExp, vsub[objKey]);
    }

    return newHtml;
}

module.exports = {
    process
}