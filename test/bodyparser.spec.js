'use strict'

/**
 * adonis-middleware
 * Copyright(c) 2015-2016 Harminder Virk
 * MIT Licensed
*/

const Ioc = require('adonis-fold').Ioc
global.use = Ioc.use

const BodyParser = require('../src/BodyParser')
const http = require('http')
const supertest = require('supertest')
const chai = require('chai')
const co = require('co')
const path = require('path')
const expect = chai.expect
const Config = {
  get: function (key) {
    if (key === 'bodyParser.uploads.maxSize') {
      return '4mb'
    }
    return {}
  }
}
require('co-mocha')

describe('BodyParser', function () {
  it('should parse http request body and attach _body object with request object', function * () {
    const bodyParser = new BodyParser(Config)
    const server = http.createServer(function (req, res) {
      req.request = req
      req.is = function (types) {
        return types.indexOf(req.headers['content-type']) > -1
      }
      req.hasBody = function () {
        return true
      }
      co(function * () {
        return yield bodyParser.handle(req, res, function * () {})
      })
        .then(function () {
          res.writeHead(200, {'content-type': 'application/json'})
          res.write(JSON.stringify(req._body))
          res.end()
        })
        .catch(function (error) {
          res.writeHead(500, {'Content-Type': 'application/json'})
          res.write(JSON.stringify({error: error.message}))
          res.end()
        })
    })

    const response = yield supertest(server).post('/').send({name: 'virk', age: 22}).type('form').expect(200)
    expect(response.body).deep.equal({name: 'virk', age: '22'})
  })

  it('should parse http request json body', function * () {
    const bodyParser = new BodyParser(Config)
    const server = http.createServer(function (req, res) {
      req.request = req
      req.is = function (types) {
        return types.indexOf(req.headers['content-type']) > -1
      }
      req.hasBody = function () {
        return true
      }
      co(function * () {
        return yield bodyParser.handle(req, res, function * () {})
      })
        .then(function () {
          res.writeHead(200, {'content-type': 'application/json'})
          res.write(JSON.stringify(req._body))
          res.end()
        })
        .catch(function (error) {
          res.writeHead(500, {'Content-Type': 'application/json'})
          res.write(JSON.stringify({error: error.message}))
          res.end()
        })
    })

    const response = yield supertest(server).post('/').set('Accept', 'application/json').send({name: 'virk'}).expect(200)
    expect(response.body).deep.equal({name: 'virk'})
  })

  it('should parse http plain text body', function * () {
    const bodyParser = new BodyParser(Config)
    const server = http.createServer(function (req, res) {
      req.request = req
      req.is = function (types) {
        return types.indexOf(req.headers['content-type']) > -1
      }
      req.hasBody = function () {
        return true
      }
      co(function * () {
        return yield bodyParser.handle(req, res, function * () {})
      })
        .then(function () {
          res.writeHead(200)
          res.write(req._raw)
          res.end()
        })
        .catch(function (error) {
          res.writeHead(500, {'Content-Type': 'application/json'})
          res.write(JSON.stringify({error: error.message}))
          res.end()
        })
    })
    const response = yield supertest(server).post('/').set('Content-Type', 'text/plain').send('Hello world!').expect(200)
    expect(response.text).to.equal('Hello world!')
  })

  it('should parse http request and attach uploaded files to _files', function * () {
    const bodyParser = new BodyParser(Config)
    const server = http.createServer(function (req, res) {
      req.request = req
      req.is = function (types) {
        return types[0] === 'multipart/form-data'
      }
      req.hasBody = function () {
        return true
      }
      co(function * () {
        return yield bodyParser.handle(req, res, function * () {})
      })
        .then(function () {
          res.writeHead(200, {'content-type': 'application/json'})
          res.write(JSON.stringify(req._files))
          res.end()
        })
        .catch(function (error) {
          res.writeHead(500, {'Content-Type': 'application/json'})
          res.write(JSON.stringify({error: error.message}))
          res.end()
        })
    })

    const response = yield supertest(server).post('/').attach('package', path.join(__dirname, '../package.json')).expect(200)
    expect(response.body).to.have.property('package')
    expect(response.body.package).to.have.property('type')
    expect(response.body.package).to.have.property('name')
    expect(response.body.package).to.have.property('path')
    expect(response.body.package).to.have.property('size')
  })

  it('should not parse body when hasBody returns false', function * () {
    const bodyParser = new BodyParser(Config)
    const server = http.createServer(function (req, res) {
      req.request = req
      req.is = function (types) {
        return types[0] === 'multipart/form-data'
      }
      req.hasBody = function () {
        return false
      }
      co(function * () {
        return yield bodyParser.handle(req, res, function * () {})
      })
        .then(function () {
          res.writeHead(200, {'content-type': 'application/json'})
          res.write(JSON.stringify(req._body))
          res.end()
        })
        .catch(function (error) {
          res.writeHead(500, {'Content-Type': 'application/json'})
          res.write(JSON.stringify({error: error.message}))
          res.end()
        })
    })

    const response = yield supertest(server).post('/').send('name', 'doe').expect(200)
    expect(Object.keys(response.body).length).to.equal(0)
  })

  it('should throw errors when upload file size is create than defined size', function * () {
    const altConfig = {
      get: function (key) {
        if (key === 'bodyParser.uploads.maxSize') {
          return '1kb'
        }
        return {}
      }
    }
    const bodyParser = new BodyParser(altConfig)
    const server = http.createServer(function (req, res) {
      req.request = req
      req.is = function (types) {
        return types[0] === 'multipart/form-data'
      }
      req.hasBody = function () {
        return true
      }
      co(function * () {
        return yield bodyParser.handle(req, res, function * () {})
      })
        .then(function () {
          res.writeHead(200, {'content-type': 'application/json'})
          res.write(JSON.stringify(req._files))
          res.end()
        })
        .catch(function (error) {
          res.writeHead(error.status, {'Content-Type': 'application/json'})
          res.write(JSON.stringify({error}))
          res.end()
        })
    })

    const response = yield supertest(server).post('/').attach('package', path.join(__dirname, '../package.json')).expect(413)
    expect(response.body.error).to.exist
    expect(response.body.error.message).to.equal('Uploaded files size is too large')
    expect(response.body.error.name).to.equal('RequestEntityTooLarge')
  })
})
