const Discord = require('discord.js')
const { colors } = require('../config')
const { isArray, getSubjects } = require('../utils')

/**
 * Produce the embed for displaying the looming questions in this tale.
 * @param {object} tale - The tale object.
 * @returns {MessageEmbed} - A MessageEmbed displaying the looming questions
 *   in this tale.
 */

const loomingSheet = tale => {
  const subjectsWQs = getSubjects(tale).filter(s => isArray(s.questions))
  const embed = new Discord.MessageEmbed()
  embed.setColor(colors.other)
  embed.setTitle(`Looming Questions`)
  subjectsWQs.forEach(subject => {
    subject.questions.forEach(q => {
      const value = q.answers.map(a => {
        const moments = a.moments === 1 ? '1 moment' : `${a.moments} moments`
        return `${a.answer} _(${moments})_`
      })
      embed.addFields({ name: `${subject.name}: ${q.question}`, value })
    })
  })
  embed.setFooter(`You can pose another looming question at any time by typing:\n"New looming question about «person»: «Question?» («Answer 1»|«Answer 2»|...)"`)
  return embed
}

module.exports = loomingSheet
