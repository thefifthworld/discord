const Discord = require('discord.js')
const { colors } = require('../config')

/**
 * Creates an embed declaring a character's success at a dangerous task.
 * @returns {MessageEmbed} - An embed declaring a character's success at a
 *   dangerous task.
 */

const dangerSuccess = (char, wager) => {
  const { name, pronouns } = char
  const embed = new Discord.MessageEmbed()
  embed.setColor(colors.green)
  embed.setTitle(`${name} succeeded!`)
  embed.setDescription(`${name} risked ${wager.toLowerCase()} to accomplish something dangerous, but with skill and no small amount of luck, ${pronouns.subject.toLowerCase()} achieved ${pronouns.possessive.toLowerCase()} goal. Tell us how ${pronouns.subject.toLowerCase()} did it.`)
  return embed
}

module.exports = dangerSuccess
