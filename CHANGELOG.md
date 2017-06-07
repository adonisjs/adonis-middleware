<a name="1.0.14"></a>
## [1.0.14](https://github.com/adonisjs/adonis-middleware/compare/v1.0.13...v1.0.14) (2017-06-07)


### Features

* **csrf:** allow CSRF cookie options via csrf config ([f28b5d1](https://github.com/adonisjs/adonis-middleware/commit/f28b5d1))



<a name="1.0.13"></a>
## [1.0.13](https://github.com/adonisjs/adonis-middleware/compare/v1.0.12...v1.0.13) (2017-04-09)


### Bug Fixes

* **bodyparser:** handle multipart fields with care ([7d17bc0](https://github.com/adonisjs/adonis-middleware/commit/7d17bc0)), closes [#10](https://github.com/adonisjs/adonis-middleware/issues/10)
* **bodyParser:** ignore aborted requests ([beb29e5](https://github.com/adonisjs/adonis-middleware/commit/beb29e5)), closes [#9](https://github.com/adonisjs/adonis-middleware/issues/9)
* **multipart:** process files via formFields class ([8b5dacd](https://github.com/adonisjs/adonis-middleware/commit/8b5dacd)), closes [#10](https://github.com/adonisjs/adonis-middleware/issues/10)



<a name="1.0.12"></a>
## [1.0.12](https://github.com/adonisjs/adonis-middleware/compare/v1.0.11...v1.0.12) (2017-03-25)


### Bug Fixes

* **middleware:** use response.viewInstance when available ([61f8aac](https://github.com/adonisjs/adonis-middleware/commit/61f8aac))



<a name="1.0.11"></a>
## [1.0.11](https://github.com/adonisjs/adonis-middleware/compare/v1.0.10...v1.0.11) (2017-02-25)


### Bug Fixes

* **bodyParser:** parse array fields properly ([48dfb8c](https://github.com/adonisjs/adonis-middleware/commit/48dfb8c)), closes [#8](https://github.com/adonisjs/adonis-middleware/issues/8)



<a name="1.0.10"></a>
## [1.0.10](https://github.com/adonisjs/adonis-middleware/compare/v1.0.9...v1.0.10) (2016-12-12)



<a name="1.0.9"></a>
## [1.0.9](https://github.com/adonisjs/adonis-middleware/compare/v1.0.8...v1.0.9) (2016-11-18)


### Bug Fixes

* **csrf:** do not encrypt xsrf-token ([6bbf1ef](https://github.com/adonisjs/adonis-middleware/commit/6bbf1ef)), closes [#5](https://github.com/adonisjs/adonis-middleware/issues/5)



<a name="1.0.8"></a>
## [1.0.8](https://github.com/adonisjs/adonis-middleware/compare/v1.0.7...v1.0.8) (2016-09-26)


### Bug Fixes

* **cors:** set proper headers when request is not options ([920320a](https://github.com/adonisjs/adonis-middleware/commit/920320a))



### Features

* **shield:csrf:** add support for host and origin match ([8cf1ac5](https://github.com/adonisjs/adonis-middleware/commit/8cf1ac5))

<a name="1.0.6"></a>
## 1.0.6 (2016-06-26)


### Bug Fixes

* **bodyparser:** handle file uploads maxSize([36b569d](https://github.com/adonisjs/adonis-middleware/commit/36b569d))
* **bodyparser:** inject config to the bodyparser instance([92cf2f8](https://github.com/adonisjs/adonis-middleware/commit/92cf2f8))
* **bodyParser:** now body parser checks for body length before reading it [#1](https://github.com/adonisjs/adonis-middleware/issues/1)([d3fcdf6](https://github.com/adonisjs/adonis-middleware/commit/d3fcdf6))


### Features

* **bodyParser:** make body parsing configurable([7389f98](https://github.com/adonisjs/adonis-middleware/commit/7389f98))
* **coveralls:** added coveralls hook([4c89535](https://github.com/adonisjs/adonis-middleware/commit/4c89535))
* **flash-sessions:** added new methods to set flash messages([e4e2f57](https://github.com/adonisjs/adonis-middleware/commit/e4e2f57))
* **package.json:** Added commitizen([5315bc8](https://github.com/adonisjs/adonis-middleware/commit/5315bc8))
* **sheild-middleware:** Added shield middleware and completed it's tests([25628db](https://github.com/adonisjs/adonis-middleware/commit/25628db))
* **travis:** Added travis.yml([71c2a48](https://github.com/adonisjs/adonis-middleware/commit/71c2a48))



<a name="1.0.5"></a>
## 1.0.5 (2016-01-29)


### Bug Fixes

* **bodyParser:** now body parser checks for body length before reading it #1 ([d3fcdf6](https://github.com/adonisjs/adonis-middleware/commit/d3fcdf6))

### Features

* **coveralls:** added coveralls hook ([4c89535](https://github.com/adonisjs/adonis-middleware/commit/4c89535))
* **package.json:** Added commitizen ([5315bc8](https://github.com/adonisjs/adonis-middleware/commit/5315bc8))
* **sheild-middleware:** Added shield middleware and completed it's tests ([25628db](https://github.com/adonisjs/adonis-middleware/commit/25628db))
* **travis:** Added travis.yml ([71c2a48](https://github.com/adonisjs/adonis-middleware/commit/71c2a48))



<a name="1.0.4"></a>
## 1.0.4 (2016-01-29)


### Bug Fixes

* **bodyParser:** now body parser checks for body length before reading it #1 ([d3fcdf6](https://github.com/adonisjs/adonis-middleware/commit/d3fcdf6))

### Features

* **coveralls:** added coveralls hook ([4c89535](https://github.com/adonisjs/adonis-middleware/commit/4c89535))
* **package.json:** Added commitizen ([5315bc8](https://github.com/adonisjs/adonis-middleware/commit/5315bc8))
* **sheild-middleware:** Added shield middleware and completed it's tests ([25628db](https://github.com/adonisjs/adonis-middleware/commit/25628db))
* **travis:** Added travis.yml ([71c2a48](https://github.com/adonisjs/adonis-middleware/commit/71c2a48))



<a name="1.0.2"></a>
## 1.0.2 (2016-01-16)
### Features

* **coveralls:** added coveralls hook ([4c89535](https://github.com/adonisjs/adonis-middleware/commit/4c89535))
* **package.json:** Added commitizen ([5315bc8](https://github.com/adonisjs/adonis-middleware/commit/5315bc8))
* **sheild-middleware:** Added shield middleware and completed it's tests ([25628db](https://github.com/adonisjs/adonis-middleware/commit/25628db))
* **travis:** Added travis.yml ([71c2a48](https://github.com/adonisjs/adonis-middleware/commit/71c2a48))

<a name="1.0.0"></a>
# 1.0.0 (2016-01-14)
### feat

* feat(package.json): Added commitizen ([5315bc8](https://github.com/adonisjs/adonis-middleware/commit/5315bc8))
* feat(sheild-middleware): Added shield middleware and completed it's tests ([25628db](https://github.com/adonisjs/adonis-middleware/commit/25628db))
* feat(travis): Added travis.yml ([71c2a48](https://github.com/adonisjs/adonis-middleware/commit/71c2a48))

* Added all official middleware supported till now except Shield ([0771269](https://github.com/adonisjs/adonis-middleware/commit/0771269))
* Added tests for existing middleware and added shield middleware ([0cc255f](https://github.com/adonisjs/adonis-middleware/commit/0cc255f))
* Initial commit ([3b795eb](https://github.com/adonisjs/adonis-middleware/commit/3b795eb))
* style(readme,contributing,license): Added github required files ([d692b5d](https://github.com/adonisjs/adonis-middleware/commit/d692b5d))
