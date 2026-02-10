export default `
For a gentle introduction to quantum computing for music, see Chapter 1.1.3 of [Zen and the Art of Praxis](https://researchportal.plymouth.ac.uk/en/studentTheses/zen-and-the-art-of-praxis/). Satori supports designing and sonifying quantum circuits using the [quantum-circuit](https://www.npmjs.com/package/quantum-circuit) package.

Qubits are named \`q0\` to \`q15\`. Gates are chained onto each qubit, with arguments following the structure (connections, parameters, offset). Where a gate does not support certain arguments, they are omitted.

For example:
\`\`\`js
q0.h().cx(1)
q1.crx(0, 0.5, 2)
\`\`\`

Here, \`h()\` applies a Hadamard gate, \`cx(1)\` applies a CNOT gate targeting qubit 1, and \`crx(0, 0.5, 2)\` applies a controlled X-rotation with a target, angle, and offset. Gate parameters can be numbers or patterns. A full list of supported gates is available [here](https://www.npmjs.com/package/quantum-circuit#implemented-gates).

To access measurements, probabilities, and phases in Satori, see the \`qmeasure\`, \`qprobability\`, and \`qphase\` methods in the Pattern documentation.
`