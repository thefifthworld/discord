const { minPlayers, maxPlayers, stages } = require('../data.json')
const { domain, timeout } = require('../config.json')
const { load, loadChildren, mention, choose } = require('../utils')

const rpStartWho = require('../embeds/rp-start-who')
const rpStartNumPlayers = require('../embeds/rp-start-num')
const rpStartCommunity = require('../embeds/rp-start-community')
const rpStartSaga = require('../embeds/rp-start-saga')

/**
 * Load a community page.
 * @param {Object} tale - The tale object.
 * @returns {Promise<Object>} - A Promise that resolves with the structured
 *   data from a community page.
 */

const loadCommunity = async tale => {
  const collected = await tale.channel.awaitMessages(m => m.content.startsWith(domain), { max: 1, time: timeout })
  const path = collected.first().content.substr(domain.length)
  const page = await load(path, 'Community')
  if (page) {
    return page
  } else {
    collected.first().reply('That page doesn’t have the `Community` type. Can you give me a link to the community that you want to play?')
    return loadCommunity(tale)
  }
}

/**
 * Load the characters that belong to a given community.
 * @param {string} path - The community's path.
 * @returns {Promise<Object[]>} - An array of structured data objects for the
 *   characters loaded from the community.
 */

const loadCharacters = async path => {
  const chars = await loadChildren(path, 'Person', 'Character')
  return chars.filter(c => !c.died)
}

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
 * Collect what community this tale concerns.
 * @param {Object} tale - The tale object.
 * @returns {Promise<void>} - A Promise that resolves once we've identified a
 *   community that this tale concerns and loaded the necessary data about it.
 */

const getCommunity = async tale => {
  tale.channel.send({ content: `Welcome, ${mention(tale.players)}!`, embed: rpStartCommunity() })
  const data = await loadCommunity(tale)
  tale.community = {
    name: data.name,
    path: data.path,
    characters: await loadCharacters(data.path),
    questions: data.questions
  }
}

/**
 * Collect what stage of the saga this tale takes place in (if any).
 * @param {Object} tale - The tale object.
 * @returns {Promise<void>} - A Promise that resolves when the tale has saved
 *   which stage the saga is currently in (if any).
 */

const getSaga = async tale => {
  const no = 'No, this tale does not belong to a saga.'
  const options = [ ...stages, no ]
  tale.channel.send({ embed: rpStartSaga(options) })
  const sagaStage = await choose(tale, options, true)
  if (sagaStage !== no) tale.saga = sagaStage
}

/**
 * Collect all of the information from players needed to begin a tale.
 * @param {Object} tale - The tale object.
 * @returns {Promise<void>} - A Promise that resolves when the tale begins.
 */

const startTale = async tale => {
  try {
    await getPlayers(tale)
    await getCommunity(tale)
    await getSaga(tale)
    console.log(tale)
  } catch (err) {
    console.error(err)
    let txt = err.message.substr(0, 12).toLowerCase() === 'pass along: '
      ? err.message.substr(12)
      : 'Sorry, I timed out waiting for a response.'
    tale.channel.send(`${txt} You can start over again with the ritual phrase, “**Let us dream together of the world to come.**”`)
  }
}

module.exports = startTale
