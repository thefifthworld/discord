const axios = require('axios')
const Discord = require('discord.js')
const getUrls = require('get-urls')
const { api, colors, domain, timeout } = require('./config.json')
const { months, stages, lifeStages } = require('./data.json')

/**
 * Create a deep clone of a variable.
 * @param {*} obj - The variable to clone.
 * @returns {any} - A deep clone of the variable given.
 */

const clone = obj => JSON.parse(JSON.stringify(obj))

/**
 * Return a random integer between 1 and 6 (inclusive), as you would get from
 * rolling a six-sided die.
 * @returns {number} - A random integer between 1 and 6 (inclusive).
 */

const roll = () => Math.floor(Math.random() * 6) + 1

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
 * Shuffle an array (Fisher-Yates).
 * @param {*[]}} arr - An array to shuffle.
 * @returns {*[]} - A copy of the original array, with its elements randomized.
 */

const shuffle = arr => {
  const cpy = clone(arr)
  for (let i = cpy.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1))
    const tmp = cpy[i]
    cpy[i] = cpy[j]
    cpy[j] = tmp
  }
  return cpy
}

/**
 * Return a copy of an array that does not include any of the elements from a
 * second array.
 * @param {*[]} arr - An array of elements to filter.
 * @param {*[]} exclude - An array of elements to filter out of `arr`.
 * @returns {*[]} - A copy of `arr` from which any elements that appear in
 *   `exclude` have been filtered out.
 */

const except = (arr, exclude) => {
  const e = exclude.map(el => JSON.stringify(el))
  return isArray(arr)
    ? arr.filter(el => !e.includes(JSON.stringify(el)))
    : []
}

/**
 * If the given string begins with "The" (ignoring case), return the substring
 * with the initial "The" removed.
 * @param {string} str - The given string.
 * @returns {string} - The given string with any initial "The" (ignoring case)
 *   removed.
 */

const deThe = str => str.substr(0, 4).toLowerCase() === 'the ' ? str.substr(4) : str

/**
 * Return an Oxford-comma-separated list of strings.
 * @param {string[]} arr - An array of strings to list.
 * @returns {string} - A string that lists the strings from the array separated
 *   by commas, and, naturally, using an Oxford comma.
 */

const list = arr => {
  if (arr.length === 0) return ''
  let list = arr.pop()
  if (arr.length === 1) {
    list = `${arr[0]} and ${list}`
  } else if (arr.length > 1) {
    list = `${arr.join(', ')}, and ${list}`
  }
  return list
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
  if (!isPopulatedArray(res?.data?.data)) return null
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
  if (!isPopulatedArray(res.data)) return []
  return res.data.map(page => {
    if (!isPopulatedArray(page?.data)) return null
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
 * Given a URL from the domain specified in the configuration, extract the
 * path from that URL.
 * @param {string} url - The URL to extract the path from.
 * @returns {string|null} - If the URL provided is from the domain specified in
 *   the configuration, this method returns the path of that URL. If not, it
 *   returns `null`.
 */

const getPath = url => {
  const index = url.indexOf(domain)
  return index > -1
    ? url.substr(index + domain.length)
    : null
}

/**
 * Parse URL paths from a string.
 * @param {string} msg - The string we want to extract URL paths from.
 * @returns {{path: (string|null), message: string}} - An object with two
 *   properties. `message` provides the original message with all URLs stripped
 *   out. `path` provides the path of the last URL in the original message that
 *   came from the domain specified in the configuration.
 */

const parseURLs = msg => {
  let message = msg
  const urls = Array.from(getUrls(message))
  let path = null
  urls.forEach(url => {
    const regex = new RegExp(url, 'gi')
    message = message.replace(regex, '')
    path = getPath(url)
  })
  return { path, message }
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
 * Return the tale from the given guild and channel.
 * @param {Guild} guild - The guild object for the Discord server that the
 *   channel belongs to.
 * @param {Channel} channel - The channel object for the Discord channel
 *   that this tale takes place in.
 * @param {Object} state - The bot's state object.
 * @returns {Object|null} - The tale object or `null` if it does not exist.
 */

const getTale = (guild, channel, state) => {
  if (!guild || !guild.id || !channel || !channel.id) return null
  return state[guild.id] && state[guild.id][channel.id]
    ? state[guild.id][channel.id]
    : null
}

/**
 * Return an array of tales that a player is currently playing in.
 * @param {Object} state - The bot's current state.
 * @param {Object|string} player - Either an object that has an `id` property
 *   (for example, a Discord.js User object), or an ID string.
 * @returns {{server: string, channel: string, tale: Object}[]} - An array of
 *   objects representing tales that the player is currently involved in. The
 *   `server` and `channel` properties provide human-readable names of the
 *   Discord server and channel hosting the tale. The `tale` property provides
 *   the tale object.
 */

const getTales = (state, player) => {
  const uid = player && player.id ? player.id : uid
  const tales = []
  Object.keys(state).forEach(guild => {
    Object.keys(state[guild]).forEach(channel => {
      const hasPlayers = state[guild][channel] && isPopulatedArray(state[guild][channel].players)
      if (hasPlayers) {
        const { players } = state[guild][channel]
        if (players.map(p => p.id).includes(uid)) {
          tales.push({
            server: state[guild].server.name,
            channel: state[guild][channel].channel.name,
            tale: state[guild][channel]
          })
        }
      }
    })
  })
  return tales
}

/**
 * Return the player object for the user given.
 * @param {Object} tale - The tale object.
 * @param {Object|string} user - This can be any object that has an `id`
 *   property (such as the User object from Discord.js) or a number.
 * @returns {Object|null} - The player object, or `null` if no matching
 *   player could be found.
 */

const getPlayer = (tale, user) => {
  const uid = user && user.id ? user.id : user
  const filtered = tale.players.filter(p => p.id === uid)
  return filtered.length > 0 ? filtered[0] : null
}

/**
 * Return the object for a character in a tale with a given name.
 * @param {Object} tale - The tale object.
 * @param {string} name - The name of the character that you'd like to find.
 * @returns {Object|null} - The character object, or `null` if no matching
 *   character could be found.
 */

const getCharacter = (tale, name) => {
  const chars = getCharacters(tale)
  const index = chars.map(c => c.name.toLowerCase()).indexOf(name.toLowerCase())
  return index > -1 ? chars[index] : null
}

/**
 * Return an array of main characters in this tale.
 * @param {Object} tale - The tale object.
 * @returns {Object[]} - An array of the main characters in this tale.
 */

const getCharacters = tale => {
  if (tale && isArray(tale.players)) {
    const playersWChars = tale.players.filter(p => Boolean(p.character))
    return playersWChars.map(p => p.character)
  } else {
    return []
  }
}

/**
 * Return the object for a place in a tale with a given name.
 * @param {Object} tale - The tale object.
 * @param {string} name - The name of the place that you'd like to find.
 * @returns {Object|null} - The place object, or `null` if no matching place
 *   could be found.
 */

const getPlace = (tale, name) => {
  const places = getPlaces(tale)
  const index = places.map(p => deThe(p.name).toLowerCase()).indexOf(deThe(name).toLowerCase())
  return index > -1 ? places[index] : null
}

/**
 * Return an array of places in this tale.
 * @param {Object} tale - The tale object.
 * @returns {Object[]} - An array of the places in this tale.
 */

const getPlaces = tale => {
  if (tale && isArray(tale.players)) {
    const playersWPlaces = tale.players.filter(p => Boolean(p.place))
    return playersWPlaces.map(p => p.place)
  } else {
    return []
  }
}

/**
 * Get the GuildMember object for a given user.
 * @param {Object} tale - The tale object.
 * @param {User|string} user - Either a User object or a user's ID number.
 * @returns {Promise<GuildMember>} - A Promise that resolves with the
 *   GuildMember object for a given User or user ID.
 */

const getMember = async (tale, user) => {
  const uid = user && user.id ? user.id : user
  return tale.channel.guild.members.fetch(uid)
}

/**
 * Get the subjects at play in a tale (the community, the main characters, and
 * the places played by the players in it).
 * @param {object} tale - The tale object.
 * @returns {{path: string, name: string}[]} - An array of subjects in the
 *   given tale.
 */

const getSubjects = tale => {
  if (!tale.subjects || !isArray(tale.subjects)) tale.subjects = []
  return [ tale.community, ...getCharacters(tale), ...getPlaces(tale), ...tale.subjects ]
}

/**
 * Find the path for a named subject in a tale. For example, if given the name
 * of one of the main characters, this will return the path recorded for that
 * character.
 * @param {string} subject - The name of the subject.
 * @param {object} tale - The object tale.
 * @returns {string|null} - The path for the subject if it could be found in
 *   the current tale, or `null` if it could not be found.
 */

const getSubjectPath = (subject, tale) => {
  const subjects = getSubjects(tale)
  const filtered = subjects.filter(s => s.name.toLowerCase() === subject.toLowerCase())
  return filtered.length > 0 ? filtered[0].path : null
}

/**
 * Return an array of all looming questions in the game.
 * @param {Object} tale - The tale object.
 * @param {string[]} exclude -  An array of strings, each one presenting the
 *   path of a subject whose questions should be excluded from the set of
 *   questions returned (Default: `[]`).
 * @returns {Object[]} - An array of question objects.
 */

const getQuestions = (tale, exclude = []) => {
  const subjects = getSubjects(tale)
  const subjectsWQs = subjects.filter(s => !exclude.includes(s.path) && isArray(s.questions))
  return subjectsWQs.flatMap(s => s.questions)
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
    return list(user.filter(u => Boolean(u.id)).map(u => mention(u)))
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
 * Presents the user with an embed asking hen to make a choice, and then
 * returns the index of the option chosen.
 * @param {Channel} channel - The channel where the embed is posted and the
 *   bot listens for a response.
 * @param {string[]} choices - An array of strings to present as choices.
 * @param {Object} options - An object containing options for how to handle
 *   this exchange.
 * @param {string} options.preamble - If provided, this text is printed in the
 *   embed before the choices.
 * @param {string} options.color - If provided, this is the color of the stripe
 *   along the left side of the embed.
 * @param {string} options.title - If provided, this is supplied as the title
 *   of the embed. (Default: `Choose one`)
 * @param {string} options.content - If provided, this is posted as textual
 *   content along with the embed.
 * @param {Object|string} options.user - If provided, restricts who can respond
 *   to this particular user. This can be an object that has an `id` property
 *   (as in the case of the Discord.js User object), or it can be a string with
 *   a user's ID.
 * @param {number} options.timeout - If provided, this becomes the timeout (in
 *   milliseconds) that the collector will wait for a reply.
 * @param {boolean} options.returnString - If set to `true`, returns the string
 *   from the `choices` array chosen, rather than its index.
 * @returns {Promise<number|string|null>} - A Promise that resolves with the
 *   index of the option that the user chose, or the string that the user
 *   chose if you set `option.returnString` to `true`, or `null` if not given
 *   valid parameters.
 */

const queryChoice = async (channel, choices, options) => {
  if (channel && isPopulatedArray(choices)) {
    const render = renderChoices(choices)
    const desc = options.preamble ? `${options.preamble}\n\n${render}` : render
    const embed = new Discord.MessageEmbed()
    embed.setColor(options.color || colors.other)
    embed.setTitle(options.title || 'Choose one')
    embed.setDescription(desc)
    const msg = options.content ? { content: options.content, embed } : { embed }
    await channel.send(msg)

    try {
      const uid = options.user && options.user.id ? options.user.id : options.user
      const filter = uid
        ? m => getChoice(m.content, choices) !== false && m.author.id === uid
        : m => getChoice(m.content, choices) !== false
      const collected = await channel.awaitMessages(filter, { max: 1, time: options.timeout || timeout })
      return getChoice(collected.first().content, choices, options.returnString)
    } catch (err) {
      throw err
    }
  } else {
    return null
  }
}

/**
 * Looks for the tales that a player is active in. If none exist, it sends a
 * direct message to the user saying so. If just one is found, it's returned.
 * If multiple tales are found, a direct message is sent to the player asking
 * her to pick one. The tale that hen chooses is then returned.
 * @param {Object} state - The bot's state.
 * @param {User} player - The user who sent a request.
 * @returns {Promise<Object|null>} - The tale object if it could be identified,
 *   or null if no tale could be found.
 */

const queryTale = async (state, player) => {
  const tales = getTales(state, player)
  if (tales.length === 0) {
    await player.send('Sorry, I couldn???t find any channels that have you listed as a player right now.')
    return null
  } else if (tales.length === 1) {
    return tales[0].tale
  } else {
    const choices = tales.map(t => `${t.server} #${t.channel}`)
    const embed = new Discord.MessageEmbed()
    embed.setColor(colors.other)
    embed.setTitle('Which tale do you mean?')
    embed.setDescription(renderChoices(choices))
    const dm = await player.send({ embed })
    try {
      const collected = await dm.channel.awaitMessages(m => getChoice(m.content, choices) !== false, { max: 1, time: timeout })
      const index = getChoice(collected.first().content, choices)
      return tales[index].tale
    } catch {
      return null
    }
  }
}

/**
 * Ask the player to choose a character from the given tale.
 * @param {Object} tale - The tale object.
 * @param {Object} options - See the `options` parameter for the `queryChoice`
 *   method for full documentation.
 * @param {boolean} options.anon - If `true`, add another option to specify
 *   no character in the tale. (Default: `false`)
 * @param {boolean} options.cancelable - If `true`, add an option to allow the
 *   user to cancel the selection.
 * @returns {Promise<Object|string|null>} - The character object chosen, or the
 *   string `SOMEONEELSE` if `options.anon` was set to `true` and the user
 *   chose that option, or `null` if something went wrong or the user cancelled
 *   the selection (if `options.cancelable` is `true`).
 */

const queryCharacter = async (tale, options) => {
  const chars = getCharacters(tale)
  if (isPopulatedArray(chars)) {
    const { anon, cancelable } = options
    const names = chars.map(c => c.name).filter(n => Boolean(n))
    if (anon) names.push('Someone else')
    if (cancelable) names.push('Cancel')
    const index = await queryChoice(tale.channel, names, options)

    if (index > -1 && index <= chars.length) {
      return chars[index]
    } else if (anon && index === chars.length) {
      return 'SOMEONEELSE'
    } else {
      return null
    }
  } else {
    return null
  }
}

/**
 * Ask the player to choose a place from the given tale.
 * @param {Object} tale - The tale object.
 * @param {Object} options - See the `options` parameter for the `queryChoice`
 *   method for full documentation.
 * @param {boolean} options.elsewhere - If `true`, add another option to
 *   specify no place in the tale. (Default: `false`)
 * @param {boolean} options.cancelable - If `true`, add an option to allow the
 *   user to cancel the selection.
 * @returns {Promise<Object|string|null>} - The place object chosen, or the
 *   string `ELSEWHERE` if `options.elsewhere` was set to `true` and the user
 *   chose that option, or `null` if something went wrong or the user cancelled
 *   the selection (if `options.cancelable` is `true`).
 */

const queryPlace = async (tale, options) => {
  const places = getPlaces(tale)
  if (isPopulatedArray(places)) {
    const { elsewhere, cancelable } = options
    const names = places.map(p => p.name).filter(n => Boolean(n))
    if (elsewhere) names.push('A place not played in this tale')
    if (cancelable) names.push('Cancel')
    const index = await queryChoice(tale.channel, names, options)

    if (index > -1 && index < places.length) {
      return places[index]
    } else if (elsewhere && index === places.length) {
      return 'ELSEWHERE'
    } else {
      return null
    }
  } else {
    return null
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
 * Clear all "traffic light" roles from a user.
 * @param {Object} tale - The tale object.
 * @param {Object} player - The player object.
 * @returns {Promise<void>} - A Promise that resolves when all "traffic light"
 *   roles have been removed from a user.
 */

const clearTraffic = async (tale, player) => {
  const member = await getMember(tale, player)
  const { green, yellow, red } = await getTrafficRoles(tale)
  await member.roles.remove(green)
  await member.roles.remove(yellow)
  await member.roles.remove(red)
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
  await clearTraffic(tale, player)
  const member = await getMember(tale, player)
  const roles = await getTrafficRoles(tale)
  await member.roles.add(roles[color])
}

const markGreen = async (tale, player) => markTraffic(tale, player, 'green')
const markYellow = async (tale, player) => markTraffic(tale, player, 'yellow')
const markRed = async (tale, player) => markTraffic(tale, player, 'red')

/**
 * Ask an attentive question.
 * @param {Message} msg - The message received asking an attentive question.
 * @param {Object} state - The current state of the bot.
 * @returns {Promise<{tale: (Object|null), character: (Object|null),
 *   place: (Object|null), ok: boolean}>} - An object with everything you need
 *   to pay the awareness necessary to ask an attentive question. The `ok`
 *   property lets you know if all necessary conditions are met.
 */

const askAttentiveQuestion = async (msg, state) => {
  const tale = getTale(msg.channel.guild, msg.channel, state)
  const player = getPlayer(tale, msg.author)
  const { character } = player
  let place = null
  if (tale && player && character) {
    place = await queryPlace(tale, {
      title: 'Where do you find yourself?',
      preamble: 'You???ve asked an **attentive question**. Pay a moment of awareness to one of the places below, and receive a true answer.',
      content: `${mention(msg.author)},`,
      user: msg.author,
      elsewhere: true,
      cancelable: true
    })
  }
  const okChar = player && character && character.awareness && character.awareness > 0
  return { tale, character, place, ok: Boolean(tale && okChar && place) }
}

module.exports = {
  clone,
  roll,
  isArray,
  isPopulatedArray,
  shuffle,
  except,
  deThe,
  list,
  load,
  loadChildren,
  getPresent,
  formatDate,
  getPath,
  parseURLs,
  initTale,
  getTale,
  getTales,
  getPlayer,
  getCharacter,
  getCharacters,
  getPlace,
  getPlaces,
  getMember,
  getSubjects,
  getSubjectPath,
  getQuestions,
  mention,
  renderChoices,
  getChoice,
  choose,
  queryChoice,
  queryTale,
  queryCharacter,
  queryPlace,
  calculateAge,
  getTrafficRoles,
  clearTraffic,
  markTraffic,
  markGreen,
  markYellow,
  markRed,
  askAttentiveQuestion
}
