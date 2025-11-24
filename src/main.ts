import { compile } from './compile';
import './style.css'

compile(`
    s0.set({
        // inst: 0,
        reverb: sine().mul(10),
        e: seq(1,1,1)
    })
`)