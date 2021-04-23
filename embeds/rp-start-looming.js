const Discord = require('discord.js')
const { colors, domain } = require('../config')

/**
 * Produces an embed that asks for a looming question.
 * @param {string} subject - The name of the subject of our question.
 * @returns {MessageEmbed} - A MessageEmbed that asks for a looming question.
 */

const rpStartLooming = subject => {
  const embed = new Discord.MessageEmbed()
  embed.setColor(colors['ritual-phrases'])
  embed.setTitle(`What looming question does ${subject} face?`)
  embed.setDescription(subject + ' begins our tale facing a _looming question_. This question must have at least two possible answers. Type it in the format `QUESTION? (ANSWER1|ANSWER2)`')
  embed.addFields(
    { name: 'Compendium Link', value: `${domain}/rpg/compendium/question/looming` }
  )
  return embed
}

module.exports = rpStartLooming
