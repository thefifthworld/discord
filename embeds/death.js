const Discord = require('discord.js')
const { colors } = require('../config')

/**
 * Creates an embed declaring that a character has died.
 * @returns {MessageEmbed} - An embed declaring that a character has died.
 */

const death = char => {
  const { name, pronouns } = char
  const embed = new Discord.MessageEmbed()
  embed.setColor(colors.red)
  embed.setTitle(`${name} has perished…`)
  embed.setDescription(`${name} has lost ${pronouns.possessive.toLowerCase()} life. Tell us how it happened.`)
  return embed
}

module.exports = death
