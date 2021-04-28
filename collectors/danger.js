const { colors, timeout } = require('../config.json')
const { queryChoice, mention, roll } = require('../utils')
const { injureCharacter, loseBodyPart } = require('../injure')
const whoInDanger = require('../embeds/rp-dangerous-who')
const dangerSuccess = require('../embeds/rp-dangerous-win')
const dangerFail = require('../embeds/rp-dangerous-fail')
const death = require('../embeds/death')

const EXHAUSTION = 'Exhaustion'
const BRUISES = 'Bruises'
const CUTS = 'Cuts'
const WOUNDS = 'Wounds'
const LIFELIMB = 'Life & Limb'
const CANCEL = 'Nothing (back away)'

/**
 * Query the level of danger.
 * @param {Object} tale - The tale object.
 * @param {User} invoker - The user who invoked the ritual phrase.
 * @returns {Promise<number|null>}
 */

const queryLevel = async (tale, invoker) => {
  return queryChoice(tale.channel, [ 'It sounds dangerous.', 'It sounds _very_ dangerous.', 'Actually, it doesn’t sound all that dangerous at all.' ], {
    title: 'How much danger do you see?',
    preamble: 'Pause to see if another player invokes the ritual phrase, “**…very dangerous.**” If someone does, choose “**It sounds _very_ dangerous.**” If not, then select “**It sounds dangerous.**”',
    color: colors['ritual-phrases'],
    content: `${mention(invoker)},`,
    user: invoker
  })
}

/**
 * Ask the invoker which players have characters doing something dangerous.
 * @param {Object} tale - The tale object.
 * @param {User} invoker - The user who invoked the ritual phrase.
 * @returns {Promise<Object[]>} - A Promise that resolves with the player
 *   objects of those players named by the invoker.
 */

const queryPlayers = async (tale, invoker) => {
  await tale.channel.send({ content: `${mention(invoker)}, `, embed: whoInDanger() })
  const collected = await tale.channel.awaitMessages(m => m.author.id === invoker.id && m.mentions.users.array().length > 0, { max: 1, time: timeout })
  const uids = collected.first().mentions.users.array().map(u => u.id)
  return tale.players.filter(p => uids.includes(p.id))
}

/**
 * Put together an array of what a character can risk, depending on the level
 * of the danger and what injuries the character has already sustained.
 * @param {number} level - `0` means the player's character has attempted
 *   something dangerous. `1` means hen has attempted something _very_
 *   dangerous.
 * @param {Object} body - The body object of the character facing the danger.
 * @returns {string[]}
 */

const assemblePossibleWagers = (level, body) => {
  const additional = []
  if (level !== 1) {
    if (body && !body.exhaustion) additional.push(EXHAUSTION)
    if (body && !body.bruises) additional.push(BRUISES)
    if (body && !body.cuts) additional.push(CUTS)
    if (body && !body.wounds) additional.push(WOUNDS)
  }
  return [ ...additional, LIFELIMB, CANCEL ]
}

/**
 * A player's character faces danger.
 * @param {Object} tale - The tale object.
 * @param {number} level - `0` means the player's character has attempted
 *   something dangerous. `1` means hen has attempted something _very_
 *   dangerous.
 * @param {Object} player - The object of the player facing the danger.
 * @returns {Promise<void>} - A Promise that resolves once the player chooses
 *   how to face the danger, the dice have rolled, and the consequences have
 *   taken effect.
 */

const faceDanger = async (tale, level, player) => {
  const { character } = player
  const wagers = assemblePossibleWagers(level, character.body)
  const wager = await queryChoice(tale.channel, wagers, {
    title: 'What will you risk?',
    preamble: level === 1
      ? `To accomplish something _very_ dangerous, you _have_ to risk life and limb.`
      : 'Choose how much you will put at risk to achieve your goal.',
    color: colors.yellow,
    content: `${mention(player)},`,
    user: player,
    returnString: true
  })

  if (wager !== CANCEL) {
    const d = roll()
    const content = `${mention(player)},`
    if (d > 3) {
      await tale.channel.send({ content, embed: dangerSuccess(player.character, wager) })
    } else if (wager === LIFELIMB && d > 1) {
      const type = d === 2 ? 'arm/leg' : 'hand/foot'
      const loss = await loseBodyPart(player.character, type)
      await tale.channel.send({ content, embed: dangerFail(player.character, `missing ${loss}` )})
    } else if (wager === LIFELIMB && d === 1) {
      await tale.channel.send({ content, embed: death(player.character) })
    } else {
      await injureCharacter(player.character, wager)
      await tale.channel.send({ content, embed: dangerFail(player.character, wager) })
    }
  }
}

/**
 * Handle an invocation of the ritual phrase, “That sounds dangerous…”
 * @param {Object} tale - The tale object.
 * @param {User} invoker - The user who invoked the ritual phrase.
 * @returns {Promise<void>} - A Promise that resolves once the ritual phrase
 *   has been properly executed.
 */

const danger = async (tale, invoker) => {
  try {
    const level = await queryLevel(tale, invoker)
    if (level < 2) {
      const players = await queryPlayers(tale, invoker)
      for (const player of players) {
        await faceDanger(tale, level, player)
      }
    }
  } catch (err) {
    console.error(err)
    let txt = err.message.substr(0, 12).toLowerCase() === 'pass along: '
      ? err.message.substr(12)
      : 'Sorry, I timed out waiting for a response.'
    tale.channel.send(`${txt} You can start over again with the ritual phrase, “**That sounds dangerous…**”`)
  }
}

module.exports = danger
