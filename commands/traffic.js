const { getTale, queryTale, markTraffic } = require('../utils')
const trafficRed = require('../embeds/traffic-red')

const regices = {
  any: /^(green|yellow|red|🔴|🟥|🛑|🟡|🟨|🟢|🟩)$/mi,
  green: /^(green|🟢|🟩)$/mi,
  yellow: /^(yellow|🟡|🟨)$/mi,
  red: /^(red|🔴|🟥|🛑)$/mi
}

/**
 * Identify which color the string specifies.
 * @param {string} str - The message content received.
 * @returns {string} - The color indicated by the string.
 */

const getColor = str => {
  if (str.match(regices.red)) return 'red'
  if (str.match(regices.yellow)) return 'yellow'
  return 'green'
}

module.exports = {
  regex: regices.any,
  description: 'Switches to a "traffic light" role.',
  execute: async (msg, state) => {
    const tale = msg.channel && msg.channel.guild
      ? getTale(msg.channel.guild, msg.channel, state)
      : await queryTale(state, msg.author)
    if (tale) {
      const color = getColor(msg.content)
      await markTraffic(tale, msg.author, color)
      if (color === 'red') {
        await tale.channel.send({ embed: trafficRed() })
      }
    }
  }
}
