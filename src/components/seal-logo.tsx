export default function SealLogo({ size = 40 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 64 64"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <circle cx="32" cy="32" r="30" fill="#16294D" stroke="#C99A3D" strokeWidth="2.5" />
      <circle cx="32" cy="32" r="24" fill="none" stroke="#C99A3D" strokeWidth="1" strokeDasharray="2 3" />
      <path
        d="M20 24h24M24 18v6M40 18v6M20 28h24v18a2 2 0 0 1-2 2H22a2 2 0 0 1-2-2V28z"
        fill="none"
        stroke="#F3F1EC"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M25 37l4 4 8-8"
        fill="none"
        stroke="#C99A3D"
        strokeWidth="2.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
