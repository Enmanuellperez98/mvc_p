const {readFileSync} = require('fs');

/**
 * 
 * @param {string} extension 
 */
function mime(extension){
    let mimes = JSON.parse(readFileSync('./core/mime.json', 'utf8'));
    return mimes[extension] || 'text/plain';
}

module.exports = mime;