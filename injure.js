const { injuries, bodyPartsPlural } = require('./data.json')
const { shuffle } = require('./utils')
const charSheet = require('./embeds/sheet-char')

/**
 * Randomly lose a body part, and then update the character sheet.
 * @param {Object} character - The character object for the character who is
 *   losing a body part.
 * @param {string} types - A string defining what kinds of body types the
 *   character could lose. This is separated by slashes (`/`). Valid
 *   possibilities are `hand`, `arm`, `foot`, or `leg` (e.g., `arm/leg` if the
 *   character might lose an arm or a leg, or `hand/foot` if hen might lose a
 *   hand or a foot).
 * @returns {Promise<string>} - A Promise that resolves when a body part has
 *   been chosen, the changes to the character object have been made, and the
 *   character sheet has been updated. It returns a string representation of
 *   the body part lost.
 */

const loseBodyPart = async (character, types) => {
  const { body } = character
  const t = types.split('/').map(t => t.toLowerCase().trim())

  const parts = []
  if (t.includes('hand') && body.hands.right !== 'Missing') parts.push('right hand')
  if (t.includes('hand') && body.hands.left !== 'Missing') parts.push('left hand')
  if (t.includes('foot') && body.feet.right !== 'Missing') parts.push('right foot')
  if (t.includes('foot') && body.feet.left !== 'Missing') parts.push('left foot')
  if (t.includes('arm') && body.arms.right !== 'Missing') parts.push('right arm')
  if (t.includes('arm') && body.arms.left !== 'Missing') parts.push('left arm')
  if (t.includes('leg') && body.legs.right !== 'Missing') parts.push('right leg')
  if (t.includes('leg') && body.legs.left !== 'Missing') parts.push('left leg')

  if (parts.length > 0) {
    const shuffled = shuffle(parts)
    const part = shuffled[0].split(' ').map(p => p.trim())
    const side = part[0]
    const type = part[1]
    const key = bodyPartsPlural[type]
    body[key][side] = 'Missing'

    if (type === 'arm') {
      body.hands[side] = 'Missing'
    } else if (type === 'leg') {
      body.feet[side] = 'Missing'
    }

    if (type === 'arm' || type === 'hand') {
      body.fingers[side] = []
    } else if (type === 'leg' || type === 'foot') {
      body.toes[side] = []
    }

    if (character.sheet) await character.sheet.edit({ embed: charSheet(character) })
    return part.join(' ')
  }
}

/**
 * Standardize strings that could refer to different types of injuries to a
 * recognizable value.
 * @param {string} str - The string to standardized.
 * @returns {string|null} - A standardized string defining a type of injury, or
 *   `null` if the string given couldn't be interpreted as an injury type.
 */

const findInjuryType = str => {
  const exhaust = [ 'exhaustion', 'exhaust' ]
  const bruises = [ 'bruises', 'bruise' ]
  const cuts = [ 'cuts', 'cut' ]
  const wounds = [ 'wounds', 'wound' ]
  const token = str.toLowerCase()
  if (exhaust.includes(token)) {
    return injuries.exhaustion
  } else if (bruises.includes(token)) {
    return injuries.bruises
  } else if (cuts.includes(token)) {
    return injuries.cuts
  } else if (wounds.includes(token)) {
    return injuries.wounds
  } else {
    return null
  }
}

/**
 * Inflicts exhaustion, bruises, cuts, or wounds on a charcter, and then
 * updates hen's character sheet accordingly.
 * @param {Object} character - The character to injure.
 * @param {string} type - A string describing the injury.
 * @returns {Promise<void>} - A Promise that resolves when the character's body
 *   object and character sheet have been updated.
 */

const injureCharacter = async (character, type) => {
  const { exhaustion, bruises, cuts, wounds } = injuries
  const token = findInjuryType(type)
  if (character) {
    if (!character.body) character.body = {}
    if (token === exhaustion) character.body.exhaustion = true
    if (token === bruises) character.body.bruises = true
    if (token === cuts) character.body.cuts = true
    if (token === wounds) character.body.wounds = true
    if (character.sheet) await character.sheet.edit({ embed: charSheet(character) })
  }
}

module.exports = {
  injureCharacter,
  loseBodyPart
}