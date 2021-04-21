const { initTale } = require('../utils')
const startTale = require('../collectors/start')

module.exports = {
  regex: /^let us dream together of the world to come\.?$/gmi,
  description: 'Starts a new tale.',
  execute: (msg, state) => {
    if (msg.channel && msg.channel.guild) {
      const tale = initTale(msg.channel.guild, msg.channel, state)
      startTale(tale)
    }
  }
}
