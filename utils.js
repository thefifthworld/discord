const { months, stages } = require('./data.json')

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
  getPresent,
  initTale,
  mention
}
