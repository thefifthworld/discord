const { askAttentiveQuestion } = require('../utils')
const pay = require('../pay')

module.exports = {
  regex: /^how (can|could) i get (.*?) to (.*?)\??$/gmi,
  description: 'Ask, “How could I get «person» to ____?”',
  execute: async (msg, state) => {
    const { tale, character, place, ok } = await askAttentiveQuestion(msg, state)
    if (ok) await pay(character, place, tale)
  }
}
