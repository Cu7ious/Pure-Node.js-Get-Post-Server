const path = require('path')
const url = require('url')
const http = require('http')
const config = require(path.resolve('./config/default'))
const {
  PORT,
  PROJECT_ROOT,
  PUBLIC_ROOT,
  FILES_ROOT,
  FILENAME_WITH_EXT
} = config

const handleError = require(PROJECT_ROOT + '/handleError')
const sendFileSafe = require(PROJECT_ROOT + '/sendFileSafe')
const writeFileSafe = require(PROJECT_ROOT + '/writeFileSafe')

module.exports = http.createServer((req, res) => {

  const pathname = decodeURI(url.parse(req.url).pathname)
  const mimeType = req.headers['content-type']

  switch (req.method) {

    case 'GET':
      if (req.url === '/favicon.ico') {
        res.writeHead(200, {'Content-Type': 'image/x-icon'})
        res.end('')
        return
      }

      if (req.url === '/') {
        sendFileSafe(PUBLIC_ROOT, '/index.html', res)
        return
      }

      if (pathname.match(FILENAME_WITH_EXT)) {
        sendFileSafe(FILES_ROOT, pathname, res)
        return
      }

      handleError(400, 'Bad Request', res)
      return

    case 'POST':

      if (mimeType.indexOf('image') === -1) {
        handleError(415, 'Unsupported Media Type', res)
        return
      }

      writeFileSafe(FILES_ROOT, req.url, req, res)
      return

    default:
      handleError(502, 'Not implemented', res)
  }
}).listen(PORT, () => {
  console.log(`Server is listening on http://localhost:${PORT}`)
})
