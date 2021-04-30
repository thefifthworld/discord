const Discord = require('discord.js')
const { colors } = require('../config.json')
const { shuffle } = require('../utils')

module.exports = {
  regex: /give me a drive/gmi,
  description: 'Roll the dice to choose a random drive.',
  execute: async (msg) => {
    const drives = [
      'Autonomy, independence, self-determination, freedom',
      'Competence, mastery, ability, skill, knowledge, proficiency',
      'Connection, community, kinship, intimacy, affection'
    ]
    const shuffled = shuffle(drives)
    const drive = shuffled[0]

    const embed = new Discord.MessageEmbed()
    embed.setColor(colors.red)
    embed.setTitle(drive)
    await msg.reply({ embed })
  }
}
