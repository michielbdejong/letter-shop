const http = require('http')
const crypto = require('crypto')
const Plugin = require('ilp-plugin-xrp-escrow')

let fulfillments = {}
let letters = {}

function base64(buf) {
  return buf.toString('base64').replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
}

function generateFulfillment() {
  const fulfillment = crypto.randomBytes(32)
  const condition = crypto.createHash('sha256').update(fulfillment).digest()
  const conditionBase64 = base64(condition)
  const fulfillmentBase64 = base64(fulfillment)
  const letter = 'X'
  fulfillments[conditionBase64] = fulfillmentBase64
  letters[fulfillmentBase64] = letter
  console.log('Generated', conditionBase64, fulfillmentBase64, letter)
  return conditionBase64
}

const plugin = new Plugin({
  secret: 'ssGjGT4sz4rp2xahcDj87P71rTYXo',
  account: 'rrhnXcox5bEmZfJCHzPxajUtwdt772zrCW',
  server: 'wss://s.altnet.rippletest.net:51233',
  prefix: 'test.crypto.xrp.'
})

plugin.connect().then(() => {
  plugin.on('incoming_prepare', (transfer) => {
    if (fulfillments[transfer.executionCondition]) {
      console.log('fulfilling', transfer)
      plugin.fulfillCondition(transfer.id, fulfillments[transfer.executionCondition]).then(() => {
        console.log('fulfilled')
        fulfillments[transfer.executionCondition].res.end('Your letter: X')
        delete fulfillments[transfer.executionCondition]
      })
    }
  })

  http.createServer((req, res) => {
    res.writeHead(200, {
      'Content-Type': 'text/html'
    })
    if (letters[req.url.substring(1)]) {
      res.end(`<h2>Your letter: ${letters[req.url.substring(1)]}</h2>`)
    } else {
      const conditionBase64 = generateFulfillment()
      res.end(`<p>Please send an Interledger payment to ${plugin.getAccount()} with condition ${conditionBase64}`)
    }
  }).listen(process.env.PORT)
})
