const { minPlayers, maxPlayers, stages } = require('../data.json')
const { domain, timeout } = require('../config.json')
const {
  isArray,
  isPopulatedArray,
  except,
  load,
  loadChildren,
  mention,
  choose,
  calculateAge,
  getMember,
  markGreen
} = require('../utils')

const rpStartWho = require('../embeds/rp-start-who')
const rpStartNumPlayers = require('../embeds/rp-start-num')
const rpStartCommunity = require('../embeds/rp-start-community')
const rpStartSaga = require('../embeds/rp-start-saga')
const rpStartCharacter = require('../embeds/rp-start-character')
const rpStartLooming = require('../embeds/rp-start-looming')
const rpStartPlace = require('../embeds/rp-start-place')

const charSheet = require('../embeds/sheet-char')
const placeSheet = require('../embeds/sheet-place')

/**
 * Create "traffic light" roles on the server if it doesn't yet have them.
 * @param {Object} tale - The tale object.
 */

const createTrafficRoles = async tale => {
  const roles = tale.channel.guild.roles.cache.array().map(r => r.name)
  if (!roles.includes('red')) await tale.channel.guild.roles.create({ data: { name: 'red', color: 'RED', position: 100 } })
  if (!roles.includes('yellow')) await tale.channel.guild.roles.create({ data: { name: 'yellow', color: 'YELLOW', position: 90 } })
  if (!roles.includes('green')) await tale.channel.guild.roles.create({ data: { name: 'green', color: 'GREEN', position: 80 } })
}

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
 * Establishes what one player's character knows about another player's
 * character. If the subject's character already knows something about the
 * object's character, this publishes that knowledge to the channel. If not,
 * it asks the subject what hen's character knows about the object's character.
 * @param {Object} tale - The tale object.
 * @param {Object} subject - The object for the player whose character knows
 *   something about the object's character.
 * @param {Object} object - The object for the player whose character the
 *   subject's character knows something about.
 * @returns {Promise<void>} - A Promise that resolves once we have established
 *   and shared what the subject's character knows about the object's
 *   character.
 */

const getKnowledgeAbout = async (tale, subject, object) => {
  const pc = subject && subject.character ? subject.character : null
  const oc = object && object.character ? object.character : null
  if (pc && oc) {
    if (!pc.knowledge) pc.knowledge = []
    const knowledge = pc.knowledge.filter(k => k.subject === oc.path)
    if (knowledge.length > 0) {
      tale.channel.send(`${pc.name} knows this about ${oc.name}:\n${knowledge.map(k => k.statement).join('\n')}`)
    } else {
      await tale.channel.send({ content: `${mention(subject)}, what does ${pc.name} know about ${oc.name}? Phrase it as an independent statement (e.g., “${oc.name} makes great chili,” rather than, “${oc.pronouns.subject} makes great chili.”).` })
      const collected = await tale.channel.awaitMessages(m => m.author.id === subject.id, { max: 1, time: timeout })
      pc.knowledge.push({
        statement: collected.first().content,
        subject: oc.path
      })
    }
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

  await markGreen(tale, player)
  const member = await getMember(tale, player)
  player.nicknameStorage = member.nickname
  const pronouns = `${character.pronouns.subject.toLowerCase()}/${character.pronouns.object.toLowerCase()}`
  try {
    await member.setNickname(`${character.name} (${pronouns})`, `Currently playing ${character.name} in the Fifth World TTRPG`)
  } catch {
    delete player.nicknameStorage
    tale.channel.send(`${mention(player)}, I couldn’t automatically update your nickname. You might want to change it to “**${character.name} (${pronouns})**” for the duration of the game, to help your fellow players remember the character you’ve selected.`)
  }

  try {
    character.questions = await getQuestions(tale, player)
    character.sheet = await player.send({ embed: charSheet(character) })
  } catch (err) {
    throw err
  }
}

/**
 * Allow a player to choose a place.
 * @param {Object} tale - The tale object.
 * @param {User} player - The player.
 * @returns {Promise<void>} - A Promise that resolves when the player has
 *   chosen a place.
 */

const choosePlace = async (tale, player) => {
  const places = player.character.bonds
  const chosen = tale.players.filter(p => p.place && p.place.path).map(p => p.place.path)
  const availablePaths = except(places.map(b => b.path), chosen)
  const available = places.filter(p => availablePaths.includes(p.path))
  if (available.length > 0) {
    const availableNames = available.map(p => p.place)
    tale.channel.send({ content: `${mention(player)},`, embed: rpStartPlace(availableNames) })
    try {
      const index = await choose(tale, availableNames, false, player)
      const data = await load(available[index].path, 'Place')
      player.place = {
        name: data.name,
        path: data.path,
        criterion: data.criterion,
        awareness: 1
      }
      player.place.sheet = await player.send({ embed: placeSheet(player.place) })

      const preamble = 'The **criterion** establishes what someone must do to gather awareness from your place. This should require someone to act in accord with the spirit of the place.'
      const specific = player.place.criterion
        ? `Right now, ${player.place.name} has this criterion: “**${player.place.criterion}**” If this fits with your understanding of the spirit of the place, type **OK**. If not, write what criterion you’d like to use instead.`
        : 'Your place does not currently have any criterion set. What should we use? Send it to me as a direct message, and I’ll update your place sheet.'
      const dm = await player.send({ content: `${preamble} ${specific}` })
      const collected = await dm.channel.awaitMessages(() => true, { max: 1, time: timeout })
      const reply = collected.first().content
      if (!(player.place.criterion && reply.substr(0, 2).toLowerCase() === 'ok')) {
        player.place.criterion = reply
        player.place.sheet.edit({ embed: placeSheet(player.place) })
      }
    } catch (err) {
      throw err
    }
  } else {
    throw new Error(`PASS ALONG: This game can’t work, because ${mention(player)} doesn’t have any places to choose from. Take a moment to consider the characters in this community and their bonds to see if you can find and agree on an arrangement that will give each player a character and a place that character has a bond with.`)
  }
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
      await choosePlace(tale, player)
    } catch (err) {
      throw err
    }
  }
}

/**
 * Loop through each player, and for each player establish that hen's character
 * knows something about each other player's character.
 * @param {Object} tale - The tale object.
 * @returns {Promise<void>} - A Promise that resolves once each player has
 *   established that hen's character knows something about each other player's
 *   character.
 */

const loopCharacterKnowledge = async tale => {
  for (const player of tale.players) {
    for (const other of tale.players.filter(p => p.id !== player.id)) {
      try {
        await getKnowledgeAbout(tale, player, other)
      } catch (err) {
        throw err
      }
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
    await createTrafficRoles(tale)
    await getPlayers(tale)
    await getCommunity(tale)
    await getSaga(tale)
    await loopPlayers(tale)
    await loopCharacterKnowledge(tale)
  } catch (err) {
    console.error(err)
    let txt = err.message.substr(0, 12).toLowerCase() === 'pass along: '
      ? err.message.substr(12)
      : 'Sorry, I timed out waiting for a response.'
    tale.channel.send(`${txt} You can start over again with the ritual phrase, “**Let us dream together of the world to come.**”`)
  }
}

module.exports = startTale
