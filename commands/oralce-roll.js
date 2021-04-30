const Discord = require('discord.js')
const { colors } = require('../config.json')
const { roll } = require('../utils')

module.exports = {
  regex: /roll (a |one |1 |two |2 )?(die|dice)/mi,
  description: 'Roll a die and report the result.',
  execute: async (msg) => {
    const two = Boolean(msg.content.match(/(2|two) dice/mi))
    const results = [ roll(), roll() ]
    const title = two
      ? `You rolled a ${Math.max(...results)}`
      : `You rolled a ${results[0]}`
    const embed = new Discord.MessageEmbed()
    embed.setColor(colors['import-export'])
    embed.setTitle(title)
    if (two) embed.setDescription(`You rolled a ${results[0]} and a ${results[1]}.`)
    await msg.reply({ embed })
  }
}
