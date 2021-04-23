const Discord = require('discord.js')
const { colors, domain } = require('../config')
const { agenda, corePrinciples, cyclicPrinciples } = require('../data.json')

/**
 * Creates a link from an object.
 * @param {{text: string, link: string}} obj - An object with a `text` property
 *   and a `link` property, like the agenda and principles objects found in our
 *   `data.json` file.
 * @returns {string} - A string that will produce a link in an embed field.
 */

const getLink = obj => `[${obj.text}](${domain}${obj.link})`

/**
 * Returns the cyclic principles active in the current tale.
 * @param {{stage: string, saga: string}} tale - The tale object.
 * @returns {string[]} - An array of strings that provides the links for the
 *   cyclic principles active in the tale in its current state.
 */

const getActivePrinciples = tale => {
  const stages = []
  if (tale && tale.saga) stages.push(tale.saga)
  if (tale && tale.stage !== tale.saga) stages.push(tale.stage)
  const principles = []
  stages.forEach(stage => {
    if (cyclicPrinciples[stage]) principles.push(getLink(cyclicPrinciples[stage]))
  })
  return principles
}

/**
 * Create an embed that lists the game's agendas and principles, including
 * which cyclic principles the tale has in play at this moment.
 * @param {object} tale - The tale object.
 * @returns {MessageEmbed} - An embed that lists the game's agendas and
 *   principles, including which cyclic principles the tale has in play at
 *   this moment.
 */

const cheatSheet = tale => {
  const embed = new Discord.MessageEmbed()
  embed.setColor(colors['agenda-principles'])
  embed.setTitle('Agenda & Principles')
  embed.setDescription('Always look for ways to advance our agendas and follow our principles.')
  embed.addFields(
    { name: 'Agenda', value: agenda.map(a => getLink(a)).join('\n') },
    { name: 'Core Principles', value: corePrinciples.map(p => getLink(p)).join('\n') }
  )

  const cyclic = getActivePrinciples(tale)
  if (cyclic && cyclic.length > 0) embed.addFields({ name: 'Cyclic Principles', value: cyclic })

  return embed
}

module.exports = cheatSheet
