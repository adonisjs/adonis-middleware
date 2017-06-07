'use strict'

/**
 * adonis-middleware
 * Copyright(c) 2016-2016 Harminder Virk
 * MIT Licensed
*/
const Ioc = require('adonis-fold').Ioc
global.use = Ioc.use

const Shield = require('../src/Shield')
const chai = require('chai')
const expect = chai.expect
const http = require('http')
const co = require('co')
const csrf = new (require('csrf'))()
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
  global: function () {},
  viewsEnv: {
    filters: {
      safe: function (input) {
        return input
      }
    }
  }
}

describe('Shield', function () {
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
      response.response = res
      response.header = function (key, value) {
        res.setHeader(key, value)
      }
      co(function * () {
        return yield shield.handle(req, response, function * () {})
      })
        .then(function () {
          res.writeHead(200, {'Content-type': 'application/json'})
          res.end()
        })
        .catch(function () {
          res.writeHead(500, {'Content-type': 'application/json'})
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
      response.response = res
      response.header = function (key, value) {
        res.setHeader(key, value)
      }
      response.cookie = function () {}
      co(function * () {
        return yield shield.handle(req, response, function * () {})
      })
        .then(function () {
          res.writeHead(200, {'Content-type': 'application/json'})
          res.end()
        })
        .catch(function (error) {
          console.log(error)
          res.writeHead(500, {'Content-type': 'application/json'})
          res.end()
        })
    })
    yield supertest(server).get('/').expect(200)
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
      response.response = res
      response.header = function (key, value) {
        res.setHeader(key, value)
      }
      response.cookie = function () {}
      co(function * () {
        return yield shield.handle(req, response, function * () {})
      })
        .then(function () {
          res.writeHead(200, {'Content-type': 'application/json'})
          res.end()
        })
        .catch(function (error) {
          res.writeHead(error.status, {'Content-type': 'application/json'})
          res.write(JSON.stringify({body: error.message}))
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
      response.response = res
      response.header = function (key, value) {
        res.setHeader(key, value)
      }
      response.cookie = function () {}

      co(function * () {
        return yield shield.handle(req, response, function * () {})
      })
        .then(function () {
          res.writeHead(200, {'Content-type': 'application/json'})
          res.end()
        })
        .catch(function (error) {
          res.writeHead(error.status, {'Content-type': 'application/json'})
          res.write(JSON.stringify({body: error.message}))
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
      response.response = res
      response.header = function (key, value) {
        res.setHeader(key, value)
      }
      response.cookie = function () {}

      co(function * () {
        return yield shield.handle(req, response, function * () {})
      })
        .then(function () {
          res.writeHead(200, {'Content-type': 'application/json'})
          res.end()
        })
        .catch(function (error) {
          console.log(error)
          res.writeHead(error.status, {'Content-type': 'application/json'})
          res.write(JSON.stringify({body: error.message}))
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
      response.response = res
      response.header = function (key, value) {
        res.setHeader(key, value)
      }
      response.cookie = function () {}

      co(function * () {
        return yield shield.handle(req, response, function * () {})
      })
        .then(function () {
          res.writeHead(200, {'Content-type': 'application/json'})
          res.end()
        })
        .catch(function (error) {
          res.writeHead(error.status, {'Content-type': 'application/json'})
          res.write(JSON.stringify({body: error.message}))
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
      response.response = res
      response.header = function (key, value) {
        res.setHeader(key, value)
      }
      response.cookie = function () {}

      co(function * () {
        return yield shield.handle(req, response, function * () {})
      })
        .then(function () {
          res.writeHead(200, {'Content-type': 'application/json'})
          res.end()
        })
        .catch(function (error) {
          console.log(error)
          res.writeHead(error.status, {'Content-type': 'application/json'})
          res.write(JSON.stringify({body: error.message}))
          res.end()
        })
    })
    yield supertest(server).get('/').expect(200)
  })

  it('should set csrfToken method on request object when csrf is enabled', function * () {
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
      response.response = res
      response.header = function (key, value) {
        res.setHeader(key, value)
      }

      co(function * () {
        return yield shield.handle(req, response, function * () {})
      })
        .then(function () {
          res.writeHead(200, {'Content-type': 'application/json'})
          res.write(JSON.stringify({token: req.csrfToken()}))
          res.end()
        })
        .catch(function (error) {
          res.writeHead(error.status, {'Content-type': 'application/json'})
          res.write(JSON.stringify({body: error.message}))
          res.end()
        })
    })
    const response = yield supertest(server).get('/').expect(200)
    expect(response.body.token).not.equal(null)
    expect(response.body.token).not.equal(undefined)
  })

  it('should add csrfToken view helper method when csrf is enabled', function * () {
    const newConfig = defaultConfig
    let viewGlobalValue = null
    newConfig.csrf.enable = true
    const Config = {
      get: function () {
        return newConfig
      }
    }
    const altView = {
      global: function (key, value) {
        if (key === 'csrfToken') {
          viewGlobalValue = value
        }
      },
      viewsEnv: View.viewsEnv
    }
    const shield = new Shield(Config, altView)
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
      response.response = res
      response.header = function (key, value) {
        res.setHeader(key, value)
      }

      co(function * () {
        return yield shield.handle(req, response, function * () {})
      })
        .then(function () {
          res.writeHead(200, {'Content-type': 'application/json'})
          res.write(JSON.stringify({token: req.csrfToken()}))
          res.end()
        })
        .catch(function (error) {
          res.writeHead(error.status, {'Content-type': 'application/json'})
          res.write(JSON.stringify({body: error.message}))
          res.end()
        })
    })
    yield supertest(server).get('/').expect(200)
    expect(viewGlobalValue).not.equal(null)
    expect(viewGlobalValue).not.equal(undefined)
  })

  it('should add csrfField view helper method when csrf is enabled', function * () {
    const newConfig = defaultConfig
    let viewGlobalValue = null
    newConfig.csrf.enable = true
    const Config = {
      get: function () {
        return newConfig
      }
    }
    const altView = {
      global: function (key, value) {
        if (key === 'csrfField') {
          viewGlobalValue = value
        }
      },
      viewsEnv: View.viewsEnv
    }
    const shield = new Shield(Config, altView)
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
      response.response = res
      response.header = function (key, value) {
        res.setHeader(key, value)
      }

      co(function * () {
        return yield shield.handle(req, response, function * () {})
      })
        .then(function () {
          res.writeHead(200, {'Content-type': 'application/json'})
          res.write(JSON.stringify({token: req.csrfToken()}))
          res.end()
        })
        .catch(function (error) {
          res.writeHead(error.status, {'Content-type': 'application/json'})
          res.write(JSON.stringify({body: error.message}))
          res.end()
        })
    })
    const res = yield supertest(server).get('/').expect(200)
    expect(viewGlobalValue).not.equal(null)
    expect(viewGlobalValue).not.equal(undefined)
    expect(viewGlobalValue).to.equal(`<input type="hidden" name="_csrf" value="${res.body.token}">`)
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
      response.response = res
      response.header = function (key, value) {
        res.setHeader(key, value)
      }
      response.cookie = function (key, value) {}

      co(function * () {
        return yield shield.handle(req, response, function * () {})
      })
        .then(function () {
          res.writeHead(200, {'Content-type': 'application/json'})
          res.end()
        })
        .catch(function (error) {
          console.log(error)
          res.writeHead(error.status, {'Content-type': 'application/json'})
          res.write(JSON.stringify({body: error.message}))
          res.end()
        })
    })
    yield supertest(server).get('/?_csrf=' + csrf.create(csrfSecret)).expect(200)
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
      response.response = res
      response.header = function (key, value) {
        res.setHeader(key, value)
      }
      response.cookie = function (key, value) {}

      co(function * () {
        return yield shield.handle(req, response, function * () {})
      })
        .then(function () {
          res.writeHead(200, {'Content-type': 'application/json'})
          res.end()
        })
        .catch(function (error) {
          console.log(error)
          res.writeHead(error.status, {'Content-type': 'application/json'})
          res.write(JSON.stringify({body: error.message}))
          res.end()
        })
    })
    yield supertest(server).get('/').set('csrf-token', csrf.create(csrfSecret)).expect(200)
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
      response.response = res
      response.header = function (key, value) {
        res.setHeader(key, value)
      }
      response.cookie = function (key, value) {}
      req.match = function () {
        return false
      }

      co(function * () {
        return yield shield.handle(req, response, function * () {})
      })
        .then(function () {
          res.writeHead(200, {'Content-type': 'application/json'})
          res.end()
        })
        .catch(function (error) {
          console.log(error)
          res.writeHead(error.status, {'Content-type': 'application/json'})
          res.write(JSON.stringify({body: error.message}))
          res.end()
        })
    })
    yield supertest(server).get('/').set('x-csrf-token', csrf.create(csrfSecret)).expect(200)
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
      response.response = res
      response.header = function (key, value) {
        res.setHeader(key, value)
      }
      response.cookie = function (key, value) {}

      co(function * () {
        return yield shield.handle(req, response, function * () {})
      })
        .then(function () {
          res.writeHead(200, {'Content-type': 'application/json'})
          res.end()
        })
        .catch(function (error) {
          console.log(error)
          res.writeHead(error.status, {'Content-type': 'application/json'})
          res.write(JSON.stringify({body: error.message}))
          res.end()
        })
    })
    yield supertest(server).get('/').set('x-xsrf-token', csrf.create(csrfSecret)).expect(200)
  })

  it('should throw error when host and origin are not the same', function * () {
    const newConfig = defaultConfig
    newConfig.csrf.enable = true
    newConfig.csrf.compareHostAndOrigin = true
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
      req.hostname = function () {
        return req.headers['host']
      }

      req.header = function (key) {
        return req.headers[key]
      }
      req.match = function () {
        return false
      }

      const response = {}
      response.response = res
      response.header = function (key, value) {
        res.setHeader(key, value)
      }
      response.cookie = function (key, value) {}

      co(function * () {
        return yield shield.handle(req, response, function * () {})
      })
        .then(function () {
          res.writeHead(200, {'Content-type': 'application/json'})
          res.end()
        })
        .catch(function (error) {
          res.writeHead(error.status, {'Content-type': 'application/json'})
          res.write(JSON.stringify({body: error.message}))
          res.end()
        })
    })
    const response = yield supertest(server).get('/').set('origin', 'http://attack.dev').set('x-xsrf-token', csrf.create(csrfSecret)).expect(403)
    expect(response.body.body).to.equal('host and origin mis-match')
  })

  it('should work fine when host and origin are same', function * () {
    const newConfig = defaultConfig
    newConfig.csrf.enable = true
    newConfig.csrf.compareHostAndOrigin = true
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
      req.hostname = function () {
        return req.headers['host'].split(':')[0]
      }

      req.header = function (key) {
        return req.headers[key]
      }
      req.match = function () {
        return false
      }

      const response = {}
      response.response = res
      response.header = function (key, value) {
        res.setHeader(key, value)
      }
      response.cookie = function (key, value) {}

      co(function * () {
        return yield shield.handle(req, response, function * () {})
      })
        .then(function () {
          res.writeHead(200, {'Content-type': 'application/json'})
          res.end()
        })
        .catch(function (error) {
          res.writeHead(error.status, {'Content-type': 'application/json'})
          res.write(JSON.stringify({body: error.message}))
          res.end()
        })
    })
    yield supertest(server).get('/').set('origin', 'http://127.0.0.1').set('x-xsrf-token', csrf.create(csrfSecret)).expect(200)
  })

  it('should fallback to referer when origin is not defined', function * () {
    const newConfig = defaultConfig
    newConfig.csrf.enable = true
    newConfig.csrf.compareHostAndOrigin = true
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
      req.hostname = function () {
        return req.headers['host'].split(':')[0]
      }

      req.header = function (key) {
        return req.headers[key]
      }
      req.match = function () {
        return false
      }

      const response = {}
      response.response = res
      response.header = function (key, value) {
        res.setHeader(key, value)
      }
      response.cookie = function (key, value) {}

      co(function * () {
        return yield shield.handle(req, response, function * () {})
      })
        .then(function () {
          res.writeHead(200, {'Content-type': 'application/json'})
          res.end()
        })
        .catch(function (error) {
          res.writeHead(error.status, {'Content-type': 'application/json'})
          res.write(JSON.stringify({body: error.message}))
          res.end()
        })
    })
    yield supertest(server).get('/').set('referer', 'http://127.0.0.1:3333/profile').set('x-xsrf-token', csrf.create(csrfSecret)).expect(200)
  })

  it('should throw error when origin or referer are not defined', function * () {
    const newConfig = defaultConfig
    newConfig.csrf.enable = true
    newConfig.csrf.compareHostAndOrigin = true
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
      req.hostname = function () {
        return req.headers['host'].split(':')[0]
      }

      req.header = function (key) {
        return req.headers[key]
      }
      req.match = function () {
        return false
      }

      const response = {}
      response.response = res
      response.header = function (key, value) {
        res.setHeader(key, value)
      }
      response.cookie = function (key, value) {}

      co(function * () {
        return yield shield.handle(req, response, function * () {})
      })
        .then(function () {
          res.writeHead(200, {'Content-type': 'application/json'})
          res.end()
        })
        .catch(function (error) {
          res.writeHead(error.status, {'Content-type': 'application/json'})
          res.write(JSON.stringify({body: error.message}))
          res.end()
        })
    })
    yield supertest(server).get('/').set('x-xsrf-token', csrf.create(csrfSecret)).expect(403)
  })

  it('should skip host origin match when compareHostAndOrigin is set to false', function * () {
    const newConfig = defaultConfig
    newConfig.csrf.enable = true
    newConfig.csrf.compareHostAndOrigin = false
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
      req.hostname = function () {
        return req.headers['host'].split(':')[0]
      }

      req.header = function (key) {
        return req.headers[key]
      }
      req.match = function () {
        return false
      }

      const response = {}
      response.response = res
      response.header = function (key, value) {
        res.setHeader(key, value)
      }
      response.cookie = function (key, value) {}

      co(function * () {
        return yield shield.handle(req, response, function * () {})
      })
        .then(function () {
          res.writeHead(200, {'Content-type': 'application/json'})
          res.end()
        })
        .catch(function (error) {
          res.writeHead(error.status, {'Content-type': 'application/json'})
          res.write(JSON.stringify({body: error.message}))
          res.end()
        })
    })
    yield supertest(server).get('/').set('x-xsrf-token', csrf.create(csrfSecret)).expect(200)
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
      response.response = res
      response.header = function (key, value) {
        res.setHeader(key, value)
      }
      response.cookie = function (key, value) {}

      co(function * () {
        return yield shield.handle(req, response, function * () {})
      })
        .then(function () {
          res.writeHead(200, {'Content-type': 'application/json'})
          res.end()
        })
        .catch(function (error) {
          console.log(error)
          res.writeHead(error.status, {'Content-type': 'application/json'})
          res.write(JSON.stringify({body: error.message}))
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
    const altView = {
      global: function (key, value) {
        if (key === 'cspMeta') {
          viewGlobalValue = value
        }
      },
      viewsEnv: View.viewsEnv
    }
    const shield = new Shield(Config, altView)
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
      response.response = res
      response.header = function (key, value) {
        res.setHeader(key, value)
      }
      response.cookie = function (key, value) {}

      co(function * () {
        return yield shield.handle(req, response, function * () {})
      })
        .then(function () {
          res.writeHead(200, {'Content-type': 'application/json'})
          res.end()
        })
        .catch(function (error) {
          console.log(error)
          res.writeHead(error.status, {'Content-type': 'application/json'})
          res.write(JSON.stringify({body: error.message}))
          res.end()
        })
    })
    yield supertest(server).get('/').expect(200)
    const globalMetaTags = viewGlobalValue.split('\n')
    expect(globalMetaTags).to.have.length(3)
    expect(globalMetaTags[0]).to.equal('<meta http-equiv="Content-Security-Policy" content="default-src \'self\'; ">')
    expect(globalMetaTags[1]).to.equal('<meta http-equiv="X-Content-Security-Policy" content="default-src \'self\'; ">')
    expect(globalMetaTags[2]).to.equal('<meta http-equiv="X-WebKit-CSP" content="default-src \'self\'; ">')
  })

  it('should set proper XSRF-TOKEN cookie options', function * () {
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
        put: function * (key, value) {
        }
      }
      req.method = function () {
        return 'GET'
      }
      req.match = function () {
        return false
      }
      const response = {}
      response.response = res
      response.header = function (key, value) {
        res.setHeader(key, value)
      }
      response.cookie = function () {}
      co(function * () {
        return yield shield.handle(req, response, function * () {})
      })
        .then(function () {
          res.writeHead(200, {'Content-type': 'application/json'})
          res.end()
        })
        .catch(function (error) {
          console.log(error)
          res.writeHead(500, {'Content-type': 'application/json'})
          res.end()
        })
    })
    const response = yield supertest(server).get('/').expect(200)
    expect(response.headers['set-cookie'][0]).to.include('Max-Age=7200')
    expect(response.headers['set-cookie'][0]).to.include('Path=/')
  })

  it('give priority to config inside shield file', function * () {
    const newConfig = defaultConfig
    newConfig.csrf.cookieOptions = {
      httpOnly: true,
      maxAge: 3600
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
          return undefined
        },
        put: function * (key, value) {
        }
      }
      req.method = function () {
        return 'GET'
      }
      req.match = function () {
        return false
      }
      const response = {}
      response.response = res
      response.header = function (key, value) {
        res.setHeader(key, value)
      }
      response.cookie = function () {}
      co(function * () {
        return yield shield.handle(req, response, function * () {})
      })
        .then(function () {
          res.writeHead(200, {'Content-type': 'application/json'})
          res.end()
        })
        .catch(function (error) {
          console.log(error)
          res.writeHead(500, {'Content-type': 'application/json'})
          res.end()
        })
    })
    const response = yield supertest(server).get('/').expect(200)
    expect(response.headers['set-cookie'][0]).to.include('Max-Age=3600')
    expect(response.headers['set-cookie'][0]).to.include('HttpOnly')
  })
})
