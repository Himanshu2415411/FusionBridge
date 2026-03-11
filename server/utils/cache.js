const NodeCache = require("node-cache")

const cache = new NodeCache({
  stdTTL: 60,
  checkperiod: 120,
})

function getCache(key) {
  return cache.get(key)
}

function setCache(key, value) {
  cache.set(key, value)
}

function deleteCache(key) {
  cache.del(key)
}

module.exports = {
  getCache,
  setCache,
  deleteCache,
}
