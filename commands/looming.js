const { getTale, getCharacters, isArray } = require('../utils')
const loomingSheet = require('../embeds/sheet-looming')

const regex = /^new looming question about (.*?): (.*?) \((.*?)\)$/mi

/**
 * Adds a question to a subject's list of looming questions.
 * @param {object} subject - The object representing the subject. Minimally,
 *   this should include a `name` property with the subject's name, and a
 *   `questions` property, which contains an array of question objects.
 * @param {object[]} question - The question object to add to the subject's
 *   list of looming questions.
 */

const addQuestionTo = (subject, question) => {
  if (subject && subject.questions) subject.questions.push(question)
}

/**
 * Finds the appropriate subject in the tale, and adds the given question to
 * that subject's questions. If given the name of the community, it will add
 * the question to the community's looming questions. If given the name of one
 * of the main characters, it will add the question to that character's list of
 * looming questions. If given the name of some other subject that already has
 * looming questions in this tale, it's added to that list, and if given a name
 * not yet found among the tale's subjects, a new record is created, and the
 * question is added to that.
 * @param {object} tale - The tale object.
 * @param {string} subject - The name of the subject. For purposes of finding a
 *   match, case is ignored, but if a new subject must be created, this string
 *   will be used for its name, in the case provided.
 * @param {object} question - The question to add to the subject's list.
 */

const addQuestion = (tale, subject, question) => {
  const { community } = tale
  const chars = getCharacters(tale).map(c => c.name)
  if (community && community.name && community.name.toLowerCase() === subject.toLowerCase()) {
    addQuestionTo(community, question)
  } else if (chars.includes(subject.toLowerCase())) {
    const index = chars.indexOf(subject.toLowerCase())
    addQuestionTo(tale.players[index].character, question)
  } else {
    if (!tale.subjects || isArray(tale.subjects)) tale.subjects = []
    const subjects = tale.subjects.map(s => s.name.toLowerCase())
    const index = subjects.indexOf(subject.toLowerCase())
    if (index < 0) {
      tale.subjects.push({ name: subject, questions: [question] })
    } else {
      addQuestionTo(tale.subjects[index], question)
    }
  }
}

module.exports = {
  regex,
  description: 'Pose a new looming question.',
  execute: async (msg, state) => {
    const tale = getTale(msg.channel.guild, msg.channel, state)
    if (tale) {
      const match = msg.content.match(regex)
      if (match && match.length > 2) {
        const subject = match[1].trim()
        const question = {
          question: match[2].trim(),
          answers: match[3].split('|').map(str => ({ answer: str.trim(), moments: 0 }))
        }
        addQuestion(tale, subject, question)
        if (tale.questions) await tale.questions.edit({ embed: loomingSheet(tale) })
      }
    }
  }
}