const Discord = require('discord.js')
const { colors } = require('../config')

/**
 * Creates an embed declaring a character's failure at a dangerous task, and
 * what hen has suffered as a result.
 * @returns {MessageEmbed} - An embed declaring a character's failure at a
 *   dangerous task, and what hen has suffered as a result.
 */

const dangerFailure = (char, loss) => {
  const { name, pronouns } = char
  const sub = pronouns.subject.toLowerCase()
  const obj = pronouns.object.toLowerCase()
  const pos = pronouns.possessive.toLowerCase()
  const cost = loss.substring(0, 8).toLowerCase() === 'missing '
    ? `but ${sub} lost ${pos} ${loss.substring(8)} in the process`
    : `but suffered ${loss.toLowerCase()} to do so`
  const desc = `${name} risked danger to accomplish ${pos} goal, ${cost}. Tell us how it happened.`

  const embed = new Discord.MessageEmbed()
  embed.setColor(colors.red)
  embed.setTitle(`${name} achieved ${pos} goal, but it cost ${obj}…`)
  embed.setDescription(desc)
  return embed
}

module.exports = dangerFailure
