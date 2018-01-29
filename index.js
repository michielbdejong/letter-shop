const http = require('http')
const Koa = require('koa')
const router = require('koa-router')()
const parser = require('koa-bodyparser')()
const Ilp = require('koa-ilp')
const Plugin = require('ilp-plugin-mini-accounts')

const server = http.createServer()
server.listen(process.env.PORT)
const plugin = new Plugin({
  wsOpts: {
    server
  },
  debugHostIldcpInfo: {
    clientAddress: 'g.letter-shop',
    assetScale: 6,
    assetCode: 'XRP'
  }
})
plugin.connect().then(() => {
  console.log('Now run `PORT=' + process.env.PORT + ' node ./pay.js`')
})
const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('')
const price = 1000
const ilp = new Ilp({ plugin })
router.options('/', ilp.options({ price }))
router.get('/', ilp.paid({ price }), async ctx => {
  const letter = letters[(Math.floor(Math.random() * 26))]
  ctx.body = 'Your letter: ' + letter
})

const app = new Koa()
app
  .use(parser)
  .use(router.routes())
  .use(router.allowedMethods())
server.on('request', app.callback())
