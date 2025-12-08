export const beatslicer = `global.set({
  cps: 1.5, e: '1*4'})

s0.set({ 
  inst:'sampler', bank:'breaks', snap: ctms(8), 
  dur: ctms(2), strum: ctms(1/8), cut:'s0', 
  begin: t(2).ie(random().step(1/16),0),
  amp: (1).expand(8, (a,i) => a / (i+1)),
  s: (1).expand(8, (s,i) => s / (i+1)),
  n: rarely().ie((60).expand(4, (x,i) => x-i*2), 60),
  e: '1 1?0*2 | 1?0*4' })`