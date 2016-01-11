# Cors

[Cors](https://developer.mozilla.org/en-US/docs/Web/HTTP/Access_control_CORS) is a way of restricting 3rd party apps from making requests to your server using an Ajax request.

This middleware handles cors with the help of a config file inside `config` directory.


#### config/cors.js

```javascript
/*
|--------------------------------------------------------------------------
| Cors
|--------------------------------------------------------------------------
|
| Cross domain calls from browsers are sent to server to make the decision whether
| to allow the request or not. This process is done using a preflight request.
| Here we define parameters for HTTP preflight/OPTIONS request.
|
*/
module.exports = {
  origin: false,
  methods: 'GET, PUT, POST',
  headers: true,
  exposeHeaders: false,
  credentials: false,
  maxAge: 90
}
```

You can read more on cors [here](http://adonisjs.com/docs/2.0/cors)