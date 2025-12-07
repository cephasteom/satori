# Sartori
A live coding language for unrestricted pattern interference. It supersedes Zen, which was limited to grid-based event triggering. Sartori offers fully flexible timing, and allows parameters from any musical layer to control or transform those of any other. As with Zen, it also includes a straightforward API for designing, running, and sonifying quantum algorithms via its built-in simulator.

The codebase is modular by design. You can use Sartori as a complete live coding environment—combining the core language, editor, console, help docs, and synthesis engine—or import individual modules into your own projects. Each folder contains a README explaining how to use its module independently.

## Local Development
To run this project locally, as a complete application:
* clone this repo
* run `nvm use` (node version manager) to change node to correct version
* `npm i` to install dependencies
* `npm run dev` for live updating
* or `npm run build` and `npm run preview` to use bundled package




## Acknowledgements
* This series of blog posts by Froos helped me finally crack time: [garten.salat.dev](https://garten.salat.dev/idlecycles/).
* Code editor built with: [Prism](https://github.com/jonpyt/prism-code-editor/?tab=readme-ov-file).
* Mini-language built on: [PegJS](https://github.com/pegjs/pegjs).
* Quantum simulator built with: [Quantum Circuit](https://www.npmjs.com/package/quantum-circuit).
