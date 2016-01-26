'use strict'

/**
 * adonis-middleware
 * Copyright(c) 2015-2016 Harminder Virk
 * MIT Licensed
*/

const formidable = use('formidable')
const coBody = use('co-better-body')

class BodyParser {

  get contentTypes () {
    return {
      json: [
        'application/json',
        'application/json-patch+json',
        'application/vnd.api+json',
        'application/csp-report'
      ],
      form: [
        'application/x-www-form-urlencoded'
      ],
      multipart: [
        'multipart/form-data'
      ]
    }
  }

  /**
   * @description parser multipart form data
   * @method _multipart
   * @param  {Object}   request
   * @return {Oject}
   * @private
   */
  _multipart (request) {
    return new Promise(function (resolve, reject) {
      const form = new formidable.IncomingForm()
      form.parse(request.request, function (error, fields, files) {
        if (error) {
          return reject(error)
        }
        resolve({fields, files})
      })
    })
  }

  /**
   * @description parses request body to fetch post data and form
   * @method parse
   * uploads
   * @param  {Object}   form
   * @param  {Object}   request
   * @return {Object}
   * @private
  */
  * _parse (request) {
    let formBody = {
      fields: {},
      files: {}
    }
    if (request.is(this.contentTypes.json)) {
      formBody.fields = yield coBody.json(request.request)
    } else if (request.is(this.contentTypes.form)) {
      formBody.fields = yield coBody.form(request.request)
    } else if (request.is(this.contentTypes.multipart)) {
      formBody = yield this._multipart(request)
    }
    return formBody
  }

  /**
   * @description this method gets called by adonis
   * @method handle
   * middleware layer.
   * @param  {Object}   request
   * @param  {Object}   response
   * @param  {Function} next
   * @return {void}
   * @public
   */
  * handle (request, response, next) {
    let formFields = {
      files: {},
      fields: {}
    }
    if (request.hasBody()) {
      formFields = yield this._parse(request)
    }
    request.request._body = formFields.fields
    request._files = formFields.files
    yield next
  }
}

module.exports = BodyParser
