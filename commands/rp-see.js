const { colors } = require('../config.json')
const { getTale, getPlayer, getQuestions, mention, queryChoice } = require('../utils')
const charSheet = require('../embeds/sheet-char')
const loomingSheet = require('../embeds/sheet-looming')
const outOfAwareness = require('../embeds/awareness-out')

/**
 * Ask the user to specify which question hen meant.
 * @param {Object} tale - THe tale object.
 * @param {Ojbect} player - An object representing the player who invoked
 *   the ritual phrase.
 * @returns {Promise<Object|null>} - A Promise that resolves with the question
 *   object that the player chooses, or `null` if hen cancels the selection.
 */

const getQuestion = async (tale, player) => {
  const questions = getQuestions(tale, [ player?.character?.path ])
  const qi = await queryChoice(tale.channel, [ ...questions.map(q => q.question), 'Cancel' ], {
    title: 'Which looming question moves closer to resolution?',
    preamble: 'The ritual phrase, **“I can see…”** allows you to spend a moment of awareness to recognize that we’ve moved one step closer towards answering one of our looming questions. Which one?',
    color: colors['ritual-phrases'],
    user: player
  })
  return qi < questions.length ? questions[qi] : null
}

/**
 * Ask the user to specify which answer to the question hen meant.
 * @param {Channel} channel - The channel that we tell this tale in.
 * @param {Object} question - The question object that the user chose.
 * @param {Ojbect} player - An object representing the player who invoked
 *   the ritual phrase.
 * @returns {Promise<Object|null>} - A Promise that resolves with the answer
 *   object that the player chooses, or `null` if hen cancels the selection.
 */

const getAnswer = async (channel, question, player) => {
  const { answers } = question
  const ai = await queryChoice(channel, [ ...answers.map(a => a.answer), 'Cancel' ], {
    title: 'Which answer have we moved towards?',
    preamble: 'Which of the potential answers to this question do you want to recognize as coming true?',
    color: colors['ritual-phrases'],
    user: player
  })
  return ai < answers.length ? answers[ai] : null
}

module.exports = {
  regex: /^i can see/gmi,
  description: 'Responds to the ritual phrase, “I can see…”',
  execute: async (msg, state) => {
    const tale = getTale(msg.channel.guild, msg.channel, state)
    if (!tale) return null
    const player = getPlayer(tale, msg.author)
    const out = isNaN(player?.character?.awareness) || player.character.awareness <= 0
    if (out) return tale.channel.send({ content: `${mention(player)},`, embed: outOfAwareness() })
    const { character } = player
    const question = await getQuestion(tale, player)
    if (!question) return null
    const answer = await getAnswer(tale.channel, question, player)
    if (!answer) return null
    character.awareness--
    answer.moments++
    if (character.sheet) await character.sheet.edit({ embed: charSheet(character) })
    if (tale.questions) await tale.questions.edit({ embed: loomingSheet(tale) })
  }
}
