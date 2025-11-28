export default `
Sartori parses mini-notation strings into arrays of values to be used as sequences. They can be used for any parameter.

#### Basic syntax
Create an array of length 16 and fill with 1s:
\`\`\`js
s0.set({ e: '1*16' }) // triggers on every division
\`\`\`

Create an array of length 16 and randomly fill it with 1s and 0s:
\`\`\`js
s0.set({ e: '1?0*16' })
\`\`\`

Create a sequence:
\`\`\`js
s0.set({ n: '60..72*16' })
\`\`\`

Randomly choose from the sequence:
\`\`\`js
s0.set({ n: '60..72?*16' })
\`\`\`

Alternate between values:
\`\`\`js
s0.set({ e: '0,1*2' })
\`\`\`

Notate bars:
\`\`\`js
s0.set({ x: '0..15*16 | 15..0*16 |' })
\`\`\`

Repeat bars:
\`\`\`js
s0.set({ x: '0..15*16 |*2 15..0*16 |*3' })
\`\`\`

#### Euclidean rhythms

[Euclidean rhythms](https://en.wikipedia.org/wiki/Euclidean_rhythm) spread *x* beats over a *y* divisions, as equally as possible.

4 pulses over 16 divisions:
\`\`\`js
s0.set({ e: '4:16' })
\`\`\`

3 pulses over 8 division:
\`\`\`js
s0.set({ e: '3:8' })
\`\`\`

3 over 8, twice per bar:
\`\`\`js
s0.set({ e: '3:8*2' })
\`\`\`

#### Note values
Midi note values are notated as \`<root><octave>\`, where the root is a capital letter and the octave is an number.
\`\`\`js
s0.set({ n: 'C4 E4 G4 B4' })
\`\`\`

#### Chords and scales
Chords and scales both return an array of note values. Scales were adapted from Tidal Cycle's [scale library](https://github.com/tidalcycles/Tidal/blob/fcc4c5d53a72dcf2b8f4c00cc1c1b3c75eef172d/src/Sound/Tidal/Scales.hs#L4).

Notate chords using \`<root><triad><extension?>\`. Root is a capitalised letter, triad is one of \`ma\`, \`mi\`, \`di\`, \`au\`, \`su\` (major, minor, diminished, augmented, suspended), (optional) extension is one of \`6\`, \`7\`, \`#7\`, \`b9\`, \`9\`, \`11\`, \`#11\`, \`13\`, \`#13\`:
\`\`\`js
s0.set({ n: 'Cmi7' })
\`\`\`

As a sequence:
\`\`\`js
s0.set({ n: 'Cmi7..*8' })
\`\`\`

Randomly choose from the sequence:
\`\`\`js
s0.set({ n: 'Cmi7..?*16' })
\`\`\`

Specify the amount of notes in the chord:
\`\`\`js
s0.set({ n: 'Cmi7%16..?*16' })
\`\`\`

Notate scales \`<root><scale>\`:
\`\`\`js
s0.set({ n: 'Clyd*16' })
\`\`\`

Turn the scale into a sequence:
\`\`\`js
s0.set({ n: 'Clyd..*16' })
\`\`\`

Randomly choose from the sequence:
\`\`\`js
s0.set({n: 'Clyd..?*16' })
\`\`\`

Specify the length of the scale:
\`\`\`js
s0.set({ n: 'Clyd%16..?*16' })
\`\`\`

Execute \`scales()\` in the editor to print a list of available scales in the console.
`