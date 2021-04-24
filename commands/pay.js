const { getTale, getPlayer, getPlace, queryPlace, mention } = require('../utils')
const outOfAwareness = require('../embeds/awareness-out')
const charSheet = require('../embeds/sheet-char')
const placeSheet = require('../embeds/sheet-place')
const taleSummary = require('../embeds/sheet-tale')

const regex = /pay (awareness|attention)( to (.*?)\.?\??$)?/mi

/**
 * Handle a character paying awareness to a place.
 * @param {Object} character - The character object.
 * @param {Object} place - The place object.
 * @param {Object} tale - The tale object.
 * @returns {Promise<void>} - A Promise that resolves once the awareness has
 *   been transferred and all relevant sheets have been updated.
 */

const pay = async (character, place, tale) => {
  character.awareness--
  if (place && place.awareness) place.awareness++

  if (character.sheet) await character.sheet.edit({ embed: charSheet(character) })
  if (place.sheet) await place.sheet.edit({ embed: placeSheet(place) })
  if (tale.summary) await tale.summary.edit({ embed: taleSummary(tale) })
}

module.exports = {
  regex,
  description: 'Pay a moment of awareness to a place',
  execute: async (msg, state) => {
    const tale = getTale(msg.channel.guild, msg.channel, state)
    if (tale) {
      const match = msg.content.match(regex)
      if (match && match.length === 4 && match[3]) {
        let place = getPlace(tale, match[3])
        if (!place) {
          place = await queryPlace(tale, {
            title: 'What place do you want to pay awareness to?',
            preamble: `I don’t know which place you meant by “**${match[3]}**.” Please select one of the following:`,
            content: `${mention(msg.author)},`,
            user: msg.author,
            elsewhere: true,
            cancelable: true
          })
        }

        if (place) {
          const player = getPlayer(tale, msg.author)
          const { character } = player
          if (player && character) {
            const { awareness } = character
            if (awareness && awareness > 0) {
              await pay(character, place, tale)
            } else {
              await msg.channel.send({ content: `${mention(msg.author)},`, embed: outOfAwareness() })
            }
          }
        }
      }
    }
  }
}
