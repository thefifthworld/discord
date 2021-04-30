const Discord = require('discord.js')
const { colors, domain } = require('../config')

/**
 * Creates an embed explaining the result of invoking the ritual phrase,
 * “But only if…”
 * @returns {MessageEmbed} - An embed explaining the result of invoking the
 *   ritual phrase, “But only if…”
 */

const onlyIf = () => {
  const embed = new Discord.MessageEmbed()
  embed.setColor(colors['ritual-phrases'])
  embed.setTitle('But only if…')
  embed.setDescription('You can only achieve the thing you said if you first fulfill the condition set by this ritual phrase.')
  embed.addFields(
    { name: 'Compendium Link', value: `${domain}/rpg/compendium/ritual-phrase/only-if` }
  )
  return embed
}

module.exports = onlyIf
