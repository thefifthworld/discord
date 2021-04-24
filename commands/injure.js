const { getTale, mention, queryCharacter, getPlayer, getCharacter } = require('../utils')
const charSheet = require('../embeds/sheet-char')

const regex = /^(exhaust|bruise|cut|wound) (.*?)(\.|\!)?$/mi

/**
 * Inflict an injury on a character.
 * @param {object} tale - The tale object.
 * @param {User} player = The player who wanted to injure someone.
 * @param {string} name - The name given for the character to injure.
 * @param {string} type - The type of injury specified for the character.
 * @returns {Promise<void>} - A Promise that resolves once the character has
 *   been injured.
 */

const injure = async (tale, player, name, type) => {
  let char = getCharacter(tale, name)
  if (!char) {
    const title = `Who do you want to ${type.toLowerCase()}?`
    const preamble = `We couldn’t tell for sure who you meant by “${name}.” Which of these characters do you want to ${type.toLowerCase()}?`
    const options = { title, preamble, content: `${mention(player)},`, user: player, }
    char = await queryCharacter(tale, options)
  }

  if (char) {
    if (!char.body) char.body = {}
    if (type.toLowerCase() === 'exhaust') char.body.exhaustion = true
    if (type.toLowerCase() === 'bruise') char.body.bruises = true
    if (type.toLowerCase() === 'cut') char.body.cuts = true
    if (type.toLowerCase() === 'wound') char.body.wounds = true
    if (char.sheet) await char.sheet.edit({ embed: charSheet(char) })
  }
}

module.exports = {
  regex,
  description: 'Inflict exhaustion, bruises, cuts, or wounds on a main character',
  execute: async (msg, state) => {
    const tale = getTale(msg.channel.guild, msg.channel, state)
    const player = getPlayer(tale, msg.author)
    if (tale) {
      const match = msg.content.match(regex)
      if (match && match.length === 4) {
        const type = match[1].toLowerCase()
        const name = match[2].trim()
        await injure(tale, player, name, type)
      }
    }
  }
}
