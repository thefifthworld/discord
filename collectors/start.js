const { minPlayers, maxPlayers } = require('../data.json')
const { timeout } = require('../config.json')
const rpStartWho = require('../embeds/rp-start-who')
const rpStartNumPlayers = require('../embeds/rp-start-num')

/**
 * Collect who will play in this tale.
 * @param {Object} tale - The tale object.
 * @returns {Promise<void>} - A Promise that resolves once an appropriate
 *   number of players have signed up for the tale.
 */

const getPlayers = async tale => {
  await tale.channel.send({ embed: rpStartWho() })
  try {
    const collected = await tale.channel.awaitMessages(m => m.mentions.users.array().length > 0, { max: 1, time: timeout })
    const players = collected.first().mentions.users.array()
    if (players.length >= minPlayers && players.length <= maxPlayers) {
      tale.players = players
    } else {
      await tale.channel.send({ embed: rpStartNumPlayers(players.length) })
      await getPlayers(tale)
    }
  } catch (err) {
    throw err
  }
}

/**
 * Collect all of the information from players needed to begin a tale.
 * @param {Object} tale - The tale object.
 * @returns {Promise<void>} - A Promise that resolves when the tale begins.
 */

const startTale = async tale => {
  try {
    await getPlayers(tale)
    console.log(tale.players)
  } catch (err) {
    console.error(err)
    let txt = err.message.substr(0, 12).toLowerCase() === 'pass along: '
      ? err.message.substr(12)
      : 'Sorry, I timed out waiting for a response.'
    tale.channel.send(`${txt} You can start over again with the ritual phrase, “**Let us dream together of the world to come.**”`)
  }
}

module.exports = startTale
