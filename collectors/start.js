const { minPlayers, maxPlayers, stages } = require('../data.json')
const { domain, timeout } = require('../config.json')
const {
  isArray,
  isPopulatedArray,
  load,
  loadChildren,
  mention,
  choose,
  calculateAge
} = require('../utils')

const rpStartWho = require('../embeds/rp-start-who')
const rpStartNumPlayers = require('../embeds/rp-start-num')
const rpStartCommunity = require('../embeds/rp-start-community')
const rpStartSaga = require('../embeds/rp-start-saga')
const rpStartCharacter = require('../embeds/rp-start-character')
const rpStartLooming = require('../embeds/rp-start-looming')

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
    const characters = await loadCharacters(page.path)
    if (characters.length < tale.players.length) {
      collected.first().reply(`${page.name} only has ${characters.length} characters available — not enough for a game with ${tale.players.length} players. Please choose a community with at least ${tale.players.length} characters to choose from.`)
      return loadCommunity(tale)
    } else {
      const places = characters.flatMap(char => char.bonds.flatMap(bond => bond.path)).filter((p, i, arr) => arr.indexOf(p) === i)
      if (places.length < tale.players.length) {
        collected.first().reply(`${page.name} only has ${places.length} places to choose from — not enough for a game with ${tale.players.length} players. Please choose a community with at least ${tale.players.length} unqiues places with bonds to characters to choose from.`)
        return loadCommunity(tale)
      } else {
        tale.community = {
          name: page.name,
          path: page.path,
          characters,
          questions: page.questions
        }
      }
    }
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
 * Keep waiting for a question until you get one.
 * @param {Object} tale - The tale object.
 * @param {User} player - The player.
 * @returns {Promise<Object[]>} - A Promise that resolves with an array
 *   containing the looming question that the player offered.
 */

const queryQuestions = async (tale, player) => {
  const regex = /^(.*?)\? \((.*?)\)$/m
  const filter = m => m.content.match(regex) !== null && m.author.id === player.id
  const collected = await tale.channel.awaitMessages(filter, { max: 1, time: timeout })
  const match = collected.first().content.match(regex)
  if (isArray(match) && match.length > 2) {
    const question = `${match[1]}?`
    const answers = match[2].split('|').map(answer => ({ answer, moments: 0 }))
    return [{ question, answers }]
  } else {
    await queryQuestions(tale, player)
  }
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
  await loadCommunity(tale)
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
  await tale.channel.send({ embed: rpStartSaga(options) })
  const sagaStage = await choose(tale, options, true)
  if (sagaStage !== no) tale.saga = sagaStage
}

/**
 * If the player's character already has questions, return them. If hen
 * doesn't, query the player for a question.
 * @param {Ojbect} tale - The tale object.
 * @param {User} player - The player.
 * @returns {Promise<Object[]>} - A Promise that resolves with an array of
 *   looming questions for the player's character.
 */

const getQuestions = async (tale, player) => {
  const { character } = player
  if (character && isPopulatedArray(character.questions)) {
    return character.questions
  } else {
    tale.channel.send({ content: `${mention(player)},`, embed: rpStartLooming(character.name) })
    return queryQuestions(tale, player)
  }
}

/**
 * Allow a player to choose a character.
 * @param {Object} tale - The tale object.
 * @param {User} player - The player.
 * @returns {Promise<void>} - A Promise that resolves when the player has
 *   chosen a character.
 */

const chooseCharacter = async (tale, player) => {
  const available = tale.community.characters.filter(c => !c.claimed)
  const choices = available.map(c => c.name)
  await tale.channel.send({ content: `${mention(player)},`, embed: rpStartCharacter(choices) })
  const index = await choose(tale, choices, false, player)
  available[index].claimed = player.id
  player.character = available[index]

  const { character } = player
  character.born = new Date(character.born)
  const { stage, age } = calculateAge(character.born, tale.present)
  character.age = age
  character.stage = stage
  character.awareness = 5
}

/**
 * Loop through each player, giving each an opportunity to select hens
 * character and place.
 * @param {Object} tale - The tale object.
 * @returns {Promise<void>} - A Promise that resolves when each player has
 *   selected a character and a place.
 */

const loopPlayers = async tale => {
  for (const player of tale.players) {
    try {
      await chooseCharacter(tale, player)
    } catch (err) {
      throw err
    }
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
    await getCommunity(tale)
    await getSaga(tale)
    await loopPlayers(tale)
  } catch (err) {
    console.error(err)
    let txt = err.message.substr(0, 12).toLowerCase() === 'pass along: '
      ? err.message.substr(12)
      : 'Sorry, I timed out waiting for a response.'
    tale.channel.send(`${txt} You can start over again with the ritual phrase, “**Let us dream together of the world to come.**”`)
  }
}

module.exports = startTale
