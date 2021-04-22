const Discord = require('discord.js')
const { colors } = require('../config')
const { renderChoices } = require('../utils')

/**
 * Produces an embed that asks the player what place hen will play.
 * @param {string[]} places - An array of the places that the player can
 *   choose from.
 * @returns {MessageEmbed} - A MessageEmbed that asks the player which place
 *   hen will play.
 */

const rpStartPlace = places => {
  const embed = new Discord.MessageEmbed()
  embed.setColor(colors['ritual-phrases'])
  embed.setTitle('Which place would you like to play?')
  embed.setDescription(renderChoices(places))
  return embed
}

module.exports = rpStartPlace
