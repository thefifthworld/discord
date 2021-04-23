const Discord = require('discord.js')
const { minPlayers, maxPlayers } = require('../data.json')
const { colors } = require('../config')

/**
 * Produces an embed that tells the channel that they must have between the
 * minimum and maximum number of players.
 * @param {number} num - The number of players that the channel tried to start
 *   a tale with.
 * @returns {MessageEmbed} - A MessageEmbed that tells the channel that they
 *   must have between the minimum and maximum number of players.
 */

const rpStartNumPlayers = num => {
  const title = num < minPlayers
    ? `You need at least ${minPlayers} players to play _The Fifth World_.`
    : `You can’t play _The Fifth World_ with more than ${maxPlayers} players.`
  const embed = new Discord.MessageEmbed()
  embed.setColor(colors['ritual-phrases'])
  embed.setTitle(title)
  embed.setDescription(`You’ll need between ${minPlayers} and ${maxPlayers} players to play the game.`)
  return embed
}

module.exports = rpStartNumPlayers
