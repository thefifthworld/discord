const { askAttentiveQuestion } = require('../utils')
const pay = require('../pay')

module.exports = {
  regex: /^what(.s| has) happened here recently\??$/gmi,
  description: 'Ask, “What has happened here recently?”',
  execute: async (msg, state) => {
    const { tale, character, place, ok } = await askAttentiveQuestion(msg, state)
    if (ok) await pay(character, place, tale)
  }
}
