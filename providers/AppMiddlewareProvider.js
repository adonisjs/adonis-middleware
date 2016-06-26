'use strict'

const ServiceProvider = require('adonis-fold').ServiceProvider

class AppMiddlewareProvider extends ServiceProvider {

  * register () {
    this.app.bind('Adonis/Middleware/BodyParser', function (app) {
      const Config = app.use('Adonis/Src/Config')
      const BodyParser = require('../src/BodyParser')
      return new BodyParser(Config)
    })

    this.app.bind('Adonis/Middleware/Cors', function (app) {
      const Config = app.use('Adonis/Src/Config')
      const Cors = require('../src/Cors')
      return new Cors(Config)
    })

    this.app.bind('Adonis/Middleware/Flash', function (app) {
      const View = app.use('Adonis/Src/View')
      const Flash = require('../src/Flash')
      return new Flash(View)
    })

    this.app.bind('Adonis/Middleware/Shield', function (app) {
      const Config = app.use('Adonis/Src/Config')
      const View = app.use('Adonis/Src/View')
      const Shield = require('../src/Shield')
      return new Shield(Config, View)
    })
  }

}

module.exports = AppMiddlewareProvider
