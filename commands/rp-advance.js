const { stages } = require('../data.json')
const { getTale, getPlayer } = require('../utils')
const { setStage } = require('../sheets')

module.exports = {
  regex: /^so the story goes\.?$/gmi,
  description: 'Move to advance the tale into the next stage.',
  execute: async (msg, state) => {
    const tale = getTale(msg.channel.guild, msg.channel, state)
    if (tale) {
      const sayer = getPlayer(tale, msg.author)
      sayer.nextStage = true
      const votes = tale.players.filter(p => p.nextStage === true)
      if (votes.length >= tale.players.length) {
        let { stage } = tale
        const curr = stages.indexOf(stage)
        if (curr > -1 && curr + 1 < stages.length) {
          stage = stages[curr + 1]
        } else if (curr + 1 === stages.length) {
          stage = 'Endgame'
        }
        await setStage(tale, stage)
        tale.players.forEach(player => delete player.nextStage)
      }
    }
  }
}
