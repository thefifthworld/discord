const Discord = require('discord.js')
const { colors } = require('../config')

/**
 * Produces an embed that provides basic help.
 * @returns {MessageEmbed} - A MessageEmbed that provides basic help.
 */

const helpIntro = () => {
  const embed = new Discord.MessageEmbed()
  embed.setColor(colors.other)
  embed.setTitle('Help')
  embed.setDescription('The Keeper of Tales helps you play the Fifth World tabletop roleplaying game over Discord.')
  embed.addFields(
    { name: 'Ritual Phrases', value: 'The ritual phrase “[Let us dream together of the world to come](https://thefifthworld.com/rpg/compendium/ritual-phrase/open)” starts a new game. Type this into a text channel to begin a game in that channel. This will overwrite any existing game in that channel. After that, you can type all other [ritual phrases](https://thefifthworld.com/rpg/compendium/ritual-phrase) into the same channel for them to take effect. Where the Keeper needs more information, it will prompt you for it.' },
    { name: 'Questions', value: 'For more on questions, type **%help --questions**.' },
    { name: 'Awareness', value: 'For more on how to gather and pay awareness, type **%help --awareness**.' },
    { name: 'Knowledge', value: 'For more on knowledge, type **%help --knowledge**.' },
    { name: 'Injury', value: 'For more on injuries, recovery, and combat, type **%help --injury**.' },
    { name: 'Oracle', value: 'For more on how to ask the Keeper to make a decision for you, type **%help --oracle**.' }
  )
  return embed
}

/**
 * Produces an embed that provides help on questions.
 * @returns {MessageEmbed} - A MessageEmbed that provides help on questions.
 */

const helpQuestions = () => {
  const embed = new Discord.MessageEmbed()
  embed.setColor(colors.other)
  embed.setTitle('Questions')
  embed.setDescription('The Fifth World tabletop roleplaying game focuses on asking and answering questions. This will help you understand how the Keeper of Tales can help you track the questions in your game.')
  embed.addFields(
    { name: 'Immediate Questions', value: 'You ask [immediate questions](https://thefifthworld.com/rpg/compendium/question/immediate) of other players, so you can pose these in the text channel in a play-by-post game or over your voice channel in a live game. You don’t need the Keeper of Tales to get involved with these.' },
    { name: 'Attentive Questions', value: 'When you ask an [attentive question](https://thefifthworld.com/rpg/compendium/question/attentive), type your question in the tale’s text channel. The Keeper will recognize the format, and prompt you to respond with which place you want to pay awareness to, in order to ask this question, or it will tell you that you don’t have any awareness if you’ve run out.' },
    { name: 'Looming Questions', value: 'The Keeper will make sure that your community, and each character, has a [looming question](https://thefifthworld.com/rpg/compendium/question/looming) at the start of a tale. You’ll enter these with a format like, `QUESTION? (ANSWER1 | ANSWER2 | ... )`, e.g., _Will I become a respected sculptor? (Yes | No)_. A looming question must have at least two possible answers, but it can have as many as you consider distinct and interesting.' },
    { name: 'New Looming Questions', value: 'You might come up with a new looming question during a tale already in progress. You can always add a new one by typing in the tale’s text channel, `New looming question about NAME: QUESTION? (ANSWER1 | ANSWER2 | ...)`' },
    { name: 'New Answers to Looming Questions', value: 'You might also realize that a looming question has another potential answer after originally posing it. You can add this by typing in the tale’s text channel, `Another answer to the question QUESTION: ANSWER`. You can wrap the question and answer in double quotes if you want to make it more precise.' },
    { name: 'Resolving Looming Questions', value: 'When you type the [ritual phrase](https://thefifthworld.com/rpg/compendium/ritual-phrase) “[I can see…](https://thefifthworld.com/rpg/compendium/ritual-phrase/see)” you can spend a moment of your own awareness to recognize that events have moved towards one answer to a looming question more than another. The [resolution stage](https://thefifthworld.com/rpg/compendium/stage/resolution) unlocks the ability to answer looming questions, if they have at least five moments of awareness in total across all of their answers, and one answer has more than three moments more than the answer with the next most moments.' }
  )
  return embed
}

/**
 * Produces an embed that provides help on awareness.
 * @returns {MessageEmbed} - A MessageEmbed that provides help on awareness.
 */

const helpAwareness = () => {
  const embed = new Discord.MessageEmbed()
  embed.setColor(colors.other)
  embed.setTitle('Awareness')
  embed.setDescription('Awareness constitutes the primary currency of the Fifth World tabletop roleplaying game.')
  embed.addFields(
    { name: 'Generating Awareness', value: 'Characters start with five moments of awareness, and places start with one. But while characters spend their awareness to do things, place accumulate a moment of awareness at the start of each stage of the tale. Additionally, most of the time when characters pay awareness, they pay it _to_ places. Characters will quickly run out of awareness unless they take the time to gather more from places.' },
    { name: 'Gathering Awareness', value: 'Characters can gather awareness from a place when they meet its _criterion_, taking part in the place’s essence. The player who plays the place must decide when this happens. If you think it has, type a message into the tale’s text channel that includes the phrase `gather awareness` (capitalization does not matter), and mentioning (@) each of the players who should receive awareness.' },
    { name: 'Default: By Need', value: 'By default, when you allow characters to gather awareness, the Keeper will distribute it according to need, giving awareness to the character who has the least until they all have the same amount, and then distributing the rest equally, or as close to that as it can accomplish. With this method, if you have four moments of awareness, and you give it to two characters, one of whom has three moments and the other of which has one, then they will both have four at the end.' },
    { name: 'Distributing Evenly', value: 'Include the word `evenly` in your message to distribute your awareness as evenly as possible. If your place has four moments of awareness, and you distribute it evenly between two characters, one of whom has three moments of awareness and the other of which has one, then the first character will have five and the second will have thre.' },
    { name: 'Distributing in Order', value: 'Include words `in order` in your message to distribute awareness in the order you specify. In this situation, the first character you mention will receive awareness until hen has reached hens capacity, and then the next character will receive awareness, and so on, until you’ve run out. For example, if you have four moments of awaareness, and you distribute it in order to one character with three moments of awareness and a second with one, the first will have five moments of awareness, and the second will have three.' },
    { name: 'Paying Awareness', value: 'For a few things, you’ll have to pay awareness, but the Keeper won’t take care of it for you. For these instances, type `Pay awareness to NAME` in the tale’s text channel. The Keeper may prompt you for clarification if it can’t exactly match which place you mention.' }
  )
  return embed
}

/**
 * Produces an embed that provides help on knowledge.
 * @returns {MessageEmbed} - A MessageEmbed that provides help on knowledge.
 */

const helpKnowledge = () => {
  const embed = new Discord.MessageEmbed()
  embed.setColor(colors.other)
  embed.setTitle('Knowledge')
  embed.setDescription('The knowledge most important to your character lies not in _things that you know_, but in _people that you know_, not statements of fact, but rather in the sense of, “I know that person.”')
  embed.addFields(
    { name: 'Main Characters', value: 'At the start of a tale, the Keeper will prompt you for what you know about each of the other main characters in the tale.' },
    { name: 'Adding Knowledge', value: 'If you get to know someone, you can add hen to the list of people you know by typing, `What I know about NAME: STATEMENT`.' },
    { name: 'Changing Knowledge', value: 'You can update what you know about someone by using the same format: `What I know about NAME: STATEMENT`. Simply supply the same `NAME`, but a different `STATEMENT`.' }
  )
  return embed
}

/**
 * Produces an embed that provides help on injuries, recovery, and combat.
 * @returns {MessageEmbed} - A MessageEmbed that provides help on injuries,
 *   recovery, and combat.
 */

const helpInjury = () => {
  const embed = new Discord.MessageEmbed()
  embed.setColor(colors.other)
  embed.setTitle('Injury')
  embed.setDescription('Most people in the Fifth World have enough sense not to risk injury and death doing stupid things, but on those rare occasions when the need may arise, the Keeper can help.')
  embed.addFields(
    { name: '“That sounds dangerous…”', value: 'Death and injury most often arise thanks to the [ritual phrase](https://thefifthworld.com/rpg/compendium/ritual-phrase) “[That sounds dangerous…](https://thefifthworld.com/rpg/compendium/ritual-phrase/dangerous)” When you type this ritual phrase into the tale’s text channel, the Keeper will walk you through everything you need to determine what happens after that.' },
    { name: 'Recovery', value: 'Bruises heal in a week and cuts in two, while wounds can take months. If that much time has passed in your tale, type `NAME recovers from INJURY` in the tale’s text channel to update your character sheet. That said, few tales will cover that much time, so you likely won’t have many opportunities to use this.' },
    { name: 'Combat', value: 'Violence has become quite rare in the Fifth World, but it hasn’t disappeared entirely. The game’s [combat rules](https://thefifthworld.com/rpg/compendium/combat) reflect the reality of violence: it escalates very easily, usually resolves nothing, and puts everyone involved in terrible danger. Most people in the Fifth World have the good sense to deescalate tensions and do all they can to avoid violence. If you find yourself caught in the exceptional situation where violence must erupt, type `roll 1 die` or `roll 2 dice` as called for, compare the results, and then use `INJURE NAME` (e.g., `Wound Bear`) and the [ritual phrase](https://thefifthworld.com/rpg/compendium/ritual-phrase) “[That sounds dangerous…](https://thefifthworld.com/rpg/compendium/ritual-phrase/dangerous) to mete out the appropriate consequences.' }
  )
  return embed
}

/**
 * Produces an embed that provides help on asking fate for her guidance.
 * @returns {MessageEmbed} - A MessageEmbed that provides help on  asking fate
 *   for her guidance.
 */

const helpOracle = () => {
  const embed = new Discord.MessageEmbed()
  embed.setColor(colors.other)
  embed.setTitle('Oracle')
  embed.setDescription('Sometimes, you want to ask fate to weigh in and make a decision for you. The Keeper can help you with that, too. With each of these, you can type the message into the tale’s text channel, or as a private message to the Keeper.')
  embed.addFields(
    { name: 'Roll Dice', value: 'You can roll a single die (`roll 1 die`) or two dice (`roll 2 dice`), and the Keeper will tell you the result.' },
    { name: 'Yes or No', value: 'Type `Yes or no?` and the Keeper will choose one for you.' },
    { name: 'Likely or Not', value: 'Type `Likely or not?` and the Keeper will choose one for you. It will pick the likely option twice as often as the unlikely one. You can increase the odds by typing, `Very likely or not?` In that case, the Keeper will pick the likely option five times more often than the unlikely one.' },
    { name: 'Random Drive', value: 'Type `Give me a drive` and the Keeper will suggest what might drive a secondary character in this moment.' }
  )
  return embed
}

module.exports = {
  helpIntro,
  helpQuestions,
  helpAwareness,
  helpKnowledge,
  helpInjury,
  helpOracle
}
