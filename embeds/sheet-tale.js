const Discord = require('discord.js')
const { colors, domain } = require('../config')
const { mention, formatDate } = require('../utils')

/**
 * Return a string that represents the awareness that a "thing" has.
 * @param {string} thing - If set to "place" (case insensitive), it returns
 *   a string representing the awareness that the player's place has. If set
 *   to anything else, it returns an empty string.
 * @param {{place: {awareness: number}}} player - The player object.
 * @returns {string} - If asked for a place, a string representing the
 *   awareness currently found there. Otherwise, an empty string.
 */

const getAwareness = (thing, player) => {
  if (thing.toLowerCase() === 'place') {
    const awareness = []
    for (let i = 0; i < player.place.awareness; i++) awareness.push('●')
    return ` ${awareness.join(' ')}`
  } else {
    return ''
  }
}

/**
 * List the characters or places played by players in this tale.
 * @param {object} tale - An object containing the data for this tale.
 * @param {string} thing - If set to 'Place', it lists the places played by
 *   players in this tale; otherwise, it lists the main characters played by
 *   players in this tale.
 * @returns {string} - A string representing either the places player by
 *   players in this tale (if `thing` equals `Place`), or the main characters
 *   played by players in this tale (if `thing` equals anything else).
 */

const listPlayerStuff = (tale, thing) => {
  const strings = tale.players.map(player => {
    const t = thing.toLowerCase() === 'place' ? player.place : player.character
    const m = mention(player)
    const link = `[${t.name}](${domain}${t.path})`
    return `${link} _(played by ${m})_${getAwareness(thing, player)}`
  })
  return strings.join('\n')
}

/**
 * Produces an embed that summarizes the current state of the tale.
 * @param {{community: object, present: string, players: object[],
 *   stage: string, saga: string? }} tale - An object representing the tale.
 * @returns {MessageEmbed} - A MessageEmbed that summarizes the current state
 *   of the tale.
 */

const taleSummary = tale => {
  const stageName = tale.saga ? 'Stage (Saga/Tale)' : 'Stage'
  const stageValue = tale.saga ? `${tale.saga} / ${tale.stage}` : tale.stage

  const embed = new Discord.MessageEmbed()
  embed.setColor(colors['other'])
  embed.setTitle('Our Tale')
  embed.addFields(
    { name: 'Community', value: `[${tale.community.name}](${domain}${tale.community.path})` },
    { name: 'Beginning', value: formatDate(tale.present) },
    { name: 'Main Characters', value: listPlayerStuff(tale, 'Character') },
    { name: 'Places', value: listPlayerStuff(tale, 'Place') },
    { name: stageName, value: stageValue }
  )
  return embed
}

module.exports = taleSummary
