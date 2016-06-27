# Adonis Middleware

[![Gitter](https://img.shields.io/badge/+%20GITTER-JOIN%20CHAT%20%E2%86%92-1DCE73.svg?style=flat-square)](https://gitter.im/adonisjs/adonis-framework)
[![Trello](https://img.shields.io/badge/TRELLO-%E2%86%92-89609E.svg?style=flat-square)](https://trello.com/b/yzpqCgdl/adonis-for-humans)
[![Version](https://img.shields.io/npm/v/adonis-middleware.svg?style=flat-square)](https://www.npmjs.com/package/adonis-middleware)
[![Build Status](https://img.shields.io/travis/adonisjs/adonis-middleware/master.svg?style=flat-square)](https://travis-ci.org/adonisjs/adonis-middleware)
[![Coverage Status](https://img.shields.io/coveralls/adonisjs/adonis-middleware/master.svg?style=flat-square)](https://coveralls.io/github/adonisjs/adonis-middleware?branch=master)
[![Downloads](https://img.shields.io/npm/dt/adonis-middleware.svg?style=flat-square)](https://www.npmjs.com/package/adonis-middleware)
[![License](https://img.shields.io/npm/l/adonis-framework.svg?style=flat-square)](https://opensource.org/licenses/MIT)

> :pray: This repository contains official list of middleware to keep your adonis application rock solid :evergreen_tree:

Adonis frameworks ships with a bunch of middleware for commonly required tasks.

## List

- [Body Parser](http://adonisjs.com/docs/request)
- [Cors](http://adonisjs.com/docs/cors)
- [Flash](http://adonisjs.com/docs/sessions#flash-messages)
- [Shield](http://adonisjs.com/docs/security)

You can learn more about AdonisJS and all of its awesomeness on http://adonisjs.com :evergreen_tree:

## Table of Contents

* [Team Members](#team-members)
* [Requirements](#requirements)
* [Getting Started](#getting-started)
* [Contribution Guidelines](#contribution-guidelines)

## <a name="team-members"></a>Team Members

* Harminder Virk ([Caffiene Blogging](http://amanvirk.me/)) <virk.officials@gmail.com>

## <a name="requirements"></a>Requirements

AdonisJS is build on the top of ES2015, which makes the code more enjoyable and cleaner to read. It doesn't make use of any transpiler and depends upon Core V8 implemented features.

For these reasons, AdonisJS require you to use `node >= 4.0` and `npm >= 3.0`.

## <a name="getting-started"></a>Getting Started

```bash
npm i --save adonis-middleware
```

Add middleware provider to the list of providers inside `bootstrap/app.js` file.

```javascript
const providers = [
  'adonis-middleware/providers/AppMiddlewareProvider'
]
```

## <a name="contribution-guidelines"></a>Contribution Guidelines

In favor of active development we accept contributions for everyone. You can contribute by submitting a bug, creating pull requests or even improving documentation.

You can find a complete guide to be followed strictly before submitting your pull requests in the [Official Documentation](http://adonisjs.com/docs/2.0/contributing).
