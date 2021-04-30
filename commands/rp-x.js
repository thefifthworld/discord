const { getTale, queryTale } = require('../utils')
const doNotSee = require('../embeds/rp-x')

module.exports = {
  regex: /^i (do not|don't|don’t) see it/mi,
  description: 'Responds to the ritual phrase, “I don’t see it.”',
  execute: async (msg, state) => {
    const tale = msg.channel === undefined || msg.channel.guild === undefined
      ? await queryTale(state, msg.author)
      : getTale(msg.channel.guild, msg.channel, state)
    if (tale) {
      await tale.channel.send({ embed: doNotSee() })
    }
  }
}
