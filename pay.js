const { getPlayers, mention } = require('./utils')
const outOfAwareness = require('./embeds/awareness-out')
const charSheet = require('./embeds/sheet-char')
const placeSheet = require('./embeds/sheet-place')
const taleSummary = require('./embeds/sheet-tale')

/**
 * Handle a character paying awareness to a place.
 * @param {Object} character - The character object.
 * @param {Object} place - The place object.
 * @param {Object} tale - The tale object.
 * @returns {Promise<void>} - A Promise that resolves once the awareness has
 *   been transferred and all relevant sheets have been updated.
 */

const pay = async (character, place, tale) => {
  if (character && character.awareness && character.awareness > 0) {
    character.awareness--
    if (place && place.awareness) place.awareness++

    if (character.sheet) await character.sheet.edit({embed: charSheet(character)})
    if (place.sheet) await place.sheet.edit({embed: placeSheet(place)})
    if (tale.summary) await tale.summary.edit({embed: taleSummary(tale)})
  } else if (character && character.awareness) {
    const players = getPlayers(tale)
    const filtered = players.filter(p => p.character && p.character.path === character.path)
    const player = filtered.length > 0 ? filtered[0] : null
    const msg = player ? { content: `${mention(player)},`, embed: outOfAwareness() } : { embed: outOfAwareness() }
    await tale.channel.send(msg)
  }
}

module.exports = pay
