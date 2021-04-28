const { getTale } = require('../utils')
const danger = require('../collectors/danger')

module.exports = {
  regex: /^that sounds dangerous/gmi,
  description: 'Responds to the ritual phrase, “That sounds dangerous…”',
  execute: async (msg, state) => {
    const tale = getTale(msg.channel.guild, msg.channel, state)
    if (tale) {
      await danger(tale, msg.author)
    }
  }
}
