const Discord = require('discord.js')
const { colors } = require('../config')

/**
 * Produces an embed that asks someone to sign up players.
 * @returns {MessageEmbed} - A MessageEmbed that asks someone to sign
 *   up players.
 */

const rpStartWho = () => {
  const embed = new Discord.MessageEmbed()
  embed.setColor(colors['ritual-phrases'])
  embed.setTitle('Who will play?')
  embed.setDescription('Mention (@) each player (including yourself, if you want to play).')
  return embed
}

module.exports = rpStartWho
