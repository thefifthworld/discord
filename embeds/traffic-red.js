const Discord = require('discord.js')
const { colors } = require('../config')

/**
 * Produces an embed that tells the channel that someone just placed henself
 * in the red role.
 * @returns {MessageEmbed} - A MessageEmbed that tells the channel to stop the
 *   game and talk about what just happened.
 */

const trafficRed = () => {
  const embed = new Discord.MessageEmbed()
  embed.setColor(colors.red)
  embed.setTitle('STOP!')
  embed.setDescription('One of your fellow players just placed henself in the red role, indicating a problem. Stop the game. That person can choose to explain henself or not. If hen doesn’t want to talk about it, you don’t have any right to force hen to do so.\n\nThis might present a good time to take a break and step away from the game for a few minutes. When you come back, rewind to a point in the story before things went awry, and try it a different way.')
  return embed
}

module.exports = trafficRed
