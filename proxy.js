const Plugin = require('ilp-plugin-xrp-escrow')
const http = require('http')
const fetch = require('node-fetch')
const uuid = require('uuid/v4')

const plugin = new Plugin({
  secret: 'sndb5JDdyWiHZia9zv44zSr2itRy1',
  account: 'rGtqDAJNTDMLaNNfq1RVYgPT8onFMj19Aj',
  server: 'wss://s.altnet.rippletest.net:51233',
  prefix: 'test.crypto.xrp.'
})

const pendingRes = {}

plugin.connect().then(() => {
  plugin.on('outgoing_fulfill', (transfer, fulfillment) => {
    console.log('outgoing fulfill', transfer, fulfillment, 'http://localhost:8000/' + fulfillment)
    fetch('http://localhost:8000/' + fulfillment).then(inRes => {
      return inRes.text()
    }).then(body => {
      pendingRes[transfer.id].end(body)
    })
  })

  function sendTransfer(obj) {
    obj.id = uuid()
    obj.from = plugin.getAccount()
    // to
    obj.ledger = plugin.getInfo().prefix
    // amount
    obj.ilp = 'AA'
    obj.noteToSelf = {}
    // executionCondition
    obj.expiresAt = new Date(new Date().getTime() + 1000000).toISOString()
    obj.custom = {}
    return plugin.sendTransfer(obj).then(() => obj.id)
  }

  http.createServer((req, outRes) => {
    fetch('http://localhost:8000' + req.url).then(inRes => {
      return  inRes.text()
    }).then(body => {
      const parts = body.split(' ')
      if (parts[0] === 'Please') {
        sendTransfer({
          to: parts[6],
          amount: '1',
          executionCondition: parts[9]
        }).then(transferId => {
          console.log('transfer sent', transferId)
          pendingRes[transferId] = outRes
        }, (err) => {
          console.error(err.message)
        })
      } else {
        outRes.end(parts.join(' '))
      }
    })
  }).listen(8001)
})
