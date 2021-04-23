const Discord = require('discord.js')
const { colors, domain } = require('../config')

/**
 * Return a string representing a place's awareness.
 * @param {number} awareness - The number of moments of awareness that the
 *   place currently possesses.
 * @returns {string} - A string that displays one filled circle  (●) for each
 *   moment of awareness that it currently possesses.
 */

const showAwareness = awareness => {
  const arr = []
  for (let i = 0; i < awareness; i++) { arr.push('●') }
  return awareness === 0
    ? '○'
    : arr.join(' ')
}

/**
 * Produce the place sheet.
 * @param {object} place - The place object.
 * @returns {MessageEmbed} - Produce the MessageEmbed for the current state
 *   of the player's place.
 */

const placeSheet = (place) => {
  const { name, path, criterion, awareness } = place
  const embed = new Discord.MessageEmbed()
  embed.setColor(colors['other'])
  embed.setTitle(name)
  if (criterion) embed.addFields({ name: 'Criterion', value: criterion })
  embed.addFields(
    { name: 'Awareness', value: showAwareness(awareness) },
    { name: 'Link', value: `${domain}${path}` }
  )
  return embed
}

module.exports = placeSheet
