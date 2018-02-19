'use strict'

const expect = require('chai').expect
const http = require('http')
const co = require('co')
const supertest = require('supertest')
const TrimStrings = require('../src/TrimStrings')

describe('Trim Strings', function () {
  it('should move on if request body is empty', function * () {
    const server = http.createServer(function (req, res) {
      const trimStrings = new TrimStrings()
      req.body = {}

      co(function * () {
        return yield trimStrings.handle(req, res, function * () {})
      })
        .then(function () {
          res.writeHead(200, { 'content-type': 'application/json' })
          res.write(JSON.stringify(req.body))
          res.end()
        })
        .catch(function () {
          res.writeHead(500, { 'content-type': 'application/json' })
          res.end()
        })
    })

    const response = yield supertest(server).get('/').expect(200)
    expect(response.body).deep.equal({})
  })

  it('should remove empty spaces from values in request body', function * () {
    const server = http.createServer(function (req, res) {
      const trimStrings = new TrimStrings()
      req.body = { foo: '   bar      ' }

      co(function * () {
        return yield trimStrings.handle(req, res, function * () {})
      })
        .then(function () {
          res.writeHead(200, { 'content-type': 'application/json' })
          res.write(JSON.stringify(req.body))
          res.end()
        })
        .catch(function () {
          res.writeHead(500, { 'content-type': 'application/json' })
          res.end()
        })
    })

    const response = yield supertest(server).get('/').expect(200)
    expect(response.body).deep.equal({ foo: 'bar' })
  })
})
