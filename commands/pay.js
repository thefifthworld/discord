const { getTale, getPlayer, getPlace, queryPlace, mention } = require('../utils')
const pay = require('../pay')

const regex = /pay (awareness|attention)( to (.*?)\.?\??$)?/mi

/**
 * If given an identifiable place in the story, return it. If not, ask the
 * author what place hen meant, and return that.
 * @param {Object} tale - The tale object.
 * @param {string} str - The string entered by the author.
 * @param {User} author - The User who sent the original message.
 * @returns {Promise<Object|null>} - A Promise that resolves with the place
 *   object for the place that the user indicated, or `null` if one could not
 *   be identified.
 */

const retrievePlace = async (tale, str, author) => {
  let place = getPlace(tale, str)
  if (place) {
    return place
  } else {
    return queryPlace(tale, {
      title: 'What place do you want to pay awareness to?',
      preamble: `I don’t know which place you meant by “**${str}**.” Please select one of the following:`,
      content: `${mention(author)},`,
      user: author,
      elsewhere: true,
      cancelable: true
    })
  }
}

module.exports = {
  regex,
  description: 'Pay a moment of awareness to a place',
  execute: async (msg, state) => {
    const tale = getTale(msg.channel.guild, msg.channel, state)
    if (tale) {
      const match = msg.content.match(regex)
      if (match && match.length === 4 && match[3]) {
        const place = await retrievePlace(tale, match[3], msg.author)
        if (place) {
          const player = getPlayer(tale, msg.author)
          const { character } = player
          await pay(character, place, tale)
        }
      }
    }
  }
}
