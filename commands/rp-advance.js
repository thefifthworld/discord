const { stages } = require('../data.json')
const { getTale, getPlayer } = require('../utils')
const { updatePlaceSheet, setStage } = require('../sheets')

/**
 * Advance the stage of the tale.
 * @param {Object} tale - The tale object.
 * @returns {Promise<void>} - A Promise that resolves when the tale's stage
 *   has been advanced.
 */

const advanceStage = async tale => {
  let { stage } = tale
  const curr = stages.indexOf(stage)
  if (curr > -1 && curr + 1 < stages.length) {
    stage = stages[curr + 1]
  } else if (curr + 1 === stages.length) {
    stage = 'Endgame'
  }

  // Remove votes and each place generates awareness
  for (const player of tale.players) {
    delete player.nextStage
    if (stage !== 'Endgame' && player.place && !isNaN(player.place.awareness)) {
      player.place.awareness++
      await updatePlaceSheet(player.place)
    }
  }

  // Update tale object and send notifications
  await setStage(tale, stage)
}

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
        await advanceStage(tale)
      }
    }
  }
}
