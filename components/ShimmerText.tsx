'use client'

const KEYFRAME = `
@keyframes shimmer-ltr {
  0%   { background-position: -200% center; }
  100% { background-position: 200% center; }
}
`

export function ShimmerText({ text, className }: { text: string; className?: string }) {
  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: KEYFRAME }} />
      <span
        className={className}
        style={{
          background: 'linear-gradient(90deg, #ffffff 0%, #ffffff 25%, #00ff88 48%, #ffffff 72%, #ffffff 100%)',
          backgroundSize: '250% auto',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          backgroundClip: 'text',
          animation: 'shimmer-ltr 2.8s linear infinite',
        }}
      >
        {text}
      </span>
    </>
  )
}
