const Discord = require('discord.js')
const { colors } = require('../config')
const { renderChoices } = require('../utils')

/**
 * Produces an embed that asks the player which subject hen knows about.
 * @param {string[]} subjects - An array of the community name, the names of
 *   the main characters, and the names of the places played in the current
 *   tale, plus the option that the subject might not have a page yet.
 * @returns {MessageEmbed} - A MessageEmbed that asks the player which subject
 *   hen knows something about.
 */

const promptQuerySubject = subjects => {
  const embed = new Discord.MessageEmbed()
  embed.setColor(colors.other)
  embed.setTitle('Who do you know something about?')
  embed.setDescription(`Choose one of the subjects below, or provide a link to the person you know something about.\n\n${renderChoices(subjects)}`)
  return embed
}

module.exports = promptQuerySubject
