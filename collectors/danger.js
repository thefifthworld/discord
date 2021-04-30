const { colors, timeout } = require('../config.json')
const { queryChoice, queryPlace, mention, roll } = require('../utils')
const { injureCharacter, loseBodyPart } = require('../injure')
const pay = require('../pay')
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
 * @returns {string[]} - An array of strings representing what a character
 *   could risk, that involve greater danger than the current wager.
 */

const assemblePossibleWagers = (level, body) => {
  const additional = []
  if (level !== 1) {
    if (body && !body.exhaustion) additional.push(EXHAUSTION)
    if (body && !body.bruises) additional.push(BRUISES)
    if (body && !body.cuts) additional.push(CUTS)
    if (body && !body.wounds) additional.push(WOUNDS)
  }
  return [ ...additional, LIFELIMB ]
}

/**
 * Return an array of possible wagers that escalate from the wager given.
 * @param {string} wager - An existing wager.
 * @param {Object} body - The body object of the character facing the danger.
 * @returns {string[]} - An array of strings representing what a character
 *   could risk, that involve greater danger than the current wager.
 */

const assembleRiskierWagers = (wager, body) => {
  const all = assemblePossibleWagers(0, body)
  return all.slice(all.indexOf(wager) + 1)
}

/**
 * Suffer the consequences of losing your wager.
 * @param {Object} tale - The tale object.
 * @param {Object} player - The player whose character has failed hens wager.
 * @param {string} wager - What the character has put at risk (and now lost).
 * @param {number} result - The die roll result.
 * @returns {Promise<void>} - A Promise that resolves when the proper toll has
 *   been taken, all appropriate sheets have been updated, and necessary
 *   notifications have been sent.
 */

const suffer = async (tale, player, wager, result) => {
  const content = `${mention(player)},`
  if (wager === LIFELIMB && result > 1) {
    const type = result === 2 ? 'arm/leg' : 'hand/foot'
    const loss = await loseBodyPart(player.character, type)
    await tale.channel.send({ content, embed: dangerFail(player.character, `missing ${loss}` )})
  } else if (wager === LIFELIMB && result === 1) {
    await tale.channel.send({ content, embed: death(player.character) })
  } else {
    await injureCharacter(player.character, wager)
    await tale.channel.send({ content, embed: dangerFail(player.character, wager) })
  }
}

/**
 * Handle a failed roll, including offering the player the chance to roll again
 * by escalating the risk or paying awareness.
 * @param {Object} tale - The tale object.
 * @param {Object} place - The place object.
 * @param {Object} player - The player whose character has failed.
 * @param {string} wager - What the character put at risk.
 * @param {number} result - The result of the die roll.
 * @returns {Promise<void>} - A Promise that resolves when the player has
 *   chosen how to deal with hen's character's failure, and the consequences
 *   have been meted out.
 */

const fail = async (tale, place, player, wager, result) => {
  const escalations = assembleRiskierWagers(wager, player?.character?.body)
  const awareness = player?.character?.awareness
  if (escalations.length + awareness < 1) return suffer(tale, player, wager, result)

  const payAwareness = 'Pay awareness'
  const accept = 'Accept the consequences'
  const options = [ ...escalations, payAwareness, accept ]
  const displayOptions = [ ...escalations.map(w => `Risk ${w.toLowerCase()}`), payAwareness, accept ]
  const by = escalations.length > 0 && awareness > 0
    ? 'risk even more or pay awareness.'
    : escalations.length > 0
      ? 'risk even more'
      : 'pay awareness'
  const pick = await queryChoice(tale.channel, displayOptions, {
    title: 'You face imminent pain and injury…',
    preamble: `You risked ${wager.toLowerCase()} and rolled a ${result}. You can roll again, though, if you ${by}.`,
    color: colors.red,
    content: `${mention(player)},`,
    user: player
  })

  if (pick < escalations.length) return rollDanger(tale, place, player, escalations[pick])
  if (options[pick] === payAwareness) {
    await pay(player.character, place, tale)
    return rollDanger(tale, place, player, wager)
  }
  if (options[pick] === accept) return suffer(tale, player, wager, result)
}

/**
 * Roll for danger and deal with the consequences.
 * @param {Object} tale - The tale object.
 * @param {Object} place - The place object.
 * @param {Object} player - The player whose character has failed.
 * @param {string} wager - What the character put at risk.
 * @returns {Promise<Message|void>} - A Promise that resolves once the danger
 *   has been faced and the consequences meted out.
 */

const rollDanger = async (tale, place, player, wager) => {
  const d = roll()
  if (d > 3) return tale.channel.send({ content: `${mention(player)},`, embed: dangerSuccess(player.character, wager) })
  return fail(tale, place, player, wager, d)
}

/**
 * A player's character faces danger.
 * @param {Object} tale - The tale object.
 * @param {number} level - `0` means the player's character has attempted
 *   something dangerous. `1` means hen has attempted something _very_
 *   dangerous.
 * @param {Object} place - The place where this occurs.
 * @param {Object} player - The object of the player facing the danger.
 * @returns {Promise<Message>} - A Promise that resolves once the player
 *   chooses how to face the danger, the dice have rolled, and the consequences
 *   have taken effect.
 */

const faceDanger = async (tale, level, place, player) => {
  const { character } = player
  const wagers = [ ...assemblePossibleWagers(level, character.body), CANCEL ]
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

  if (wager !== CANCEL) return rollDanger(tale, place, player, wager)
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
      const place = await queryPlace(tale, {
        title: 'Where does this happen?',
        preamble: 'If one of these people pays attention to escape danger, what place will hen pay awareness to?',
        color: colors['ritual-phrases'],
        content: `${mention(invoker)},`,
        user: invoker,
        elsewhere: true,
        cancelable: true
      })
      if (place) {
        const players = await queryPlayers(tale, invoker)
        for (const player of players) {
          await faceDanger(tale, level, place, player)
        }
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
