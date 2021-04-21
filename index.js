const fs = require('fs')
const Discord = require('discord.js')
const client = new Discord.Client()
const { token } = require('./config.json')

const commands = []
const commandFiles = fs.readdirSync('./commands').filter(file => file.endsWith('.js'))
commandFiles.forEach(file => {
  const cmd = require(`./commands/${file}`)
  commands.push(cmd)
})

const state = {}

client.once('ready', () => {
  console.log('The Fifth World Discord bot is now running.')
})

client.on('message', msg => {
  if (msg.author.bot) return
  commands.forEach(cmd => {
    if (msg.content.match(cmd.regex)) {
      cmd.execute(msg, state)
    }
  })
})

client.login(token)
