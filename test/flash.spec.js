'use strict'

/**
 * adonis-middleware
 * Copyright(c) 2015-2016 Harminder Virk
 * MIT Licensed
*/

const Flash = require('../src/Flash')
const http = require('http')
const co = require('co')
const supertest = require('supertest')
const chai = require('chai')
const expect = chai.expect
require('co-mocha')

describe('Flash', function() {
  it('should pull messages from session and set them on to request object', function * () {
    const server = http.createServer(function (req, res) {
      const View = {
        global: function (){}
      }
      const flash = new Flash(View)
      req.session = {}
      req.session.pull = function * () {
        return {name: 'virk'}
      }
      co(function * () {
        return yield flash.handle(req, res, function * () {})
      })
      .then(function () {
        res.writeHead(200, {"content-type": "application/json"})
        res.write(JSON.stringify(req._flash_messages))
        res.end()
      })
      .catch(function (error) {
        res.writeHead(500, {"content-type": "application/json"})
        res.end()
      })
    })

    const response = yield supertest(server).get('/').expect(200)
    expect(response.body).deep.equal({name: 'virk'})
  })

  it('should return empty object when unable to pull flash messages', function * () {
    const server = http.createServer(function (req, res) {
      const View = {
        global: function (){}
      }
      const flash = new Flash(View)
      req.session = {}
      req.session.pull = function * () {
      }
      co(function * () {
        return yield flash.handle(req, res, function * () {})
      })
      .then(function () {
        res.writeHead(200, {"content-type": "application/json"})
        res.write(JSON.stringify(req._flash_messages))
        res.end()
      })
      .catch(function (error) {
        res.writeHead(500, {"content-type": "application/json"})
        res.end()
      })
    })

    const response = yield supertest(server).get('/').expect(200)
    expect(response.body).deep.equal({})
  })
  it('should setup view helper to return flash messages', function * () {
    let viewMethod = null
    const server = http.createServer(function (req, res) {
      const View = {
        global: function (name, callback) {
          viewMethod = callback()
        }
      }
      const flash = new Flash(View)
      req.session = {}
      req.old = function () {
        return 'foo'
      }
      req.session.pull = function * () {
        return {name: 'virk'}
      }
      co(function * () {
        return yield flash.handle(req, res, function * () {})
      })
      .then(function () {
        res.writeHead(200, {"content-type": "text/plain"})
        res.end(viewMethod)
      })
      .catch(function (error) {
        res.writeHead(500, {"content-type": "application/json"})
        res.end()
      })
    })

    const response = yield supertest(server).get('/').expect(200)
    expect(response.text).to.equal('foo')
  })

})
