const { getTale } = require('../utils')
const difficult = require('../embeds/rp-difficult')

module.exports = {
  regex: /^that sounds difficult/gmi,
  description: 'Responds to the ritual phrase, “That sounds difficult…”',
  execute: async (msg, state) => {
    const tale = getTale(msg.channel.guild, msg.channel, state)
    if (tale) await tale.channel.send({ embed: difficult() })
  }
}
