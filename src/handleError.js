/**
 * Created by cu7ious on 3/16/17.
 */
module.exports = function handleError (code, text, response) {
  response.statusCode = code
  response.end(`${code} ${text}`)
}
