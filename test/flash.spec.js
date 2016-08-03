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
const View = {
  global: function () {}
}

describe('Flash', function () {
  it('should pull messages from session and set them on to request object', function * () {
    const server = http.createServer(function (req, res) {
      const flash = new Flash(View)
      req.session = {}
      req.session.pull = function * () {
        return {name: 'virk'}
      }
      co(function * () {
        return yield flash.handle(req, res, function * () {})
      })
        .then(function () {
          res.writeHead(200, {'content-type': 'application/json'})
          res.write(JSON.stringify(req._flashMessages.getValues))
          res.end()
        })
        .catch(function () {
          res.writeHead(500, {'content-type': 'application/json'})
          res.end()
        })
    })

    const response = yield supertest(server).get('/').expect(200)
    expect(response.body).deep.equal({name: 'virk'})
  })

  it('should return empty object when unable to pull flash messages', function * () {
    const server = http.createServer(function (req, res) {
      const flash = new Flash(View)
      req.session = {}
      req.session.pull = function * () {}
      co(function * () {
        return yield flash.handle(req, res, function * () {})
      })
        .then(function () {
          res.writeHead(200, {'content-type': 'application/json'})
          res.write(JSON.stringify(req._flashMessages.getValues))
          res.end()
        })
        .catch(function () {
          res.writeHead(500, {'content-type': 'application/json'})
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
          if (name === 'old') {
            viewMethod = callback('name')
          }
        }
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
          res.writeHead(200, {'content-type': 'text/plain'})
          res.end(viewMethod)
        })
        .catch(function () {
          res.writeHead(500, {'content-type': 'application/json'})
          res.end()
        })
    })

    const response = yield supertest(server).get('/').expect(200)
    expect(response.text).to.equal('virk')
  })

  it('should setup view global to return all flash messages', function * () {
    let viewMessages = null
    const server = http.createServer(function (req, res) {
      const View = {
        global: function (name, values) {
          if (name === 'flashMessages') {
            viewMessages = values
          }
        }
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
          res.writeHead(200, {'content-type': 'application/json'})
          res.end(JSON.stringify(viewMessages))
        })
        .catch(function () {
          res.writeHead(500, {'content-type': 'application/json'})
          res.end()
        })
    })

    const response = yield supertest(server).get('/').expect(200)
    expect(response.body).deep.equal({name: 'virk'})
  })

  it('should be able to set all input values as flash messages on session', function * () {
    const server = http.createServer(function (req, res) {
      const flash = new Flash(View)
      req.old = function () {}
      let sessionValues = {}

      req.session = {
        put: function * (key, values) {
          sessionValues = {key, values}
        },
        pull: function * () {}
      }
      req.all = function () {
        return {name: 'doe'}
      }

      co(function * () {
        yield flash.handle(req, res, function * () {})
        yield req.withAll().flash()
      })
        .then(function () {
          res.writeHead(200, {'content-type': 'application/json'})
          res.end(JSON.stringify(sessionValues))
        })
        .catch(function () {
          res.writeHead(500, {'content-type': 'application/json'})
          res.end()
        })
    })
    const response = yield supertest(server).get('/').expect(200)
    expect(response.body).to.have.property('key')
    expect(response.body).to.have.property('values')
    expect(response.body.values).deep.equal({name: 'doe'})
  })

  it('should be able to set values of only required fields as flash messages on session', function * () {
    const server = http.createServer(function (req, res) {
      const flash = new Flash(View)
      req.old = function () {}
      let sessionValues = {}

      req.session = {
        put: function * (key, values) {
          sessionValues = {key, values}
        },
        pull: function * () {}
      }
      req.only = function () {
        const args = Array.prototype.slice.call(arguments)
        const values = {name: 'doe', age: 22, email: 'doe@bar.com'}
        let valuesToReturn = {}
        args.forEach(function (item) {
          valuesToReturn[item] = values[item]
        })
        return valuesToReturn
      }

      co(function * () {
        yield flash.handle(req, res, function * () {})
        yield req.withOnly('age', 'name').flash()
      })
        .then(function () {
          res.writeHead(200, {'content-type': 'application/json'})
          res.end(JSON.stringify(sessionValues))
        })
        .catch(function () {
          res.writeHead(500, {'content-type': 'application/json'})
          res.end()
        })
    })
    const response = yield supertest(server).get('/').expect(200)
    expect(response.body).to.have.property('key')
    expect(response.body).to.have.property('values')
    expect(response.body.values).deep.equal({name: 'doe', age: 22})
  })

  it('should be able to set values of fields except defined fields as flash messages on session', function * () {
    const server = http.createServer(function (req, res) {
      const flash = new Flash(View)
      req.old = function () {}
      let sessionValues = {}

      req.session = {
        put: function * (key, values) {
          sessionValues = {key, values}
        },
        pull: function * () {}
      }
      req.except = function () {
        const args = Array.prototype.slice.call(arguments)
        const values = {name: 'doe', age: 22, email: 'doe@bar.com'}
        let valuesToReturn = {}
        Object.keys(values).forEach(function (item) {
          if (args.indexOf(item) <= -1) {
            valuesToReturn[item] = values[item]
          }
        })
        return valuesToReturn
      }

      co(function * () {
        yield flash.handle(req, res, function * () {})
        yield req.without('age').flash()
      })
        .then(function () {
          res.writeHead(200, {'content-type': 'application/json'})
          res.end(JSON.stringify(sessionValues))
        })
        .catch(function () {
          res.writeHead(500, {'content-type': 'application/json'})
          res.end()
        })
    })
    const response = yield supertest(server).get('/').expect(200)
    expect(response.body).to.have.property('key')
    expect(response.body).to.have.property('values')
    expect(response.body.values).deep.equal({name: 'doe', email: 'doe@bar.com'})
  })

  it('should be able to set values an object of values as flash messages on session', function * () {
    const server = http.createServer(function (req, res) {
      const flash = new Flash(View)
      req.old = function () {}
      let sessionValues = {}

      req.session = {
        put: function * (key, values) {
          sessionValues = {key, values}
        },
        pull: function * () {}
      }

      co(function * () {
        yield flash.handle(req, res, function * () {})
        yield req.with({name: 'foo'}).flash()
      })
        .then(function () {
          res.writeHead(200, {'content-type': 'application/json'})
          res.end(JSON.stringify(sessionValues))
        })
        .catch(function () {
          res.writeHead(500, {'content-type': 'application/json'})
          res.end()
        })
    })
    const response = yield supertest(server).get('/').expect(200)
    expect(response.body).to.have.property('key')
    expect(response.body).to.have.property('values')
    expect(response.body.values).deep.equal({name: 'foo'})
  })

  it('should be able to chain additional values using flashExcept', function * () {
    const server = http.createServer(function (req, res) {
      const flash = new Flash(View)
      req.old = function () {}
      let sessionValues = {}

      req.session = {
        put: function * (key, values) {
          sessionValues = {key, values}
        },
        pull: function * () {}
      }
      req.except = function () {
        const args = Array.prototype.slice.call(arguments)
        const values = {name: 'doe', age: 22, email: 'doe@bar.com'}
        let valuesToReturn = {}
        Object.keys(values).forEach(function (item) {
          if (args.indexOf(item) <= -1) {
            valuesToReturn[item] = values[item]
          }
        })
        return valuesToReturn
      }

      co(function * () {
        yield flash.handle(req, res, function * () {})
        yield req.without('age').andWith({gender: 'male'}).flash()
      })
        .then(function () {
          res.writeHead(200, {'content-type': 'application/json'})
          res.end(JSON.stringify(sessionValues))
        })
        .catch(function () {
          res.writeHead(500, {'content-type': 'application/json'})
          res.end()
        })
    })
    const response = yield supertest(server).get('/').expect(200)
    expect(response.body).to.have.property('key')
    expect(response.body).to.have.property('values')
    expect(response.body.values).deep.equal({name: 'doe', email: 'doe@bar.com', gender: 'male'})
  })

  it('should be able to chain additional values using flashOnly', function * () {
    const server = http.createServer(function (req, res) {
      const flash = new Flash(View)
      req.old = function () {}
      let sessionValues = {}

      req.session = {
        put: function * (key, values) {
          sessionValues = {key, values}
        },
        pull: function * () {}
      }
      req.only = function () {
        const args = Array.prototype.slice.call(arguments)
        const values = {name: 'doe', age: 22, email: 'doe@bar.com'}
        let valuesToReturn = {}
        args.forEach(function (item) {
          valuesToReturn[item] = values[item]
        })
        return valuesToReturn
      }

      co(function * () {
        yield flash.handle(req, res, function * () {})
        yield req.withOnly('name').andWith({gender: 'male'}).flash()
      })
        .then(function () {
          res.writeHead(200, {'content-type': 'application/json'})
          res.end(JSON.stringify(sessionValues))
        })
        .catch(function () {
          res.writeHead(500, {'content-type': 'application/json'})
          res.end()
        })
    })
    const response = yield supertest(server).get('/').expect(200)
    expect(response.body).to.have.property('key')
    expect(response.body).to.have.property('values')
    expect(response.body.values).deep.equal({name: 'doe', gender: 'male'})
  })

  it('should be able to chain additional values using flashAll', function * () {
    const server = http.createServer(function (req, res) {
      const flash = new Flash(View)
      req.old = function () {}
      let sessionValues = {}

      req.session = {
        put: function * (key, values) {
          sessionValues = {key, values}
        },
        pull: function * () {}
      }

      req.all = function () {
        return {name: 'doe'}
      }

      co(function * () {
        yield flash.handle(req, res, function * () {})
        yield req.withAll().andWith({age: 22}).flash()
      })
        .then(function () {
          res.writeHead(200, {'content-type': 'application/json'})
          res.end(JSON.stringify(sessionValues))
        })
        .catch(function () {
          res.writeHead(500, {'content-type': 'application/json'})
          res.end()
        })
    })
    const response = yield supertest(server).get('/').expect(200)
    expect(response.body).to.have.property('key')
    expect(response.body).to.have.property('values')
    expect(response.body.values).deep.equal({name: 'doe', age: 22})
  })

  it('should be able to chain andWith for multiple times', function * () {
    const server = http.createServer(function (req, res) {
      const flash = new Flash(View)
      req.old = function () {}
      let sessionValues = {}

      req.session = {
        put: function * (key, values) {
          sessionValues = {key, values}
        },
        pull: function * () {}
      }

      req.all = function () {
        return {name: 'doe'}
      }

      co(function * () {
        yield flash.handle(req, res, function * () {})
        yield req.with({name: 'doe'}).andWith({age: 22}).andWith({gender: 'male'}).flash()
      })
        .then(function () {
          res.writeHead(200, {'content-type': 'application/json'})
          res.end(JSON.stringify(sessionValues))
        })
        .catch(function () {
          res.writeHead(500, {'content-type': 'application/json'})
          res.end()
        })
    })
    const response = yield supertest(server).get('/').expect(200)
    expect(response.body).to.have.property('key')
    expect(response.body).to.have.property('values')
    expect(response.body.values).deep.equal({name: 'doe', age: 22, gender: 'male'})
  })
})
