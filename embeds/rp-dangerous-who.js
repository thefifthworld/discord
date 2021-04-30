const Discord = require('discord.js')
const { colors, domain } = require('../config')

/**
 * Creates an embed asking whose characters did something dangerous, in
 * response to the ritual phrase, “That sounds dangerous…”
 * @returns {MessageEmbed} - An embed asking whose characters did something
 *   dangerous, in response to the ritual phrase, “That sounds dangerous…”
 */

const whoInDanger = () => {
  const embed = new Discord.MessageEmbed()
  embed.setColor(colors['ritual-phrases'])
  embed.setTitle('Who did something dangerous?')
  embed.setDescription('Mention (@) the player(s) of the main character(s) doing something dangerous.')
  embed.addFields(
    { name: 'Compendium Link', value: `${domain}/rpg/compendium/ritual-phrase/dangerous` }
  )
  return embed
}

module.exports = whoInDanger
