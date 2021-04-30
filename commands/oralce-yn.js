const Discord = require('discord.js')
const { colors } = require('../config.json')
const { roll } = require('../utils')

module.exports = {
  regex: /yes or no\?/gmi,
  description: 'Roll the dice to choose between two options.',
  execute: async (msg) => {
    const result = roll()
    const yes = result % 2 === 0

    const embed = new Discord.MessageEmbed()
    embed.setColor(yes ? colors.green : colors.red)
    embed.setTitle(yes ? 'Yes' : 'No')
    await msg.reply({ embed })
  }
}
