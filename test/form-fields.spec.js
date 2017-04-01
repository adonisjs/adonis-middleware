'use strict'

/*
 * adonis-middleware
 *
 * (c) Harminder Virk <virk@adonisjs.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
*/

const expect = require('chai').expect
const FormFields = require('../src/BodyParser/FormFields')

describe('Form Fields Parser', function () {
  it('add a plain key value pair to form fields', function () {
    const formFields = new FormFields()
    formFields.add('name', 'foo')
    expect(formFields.get()).deep.equal({name: 'foo'})
  })

  it('add an array key value pair to form fields', function () {
    const formFields = new FormFields()
    formFields.add('name[]', 'foo')
    expect(formFields.get()).deep.equal({name: ['foo']})
  })

  it('add an array key value pair to form fields multiple times', function () {
    const formFields = new FormFields()
    formFields.add('name[]', 'foo')
    formFields.add('name[]', 'bar')
    expect(formFields.get()).deep.equal({name: ['foo', 'bar']})
  })

  it('add a key with nested arrays', function () {
    const formFields = new FormFields()
    formFields.add('user[email]', 'foo@bar.com')
    formFields.add('user[age]', 22)
    expect(formFields.get()).deep.equal({user: {email: 'foo@bar.com', age: 22}})
  })

  it('add a key with deep nested arrays', function () {
    const formFields = new FormFields()
    formFields.add('user[email[]]', 'foo@bar.com')
    formFields.add('user[email[]]', 'foo@baz.com')
    formFields.add('user[age]', 22)
    expect(formFields.get()).deep.equal({user: {email: ['foo@bar.com', 'foo@baz.com'], age: 22}})
  })

  it('add arrays with indexes', function () {
    const formFields = new FormFields()
    formFields.add('user[0][email]', 'foo@baz.com')
    formFields.add('user[1][age]', 22)
    expect(formFields.get()).deep.equal({ user: [{ email: 'foo@baz.com' }, { age: 22 }] })
  })
})
