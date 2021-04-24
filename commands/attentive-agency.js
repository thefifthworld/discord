const { getTale, getPlayer, queryPlace, mention } = require('../utils')
const pay = require('../pay')

module.exports = {
  regex: /^who has agency here\??$/gmi,
  description: 'Ask, “Who has agency here?”',
  execute: async (msg, state) => {
    const tale = getTale(msg.channel.guild, msg.channel, state)
    const player = getPlayer(tale, msg.author)
    if (tale && player && player.character) {
      const place = await queryPlace(tale, {
        title: 'Where do you find yourself?',
        preamble: 'You’ve asked an **attentive question**. Pay a moment of awareness to one of the places below, and receive a true answer.',
        content: `${mention(msg.author)},`,
        user: msg.author,
        elsewhere: true,
        cancelable: true
      })
      if (place) await pay(player.character, place, tale)
    }
  }
}
