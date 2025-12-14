// @ts-ignore
import QuantumCircuit from 'quantum-circuit/dist/quantum-circuit.min.js';

const circuit = new QuantumCircuit();

const svgContainer = document.getElementById('circuit');
if (svgContainer) {
    const svg = circuit.exportSVG(true);
    svgContainer.innerHTML = svg;
}

export interface Qubit {
    _id: string;
    row: number;
    _offset: number;
    _stack: Function[];
}

/**
 * Qubit represents a single qubit in the quantum circuit.
 * It provides methods to apply quantum gates to each wire.
 * Implemented gates are based on the QuantumCircuit library. See https://www.npmjs.com/package/quantum-circuit.
 * @example
 * q0.h() // apply Hadamard gate to qubit 0
 * q1.cx(0) // apply CNOT gate with target qubit 0

 */
export class Qubit {
    /** @hidden */
    constructor(row: number) {
        this.row = row;
        this._id = `q${row}`;

        Object.entries(circuit.basicGates).forEach(([key, gate]: [string, any]) => {
            // add a method for each gate
            // variable order of arguments
            // @ts-ignore
            this[key] = (arg1: number[] | number, arg2: number[] | number, arg3: number[] | number) => {
                return this.configureGate(key, gate, arg1, arg2, arg3)
            }
        })

        this.configureGate = this.configureGate.bind(this)
        this._stack = []
        this._offset = 0
    }

    /** @hidden */
    configureGate(key: string, gate: any, arg1?: number[] | number, arg2?: number[] | number, arg3?: number[] | number)
    {
        this._offset > 0 && this._offset++

        const hasConnections = gate.numControlQubits > 0 || gate.numTargetQubits > 1
        const hasParams = gate.params.length > 0

        // determine which argument is which
        // important for live coding so we don't have to pass all arguments
        const connections = [(hasConnections ? arg1 : [])].flat() || []
        const params = [(hasParams 
            ? hasConnections ? arg2 : arg1
            : [])].flat().filter(v => v!== undefined && v !== null)

        const offset = [(hasConnections
            ? hasParams ? arg3 : arg2
            : hasParams ? arg2 : arg1)].flat()[0] || 0  
            
        this._offset += offset

        // format connections so that they are appropriate list of control qubits
        const controlQubits = connections
            // you can't connect a qubit to itself
            .filter(qubit => qubit !== this.row)
            // limit the number of control qubits to what the gate can handle
            .filter((_, i) => i < (gate.numControlQubits + gate.numTargetQubits - 1))

        const gates = circuit.gates[this.row] || [];
        const firstNullIndex = gates.findIndex((gate: any) => gate === null);
        const column = firstNullIndex !== -1 ? firstNullIndex + this._offset : gates.length + this._offset;
        const creg = key === 'measure' ? {
            name: "c",
            bit: this.row
        } : {}

        // intialise the gate without options
        const defaultOptions = {creg, params: {theta: 0, phi: 0, lambda: 0}}
        const id = hasConnections
            ? circuit.insertGate(key, column, [this.row, ...controlQubits], defaultOptions)
            : circuit.addGate(key, column, this.row, defaultOptions)

        // store a function to configure the gate later - expecting parameters to be dynamic
        this._stack.push(() => {
            if(!hasParams) return

            const options = {
                creg,
                params: params.length
                    ? params
                        .filter((_, i) => i < gate.params.length)
                        .reduce((obj, value, i) => ({
                            ...obj,
                            // TODO: handle patterns
                            [gate.params[i]]: value * (gate.params[i] === 'theta' ? 1 : 2) * Math.PI
                        }), {})
                    : {theta: 0, phi: 0, lambda: 0},
            }
            
            const {wires, col} = circuit.getGatePosById(id)

            wires.forEach((wire: any) => {
                const g = circuit.gates[wire][col] || {}
                g.options = options
            })

        })
        return this
    }

    build() {
        this._stack.forEach(fn => fn())
        this._stack = []
        this._offset = 0
    }
}
