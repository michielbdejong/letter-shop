const http = require('http')
const Koa = require('koa')
const router = require('koa-router')()
const parser = require('koa-bodyparser')()
const Ilp = require('koa-ilp')
const Plugin = require('ilp-plugin-btp')

const server = http.createServer()
server.listen(process.env.PORT)
const plugin = new Plugin({ server: process.env.BTP_URL })
plugin.connect().then(() => {
  console.log('Now use `moneyd` + ilp-curl https://letter-shop.herokuapp.com/ to buy a letter!')
})
const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('')
const price = 1000
const ilp = new Ilp({ plugin })
router.options('/', ilp.options({ price }))
router.get('/', ilp.paid({ price }), async ctx => {
  const letter = letters[(Math.floor(Math.random() * 26))]
  ctx.body = { message: 'Your letter: ' + letter }
})

const app = new Koa()
app
  .use(parser)
  .use(router.routes())
  .use(router.allowedMethods())
server.on('request', app.callback())
