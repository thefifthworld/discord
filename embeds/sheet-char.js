const Discord = require('discord.js')
const { colors, domain } = require('../config')
const { cyclicPrinciples } = require('../data')
const { formatDate } = require('../utils')

/**
 * Describe the current state of a character's injuries.
 * @param {object} body - The character's body object.
 * @returns {string} - A string describing the current state of a character's
 *   injuries.
 */

const describeInjuries = body => {
  if (!body.scars) body.scars = []
  const injuryTypes = [ 'Exhaustion', 'Bruises', 'Cuts', 'Wounds' ]
  const injuries = injuryTypes.map(type => `${body[type.toLowerCase()] && body[type.toLowerCase()] === true ? '●' : '○'} ${type}`)
  const desc = [ injuries.join(' / '), ...body.scars ]
  return desc.join('\n')
}

/**
 * List the character's bonds.
 * @param {{place: string, path: string, stage: string}[]} bonds - An array of
 *   bonds to display. Each element in the array is expected to be an object
 *   with at least three properties: `place` (a string providing the name of
 *   the place you've bonded to), `path` (a string providing the path for this
 *   place on the Fifth World website), and `stage` (the stage of life in which
 *   you formed this bond).
 * @returns {string} - A string representation of the character's bonds, ready
 *   for display.
 */

const listBonds = bonds => {
  const bondStrings = bonds.map(bond => `_${bond.stage}:_ [${bond.place}](${domain}${bond.path})`)
  return bondStrings.join('\n')
}

/**
 * List what the character knows.
 * @param {{statement: string, subject: string}[]} knowledge - An array of
 *   things that a character knows. Each item in the array must have a
 *   `statement` property, providing a string that says what the character
 *   knows. The other property, `subject`, should provide a string with the
 *   path of the subject that this knowledge says something about.
 * @returns {string} - A string representation of the character's knowledge,
 *   ready for display.
 */

const listKnowledge = knowledge => knowledge ? knowledge.map(k => k.statement).join('\n') : '—'

/**
 * Return a string representing a character's awareness.
 * @param {number} awareness - The number of moments of awareness that the
 *   character currently possesses.
 * @returns {string} - A string representing the character's current awareness,
 *   showing five circles, with filled circles (●) representing moments that
 *   the character possesses, and empty circles (○) the character's capacity to
 *   gain more awareness.
 */

const showAwareness = awareness => {
  const arr = []
  for (let i = 0; i < 5; i++) {
    const next = i < awareness ? '●' : '○'
    arr.push(next)
  }
  return arr.join(' ')
}

/**
 * Produce the character sheet.
 * @param {object} char - The character object.
 * @returns {MessageEmbed} - Produce the MessageEmbed for the current state
 *   of the player's main character.
 */

const charSheet = (char) => {
  if (!char.body) char.body = {}
  const { name, body, born, age, stage, bonds, knowledge, path, awareness } = char

  const embed = new Discord.MessageEmbed()
  embed.setColor(colors['other'])
  embed.setTitle(name)
  embed.addFields(
    { name: 'Born', value: formatDate(born), inline: true },
    { name: 'Age', value: `${age} (${stage.person})`, inline: true },
    { name: 'Cyclic Principle', value: `[${cyclicPrinciples[stage.stage].text}](${domain}${cyclicPrinciples[stage.stage].link})` },
    { name: 'Injuries', value: describeInjuries(body), inline: true },
    { name: 'Bonds', value: listBonds(bonds) },
    { name: 'Awareness', value: showAwareness(awareness) },
    { name: 'Knowledge', value: listKnowledge(knowledge) },
    { name: 'Link', value: `${domain}${path}` }
  )
  return embed
}

module.exports = charSheet
