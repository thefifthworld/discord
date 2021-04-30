const { getTale, getMember, clearTraffic } = require('../utils')

module.exports = {
  regex: /^so the story might one day go\.?$/gmi,
  description: 'Ends a tale.',
  execute: async (msg, state) => {
    const tale = getTale(msg.channel.guild, msg.channel, state)
    if (tale && tale.stage === 'Endgame') {
      if (tale.summary) tale.summary.unpin()
      if (tale.questions) tale.questions.unpin()
      if (tale.cheat) tale.cheat.unpin()

      for (const player of tale.players) {
        await clearTraffic(tale, player)
        if (player.nicknameStorage !== undefined) {
          try {
            const member = await getMember(tale, player)
            await member.setNickname(player.nicknameStorage, `Restoring nickname after the Fifth World TTRPG`)
          } catch (err) {}
        }
      }

      const { channel } = msg
      const { guild } = channel
      delete state[guild.id][channel.id]
      if (state[guild.id] === {}) delete state[guild.id]
    }
  }
}
