'use client'

const KEYFRAME = `
@keyframes brand-shimmer {
  0%   { background-position: 200% center; }
  100% { background-position: -200% center; }
}
`

export function BrandName() {
  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: KEYFRAME }} />
      <span
        style={{
          background: 'linear-gradient(90deg, #22c55e 0%, #22c55e 5%, #00ff88 25%, #ffffff 45%, #00ff88 65%, #22c55e 90%, #22c55e 100%)',
          backgroundSize: '300% auto',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          backgroundClip: 'text',
          animation: 'brand-shimmer 2.5s linear infinite',
          fontWeight: 600,
          fontSize: '15px',
          letterSpacing: '-0.01em',
        }}
      >
        RealGrowthHQ
      </span>
    </>
  )
}
