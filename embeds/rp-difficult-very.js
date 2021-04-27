const Discord = require('discord.js')
const { colors, domain } = require('../config')

/**
 * Creates an embed explaining the result of invoking the ritual phrase,
 * “…very difficult”
 * @returns {MessageEmbed} - An embed explaining the result of invoking the
 *   ritual phrase, “…very difficult.”
 */

const veryDifficult = () => {
  const embed = new Discord.MessageEmbed()
  embed.setColor(colors['ritual-phrases'])
  embed.setTitle('…very difficult.')
  embed.setDescription('This ritual phrase intensifies the difficulty. You’ll still need to spend awareness as before, but even with that, you won’t complete the task without help. Another main character can spend awareness to help you, or you can ask a supporting character for help.')
  embed.addFields(
    { name: 'Compendium Link', value: `${domain}/rpg/compendium/ritual-phrase/very-difficult` }
  )
  return embed
}

module.exports = veryDifficult
