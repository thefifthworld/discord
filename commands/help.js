const Discord = require('discord.js')
const { colors } = require('../config.json')
const {
  helpIntro,
  helpQuestions,
  helpAwareness,
  helpKnowledge,
  helpInjury,
  helpOracle
} = require('../embeds/help')

module.exports = {
  regex: /^%help/gmi,
  description: 'Display help',
  execute: async (msg) => {
    if (msg.content.includes('--questions')) {
      await msg.reply({ embed: helpQuestions() })
    } else if (msg.content.includes('--awareness')) {
      await msg.reply({ embed: helpAwareness() })
    } else if (msg.content.includes('--knowledge')) {
      await msg.reply({ embed: helpKnowledge() })
    } else if (msg.content.includes('--injury')) {
      await msg.reply({ embed: helpInjury() })
    } else if (msg.content.includes('--oracle')) {
      await msg.reply({ embed: helpOracle() })
    } else {
      await msg.reply({ embed: helpIntro() })
    }
  }
}
