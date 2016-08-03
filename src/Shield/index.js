'use strict'

/**
 * adonis-middleware
 * Copyright(c) 2016-2016 Harminder Virk
 * MIT Licensed
*/

const guard = use('node-guard')
const csp = use('node-csp')
const uuid = use('node-uuid')
const Csrf = use('csrf')
const url = use('url')

class Shield {

  constructor (Config, View) {
    this.view = View
    this.csrf = new Csrf()
    this.shieldConfig = Config.get('shield')
    this.shieldConfig.csp.nonce = uuid.v4()
  }

  /**
   * @description key to be used for saving csrf
   * secret inside session
   * @method sessionKey
   * @return {String}
   */
  get sessionKey () {
    return 'csrf-secret'
  }

  /**
   * @description sets up csp header to be used
   * @method _setupCsp
   * @param  {Object}  request
   * @param  {Object}  response
   * @return {void}
   * @private
   */
  _setupCsp (request, response) {
    const cspValues = csp.build(request.request, this.shieldConfig.csp)
    let metaTags = []

    /**
     * adding request helper method to return
     * nonce value for this request
     * @method
     * @return {String}
     */
    request.nonce = () => {
      return this.shieldConfig.csp.nonce
    }

    /**
     * @description adding headers and setting up csp string
     * to be used inside views
     */
    Object.keys(cspValues).forEach((key) => {
      response.header(key, cspValues[key])
      metaTags.push(`<meta http-equiv="${key}" content="${cspValues[key]}">`)
    })

    /**
     * @description view global variable to return csp string
     * as meta tags.
     */
    this.view.global('cspMeta', this.view.viewsEnv.filters.safe(metaTags.join('\n')))

    /**
     * @description nonce value to be used under view
     */
    this.view.global('cspNonce', request.nonce())
  }

  /**
   * @description adds bunch of security headers like a breeze
   * @method _setupGuard
   * @param  {Object}    request
   * @param  {Object}    response
   * @return {void}
   * @public
   */
  _setupGuard (request, response) {
    guard.addFrameOptions(response.response, this.shieldConfig.xframe)
    guard.addXssFilter(request.request, response.response, this.shieldConfig.xss)
    guard.addNoSniff(response.response, this.shieldConfig.nosniff)
    guard.addNoOpen(response.response, this.shieldConfig.noopen)
  }

  /**
   * @description sets up csrf secret, token, request
   * and view helpers to be manage csrf inside the
   * application
   * @method _setupCsrf
   * @param  {Object}   request
   * @param  {Object}   response
   * @param  {String}   csrfSecret
   * @return {void}
   * @public
   */
  * _setupCsrf (request, response, csrfSecret) {
    /**
     * generates a new csrf secret to be used while
     * verifying tokens
     */
    if (!csrfSecret) {
      csrfSecret = yield this.csrf.secret()
    }

    /**
     * adding secret to session to be used for verification
     */
    yield request.session.put(this.sessionKey, csrfSecret)

    /**
     * generating new token to be used as csrfToken
     * @type {String}
     */
    const csrfToken = this.csrf.create(csrfSecret)

    /**
     * adding token to the cookie to be used by
     * JS frameworks like Angular
     */
    response.cookie('XSRF-TOKEN', csrfToken)

    /**
     * creating request helper to be used under
     * request controllers
     */
    request.csrfToken = function () {
      return csrfToken
    }

    /**
     * adding a new global to return the csrf token
     */
    this.view.global('csrfToken', csrfToken)

    /**
     * adding a view global to output the html field
     */
    this.view.global('csrfField', this.view.viewsEnv.filters.safe(`<input type="hidden" name="_csrf" value="${csrfToken}">`))
  }

  /**
   * @description validates the request with csrf token and
   * secret and throws an error if they does not match
   * @method _validateCsrf
   * @param  {Object}      request
   * @param  {String}      csrfSecret
   * @return {void}
   * @public
   */
  _validateCsrf (request, csrfSecret) {
    /**
     * @description throw error when unable to find csrf secret
     */
    if (!csrfSecret) {
      const error = new Error('csrf secret missing')
      error.status = 403
      error.code = 'EBADCSRFTOKEN'
      throw error
    }

    /**
     * if host and origin should be matched then make sure
     * token is not sent by a 3rd party website
     */
    if (this.shieldConfig.csrf.compareHostAndOrigin) {
      const host = request.hostname()
      const requestOrigin = request.header('origin') || request.header('referer')
      const originHost = requestOrigin ? url.parse(requestOrigin).hostname : null
      if (!originHost || host !== originHost) {
        const error = new Error('host and origin mis-match')
        error.status = 403
        error.code = 'EBADCSRFTOKEN'
        throw error
      }
    }

    /**
     * reading csrf token from all possible sources
     * @type {String}
     */
    const csrfToken = request.input('_csrf') ||
    request.header('csrf-token') ||
    request.header('x-csrf-token') ||
    request.header('x-xsrf-token')

    /**
     * @description throw error when unable to verify csrf token
     */
    if (!this.csrf.verify(csrfSecret, csrfToken)) {
      const error = new Error('csrf token mismatch')
      error.status = 403
      error.code = 'EBADCSRFTOKEN'
      throw error
    }
  }

  /**
   * @description tells whether the request current uri is in
   * filterUris list or not
   * @method _isFiltered
   * @param  {Object}    request
   * @param  {Array}    filterUris
   * @return {Boolean}
   * @private
   */
  _isFiltered (request, filterUris) {
    if (filterUris.length) {
      return request.match(filterUris)
    }
    return false
  }

  /**
   * @description middleware handle method to setup all security
   * headers and setup Csrf token too
   * @method handle
   * @param  {Object}   request
   * @param  {Object}   response
   * @param  {Function} next
   * @return {Function}
   * @public
   */
  * handle (request, response, next) {
    const enable = this.shieldConfig.csrf.enable
    const methods = this.shieldConfig.csrf.methods
    const filterUris = this.shieldConfig.csrf.filterUris
    const requestMethod = request.method()
    this._setupCsp(request, response)
    this._setupGuard(request, response)

    /**
     * yield to next middleware if csrf is disabled
     */
    if (!enable) {
      yield next
      return
    }

    const csrfSecret = yield request.session.get(this.sessionKey)
    if (methods.indexOf(requestMethod) > -1 && !this._isFiltered(request, filterUris)) {
      this._validateCsrf(request, csrfSecret)
    }
    yield this._setupCsrf(request, response, csrfSecret)
    yield next
  }

}

module.exports = Shield
