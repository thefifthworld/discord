const { getTale } = require('../utils')
const veryDifficult = require('../embeds/rp-difficult-very')

module.exports = {
  regex: /^(…|\.\.\.)?very difficult/mi,
  description: 'Responds to the ritual phrase, “…very difficult.”',
  execute: async (msg, state) => {
    const tale = getTale(msg.channel.guild, msg.channel, state)
    if (tale) await tale.channel.send({ embed: veryDifficult() })
  }
}
