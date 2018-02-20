'use strict'

class TrimStrings {
  * handle (request, response, next) {
    /**
     * yield to next middleware if request body is empty
     */
    if (Object.keys(request.body).length === 0) {
      yield next
      return
    }

    request.body = Object.assign(
      ...Object.keys(request.body).map(key => ({
        [key]: request.body[key].trim()
      }))
    )

    yield next
  }
}

module.exports = TrimStrings
