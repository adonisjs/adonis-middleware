'use strict'

/**
 * adonis-middleware
 * Copyright(c) 2016-2016 Harminder Virk
 * MIT Licensed
*/
const Ioc = require('adonis-fold').Ioc
GLOBAL.use = Ioc.use

const Shield = require('../src/Shield')
const chai = require('chai')
const expect = chai.expect
const http = require('http')
const co = require('co')
const csrf = new(require('csrf'))
const supertest = require('supertest')
let csrfSecret = null
require('co-mocha')

const defaultConfig = {
  csrf: {
    enable: false,
    methods: ['POST'],
    filterUris: []
  },
  csp: {
    directives: {}
  }
}

const View = {
  global: function () {}
}

describe('Sheild', function () {

  before(function * () {
    csrfSecret = yield csrf.secret()
  })

  it('should not set csrf token secret when csrf is disabled', function * () {
    const Config = {
      get: function () {
        return defaultConfig
      }
    }
    const shield = new Shield(Config, View)
    const server = http.createServer(function (req, res) {
      req.request = req
      req.method = function () {
        return 'POST'
      }
      req.match = function () {
        return false
      }
      const response = {}
      response.header = function (key, value) {
        res.setHeader(key, value)
      }
      co(function * () {
        return yield shield.handle(req, response, function * () {})
      })
      .then(function () {
        res.writeHead(200, {"Content-type": "application/json"})
        res.end()
      })
      .catch(function (error) {
        res.writeHead(500, {"Content-type": "application/json"})
        res.end()
      })
    })
    const response = yield supertest(server).get('/').expect(200)
    expect(response.headers).not.have.property(shield.sessionKey)
  })

  it('should get csrf secret when csrf is enabled', function * () {
    const newConfig = defaultConfig
    const secretAddedOnSession = {}
    newConfig.csrf.enable = true
    const Config = {
      get: function () {
        return newConfig
      }
    }
    const shield = new Shield(Config, View)
    const server = http.createServer(function (req, res) {
      req.request = req
      req.session = {
        get: function * () {
          return undefined
        },
        put: function * (key, value) {
          secretAddedOnSession[key] = value
        }
      }
      req.method = function () {
        return 'GET'
      }
      req.match = function () {
        return false
      }
      const response = {}
      response.header = function (key, value) {
        res.setHeader(key, value)
      }
      response.cookie = function () {}
      co(function * () {
        return yield shield.handle(req, response, function * () {})
      })
      .then(function () {
        res.writeHead(200, {"Content-type": "application/json"})
        res.end()
      })
      .catch(function (error) {
        console.log(error)
        res.writeHead(500, {"Content-type": "application/json"})
        res.end()
      })
    })
    const response = yield supertest(server).get('/').expect(200)
    expect(secretAddedOnSession).to.have.property(shield.sessionKey)
    expect(secretAddedOnSession[shield.sessionKey]).to.be.a('string')
  })

  it('should get deny request with an error when csrf secret is not available', function * () {
    const newConfig = defaultConfig
    newConfig.csrf.enable = true
    const Config = {
      get: function () {
        return newConfig
      }
    }
    const shield = new Shield(Config, View)
    const server = http.createServer(function (req, res) {
      req.request = req
      req.session = {
        get: function * () {
          return undefined
        },
        put: function * () {}
      }
      req.method = function () {
        return 'POST'
      }
      req.match = function () {
        return false
      }
      const response = {}
      response.header = function (key, value) {
        res.setHeader(key, value)
      }
      response.cookie = function () {}
      co(function * () {
        return yield shield.handle(req, response, function * () {})
      })
      .then(function () {
        res.writeHead(200, {"Content-type": "application/json"})
        res.end()
      })
      .catch(function (error) {
        res.writeHead(error.status, {"Content-type": "application/json"})
        res.write(JSON.stringify({body:error.message}))
        res.end()
      })
    })
    const response = yield supertest(server).get('/').expect(403)
    expect(response.body.body).to.match(/csrf secret missing/)
  })

  it('should get deny request with an error when csrf secret is available but csrf token is missing', function * () {
    const newConfig = defaultConfig
    newConfig.csrf.enable = true
    const Config = {
      get: function () {
        return newConfig
      }
    }
    const shield = new Shield(Config, View)
    const server = http.createServer(function (req, res) {
      req.request = req
      req.session = {
        get: function () {
          return csrf.secret()
        },
        put: function * () {}
      }
      req.method = function () {
        return 'POST'
      }
      req.input = function () {
        return ''
      }
      req.header = function (key) {
        return req.headers[key]
      }
      req.match = function () {
        return false
      }

      const response = {}
      response.header = function (key, value) {
        res.setHeader(key, value)
      }
      response.cookie = function () {}

      co(function * () {
        return yield shield.handle(req, response, function * () {})
      })
      .then(function () {
        res.writeHead(200, {"Content-type": "application/json"})
        res.end()
      })
      .catch(function (error) {
        res.writeHead(error.status, {"Content-type": "application/json"})
        res.write(JSON.stringify({body:error.message}))
        res.end()
      })
    })
    const response = yield supertest(server).get('/').expect(403)
    expect(response.body.body).to.match(/csrf token mismatch/)
  })

  it('should skip request when request method does not falls in one of the defined csrf methods', function * () {
    const newConfig = defaultConfig
    newConfig.csrf.enable = true
    const Config = {
      get: function () {
        return newConfig
      }
    }
    const shield = new Shield(Config, View)
    const server = http.createServer(function (req, res) {
      req.request = req
      req.session = {
        get: function * () {
          return undefined
        },
        put: function * () {}
      }
      req.method = function () {
        return 'GET'
      }
      req.input = function () {
        return ''
      }
      req.header = function (key) {
        return req.headers[key]
      }
      req.match = function () {
        return false
      }

      const response = {}
      response.header = function (key, value) {
        res.setHeader(key, value)
      }
      response.cookie = function () {}

      co(function * () {
        return yield shield.handle(req, response, function * () {})
      })
      .then(function () {
        res.writeHead(200, {"Content-type": "application/json"})
        res.end()
      })
      .catch(function (error) {
        console.log(error)
        res.writeHead(error.status, {"Content-type": "application/json"})
        res.write(JSON.stringify({body:error.message}))
        res.end()
      })
    })
    yield supertest(server).get('/').expect(200)
  })

  it('should get deny request with an error when csrf secret is available but csrf token is missing', function * () {
    const newConfig = defaultConfig
    newConfig.csrf.enable = true
    const Config = {
      get: function () {
        return newConfig
      }
    }
    const shield = new Shield(Config, View)
    const server = http.createServer(function (req, res) {
      req.request = req
      req.session = {
        get: function () {
          return csrf.secret()
        },
        put: function * () {}
      }
      req.method = function () {
        return 'POST'
      }
      req.input = function () {
        return ''
      }
      req.header = function (key) {
        return req.headers[key]
      }
      req.match = function () {
        return false
      }

      const response = {}
      response.header = function (key, value) {
        res.setHeader(key, value)
      }
      response.cookie = function () {}

      co(function * () {
        return yield shield.handle(req, response, function * () {})
      })
      .then(function () {
        res.writeHead(200, {"Content-type": "application/json"})
        res.end()
      })
      .catch(function (error) {
        res.writeHead(error.status, {"Content-type": "application/json"})
        res.write(JSON.stringify({body:error.message}))
        res.end()
      })
    })
    const response = yield supertest(server).get('/').expect(403)
    expect(response.body.body).to.match(/csrf token mismatch/)
  })

  it('should skip request when url matches one of the filterUris', function * () {
    const newConfig = defaultConfig
    newConfig.csrf.enable = true
    newConfig.csrf.filterUris = ['']
    const Config = {
      get: function () {
        return newConfig
      }
    }
    const shield = new Shield(Config, View)
    const server = http.createServer(function (req, res) {
      req.request = req
      req.session = {
        get: function * () {
          return undefined
        },
        put: function * () {}
      }
      req.method = function () {
        return 'POST'
      }
      req.input = function () {
        return ''
      }
      req.header = function (key) {
        return req.headers[key]
      }
      req.match = function () {
        return true
      }

      const response = {}
      response.header = function (key, value) {
        res.setHeader(key, value)
      }
      response.cookie = function () {}

      co(function * () {
        return yield shield.handle(req, response, function * () {})
      })
      .then(function () {
        res.writeHead(200, {"Content-type": "application/json"})
        res.end()
      })
      .catch(function (error) {
        console.log(error)
        res.writeHead(error.status, {"Content-type": "application/json"})
        res.write(JSON.stringify({body:error.message}))
        res.end()
      })
    })
    yield supertest(server).get('/').expect(200)
  })

  it('should set csrfToken method on request object when csrf is enabled', function * () {
    const newConfig = defaultConfig
    let cookieValue = null
    newConfig.csrf.enable = true
    const Config = {
      get: function () {
        return newConfig
      }
    }
    const shield = new Shield(Config, View)
    const server = http.createServer(function (req, res) {
      req.request = req
      req.session = {
        get: function * () {
          return undefined
        },
        put: function * () {}
      }
      req.method = function () {
        return 'GET'
      }
      req.input = function () {
        return ''
      }
      req.header = function (key) {
        return req.headers[key]
      }
      req.match = function () {
        return false
      }

      const response = {}
      response.header = function (key, value) {
        res.setHeader(key, value)
      }
      response.cookie = function (key, value) {
        cookieValue = value
      }

      co(function * () {
        return yield shield.handle(req, response, function * () {})
      })
      .then(function () {
        res.writeHead(200, {"Content-type": "application/json"})
        res.write(JSON.stringify({token: req.csrfToken()}))
        res.end()
      })
      .catch(function (error) {
        res.writeHead(error.status, {"Content-type": "application/json"})
        res.write(JSON.stringify({body:error.message}))
        res.end()
      })
    })
    const response = yield supertest(server).get('/').expect(200)
    expect(response.body.token).not.equal(null)
    expect(response.body.token).not.equal(undefined)
    expect(response.body.token).to.equal(cookieValue)
  })

  it('should add csrfToken view helper method when csrf is enabled', function * () {
    const newConfig = defaultConfig
    let cookieValue = null
    let viewGlobalValue = null
    newConfig.csrf.enable = true
    const Config = {
      get: function () {
        return newConfig
      }
    }
    const View = {
      global: function (key, value) {
        if(key === 'csrfToken') {
          viewGlobalValue = value
        }
      }
    }
    const shield = new Shield(Config, View)
    const server = http.createServer(function (req, res) {
      req.request = req
      req.session = {
        get: function * () {
          return undefined
        },
        put: function * () {}
      }
      req.method = function () {
        return 'GET'
      }
      req.input = function () {
        return ''
      }
      req.header = function (key) {
        return req.headers[key]
      }
      req.match = function () {
        return false
      }

      const response = {}
      response.header = function (key, value) {
        res.setHeader(key, value)
      }
      response.cookie = function (key, value) {
        cookieValue = value
      }

      co(function * () {
        return yield shield.handle(req, response, function * () {})
      })
      .then(function () {
        res.writeHead(200, {"Content-type": "application/json"})
        res.write(JSON.stringify({token: req.csrfToken()}))
        res.end()
      })
      .catch(function (error) {
        res.writeHead(error.status, {"Content-type": "application/json"})
        res.write(JSON.stringify({body:error.message}))
        res.end()
      })
    })
    const response = yield supertest(server).get('/').expect(200)
    expect(viewGlobalValue).not.equal(null)
    expect(viewGlobalValue).not.equal(undefined)
    expect(viewGlobalValue).to.equal(cookieValue)
  })

  it('should add csrfField view helper method when csrf is enabled', function * () {
    const newConfig = defaultConfig
    let cookieValue = null
    let viewGlobalValue = null
    newConfig.csrf.enable = true
    const Config = {
      get: function () {
        return newConfig
      }
    }
    const View = {
      global: function (key, value) {
        if(key === 'csrfField') {
          viewGlobalValue = value
        }
      }
    }
    const shield = new Shield(Config, View)
    const server = http.createServer(function (req, res) {
      req.request = req
      req.session = {
        get: function * () {
          return undefined
        },
        put: function * () {}
      }
      req.method = function () {
        return 'GET'
      }
      req.input = function () {
        return ''
      }
      req.header = function (key) {
        return req.headers[key]
      }
      req.match = function () {
        return false
      }

      const response = {}
      response.header = function (key, value) {
        res.setHeader(key, value)
      }
      response.cookie = function (key, value) {
        cookieValue = value
      }

      co(function * () {
        return yield shield.handle(req, response, function * () {})
      })
      .then(function () {
        res.writeHead(200, {"Content-type": "application/json"})
        res.write(JSON.stringify({token: req.csrfToken()}))
        res.end()
      })
      .catch(function (error) {
        res.writeHead(error.status, {"Content-type": "application/json"})
        res.write(JSON.stringify({body:error.message}))
        res.end()
      })
    })
    const response = yield supertest(server).get('/').expect(200)
    expect(viewGlobalValue).not.equal(null)
    expect(viewGlobalValue).not.equal(undefined)
    expect(viewGlobalValue).to.equal(`<input type="hidden" name="_csrf" value="${cookieValue}">`)
  })

  it('should pass the request when _csrf value is present as a query string', function * () {
    const newConfig = defaultConfig
    newConfig.csrf.enable = true
    const Config = {
      get: function () {
        return newConfig
      }
    }
    const shield = new Shield(Config, View)
    const server = http.createServer(function (req, res) {
      req.request = req
      req.session = {
        get: function * () {
          return csrfSecret
        },
        put: function * () {}
      }
      req.method = function () {
        return 'POST'
      }
      req.input = function () {
        return req.url.split('_csrf=')[1]
      }
      req.header = function (key) {
        return req.headers[key]
      }
      req.match = function () {
        return false
      }

      const response = {}
      response.header = function (key, value) {
        res.setHeader(key, value)
      }
      response.cookie = function (key, value) {
      }

      co(function * () {
        return yield shield.handle(req, response, function * () {})
      })
      .then(function () {
        res.writeHead(200, {"Content-type": "application/json"})
        res.end()
      })
      .catch(function (error) {
        console.log(error)
        res.writeHead(error.status, {"Content-type": "application/json"})
        res.write(JSON.stringify({body:error.message}))
        res.end()
      })
    })
    const response = yield supertest(server).get('/?_csrf='+csrf.create(csrfSecret)).expect(200)
  })

  it('should pass the request when csrf-token header is present', function * () {
    const newConfig = defaultConfig
    newConfig.csrf.enable = true
    const Config = {
      get: function () {
        return newConfig
      }
    }
    const shield = new Shield(Config, View)
    const server = http.createServer(function (req, res) {
      req.request = req
      req.session = {
        get: function * () {
          return csrfSecret
        },
        put: function * () {}
      }
      req.method = function () {
        return 'POST'
      }
      req.input = function () {}

      req.header = function (key) {
        return req.headers[key]
      }
      req.match = function () {
        return false
      }

      const response = {}
      response.header = function (key, value) {
        res.setHeader(key, value)
      }
      response.cookie = function (key, value) {
      }

      co(function * () {
        return yield shield.handle(req, response, function * () {})
      })
      .then(function () {
        res.writeHead(200, {"Content-type": "application/json"})
        res.end()
      })
      .catch(function (error) {
        console.log(error)
        res.writeHead(error.status, {"Content-type": "application/json"})
        res.write(JSON.stringify({body:error.message}))
        res.end()
      })
    })
    const response = yield supertest(server).get('/').set('csrf-token', csrf.create(csrfSecret)).expect(200)
  })

  it('should pass the request when x-csrf-token header is present', function * () {
    const newConfig = defaultConfig
    newConfig.csrf.enable = true
    const Config = {
      get: function () {
        return newConfig
      }
    }
    const shield = new Shield(Config, View)
    const server = http.createServer(function (req, res) {
      req.request = req
      req.session = {
        get: function * () {
          return csrfSecret
        },
        put: function * () {}
      }
      req.method = function () {
        return 'POST'
      }
      req.input = function () {}

      req.header = function (key) {
        return req.headers[key]
      }

      const response = {}
      response.header = function (key, value) {
        res.setHeader(key, value)
      }
      response.cookie = function (key, value) {
      }
      req.match = function () {
        return false
      }

      co(function * () {
        return yield shield.handle(req, response, function * () {})
      })
      .then(function () {
        res.writeHead(200, {"Content-type": "application/json"})
        res.end()
      })
      .catch(function (error) {
        console.log(error)
        res.writeHead(error.status, {"Content-type": "application/json"})
        res.write(JSON.stringify({body:error.message}))
        res.end()
      })
    })
    const response = yield supertest(server).get('/').set('x-csrf-token', csrf.create(csrfSecret)).expect(200)
  })

  it('should pass the request when x-xsrf-token header is present', function * () {
    const newConfig = defaultConfig
    newConfig.csrf.enable = true
    const Config = {
      get: function () {
        return newConfig
      }
    }
    const shield = new Shield(Config, View)
    const server = http.createServer(function (req, res) {
      req.request = req
      req.session = {
        get: function * () {
          return csrfSecret
        },
        put: function * () {}
      }
      req.method = function () {
        return 'POST'
      }
      req.input = function () {}

      req.header = function (key) {
        return req.headers[key]
      }
      req.match = function () {
        return false
      }

      const response = {}
      response.header = function (key, value) {
        res.setHeader(key, value)
      }
      response.cookie = function (key, value) {
      }

      co(function * () {
        return yield shield.handle(req, response, function * () {})
      })
      .then(function () {
        res.writeHead(200, {"Content-type": "application/json"})
        res.end()
      })
      .catch(function (error) {
        console.log(error)
        res.writeHead(error.status, {"Content-type": "application/json"})
        res.write(JSON.stringify({body:error.message}))
        res.end()
      })
    })
    const response = yield supertest(server).get('/').set('x-xsrf-token', csrf.create(csrfSecret)).expect(200)
  })

  it('should setup csp header with given values', function * () {
    const newConfig = defaultConfig
    newConfig.csp.directives = {
      defaultSrc: ['self']
    }
    const Config = {
      get: function () {
        return newConfig
      }
    }
    const shield = new Shield(Config, View)
    const server = http.createServer(function (req, res) {
      req.request = req
      req.session = {
        get: function * () {
          return csrfSecret
        },
        put: function * () {}
      }
      req.method = function () {
        return 'GET'
      }

      req.header = function (key) {
        return req.headers[key]
      }
      req.match = function () {
        return false
      }

      const response = {}
      response.header = function (key, value) {
        res.setHeader(key, value)
      }
      response.cookie = function (key, value) {
      }

      co(function * () {
        return yield shield.handle(req, response, function * () {})
      })
      .then(function () {
        res.writeHead(200, {"Content-type": "application/json"})
        res.end()
      })
      .catch(function (error) {
        console.log(error)
        res.writeHead(error.status, {"Content-type": "application/json"})
        res.write(JSON.stringify({body:error.message}))
        res.end()
      })
    })
    const response = yield supertest(server).get('/').expect(200)
    expect(response.headers).to.have.property('content-security-policy')
    expect(response.headers['content-security-policy'].trim()).to.equal("default-src 'self';")
  })

  it('should setup view helper for csp header with given values', function * () {
    const newConfig = defaultConfig
    let viewGlobalValue = null
    newConfig.csp.directives = {
      defaultSrc: ['self']
    }
    const Config = {
      get: function () {
        return newConfig
      }
    }
    const View = {
      global: function (key, value) {
        if(key === 'cspMeta') {
          viewGlobalValue = value
        }
      }
    }
    const shield = new Shield(Config, View)
    const server = http.createServer(function (req, res) {
      req.request = req
      req.session = {
        get: function * () {
          return csrfSecret
        },
        put: function * () {}
      }
      req.method = function () {
        return 'GET'
      }

      req.header = function (key) {
        return req.headers[key]
      }
      req.match = function () {
        return false
      }

      const response = {}
      response.header = function (key, value) {
        res.setHeader(key, value)
      }
      response.cookie = function (key, value) {
      }

      co(function * () {
        return yield shield.handle(req, response, function * () {})
      })
      .then(function () {
        res.writeHead(200, {"Content-type": "application/json"})
        res.end()
      })
      .catch(function (error) {
        console.log(error)
        res.writeHead(error.status, {"Content-type": "application/json"})
        res.write(JSON.stringify({body:error.message}))
        res.end()
      })
    })
    const response = yield supertest(server).get('/').expect(200)
    const globalMetaTags = viewGlobalValue.split("\n")
    expect(globalMetaTags).to.have.length(3)
    expect(globalMetaTags[0]).to.equal(`<meta http-equiv="Content-Security-Policy" content="default-src 'self'; ">`)
    expect(globalMetaTags[1]).to.equal(`<meta http-equiv="X-Content-Security-Policy" content="default-src 'self'; ">`)
    expect(globalMetaTags[2]).to.equal(`<meta http-equiv="X-WebKit-CSP" content="default-src 'self'; ">`)
  })
})
