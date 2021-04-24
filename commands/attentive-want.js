const { askAttentiveQuestion } = require('../utils')
const pay = require('../pay')

module.exports = {
  regex: /^what does (.*?) want me to do\??$/gmi,
  description: 'Ask, “What does «person» want me to do?”',
  execute: async (msg, state) => {
    const { tale, character, place, ok } = await askAttentiveQuestion(msg, state)
    if (ok) await pay(character, place, tale)
  }
}
