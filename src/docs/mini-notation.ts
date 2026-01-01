export default `
Satori parses mini-notation strings into pattern methods, using a syntax similar to TidalCycles. They can be used to control any stream parameter.

#### Basic syntax
\`\`\`js
s0.set({ e: '1*4' }) // seq(1,1,1,1)
\`\`\`

\`\`\`js
s0.set({ e: '1 1*4 1 1' }) // seq(1,seq(1,1,1,1),1,1)
\`\`\`

\`\`\`js
s0.set({ e: '1 . 1 2 3 4 . 1 1' }) // seq(1,seq(1,2,3,4),1,1)
\`\`\`

\`\`\`js
s0.set({ 
    n: '60?72', // choose(60,72)
    e: '1?0*8' // seq(choose(1,0), choose(1,0), choose(1,0), choose(1,0), choose(1,0), choose(1,0), choose(1,0), choose(1,0))
}) 
\`\`\`

\`\`\`js
s0.set({ x: '1 2 3 4 | 5 6 7 8 |' }) // cat(seq(1,2,3,4), seq(5,6,7,8))
\`\`\`

\`\`\`js
s0.set({ x: '1 2 3 4 |*2 5 6 7 8 |' }) // cat(seq(1,2,3,4), seq(1,2,3,4), seq(5,6,7,8))
\`\`\`

\`\`\`js
s0.set({ x: '1 2 3 4'.add('0?12') }) // dangerously chain patterns methods on the mini-notation string
\`\`\`

#### Euclidean rhythms

\`\`\`js
s0.set({ e: '4:16' }) // 4 pulses over 16 divisions
\`\`\`

\`\`\`js
s0.set({ e: '3:8' }) // 3 pulses over 8 divisions
\`\`\`

\`\`\`js
s0.set({ e: '3:8*2' }) // 3 pulses over 8 divisions, twice per bar
\`\`\`

#### Note values
\`\`\`js
s0.set({ n: 'C4 E4 G4 B4' }) // notated as <Root><octave> - seq(60,64,67,71)
\`\`\`

#### Chords and scales
Chords and [scales](https://github.com/tidalcycles/Tidal/blob/fcc4c5d53a72dcf2b8f4c00cc1c1b3c75eef172d/src/Sound/Tidal/Scales.hs#L4) both return an array of note values. Execute \`scales()\` in the editor to show all scales in the console.

\`\`\`js
s0.set({ n: 'Cmi7' }) // Notate chords using \`<Root><triad><extension?>\` - stack(60,63,67,70)
\`\`\`

\`\`\`js
s0.set({ n: 'Cma Ami Ddi Gsu' }) // Triads are \`ma\`, \`mi\`, \`di\`, \`au\`, \`su\` (major, minor, diminished, augmented, suspended).
\`\`\`

\`\`\`js
s0.set({ n: 'Cma#7 Ami7 Ddi7 Gma7b9' }) // Extensions are \`6\`, \`7\`, \`#7\`, \`b9\`, \`9\`, \`11\`, \`#11\`, \`13\`, \`#13\`.
\`\`\`

\`\`\`js
s0.set({ n: 'Cmi7..' }) // Turn the chord into a sequence - seq(60,63,67,70)
\`\`\`

\`\`\`js
s0.set({ n: 'Cmi7..?' }) // Randomly choose from the chord - choose(60,63,67,70)
\`\`\`

\`\`\`js
s0.set({ n: 'Cmi7%8..' }) // % is the length of the chord, continues up the octave - seq(60,63,67,70,72,75,79,82)
\`\`\`

\`\`\`js
s0.set({ n: 'Clyd' }) // Notate scales <Root><scale> - stack(60,62,64,66,67,69,71,73)
\`\`\`

\`\`\`js
s0.set({ n: 'Clyd..' }) // scale as a sequence - seq(60,62,64,66,67,69,71,73)
\`\`\`

\`\`\`js
s0.set({n: 'Clyd..?' }) // randomly choose from the scale - choose(60,62,64,66,67,69,71,73)
\`\`\`

\`\`\`js
s0.set({ n: 'Clyd%16..' }) // % specifies the length of the scale - seq(60,62,64,66,67,69,71,73,72,74,76,78,79,81,83,85)
\`\`\`

#### Escape mini-notation
To escape mini-notation parsing, prefix the string with an exclamation mark \`!\`. This can be useful when you want to use characters that would normally be interpreted as mini-notation syntax.

\`\`\`js
s0.set({ midi: '!to Max 1' }) // sets e to the literal string '1*4', not seq(1,1,1,1)
\`\`\`
`