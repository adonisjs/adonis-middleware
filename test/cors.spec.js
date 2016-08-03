'use strict'

/**
 * adonis-middleware
 * Copyright(c) 2015-2016 Harminder Virk
 * MIT Licensed
*/

const Cors = require('../src/Cors')
const chai = require('chai')
const http = require('http')
const co = require('co')
const supertest = require('supertest')
const expect = chai.expect
require('co-mocha')

describe('Cors', function () {
  it('should disable cors when cors origin is set to false', function * () {
    const Config = {
      get: function (key) {
        key = key.split('.')[1]
        const options = {
          origin: false,
          methods: 'GET, PUT, POST',
          headers: true,
          exposeHeaders: false,
          credentials: false,
          maxAge: 90
        }
        return options[key]
      }
    }

    const cors = new Cors(Config)
    const server = http.createServer(function (req, res) {
      req.header = function (key) {
        return req.headers[key]
      }
      req.method = function () {
        return 'OPTIONS'
      }
      res.header = function (key, value) {
        res.setHeader(key, value)
      }
      res.status = function (code) {
        res.writeHead(code)
        return res
      }
      res.send = function (code) {}
      co(function * () {
        return yield cors.handle(req, res, function * () {})
      })
        .then(function () {
          res.end()
        })
        .catch(function (error) {
          console.log(error)
          res.writeHead(500)
          res.end()
        })
    })

    const response = yield supertest(server).options('/').expect(204)
    expect(response.header['access-control-allow-origin']).to.equal('false')
  })

  it('should return request origin as allowed origin when cors origin is set to true', function * () {
    const Config = {
      get: function (key) {
        key = key.split('.')[1]
        const options = {
          origin: true,
          methods: 'GET, PUT, POST',
          headers: true,
          exposeHeaders: false,
          credentials: false,
          maxAge: 90
        }
        return options[key]
      }
    }

    const cors = new Cors(Config)
    const server = http.createServer(function (req, res) {
      req.header = function (key) {
        return req.headers[key]
      }
      req.method = function () {
        return 'OPTIONS'
      }
      res.header = function (key, value) {
        res.setHeader(key, value)
      }
      res.status = function (code) {
        res.writeHead(code)
        return res
      }
      res.send = function (code) {}
      co(function * () {
        return yield cors.handle(req, res, function * () {})
      })
        .then(function () {
          res.end()
        })
        .catch(function (error) {
          console.log(error)
          res.writeHead(500)
          res.end()
        })
    })

    const response = yield supertest(server).options('/').set('origin', 'localhost').expect(204)
    expect(response.header['access-control-allow-origin']).to.equal('localhost')
  })

  it('should return call cors origin method when defined', function * () {
    const Config = {
      get: function (key) {
        key = key.split('.')[1]
        const options = {
          origin: function (origin) {
            return origin === 'localhost'
          },
          methods: 'GET, PUT, POST',
          headers: true,
          exposeHeaders: false,
          credentials: false,
          maxAge: 90
        }
        return options[key]
      }
    }

    const cors = new Cors(Config)
    const server = http.createServer(function (req, res) {
      req.header = function (key) {
        return req.headers[key]
      }
      req.method = function () {
        return 'OPTIONS'
      }
      res.header = function (key, value) {
        res.setHeader(key, value)
      }
      res.status = function (code) {
        res.writeHead(code)
        return res
      }
      res.send = function (code) {}
      co(function * () {
        return yield cors.handle(req, res, function * () {})
      })
        .then(function () {
          res.end()
        })
        .catch(function (error) {
          console.log(error)
          res.writeHead(500)
          res.end()
        })
    })

    const response = yield supertest(server).options('/').set('origin', 'localhost').expect(204)
    expect(response.header['access-control-allow-origin']).to.equal('localhost')
  })

  it('should define methods allowed in cors methods', function * () {
    const Config = {
      get: function (key) {
        key = key.split('.')[1]
        const options = {
          origin: function (origin) {
            return origin === 'localhost'
          },
          methods: 'GET, PUT, POST',
          headers: true,
          exposeHeaders: false,
          credentials: false,
          maxAge: 90
        }
        return options[key]
      }
    }

    const cors = new Cors(Config)
    const server = http.createServer(function (req, res) {
      req.header = function (key) {
        return req.headers[key]
      }
      req.method = function () {
        return 'OPTIONS'
      }
      res.header = function (key, value) {
        res.setHeader(key, value)
      }
      res.status = function (code) {
        res.writeHead(code)
        return res
      }
      res.send = function (code) {}
      co(function * () {
        return yield cors.handle(req, res, function * () {})
      })
        .then(function () {
          res.end()
        })
        .catch(function (error) {
          console.log(error)
          res.writeHead(500)
          res.end()
        })
    })

    const response = yield supertest(server).options('/').set('origin', 'localhost').expect(204)
    expect(response.header['access-control-allow-methods']).to.equal('GET, PUT, POST')
  })

  it('should return request headers defined in Access-Control-Request-Headers back when cors headers are set to true', function * () {
    const Config = {
      get: function (key) {
        key = key.split('.')[1]
        const options = {
          origin: function (origin) {
            return origin === 'localhost'
          },
          methods: 'GET, PUT, POST',
          headers: true,
          exposeHeaders: false,
          credentials: false,
          maxAge: 90
        }
        return options[key]
      }
    }

    const cors = new Cors(Config)
    const server = http.createServer(function (req, res) {
      req.header = function (key) {
        key = key.replace(/(?:^|-)\S/g, function (a) {
          return a.toLowerCase()
        })
        return req.headers[key]
      }
      req.method = function () {
        return 'OPTIONS'
      }
      res.header = function (key, value) {
        res.setHeader(key, value)
      }
      res.status = function (code) {
        res.writeHead(code)
        return res
      }
      res.send = function (code) {}
      co(function * () {
        return yield cors.handle(req, res, function * () {})
      })
        .then(function () {
          res.end()
        })
        .catch(function (error) {
          console.log(error)
          res.writeHead(500)
          res.end()
        })
    })

    const response = yield supertest(server).options('/').set('Access-Control-Request-Headers', 'Accept').set('origin', 'localhost').expect(204)
    expect(response.header['access-control-allow-headers']).to.equal('Accept')
  })

  it('should return request headers defined in Access-Control-Request-Headers back when cors headers is a function returning true', function * () {
    const Config = {
      get: function (key) {
        key = key.split('.')[1]
        const options = {
          origin: function (origin) {
            return origin === 'localhost'
          },
          methods: 'GET, PUT, POST',
          headers: function () {
            return true
          },
          exposeHeaders: false,
          credentials: false,
          maxAge: 90
        }
        return options[key]
      }
    }

    const cors = new Cors(Config)
    const server = http.createServer(function (req, res) {
      req.header = function (key) {
        key = key.replace(/(?:^|-)\S/g, function (a) {
          return a.toLowerCase()
        })
        return req.headers[key]
      }
      req.method = function () {
        return 'OPTIONS'
      }
      res.header = function (key, value) {
        res.setHeader(key, value)
      }
      res.status = function (code) {
        res.writeHead(code)
        return res
      }
      res.send = function (code) {}
      co(function * () {
        return yield cors.handle(req, res, function * () {})
      })
        .then(function () {
          res.end()
        })
        .catch(function (error) {
          console.log(error)
          res.writeHead(500)
          res.end()
        })
    })

    const response = yield supertest(server).options('/').set('Access-Control-Request-Headers', 'Accept').set('origin', 'localhost').expect(204)
    expect(response.header['access-control-allow-headers']).to.equal('Accept')
  })

  it('should not set access-control-allow-headers when cors headers is set to false', function * () {
    const Config = {
      get: function (key) {
        key = key.split('.')[1]
        const options = {
          origin: function (origin) {
            return origin === 'localhost'
          },
          methods: 'GET, PUT, POST',
          headers: false,
          exposeHeaders: false,
          credentials: false,
          maxAge: 90
        }
        return options[key]
      }
    }

    const cors = new Cors(Config)
    const server = http.createServer(function (req, res) {
      req.header = function (key) {
        key = key.replace(/(?:^|-)\S/g, function (a) {
          return a.toLowerCase()
        })
        return req.headers[key]
      }
      req.method = function () {
        return 'OPTIONS'
      }
      res.header = function (key, value) {
        res.setHeader(key, value)
      }
      res.status = function (code) {
        res.writeHead(code)
        return res
      }
      res.send = function (code) {}
      co(function * () {
        return yield cors.handle(req, res, function * () {})
      })
        .then(function () {
          res.end()
        })
        .catch(function (error) {
          console.log(error)
          res.writeHead(500)
          res.end()
        })
    })

    const response = yield supertest(server).options('/').set('Access-Control-Request-Headers', 'Accept').set('origin', 'localhost').expect(204)
    expect(response.header['access-control-allow-headers']).to.equal(undefined)
  })

  it('should set Access-Control-Expose-Headers when expose header are defined', function * () {
    const Config = {
      get: function (key) {
        key = key.split('.')[1]
        const options = {
          origin: function (origin) {
            return origin === 'localhost'
          },
          methods: 'GET, PUT, POST',
          headers: false,
          exposeHeaders: 'Accept, Content-Type',
          credentials: false,
          maxAge: 90
        }
        return options[key]
      }
    }

    const cors = new Cors(Config)
    const server = http.createServer(function (req, res) {
      req.header = function (key) {
        key = key.replace(/(?:^|-)\S/g, function (a) {
          return a.toLowerCase()
        })
        return req.headers[key]
      }
      req.method = function () {
        return 'OPTIONS'
      }
      res.header = function (key, value) {
        res.setHeader(key, value)
      }
      res.status = function (code) {
        res.writeHead(code)
        return res
      }
      res.send = function (code) {}
      co(function * () {
        return yield cors.handle(req, res, function * () {})
      })
        .then(function () {
          res.end()
        })
        .catch(function (error) {
          console.log(error)
          res.writeHead(500)
          res.end()
        })
    })

    const response = yield supertest(server).options('/').set('origin', 'localhost').expect(204)
    expect(response.header['access-control-expose-headers']).to.equal('Accept, Content-Type')
  })

  it('should not interpret when request method is not options', function * () {
    const Config = {
      get: function (key) {
        key = key.split('.')[1]
        const options = {
          origin: function (origin) {
            return origin === 'localhost'
          },
          methods: 'GET, PUT, POST',
          headers: false,
          exposeHeaders: 'Accept, Content-Type',
          credentials: false,
          maxAge: 90
        }
        return options[key]
      }
    }

    const cors = new Cors(Config)
    const server = http.createServer(function (req, res) {
      req.header = function (key) {
        key = key.replace(/(?:^|-)\S/g, function (a) {
          return a.toLowerCase()
        })
        return req.headers[key]
      }
      req.method = function () {
        return 'GET'
      }
      res.header = function (key, value) {
        res.setHeader(key, value)
      }
      res.status = function (code) {
        res.writeHead(code)
        return res
      }
      res.send = function (code) {}
      co(function * () {
        return yield cors.handle(req, res, function * () {})
      })
        .then(function () {
          res.writeHead(200)
          res.end()
        })
        .catch(function (error) {
          console.log(error)
          res.writeHead(500)
          res.end()
        })
    })
    yield supertest(server).get('/').set('origin', 'localhost').expect(200)
  })
})
