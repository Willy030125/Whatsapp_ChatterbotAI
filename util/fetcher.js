const fetch = require('node-fetch');
const FormData = require('form-data');
const fs = require('fs');
const fileType = require('file-type');
const { fromBuffer } = require('file-type');
const readline = require('readline');
const Stream = require('stream');

/**
 *Fetch Json from Url
 *
 *@param {String} url
 *@param {Object} options
 */

const fetchJson = (url, options) =>
    new Promise((resolve, reject) =>
        fetch(url, options)
            .then(response => response.json())
            .then(json => resolve(json))
            .catch(err => {
                console.error(err)
                reject(err)
            })
    )

/**
 * Fetch Text from Url
 *
 * @param {String} url
 * @param {Object} options
 */

const fetchText = (url, options) => {
    return new Promise((resolve, reject) => {
        return fetch(url, options)
            .then(response => response.text())
            .then(text => resolve(text))
            .catch(err => {
                console.error(err)
                reject(err)
            })
    })
}

/**
 * Fetch base64 from url
 * @param {String} url
 */

const fetchBase64 = (url, mimetype) => {
    return new Promise((resolve, reject) => {
        console.log('Get base64 from:', url)
        return fetch(url)
            .then((res) => {
                const _mimetype = mimetype || res.headers.get('content-type')
                res.buffer()
                    .then((result) => resolve(`data:${_mimetype};base64,` + result.toString('base64')))
            })
            .catch((err) => {
                console.error(err)
                reject(err)
            })
    })
}

/**
 * Upload images to telegra.ph server.
 * @param {Buffer} buffData 
 * @param {string} fileName
 * @returns {Promise<string>}
 */
const uploadImages = (buffData, fileName) => {
    return new Promise(async (resolve, reject) => {
        const { ext } = await fileType(buffData)
        const filePath = `media/${fileName}.${ext}`
        fs.writeFile(filePath, buffData, { encoding: 'base64' }, (err) => {
            if (err) reject(err)
            console.log('Uploading image to telegra.ph server...')
            const fileData = fs.readFileSync(filePath)
            const form = new FormData()
            form.append('file', fileData, `${fileName}.${ext}`)
            fetch('https://telegra.ph/upload', {
                method: 'POST',
                body: form
            })
                .then((response) => response.json())
                .then((result) => {
                    if (result.error) reject(result.error)
                    resolve('https://telegra.ph' + result[0].src)
                })
                .then(() => fs.unlinkSync(filePath))
                .catch((err) => reject(err))
        })
    })
}
/**
 * Save mediabuffer to file
 * @param {Buffer} buffData 
 * @param {string} fileName
 * @returns {Promise<string>}
 */
const saveFile = (buffData, fileName) => {
    return new Promise(async (resolve, reject) => {
        const { ext } = await fileType(buffData)
        const filePath = `media/${fileName}.${ext}`
        fs.writeFile(filePath, buffData, (err) => {
            if (err) reject(err)
            console.log(`File with filename ${filePath} saved`)
            resolve(filePath)
        })
    })
}

/**
 * Get last line from file
 * @param {string} fileName 
 * @param {string} minLength
 * @returns {Promise<string>}
 */
const getLastLine = (fileName, minLength) => {
    let inStream = fs.createReadStream(fileName);
    let outStream = new Stream;
    return new Promise((resolve, reject)=> {
        let rl = readline.createInterface(inStream, outStream);

        let lastLine = '';
        rl.on('line', function (line) {
            if (line.length >= minLength) {
                lastLine = line;
            }
        });

        rl.on('error', reject)

        rl.on('close', function () {
            resolve(lastLine)
        });
    })
}


module.exports = {
    fetchJson,
    fetchText,
    fetchBase64,
    uploadImages,
    saveFile,
    getLastLine
}
