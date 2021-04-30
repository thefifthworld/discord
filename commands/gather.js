const { getTale, getPlayer } = require('../utils')
const placeSheet = require('../embeds/sheet-place')
const charSheet = require('../embeds/sheet-char')
const taleSummary = require('../embeds/sheet-tale')

module.exports = {
  regex: /gather awareness/mi,
  description: 'Shares your place’s awareness with main characters.',
  execute (msg, state) {
    const tale = getTale(msg.channel.guild, msg.channel, state)
    const players = msg.mentions.users.array()
    if (tale && players && players.length > 0) {
      const placePlayer = getPlayer(tale, msg.author)
      if (placePlayer) {
        const { place } = placePlayer
        const { awareness } = place
        if (awareness > 0) {
          const even = Boolean(msg.content.match(/\(evenly\)/mi))
          const order = Boolean(msg.content.match(/\(in order\)/mi))

          let remaining = awareness
          if (even) {
            // In this logic, we give each character one awareness until they
            // all reach maximum or we run out of awareness to hand out.
            let i = 0
            const isAllFull = players => players.map(p => p.character.awareness).filter(a => a >= 5).reduce((acc, curr) => acc && curr, true)
            while (remaining > 0 && !isAllFull(players)) {
              if (players[i].character.awareness < 5) players[i].character.awareness++
              remaining--
              i++
              if (i === players.length) i = 0
            }
          } else if (order) {
            // In this logic, we give as much as we can to the first person,
            // and then as much as we can to the second, and so on until we
            // run out of awareness or characters.
            for (const p of players) {
              while (remaining > 0 && p.character.awareness < 5) {
                p.character.awareness++
                remaining--
              }
            }
          } else {
            // By default, the Fifth World disperses by need — bring everyone
            // up to an even level, starting with the person who has the least,
            // and then divide the rest evenly.
            while (remaining > 0) {
              const sorted = players.sort((a, b) => a.character.awareness - b.character.awareness)
              sorted[0].character.awareness++
              remaining--
            }
          }

          place.awareness = remaining

          // Update sheets
          if (tale.summary) tale.summary.edit({ embed: taleSummary(tale) })
          if (place.sheet) place.sheet.edit({ embed: placeSheet(place) })
          players.forEach(player => {
            const { character } = player
            if (character && character.sheet) character.sheet.edit({ embed: charSheet(character) })
          })
        }
      }
    }
  }
}
