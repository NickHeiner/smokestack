var shoe      = require('shoe')('/smokestack')
var stringify = require('json-stringify-safe')
var slice     = require('sliced')
var isDom     = require('is-dom')
var console   = window.console

;['error'
, 'info'
, 'log'
, 'debug'
, 'warn'
].forEach(function(k) {
  var old = console[k]
  var prefix = [k]

  console[k] = function() {
    // keep original args so browser can log as usual
    var args = slice(arguments)

    // prepare args for transport
    var cleanArgs = args.map(function(item) {
      // no sensible default for stringifying
      // DOM Elements nicely so just toString and let
      // whoever is logging handle stringification.
      if (isDom(item)) return item.toString()
      return item
    })

    var data = stringify(prefix.concat(cleanArgs))

    shoe.write(data)
    shoe.write('\n')

    return old.apply(this, args)
  }
})

var close = window.close

window.close = function() {
  shoe.write(JSON.stringify({ end: true }))
  shoe.write('\n')
  shoe.once('data', function(data) {
    close()
  })
}

shoe.on('end', function() {
  close()
})

window.onerror = function (message, filename, lineno, colno, error) {
  console.error("%s\n%s", message, error && error.stack.toString());
  window.close()
}
