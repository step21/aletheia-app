const ipfsAPI = require('ipfs-api')
const EventEmitter = require('events').EventEmitter
const ee = new EventEmitter()
const fs = require('fs')

let _ipfsClient = null

function checkConnection () {
  return _ipfsClient.swarm.peers().then((result) => {
    ee.emit('peer-update', null, result.length)
  }).catch((e) => {
    ee.emit('peer-update', e)
    console.error(e, e.stack)
    throw e
  })
}

module.exports = {
  checkConnection: checkConnection,
  init: function (args) {
    _ipfsClient = ipfsAPI(args.address)
    window.ipfs = _ipfsClient
    setTimeout(checkConnection, args.statusPollIntervalMs)
    console.log('init')
    checkConnection()
  },
  addFileFromPath: function (args) {
    if (typeof args.filePath !== 'string') {
      throw {err: 'filePath was null'}
    }
    console.log(args.filePath)
    const fileStream = fs.createReadStream(args.filePath)
    // using the lower level method so that we do not reveal the user's local file path to the network
    return _ipfsClient.files.add([{path: '', content: fileStream}])
  },
  onNumPeersChange: function (cb) {
    ee.on('peer-update', function (err, numPeers) {
      cb(err, numPeers)
    })
  }

}
