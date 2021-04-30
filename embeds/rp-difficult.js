const Discord = require('discord.js')
const { colors, domain } = require('../config')

/**
 * Creates an embed explaining the result of invoking the ritual phrase, “That
 * sounds difficult…”
 * @returns {MessageEmbed} - An embed explaining the result of invoking the
 *   ritual phrase, “That sounds difficult…”
 */

const difficult = () => {
  const embed = new Discord.MessageEmbed()
  embed.setColor(colors['ritual-phrases'])
  embed.setTitle('That sounds difficult…')
  embed.setDescription('You will need to spend a moment of awareness to accomplish that. You can pay a moment of awareness by sending the message, “**Pay awareness to «place name»**.” Any other player can escalate this further by responding with, “**…very difficult.**”')
  embed.addFields(
    { name: 'Compendium Link', value: `${domain}/rpg/compendium/ritual-phrase/difficult` }
  )
  return embed
}

module.exports = difficult
