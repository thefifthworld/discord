const Discord = require('discord.js')
const { colors, domain } = require('../config')

/**
 * Creates an embed explaining the result of invoking the ritual phrase,
 * “I don’t see it.”
 * @returns {MessageEmbed} - An embed explaining the result of invoking the
 *   ritual phrase, “I don’t see it.”
 */

const doNotSee = () => {
  const embed = new Discord.MessageEmbed()
  embed.setColor(colors.red)
  embed.setTitle('I don’t see it.')
  embed.setDescription('When someone says this, it cancels out the last thing said. You can follow this up with what you object to, or not. If a player uses this ritual phrase and doesn’t want to explain why, no one has the right to press hen for an answer. We want to see the Fifth World together, so if one of us doesn’t see it, then it can’t possibly fit into that agenda, can it?')
  embed.addFields(
    { name: 'Compendium Link', value: `${domain}/rpg/compendium/ritual-phrase/x` }
  )
  return embed
}

module.exports = doNotSee
