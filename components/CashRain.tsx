'use client'

const ORBS = [
  { w: 160, h: 160, x: '3%',  y: '8%',  dur: '12s', delay: '0s',   anim: 'orb-a' },
  { w: 120, h: 120, x: '18%', y: '65%', dur: '9s',  delay: '-3s',  anim: 'orb-b' },
  { w: 180, h: 180, x: '35%', y: '20%', dur: '11s', delay: '-6s',  anim: 'orb-c' },
  { w: 100, h: 100, x: '52%', y: '75%', dur: '8s',  delay: '-1s',  anim: 'orb-a' },
  { w: 150, h: 150, x: '68%', y: '10%', dur: '13s', delay: '-7s',  anim: 'orb-b' },
  { w: 130, h: 130, x: '80%', y: '50%', dur: '10s', delay: '-4s',  anim: 'orb-c' },
  { w: 110, h: 110, x: '12%', y: '35%', dur: '7s',  delay: '-2s',  anim: 'orb-a' },
  { w: 170, h: 170, x: '45%', y: '55%', dur: '14s', delay: '-9s',  anim: 'orb-b' },
  { w: 90,  h: 90,  x: '90%', y: '30%', dur: '8s',  delay: '-5s',  anim: 'orb-c' },
  { w: 140, h: 140, x: '60%', y: '85%', dur: '11s', delay: '-11s', anim: 'orb-a' },
  { w: 120, h: 120, x: '28%', y: '80%', dur: '9s',  delay: '-3s',  anim: 'orb-c' },
  { w: 100, h: 100, x: '75%', y: '68%', dur: '7s',  delay: '-6s',  anim: 'orb-b' },
  { w: 160, h: 160, x: '88%', y: '5%',  dur: '10s', delay: '-8s',  anim: 'orb-a' },
  { w: 110, h: 110, x: '42%', y: '40%', dur: '8s',  delay: '-2s',  anim: 'orb-c' },
  { w: 130, h: 130, x: '7%',  y: '88%', dur: '12s', delay: '-14s', anim: 'orb-b' },
]

const KEYFRAMES = `
  @keyframes orb-a {
    0%   { transform: translate(0px, 0px) scale(1); }
    20%  { transform: translate(55px, -45px) scale(1.12); }
    40%  { transform: translate(-40px, 60px) scale(0.90); }
    60%  { transform: translate(70px, 30px) scale(1.08); }
    80%  { transform: translate(-25px, -55px) scale(0.94); }
    100% { transform: translate(0px, 0px) scale(1); }
  }
  @keyframes orb-b {
    0%   { transform: translate(0px, 0px) scale(1); }
    25%  { transform: translate(-65px, 50px) scale(1.15); }
    50%  { transform: translate(50px, -40px) scale(0.88); }
    75%  { transform: translate(-30px, 65px) scale(1.10); }
    100% { transform: translate(0px, 0px) scale(1); }
  }
  @keyframes orb-c {
    0%   { transform: translate(0px, 0px) scale(1); }
    33%  { transform: translate(45px, 70px) scale(0.92); }
    66%  { transform: translate(-60px, -35px) scale(1.14); }
    100% { transform: translate(0px, 0px) scale(1); }
  }
`

export function CashRain() {
  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: KEYFRAMES }} />
      <div
        style={{
          position: 'fixed',
          top: '56px',
          bottom: 0,
          left: '208px',
          right: 0,
          zIndex: 0,
          pointerEvents: 'none',
          overflow: 'hidden',
        }}
      >
        {ORBS.map((orb, i) => (
          <div
            key={i}
            style={{
              position: 'absolute',
              left: orb.x,
              top: orb.y,
              width: orb.w,
              height: orb.h,
              borderRadius: '50%',
              background: 'radial-gradient(circle, rgba(0,255,120,0.75) 0%, rgba(0,255,100,0.35) 40%, transparent 70%)',
              filter: 'blur(28px)',
              opacity: 0.7,
              animation: `${orb.anim} ${orb.dur} ease-in-out ${orb.delay} infinite`,
            }}
          />
        ))}
      </div>
    </>
  )
}
