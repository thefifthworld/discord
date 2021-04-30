const { askAttentiveQuestion } = require('../utils')
const pay = require('../pay')

module.exports = {
  regex: /^who has agency here\??$/gmi,
  description: 'Ask, “Who has agency here?”',
  execute: async (msg, state) => {
    const { tale, character, place, ok } = await askAttentiveQuestion(msg, state)
    if (ok) await pay(character, place, tale)
  }
}
