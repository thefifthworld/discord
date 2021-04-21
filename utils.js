const axios = require('axios')
const { api } = require('./config.json')
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
 * @param {boolean=} asString - If set to `true`, returns a string representing
 *   the date, in the format `DD MONTHNAME YYYY`. (Default: `false`)
 * @returns {string|Date} - The canonical "present" in the Fifth World (144,000
 *   days, or one bak'tun on the Maya calendar, from today), as a `Date` object
 *   by default, or as a string if you set `asString` to `true`.
 */

const getPresent = (asString = false) => {
  const present = new Date()
  present.setDate(present.getDate() + 144000)
  return asString
    ? `${present.getDate()} ${months[present.getMonth()]} ${present.getFullYear()}`
    : present
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

module.exports = {
  load,
  loadChildren,
  getPresent,
  initTale,
  mention
}