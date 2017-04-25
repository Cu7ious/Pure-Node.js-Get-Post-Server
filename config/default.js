const path = require('path')
const projectRoot = path.dirname(process.argv[1])

module.exports = {
  PORT: 3000,
  PROJECT_ROOT: path.join(projectRoot, 'src'),
  PUBLIC_ROOT: path.join(projectRoot, 'public'),
  FILES_ROOT: path.join(projectRoot, 'files'),
  FILENAME_WITH_EXT:  /[^\\]*\.(\w+)$/,
  FILESIZE_LIMIT: 10e6
}
