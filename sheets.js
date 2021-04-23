const charSheet = require('./embeds/sheet-char')
const placeSheet = require('./embeds/sheet-place')
const taleSheet = require('./embeds/sheet-tale')
const loomingSheet = require('./embeds/sheet-looming')

/**
 * Update a character's sheet.
 * @param {Object} char - The character object.
 * @returns {Promise<void>} - A Promise that resolves when the character's
 *   sheet has been updated.
 */

const updateCharSheet = async char => {
  if (char.sheet) {
    await char.sheet.edit({ embed: charSheet(char) })
  }
}

/**
 * Update a place's sheet.
 * @param {Object} place - The place object.
 * @returns {Promise<void>} - A Promise that resolves when the place's sheet
 *   has been updated.
 */

const updatePlaceSheet = async place => {
  if (place.sheet) {
    await place.sheet.edit({ embed: placeSheet(place) })
  }
}

/**
 * Update a tale's summary and looming questions sheets.
 * @param {Object} tale - The tale object.
 * @returns {Promise<void>} - A Promise that resolves when the tale's summary
 *   and looming questions sheets have been updated.
 */

const updateTaleSheets = async tale => {
  if (tale.summary) await tale.summary.edit({ embed: taleSheet(tale) })
  if (tale.questions) await tale.questions.edit({ embed: loomingSheet(tale) })
}

/**
 * Set the tale's stage and send an announcement to the tale's channel.
 * @param {Object} tale - The tale object.
 * @param {string} stage - The name of the stage to set.
 * @returns {Promise<void>} - A Promise that resolves when the stage has been
 *   set and an announcement has been sent to the channel.
 */

const setStage = async (tale, stage) => {
  tale.stage = stage
  let dashes = ''
  for (let i = 0; i < Math.floor((40 - stage.length) / 2); i++) dashes += '⦾'
  await updateTaleSheets(tale)
  await tale.channel.send(`${dashes} **${stage}** ${dashes}`)
}

module.exports = {
  updateCharSheet,
  updatePlaceSheet,
  updateTaleSheets,
  setStage
}