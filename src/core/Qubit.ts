// @ts-ignore
import QuantumCircuit from 'quantum-circuit/dist/quantum-circuit.min.js';

const circuit = new QuantumCircuit();

export interface Qubit {
    id: string;
    row: number;
    _offset: number;
}

export class Qubit {
    /** @hidden */
    constructor(row: number) {
        this.row = row;
        this.id = `q${row}`;
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

        // todo: function to handle gate params at a particular position
    }
}
