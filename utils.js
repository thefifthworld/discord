const axios = require('axios')
const { api, timeout } = require('./config.json')
const { months, stages } = require('./data.json')

/**
 * Return structured date of given `type` from a page.
 * @param {string} path - The path of the page to fetch.
 * @param {string} type - The type of the structured data to fetch from that
 *   page.
 * @returns {Promise<object|null>} - A Promise that resolves with the data
 *   requested or `null` if it could not be fetched.
 */

const load = async (path, type) => {
  const res = await axios({ method: 'GET', url: `${api}/pages${path}` })
  const filtered = res.data.data.filter(d => d.type === type)
  return filtered.length > 0 ? filtered[0] : null
}

/**
 * Return structured data from the children of a given page.
 * @param {string} path - The path of the parent.
 * @param {string} type - The types of children to fetch.
 * @param {string} dataType - The type of the structured data to fetch from
 *   those children.
 * @returns {Promise<object[]>} - A Promise that resolves with the requested
 *   structured data from each of the children of the given path that have the
 *   given type.
 */

const loadChildren = async (path, type, dataType) => {
  const res = await axios({ method: 'GET', url: `${api}/pages?ancestor=${encodeURIComponent(path)}&type=${type}` })
  return res.data.map(page => {
    const filtered = page.data.filter(d => d.type === dataType)
    return filtered.length > 0 ? filtered[0] : null
  }).filter(page => page !== null)
}

/**
 * Return the canonical "present" in the Fifth World (144,000 days, or one
 * bak'tun on the Maya calendar, from today).
 * @returns {string|Date} - The canonical "present" in the Fifth World (144,000
 *   days, or one bak'tun on the Maya calendar, from today), as a `Date` object
 *   by default, or as a string if you set `asString` to `true`.
 */

const getPresent = (asString = false) => {
  const present = new Date()
  present.setDate(present.getDate() + 144000)
  return present
}

/**
 * Formats a date into a consistent `DD MONTHNAME YYYY` string.
 * @param {Date} d - The date to format.
 * @returns {string} - The date formatted to `DD MONTHNAME YYYY`.
 */

const formatDate = d => {
  return `${d.getDate()} ${months[d.getMonth()]} ${d.getFullYear()}`
}

/**
 * Creates a tale in a given server and channel.
 * @param {Guild} guild - The guild object for the Discord server that the
 *   channel belongs to.
 * @param {Channel} channel - The channel object for the Discord channel
 *   that this tale takes place in.
 * @param {Object} state - The bot's state object.
 * @returns {Object|null} - The newly-created tale object, or `null` if not
 *   given a valid guild or channel object.
 */

const initTale = (guild, channel, state) => {
  if (!guild || !guild.id || !channel || !channel.id) return null

  const gid = guild.id
  const cid = channel.id

  if (!state[gid]) state[gid] = { server: guild }
  if (!state[gid][cid]) state[gid][cid] = {
    channel,
    community: null,
    players: [],
    present: getPresent(),
    stage: stages[0]
  }
  return state[gid][cid]
}

/**
 * Creates a string to mention one or more users.
 * @param {User|User[]} user - A User object to create a mention for, or an
 *   array of User objects to create mentions for.
 * @returns {string} - A mention for a single user, or an Oxford
 *   comma-separated list of mentions for an array of users, or an empty string
 *   if not given valid input.
 */

const mention = user => {
  if (user && user.id) {
    return `<@!${user.id}>`
  } else if (Array.isArray(user)) {
    const mentions = user.filter(u => Boolean(u.id)).map(u => mention(u))
    let users = mentions.pop()
    if (mentions.length === 1) {
      users = `${mentions[0]} and ${users}`
    } else if (mentions.length > 1) {
      users = `${mentions.join(', ')}, and ${users}`
    }
    return users
  } else {
    return ''
  }
}

/**
 * Render an array of choices for a user to select from.
 * @param {string[]} choices - An array of choices to choose from.
 * @returns {string} - A string suitable for a MessageEmbed listing the
 *   available choices.
 */

const renderChoices = choices => {
  return choices.map((choice, index) => `**[${index + 1}]** ${choice}`).join('\n')
}

/**
 * Tests if a string indicates one of the choices provided, either by copying
 * the value of one of the strings, or by providing a number associated with
 * one of them.
 * @param {string} str - The string to test.
 * @param {string[]} choices - An array of strings to choose from.
 * @param {boolean=} returnString - If set to `true`, returns the string chosen
 *   rather than the index of that string in the array. (Default: `false`)
 * @returns {boolean|number|string} - Returns the index of the string chosen in
 *   the `choices` array, or the string chosen if `returnString` equals `true`,
 *   or `false` if given a `str` argument that does not refer to any of the
 *   choices provided.
 */

const getChoice = (str, choices, returnString = false) => {
  if (choices.includes(str)) return returnString ? str : choices.indexOf(str)
  const i = parseInt(str)
  if (!isNaN(i) && i > 0 && i <= choices.length) return returnString ? choices[i - 1] : i - 1
  return false
}

/**
 * Wait for a response to a question with numbered options.
 * @param {Object} tale - The tale object.
 * @param {string[]} choices - An array of choices.
 * @param {boolean=} returnString - If set to `true`, returns the string chosen
 *   rather than the index of that string in the array. (Default: `false`)
 * @param {Object} user - If you provide an object that has an `id` property,
 *   only responses from users who have that ID will be considered.
 * @returns {Promise<number|string>} - The index of the choice selected in the
 *   `choices` array, or the string itself is you set `returnString` to `true`.
 */

const choose = async (tale, choices, returnString, user) => {
  try {
    const filter = user && user.id
      ? m => getChoice(m.content, choices) !== false && m.author.id === user.id
      : m => getChoice(m.content, choices) !== false
    const collected = await tale.channel.awaitMessages(filter, { max: 1, time: timeout })
    return getChoice(collected.first().content, choices, returnString)
  } catch (err) {
    throw err
  }
}

module.exports = {
  load,
  loadChildren,
  getPresent,
  formatDate,
  initTale,
  mention,
  renderChoices,
  getChoice,
  choose
}
