export function Logo({ size = 32 }: { size?: number }) {
  return (
    <div className="flex items-center gap-2.5">
      <svg
        width={size}
        height={size}
        viewBox="0 0 32 32"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <rect width="32" height="32" rx="8" fill="#E8E8E8" />
        <path
          d="M19 5L10 17H16L13 27L22 15H16L19 5Z"
          fill="#0A0A0A"
          strokeLinejoin="round"
        />
      </svg>
      <span className="font-semibold text-[15px] tracking-tight text-[#F0F0F0]">
        RealGrowthHQ
      </span>
    </div>
  )
}

export function LogoMark({ size = 32 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <rect width="32" height="32" rx="8" fill="#E8E8E8" />
      <path
        d="M19 5L10 17H16L13 27L22 15H16L19 5Z"
        fill="#0A0A0A"
        strokeLinejoin="round"
      />
    </svg>
  )
}
