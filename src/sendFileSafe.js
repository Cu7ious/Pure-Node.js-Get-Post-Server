const fs = require('fs')
const path = require('path')
const mime = require('mime')

const handleError = require('./handleError')

module.exports = function sendFileSafe (folder, pathname, response) {
  let filePath = pathname

  try {
    filePath = decodeURIComponent(pathname)
  } catch (e) {
    console.log(e)
    handleError(400, 'Bad Request', response)
    return
  }

  if (~filePath.indexOf('\0')
    || filePath.indexOf('..') !== -1
  ) {
    handleError(400, 'Bad Request', response)
    return
  }

  filePath = path.normalize(path.join(folder, filePath))

  const readSteram = fs.createReadStream(filePath)

  readSteram.once('data', () => {
    const mimeType = mime.lookup(filePath)
    response.setHeader('Content-type', mimeType + '; charset=utf-8')
  })

  readSteram
    .on('data', chunk => {
      response.write(chunk)
    })
    .on('error', err => {
      if (err.code === 'ENOENT') {
        handleError(404, 'Not Found', response)
      } else if (err.code === 'EACCES') {
        handleError(403, 'Forbidden', response)
      }
    })
    .on('end', () => {
      response.statusCode = 200
      response.end()
    })
    .on('close', () => {
      readSteram.destroy()
    })
}
