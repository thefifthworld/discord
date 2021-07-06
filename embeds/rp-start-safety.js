const Discord = require('discord.js')
const { colors } = require('../config')

/**
 * Produces an embed that describes the safety tools that the bot supports.
 * @returns {MessageEmbed} - A MessageEmbed that describes the safety tools
 *   that the bot recognizes.
 */

const rpStartSafety = () => {
  const embed = new Discord.MessageEmbed()
  embed.setColor(colors['ritual-phrases'])
  embed.setTitle('Safety Tools')
  embed.setDescription('The Keeper of Tales runs two types of safety tools, in addition to what you might work out over the voice channel.')
  embed.addFields(
    { name: '“I don’t see it.”', value: 'The ritual phrase, “[I don’t see it](https://thefifthworld.com/rpg/compendium/ritual-phrase/x)” provides the primary safety tool built into the game. You can use this to veto the last thing said for any reason. It might introduce something that you find too upsetting to explore, or it might just not fit with your idea of the game’s tone, or your sense of verisimilitude. This ritual phrase can help shape a consistent tone for the game, or help it remain grounded and feeling real, but it can also serve as a safety tool. Don’t hesitate to use it. Early in a game in particular, it can help a group find the right space to play in.' },
    { name: 'Traffic Lights', value: 'We have a version of Peter Malmberg’s “[traffic lights](https://blackfiskforlag.com/products/traffic-lights/)” for this game. This provides a secondary means of communicating how _you_ feel, distinct from the feelings of the character you play. As we find ourselves on a Discord server here, we can use roles. We’ve added each of you to the **green** role, which should match how you all feel right now at the start of the game. If not, you should stop the game to talk about that first. As the game progresses, though, you might need to change that role. You can do this by sending any of the messages below, either in this channel, or to the Keeper of Tales as a direct message.' }
  )
  return embed
}

/**
 * Produces an embed that describes what the "Red" role means and how to
 * activate it.
 * @returns {MessageEmbed} - A MessageEmbed that describes the "Red" role and
 *   how to activate it.
 */

const rpStartSafetyRed = () => {
  const embed = new Discord.MessageEmbed()
  embed.setColor(colors.red)
  embed.setTitle('Red')
  embed.setDescription('**Red** means we’ve crossed a line. You don’t feel OK. Stop the game immediately and talk about what’s happened.')
  embed.addFields(
    { name: 'How to activate it', value: 'Send a message of `red`, :red_circle:, :red_square:, or :stop_sign:, either in this channel or as a private message to the Keeper of Tales.' }
  )
  return embed
}

/**
 * Produces an embed that describes what the "Yellow" role means and how to
 * activate it.
 * @returns {MessageEmbed} - A MessageEmbed that describes the "Yellow" role
 *   and how to activate it.
 */

const rpStartSafetyYellow = () => {
  const embed = new Discord.MessageEmbed()
  embed.setColor(colors.yellow)
  embed.setTitle('Yellow')
  embed.setDescription('**Yellow** means you have some concerns. We haven’t crossed a line yet, but we’ve gotten close. If you see someone go yellow, you might want to pull back.')
  embed.addFields(
    { name: 'How to activate it', value: 'Send a message of `yellow`, :yellow_circle:, or :yellow_square:, either in this channel or as a private message to the Keeper of Tales.' }
  )
  return embed
}

/**
 * Produces an embed that describes what the "Green" role means and how to
 * activate it.
 * @returns {MessageEmbed} - A MessageEmbed that describes the "Green" role and
 *   how to activate it.
 */

const rpStartSafetyGreen = () => {
  const embed = new Discord.MessageEmbed()
  embed.setColor(colors.green)
  embed.setTitle('Green')
  embed.setDescription('**Green** means enthusiastic consent. You might portray a character in anguish, but you enjoy it and feel good about it.')
  embed.addFields(
    { name: 'How to activate it', value: 'Send a message of `green`, :green_circle:, or :green_square:, either in this channel or as a private message to the Keeper of Tales.' }
  )
  return embed
}

module.exports = {
  rpStartSafety,
  rpStartSafetyRed,
  rpStartSafetyYellow,
  rpStartSafetyGreen
}
