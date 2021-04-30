const { askAttentiveQuestion } = require('../utils')
const pay = require('../pay')

module.exports = {
  regex: /^how does (.*?) really feel\??$/gmi,
  description: 'Ask, “How does «person» really feel?”',
  execute: async (msg, state) => {
    const { tale, character, place, ok } = await askAttentiveQuestion(msg, state)
    if (ok) await pay(character, place, tale)
  }
}
