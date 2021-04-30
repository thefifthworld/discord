const Discord = require('discord.js')
const { colors, domain } = require('../config')
const { cyclicPrinciples, bodyPartsPlural, allFingers, allToes } = require('../data')
const { list, except, formatDate } = require('../utils')

/**
 * Describe the condition of a limb. If describing an arm that's missing, say
 * that the arm is missing. If the arm is present but the hand is missing, say
 * that the hand is missing. If the arm and the hand are present, describe
 * which fingers (if any) may be missing.
 * @param {Object} body - The character's body object.
 * @param {string} side - `Left` or `Right`
 * @param {string} type - `arm` or `leg`
 * @returns {string[]} - An array of strings describing what parts of the limb
 *   might be missing.
 */

const describeMissingLimb = (body, side, type) => {
  const arr = []
  const s = side.toLowerCase()
  const extremity = type === 'arm' ? 'hand' : 'leg' ? 'foot' : null
  const digits = type === 'arm' ? 'finger' : 'leg' ? 'toe' : null
  const full = type === 'arm' ? allFingers : 'leg' ? allToes : null

  if (extremity && digits && full) {
    if (body[bodyPartsPlural[type]][s] === 'Missing') {
      arr.push(`${side} ${type} missing`)
    } else if (body[bodyPartsPlural[extremity]][s] === 'Missing') {
      arr.push(`${side} ${extremity} missing`)
    } else {
      const missingDigits = except(full, body[bodyPartsPlural[digits]][s]).filter(f => f !== 'Thumb').map(f => `${f.toLowerCase()} ${digits}`)
      if (digits === 'finger' && !body[bodyPartsPlural[digits]][s].includes('Thumb')) missingDigits.unshift('thumb')
      if (missingDigits.length > 0) arr.push(`Missing ${list(missingDigits)} on ${s} ${extremity}`)
    }
  }

  return arr
}

/**
 * Describe which body parts a character is missing.
 * @param {Object} body - The character's body object.
 * @returns {string[]} - An array of strings describing the body parts that a
 *   character is missing.
 */

const describeMissingBodyParts = body => {
  let missing = []

  if (body.eyes.left === 'Blind' && body.eyes.right === 'Blind') {
    missing.push('Blind')
  } else if (body.eyes.left === 'Blind') {
    missing.push('Blind in left eye')
  } else if (body.eyes.right === 'Blind') {
    missing.push('Blind in right eye')
  }

  if (body.eyes.left === 'Missing' && body.eyes.right === 'Missing') {
    missing.push('Missing both eyes')
  } else if (body.eyes.left === 'Missing') {
    missing.push('Missing left eye')
  } else if (body.eyes.right === 'Missing') {
    missing.push('Missing right eye')
  }

  if (body.ears.left === 'Deaf' && body.ears.right === 'Deaf') {
    missing.push('Deaf')
  } else if (body.ears.left === 'Deaf') {
    missing.push('Deaf in left ear')
  } else if (body.ears.right === 'Deaf') {
    missing.push('Deaf in right ear')
  }

  if (body.ears.left === 'Missing' && body.ears.right === 'Missing') {
    missing.push('Missing both ears')
  } else if (body.ears.left === 'Missing') {
    missing.push('Missing left ear')
  } else if (body.ears.right === 'Missing') {
    missing.push('Missing right ear')
  }

  missing = [
    ...missing,
    ...describeMissingLimb(body, 'Right', 'arm'),
    ...describeMissingLimb(body, 'Left', 'arm'),
    ...describeMissingLimb(body, 'Right', 'leg'),
    ...describeMissingLimb(body, 'Left', 'leg')
  ]

  return missing
}

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
  const desc = [ injuries.join(' / '), ...describeMissingBodyParts(body) ]
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
