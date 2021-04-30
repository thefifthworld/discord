const Discord = require('discord.js')
const { colors } = require('../config.json')
const { roll } = require('../utils')

module.exports = {
  regex: /likely or not\?/gmi,
  description: 'Roll the dice to choose between two options, when one seems more likely than the other.',
  execute: async (msg) => {
    const result = roll()
    const very = msg.content.match(/very likely or not\?/gmi)
    const limit = very ? 5 : 4
    const unlikely = result > limit
    const less = very ? 'The much less likely option' : 'The less likely option'
    const more = very ? 'The much more likely option' : 'The more likely option'

    const embed = new Discord.MessageEmbed()
    embed.setColor(unlikely ? colors.yellow : colors.knowledge)
    embed.setTitle(unlikely ? less : more)
    await msg.reply({ embed })
  }
}
