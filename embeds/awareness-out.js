const Discord = require('discord.js')
const { colors } = require('../config')

/**
 * Create an embed to tell a player hen has run out of awareness.
 * @returns {MessageEmbed} - An embed that tells that player that hen has run
 *   out of awareness.
 */

const outOfAwareness = () => {
  const embed = new Discord.MessageEmbed()
  embed.setColor(colors.red)
  embed.setTitle('Out of Awareness')
  embed.setDescription('You can’t do that, because you’ve run out of awareness. Try to figure out how to connect with a place so that you can gather awareness from it. Check the tale summary pinned in this channel to see the places in this tale, and how much awareness each has to offer.')
  return embed
}

module.exports = outOfAwareness
