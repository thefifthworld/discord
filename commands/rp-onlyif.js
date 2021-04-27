const { getTale } = require('../utils')
const onlyIf = require('../embeds/rp-onlyif')

module.exports = {
  regex: /^but only if/gmi,
  description: 'Responds to the ritual phrase, “But only if…”',
  execute: async (msg, state) => {
    const tale = getTale(msg.channel.guild, msg.channel, state)
    if (tale) await tale.channel.send({ embed: onlyIf() })
  }
}
