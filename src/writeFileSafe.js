const path = require('path')
const fs = require('fs')
const config = require(path.resolve('./config/default'))

const handleError = require('./handleError')
const sendFileSafe = require('./sendFileSafe')
const FILESIZE_LIMIT = config.FILESIZE_LIMIT

module.exports = function writeFileSafe (folder, pathname, request, response) {
  let filePath = pathname

  try {
    filePath = decodeURIComponent(pathname)
  } catch (e) {
    handleError(400, 'Bad Request', response)
    console.log(e)
    return
  }

  const writeStream = fs.createWriteStream(folder + filePath, {flags: 'wx'})
  let totalLength = 0

  request.on('data', chunk => {
    totalLength += chunk.length

    if (totalLength > FILESIZE_LIMIT) {
      response.setHeader('Connection', 'close')
      handleError(413, 'Payload Too Large', response)

      writeStream.destroy()
      fs.unlink(folder + filePath, err => {// eslint-disable-line
        /* ignore error */
      })
    }
  }).on('finish', () => {
    console.log(`${folder + filePath} was written`)
    sendFileSafe(folder, filePath, response)
  }).on('clientError', err => {
    console.log(err)
    writeStream.destroy()
    fs.unlink(folder + filePath, err => {// eslint-disable-line
      /* ignore error */
      console.log(err)
    })
  }).on('error', err => {
    writeStream.destroy()
    fs.unlink(folder + filePath, err => {// eslint-disable-line
      /* ignore error */
      console.log(err)
    })
  }).on('close', () => {
    writeStream.destroy()
    fs.unlink(folder + filePath, err => {// eslint-disable-line
      /* ignore error */
      console.log(err)
    })
  }).pipe(writeStream)

  writeStream.on('error', err => {
    if (err.code === 'EEXIST') {
      handleError(409, 'File exists', response)
    } else {
      console.error(err)
      if (!response.headersSent) {
        response.setHeader('Connection', 'close')
        handleError(500, 'Internal error', response)
      }
      response.end('')
      fs.unlink(filepath, err => {// eslint-disable-line
        /* ignore error */
      })
    }
  }).on('close', () => {
    // Note: can't use on('finish')
    // finish = data flushed, for zero files happens immediately,
    // even before 'file exists' check

    // for zero files the event sequence may be:
    //   finish -> error

    // we must use 'close' event to track if the file has really been written down
    sendFileSafe(folder, pathname, response)
  })

  request.on('close', () => {
    writeStream.destroy()
  })
}
