const { MessageAttachment } = require('discord.js')
const charSheet = require('./embeds/sheet-char')
const placeSheet = require('./embeds/sheet-place')
const taleSheet = require('./embeds/sheet-tale')
const loomingSheet = require('./embeds/sheet-looming')
const cheatSheet = require('./embeds/sheet-cheat')

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
  if (tale.cheat) await tale.cheat.edit({ embed: cheatSheet(tale) })
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
  await updateTaleSheets(tale)

  const base = 'https://thefifthworld.s3.us-east-2.wasabisys.com/discord'
  const banners = {
    Introduction: 1,
    Development: 2,
    Contrast: 3,
    Resolution: 4,
    Endgame: 5
  }
  const attachment = new MessageAttachment(`${base}/stage${banners[stage]}.png`)
  await tale.channel.send(attachment)
}

module.exports = {
  updateCharSheet,
  updatePlaceSheet,
  updateTaleSheets,
  setStage
}