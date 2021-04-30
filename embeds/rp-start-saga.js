const Discord = require('discord.js')
const { colors } = require('../config')
const { renderChoices } = require('../utils')

/**
 * Produces an embed that asks if this tale belongs to a larger saga.
 * @param {string[]} choices - An array of strings presenting the possible
 *   responses.
 * @returns {MessageEmbed} - A MessageEmbed that asks if this tale belongs to
 *   a larger saga.
 */

const rpStartSaga = choices => {
  const embed = new Discord.MessageEmbed()
  embed.setColor(colors['ritual-phrases'])
  embed.setTitle('Does this tale belong to a larger saga?')
  embed.setDescription(`Not all tales belong to a larger saga, but if this one does, what stage of the saga does it take place in?\n\n${renderChoices(choices)}`)
  return embed
}

module.exports = rpStartSaga
