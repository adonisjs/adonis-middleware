'use strict'

/**
 * adonis-framework
 *
 * (c) Harminder Virk <virk@adonisjs.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
*/

const FlashMethods = require('./methods')

class Flash {

  constructor (View) {
    this.view = View
  }

  * handle (request, response, next) {
    request._flashMessages = {}
    /**
     * pulling flash messages from session, pull method will
     * remove the flash messages from session itself
     */
    const flashMessages = yield request.session.pull('flash_messages')
    request._flashMessages.getValues = flashMessages || {}

    request.old = FlashMethods.old
    request.with = FlashMethods.with
    request.withAll = FlashMethods.withAll
    request.withOnly = FlashMethods.withOnly
    request.without = FlashMethods.without
    request.withOut = FlashMethods.without
    request.andWith = FlashMethods.andWith
    request.flash = FlashMethods.flash

    /**
     * adding view global method to have access to old method from current
     * request
     */
    this.view.global('old', function (key, defaultValue) {
      return request.old(key, defaultValue)
    })

    /**
     * attach flashMessages global to the view to get the actual flash
     * object.
     */
    this.view.global('flashMessages', request._flashMessages.getValues)

    yield next
  }
}

module.exports = Flash
