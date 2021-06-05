const axios = require('axios')
const { api, user } = require('../config.json')
const {
  getTale,
  getMember,
  getCharacters,
  getPlaces,
  clearTraffic
} = require('../utils')

/**
 * Update the wiki.
 * @param {string} path - The path of the wiki entry to update.
 * @param {string} type - The type of the data to update.
 * @param {function} change - A function to execute on the matching datum.
 * @param {stirng} jwt - The JWT token to be used to make the update.
 * @returns {Promise<void>} - A Promise that resolves when the update has
 *   been made.
 */

const update = async (path, type, change, jwt) => {
  const res = await axios({ method: 'GET', url: `${api}/pages${path}` })
  const { page, data } = res.data
  const dataMatch = data.filter(d => d.type === type)
  if (dataMatch && dataMatch.length > 0) {
    change(dataMatch[0])
    const latest = page.history[page.history.length - 1]?.content
    const updateData = {
      title: page.title,
      path: page.path,
      parent: latest?.parent,
      body: latest?.body,
      description: page.description,
      data: JSON.stringify(data, null, 2),
      msg: `Updating data for ${page.title} after an online RPG session played over Discord`
    }
    try {
      await axios({ method: 'POST', url: `${api}/pages${path}`, data: updateData, headers: { Authorization: `Bearer ${jwt}` } })
    } catch (err) {
      console.error(err)
    }
  }
}

/**
 * Loop through all of the characters and save each one.
 * @param {object} tale - The tale object.
 * @param {string} jwt - The JWT token to be used to make the update.
 * @returns {Promise<void>} - A Promise that resolves when all of the
 *   characters in the tale have been updated on the wiki.
 */

const saveCharacters = async (tale, jwt) => {
  const chars = getCharacters(tale)
  for (const char of chars) {
    await update(char.path, 'Character', obj => {
      obj.body = char.body
      obj.knowledge = char.knowledge
      obj.questions = char.questions
    }, jwt)
  }
}

/**
 * Loop through all of the places and save each one.
 * @param {object} tale - The tale object.
 * @param {string} jwt - The JWT token to be used to make the update.
 * @returns {Promise<void>} - A Promise that resolves when all of the
 *   places in the tale have been updated on the wiki.
 */

const savePlaces = async (tale, jwt) => {
  const places = getPlaces(tale)
  for (const place of places) {
    await update(place.path, 'Place', obj => {
      obj.criterion = place.criterion
    }, jwt)
  }
}

module.exports = {
  regex: /^so the story might one day go\.?$/gmi,
  description: 'Ends a tale.',
  execute: async (msg, state) => {
    const tale = getTale(msg.channel.guild, msg.channel, state)
    if (tale && tale.stage === 'Endgame') {
      if (tale.summary) tale.summary.unpin()
      if (tale.questions) tale.questions.unpin()
      if (tale.cheat) tale.cheat.unpin()

      const res = await axios({ method: 'POST', url: `${api}/members/auth`, data: user })
      await saveCharacters(tale, res.data)
      await savePlaces(tale, res.data)

      for (const player of tale.players) {
        await clearTraffic(tale, player)
        delete player.character
        delete player.place
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
      if (Object.keys(state[guild.id]) === [ 'server' ]) delete state[guild.id]
    }
  }
}
