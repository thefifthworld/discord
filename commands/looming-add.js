const { getTale, getQuestions } = require('../utils')
const loomingSheet = require('../embeds/sheet-looming')

const regex = /Another (possible )?answer to the question(,)? ("|“)(.*?)("|”): ("|“)(.*?)("|”)/mi

module.exports = {
  regex,
  description: 'Add another possible answer to a looming question.',
  execute: async (msg, state) => {
    const tale = getTale(msg.channel.guild, msg.channel, state)
    if (tale) {
      const match = msg.content.match(regex)
      if (match && match.length > 8) {
        const questions = getQuestions(tale)
        const index = questions.map(q => q.question).indexOf(match[4])
        if (index >= 0) questions[index].answers.push({ answer: match[7], moments: 0 })
        if (tale.questions) await tale.questions.edit({ embed: loomingSheet(tale) })
      }
    }
  }
}
