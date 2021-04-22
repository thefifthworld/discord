const axios = require('axios')
const { api, timeout } = require('./config.json')
const { months, stages, lifeStages } = require('./data.json')

/**
 * Tests if given an array.
 * @param {*} arr - The element to test.
 * @returns {boolean} - `true` if given an array, or `false` if not.
 */

const isArray = arr => {
  return arr && Array.isArray(arr)
}

/**
 * Tests if given an array that has elements in it.
 * @param {*} arr - The element to test.
 * @returns {boolean} - `true` if given an array that has elements in it, or
 *   `false` if not.
 */

const isPopulatedArray = arr => {
  return isArray(arr) && arr.length > 0
}

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
 * @param {Object=} user - If you provide an object that has an `id` property,
 *   only responses from users who have that ID will be considered.
 *   (Default: `null`)
 * @returns {Promise<number|string>} - The index of the choice selected in the
 *   `choices` array, or the string itself is you set `returnString` to `true`.
 */

const choose = async (tale, choices, returnString = false, user = null) => {
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

/**
 * Calculate the character's age.
 * @param {Date} born - A date representing when the character was born.
 * @param {Date} present - A date representing the present.
 * @returns {{stage: {name: string, person: string, code: string, max: number,
 *   stage: string}|boolean, age: number}} - An object with two properties:
 *   `age`, providing the character's age as of the given `present` in years,
 *   and `stage`, and object with information pertaining to the character's
 *   current stage of life. This latter object includes the name of this stage
 *   (`name`, e.g., "Childhood," "Young Adulthood," etc.), what a person in
 *   this stage of life is called (`person`, e.g., "Child," "Young Adult,"
 *   etc.), the string used to identify this stage (`code`), the maximum age
 *   that one can be and still count as being in this stage of life (`max`),
 *   and the stage of the story that this stage of life correlates to (`stage`,
 *   e.g., "Introduction," "Development," etc.).
 */

const calculateAge = (born, present) => {
  const msInYear = 1000 * 60 * 60 * 24 * 365.2422
  const age = Math.floor((present - born) / msInYear)
  let stage = false
  let i = 0
  while (!stage) {
    const match = lifeStages[i] && lifeStages[i].max && lifeStages[i].max > age
    const noMax = lifeStages[i] && !lifeStages[i].max
    const end = lifeStages[i] && !lifeStages[i + 1]
    if (match || noMax || end) {
      stage = lifeStages[i]
    } else {
      i++
    }
  }
  return { stage, age }
}

/**
 * Get the GuildMember object for a given user.
 * @param {Object} tale - The tale object.
 * @param {User|number} user - Either a User object or a user's ID number.
 * @returns {Promise<GuildMember>} - A Promise that resolves with the
 *   GuildMember object for a given User or user ID.
 */

const getMember = async (tale, user) => {
  const uid = user && user.id ? user.id : user
  return tale.channel.guild.members.fetch(user.id)
}

/**
 * Return the "traffic light" roles on the tale's server.
 * @param {Object} tale - The tale object.
 * @returns {Promise<{green: Role, yellow: Role, red: Role}>} - A Promise that
 *   resolves with an object containing the "traffic light" roles on the tale's
 *   server.
 */

const getTrafficRoles = async (tale) => {
  const roles = [ 'green', 'yellow', 'red' ]
  const obj = {}
  for (const r of roles) obj[r] = await tale.channel.guild.roles.cache.find(role => role.name === r)
  return obj
}

/**
 * Set the player's "traffic light" role to the one specified.
 * @param {Object} tale - The tale object.
 * @param {Object} player - The player object.
 * @param {string=} color - Valid values are `red`, `yellow`, and `green`.
 *   (Default: `green`)
 * @returns {Promise<void>} - A Promise that resolves when the player has
 *   been assigned the "green" role, and had any "yellow" or "red" role
 *   assignment removed.
 */

const markTraffic = async (tale, player, color = 'green') => {
  const member = await getMember(tale, player)
  const { green, yellow, red } = await getTrafficRoles(tale)

  if (green && yellow && red) {
    let remove, add
    if (color.toLowerCase() === 'red') {
      remove = [yellow, green]
      add = red
    } else if (color.toLowerCase() === 'yellow') {
      remove = [red, green]
      add = yellow
    } else {
      remove = [red, yellow]
      add = green
    }

    for (const role of remove) await member.roles.remove(role)
    await member.roles.add(add)
  }
}

const markGreen = async (tale, player) => markTraffic(tale, player, 'green')
const markYellow = async (tale, player) => markTraffic(tale, player, 'yellow')
const markRed = async (tale, player) => markTraffic(tale, player, 'red')

module.exports = {
  isArray,
  isPopulatedArray,
  load,
  loadChildren,
  getPresent,
  formatDate,
  initTale,
  mention,
  renderChoices,
  getChoice,
  choose,
  calculateAge,
  getMember,
  getTrafficRoles,
  markTraffic,
  markGreen,
  markYellow,
  markRed
}
