const Discord = require('discord.js')
const { colors } = require('../config')
const { renderChoices } = require('../utils')

/**
 * Produces an embed that asks a player which character hen would like to play.
 * @param {string[]} chars - An array of characters to choose from.
 * @returns {MessageEmbed} - A MessageEmbed that presents the player with the
 *   characters that hen has to choose form.
 */

const rpStartCharacter = chars => {
  const embed = new Discord.MessageEmbed()
  embed.setColor(colors['ritual-phrases'])
  embed.setTitle('Which character would you like to play?')
  embed.setDescription(renderChoices(chars))
  return embed
}

module.exports = rpStartCharacter
