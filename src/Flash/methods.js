'use strict'

/**
 * adonis-framework
 *
 * (c) Harminder Virk <virk@adonisjs.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
*/

const _ = require('lodash')
const FlashMethods = exports = module.exports = {}

/**
 * takes everything from current request using
 * request.all and assign it to be used
 * for flash messages.
 *
 * @method withAll
 *
 * @return {Object} - Reference to this for chaining
 *
 * @example
 * yield request.withAll().flash()
 */
FlashMethods.withAll = function () {
  this._flashMessages.putValues = this.all()
  return this
}

/**
 * takes values of defined keys from current request using
 * request.only and assign it to be used with flash
 * messages.
 *
 * @method withOnly
 *
 * @param {Mixed} keys An array of keys or multiple parameters
 * @return {Object} - Reference to this for chaining
 *
 * @example
 * yield request.withOnly('name', 'email').flash()
 */
FlashMethods.withOnly = function () {
  this._flashMessages.putValues = this.only.apply(this, arguments)
  return this
}

/**
 * omit values of defined keys from current request using
 * request.expect and assign it to be used with flash
 * messages.
 *
 * @method without
 *
 * @param {Mixed} keys An array of keys or multiple parameters
 * @return {Object} - Reference to this for chaining
 *
 * @example
 * yield request.without('name', 'email').flash()
 */
FlashMethods.without = function () {
  this._flashMessages.putValues = this.except.apply(this, arguments)
  return this
}

/**
 * sets a custom object to be used with flash messages
 *
 * @method with
 *
 * @param  {Object} values
 * @return {Object} - Reference to this for chaining
 *
 * @example
 * yield request.with({name: 'doe'}).flash()
 */
FlashMethods.with = function (values) {
  this._flashMessages.putValues = values
  return this
}

/**
 * sets a custom object to be used with flash messages
 * similar to with but it appends the values.
 *
 * @method andWith
 *
 * @param  {Object} values
 * @return {Object} - Reference to this for chaining
 *
 * @example
 * yield request.withAll().andWith({name: 'doe'}).flash()
 */
FlashMethods.andWith = function (values) {
  if (!this._flashMessages || !this._flashMessages.putValues) {
    throw new Error('Cannot call andWith directly, use with')
  }
  this._flashMessages.putValues = _.merge(this._flashMessages.putValues, values)
  return this
}

/**
 * flash messages to the session.
 *
 * @method flash
 *
 * @example
 * yield request.withAll().andWith({name: 'doe'}).flash()
 */
FlashMethods.flash = function * () {
  if (!this._flashMessages || !this._flashMessages.putValues) {
    throw new Error('Cannot flash an empty object')
  }
  yield this.session.put('flash_messages', this._flashMessages.putValues)
}

/**
 * returns nested values from flash messages
 *
 * @method old
 *
 * @param  {String} key - key to fetch value for
 * @param  {String} defaultValue - default value to return when actual value
 *                                 is null or undefined
 * @return {Mixed}
 *
 * @example
 * request.old('name', 'somename')
 * request.old('profile.name', 'somename')
 */
FlashMethods.old = function (key, defaultValue) {
  defaultValue = (defaultValue !== null && defaultValue !== undefined) ? defaultValue : null
  const value = _.get(this._flashMessages.getValues, key)
  return (value !== null && value !== undefined) ? value : defaultValue
}
