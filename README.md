# OS.js Hardware Service Provider

A service provider that adds hardware access.

# Install

In the OS.js's V3 install directory, run:
```
$ npm install --save osjs-hardware-provider
```
In `src/client/index.js`'s `init()` function, add `osjs.register(require("osjs-hardware-provider/client.js"));` before `osjs.boot()`
In `src/server/index.js`, add `osjs.register(require("osjs-hardware-provider/server.js"));` before `process.on('SIGTERM', () => osjs.destroy());`
Now run `npm build` and you're done.
