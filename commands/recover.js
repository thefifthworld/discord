const { getTale, getPlayer, getCharacter, queryCharacter, mention } = require('../utils')
const charSheet = require('../embeds/sheet-char')

const regex = /^(.*?) recovers from (.*?)(exhaustion|bruises|cuts|wounds)\.?$/mi

/**
 * Mark a character's injuries as recovered.
 * @param {Object} tale - The tale object.
 * @param {User} player - The player who wanted someone to recover.
 * @param {string} name - The name given for the character to recover.
 * @param {string} type - The type of injury specified for the character
 *   to recover.
 * @returns {Promise<void>} - A Promise that resolves once the character has
 *   recovered from the specified injury.
 */

const recover = async (tale, player, name, type) => {
  let char = getCharacter(tale, name)
  if (!char) {
    const title = `Who will recover from ${type.toLowerCase()}?`
    const preamble = `We couldn’t tell for sure who you meant by “${name}.” Which of these characters has recovered from ${type.toLowerCase()}?`
    const options = { title, preamble, content: `${mention(player)},`, user: player, }
    char = await queryCharacter(tale, options)
  }

  if (char) {
    if (!char.body) char.body = {}
    if (type.toLowerCase() === 'exhaustion') char.body.exhaustion = false
    if (type.toLowerCase() === 'bruises') char.body.bruises = false
    if (type.toLowerCase() === 'cuts') char.body.cuts = false
    if (type.toLowerCase() === 'wounds') char.body.wounds = false
    if (char.sheet) await char.sheet.edit({ embed: charSheet(char) })
  }
}

module.exports = {
  regex,
  description: 'Allow a main character to recover from exhaustion, bruises, cuts, or wounds.',
  execute: async (msg, state) => {
    const tale = getTale(msg.channel.guild, msg.channel, state)
    const player = getPlayer(tale, msg.author)
    if (tale) {
      const match = msg.content.match(regex)
      if (match && match.length === 4) {
        const type = match[3].trim().toLowerCase()
        const name = match[1].trim()
        await recover(tale, player, name, type)
      }
    }
  }
}
