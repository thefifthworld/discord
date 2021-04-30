const { timeout } = require('../config.json')
const promptQuerySubject = require('../embeds/know-subject')
const charSheet = require('../embeds/sheet-char')
const {
  isArray,
  getPath,
  getTale,
  getPlayer,
  getSubjects,
  getSubjectPath,
  parseURLs,
  mention
} = require('../utils')

const regex = /what I know about (.*?): (.*?)$/mi

/**
 * Parse a message to find a path, subject, and statement.
 * @param {string} msg - The message to parse.
 * @returns {{path: (string|null), subject: (string|null),
 *   statement: string}} - This method returns an object with three properties.
 *   `path` provides the path of the last URL in the original message that came
 *   from the domain specified in the configuration. `subject` provides the
 *   named subject of the knowledge, and `statement` states what is known.
 */

const parseMessage = msg => {
  const { path, message } = parseURLs(msg)
  const match = message.match(regex)
  return {
    subject: match && match.length > 1 ? match[1].trim() : null,
    statement: match && match.length > 2 ? match[2].trim() : message,
    path
  }
}

/**
 * If a player declares knowledge about someone without providing a path,
 * we prompt hen for a path. This method waits for and interprets the player's
 * response.
 * @param {Message} msg - The message object received.
 * @param {string[]} choices - The choices presented.
 * @param {{statement: string, subject: string}[]}subjects - The array of
 *   subjects in the current tale.
 * @returns {string|boolean} - The path for the subject if the player chooses
 *   one from the list, the string `NOLINK` if the player indicated that hens
 *   subject doesn't have a URL, or `false` if the player did not provide a
 *   viable response.
 */

const getChosenPath = (msg, choices, subjects) => {
  const pathGiven = getPath(msg.content)
  if (pathGiven) {
    return pathGiven
  } else if (choices.includes(msg.content)) {
    const filtered = subjects.filter(s => s.name === msg.content)
    if (filtered.length > 0) return filtered[0].path
  } else {
    const index = parseInt(msg.content)
    if (!isNaN(index)) {
      if (index <= subjects.length) {
        return subjects[index - 1].path
      } else if (index > subjects.length) {
        return 'NOLINK'
      }
    }
  }
  return false
}

/**
 * Prompt the player for a path, then wait for and interpret the response.
 * @param {object} tale - The tale object.
 * @param {Message} msg - The message object.
 * @returns {Promise<string|boolean>} - A Promise that resolves with the path
 *   collected from the player, or `false` if the player refused to provide
 *   a path.
 */

const queryPath = async (tale, msg) => {
  const subjects = getSubjects(tale)
  const choices = [ ...subjects.map(s => s.name), 'My subject doesn’t have a page yet' ]
  await msg.channel.send({ content: `${mention(msg.author)},`, embed: promptQuerySubject(choices) })
  const collected = await msg.channel.awaitMessages(m => getChosenPath(m, choices, subjects) && m.author.id === msg.author.id, { max: 1, time: timeout })
  return getChosenPath(collected.first(), choices, subjects)
}

/**
 * Record the knowledge offered as something hens character knows, then update
 * hens character sheet.
 * @param {Object} tale - The tale object.
 * @param {Message} msg - The message object.
 * @returns {Promise<void>} - A Promise that resolves when the knowledge has
 *   been recorded and the character's sheet has been updated.
 */

const record = async (tale, msg) => {
  const parsed = parseMessage(msg.content)
  let { subject, statement, path } = parsed
  if (!path) path = getSubjectPath(subject, tale)
  if (!path) path = await queryPath(tale, msg)
  if (path && path !== 'NOLINK') subject = path

  const player = getPlayer(tale, msg.author)
  if (player && player.character && isArray(player.character.knowledge)) {
    const { character } = player
    const subjects = character.knowledge.map(k => k.subject)
    if (subjects.includes(subject)) {
      character.knowledge = character.knowledge.map(k => k.subject === subject ? { statement, subject } : k)
    } else {
      character.knowledge.push({ statement, subject })
    }
    if (character.sheet) await character.sheet.edit({ embed: charSheet(character) })
  }
}

module.exports = {
  regex,
  description: 'Add to or update your character\'s knowledge.',
  execute: async (msg, state) => {
    const tale = getTale(msg.channel.guild, msg.channel, state)
    if (tale) await record(tale, msg)
  }
}
