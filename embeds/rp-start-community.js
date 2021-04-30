const Discord = require('discord.js')
const { colors } = require('../config')

/**
 * Produces an embed that asks the players what community the tale concerns.
 * @returns {MessageEmbed} - A MessageEmbed that asks the players what
 *   community the tale concerns.
 */

const rpStartCommunity = () => {
  const embed = new Discord.MessageEmbed()
  embed.setColor(colors['ritual-phrases'])
  embed.setTitle('What community does this tale take place in?')
  embed.setDescription('Provide a link to the community on the Fifth World website.')
  return embed
}

module.exports = rpStartCommunity
