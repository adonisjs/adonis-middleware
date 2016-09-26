'use strict'

/**
 * adonis-middleware
 * Copyright(c) 2015-2016 Harminder Virk
 * MIT Licensed
*/

class Cors {

  constructor (Config) {
    this.origin = Config.get('cors.origin', false)
    this.methods = Config.get('cors.methods', ['GET', 'POST', 'PUT'])
    this.headers = Config.get('cors.headers', false)
    this.credentials = Config.get('cors.credentials', false)
    this.exposeHeaders = Config.get('cors.exposeHeaders', false)
    this.maxAge = Config.get('cors.maxAge', false)
  }

  /**
   * @description returns origin to be allowed for CORS request. It is
   * calculated fron cors.origin field inside config file.
   * @method _getOrigin
   * @param  {String}   origin
   * @return {Mixed}
   * @public
   */
  _getOrigin (origin) {
    if (typeof (this.origin) === 'function') {
      this.origin = this.origin(origin)
    }
    if (this.origin === true) {
      return origin
    }
    return this.origin
  }

  /**
   * @description returns headers to be allowed on cors request based
   * upon input from cors.headers inside config file
   * @method _getHeaders
   * @param  {String}    headers
   * @return {Mixed}
   * @public
   */
  _getHeaders (headers) {
    if (typeof (this.headers) === 'function') {
      this.headers = this.headers(headers)
    }
    if (this.headers === true) {
      return headers
    }
    return this.headers
  }

  /**
   * @description middleware handler to allow/disallow preflight requests
   * based upon defined configuration for cors.
   * @method handle
   * @param  {Object}   request
   * @param  {Object}   response
   * @param  {Function} next
   * @return {void}
   * @public
   */
  * handle (request, response, next) {
    /**
     * required headers to be defined on every request
     */
    response.header('Access-Control-Allow-Origin', this._getOrigin(request.header('origin')))
    response.header('Access-Control-Allow-Credentials', this.credentials)

    /**
     * setting up exposed headers if defined
     */
    if (this.exposeHeaders) {
      response.header('Access-Control-Expose-Headers', this.exposeHeaders)
    }

    /**
     * if request is not for OPTIONS yield next. Otherwise set
     * CORS headers.
     */
    if (request.method() !== 'OPTIONS') {
      yield next
      return
    }

    response.header('Access-Control-Allow-Methods', this.methods)

    /**
     * setting up cors headers only if they are not set to false.
     */
    const corsHeaders = this._getHeaders(request.header('access-control-request-headers'))
    if (corsHeaders) {
      response.header('Access-Control-Allow-Headers', corsHeaders)
    }

    /**
     * setting up max age if defined
     */
    if (this.maxAge) {
      response.header('Access-Control-Allow-Max-Age', this.maxAge)
    }
    response.status(204).send()
  }

}

module.exports = Cors
