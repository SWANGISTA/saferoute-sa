const Logo = ({ size = 'large', className = '' }) => {
  const iconSizes = {
    large: 76,
    small: 46,
    icon: 32
  };

  const iconSize = iconSizes[size] || iconSizes.large;
  const showText = size === 'large';

  return (
    <div className={`inline-flex items-center gap-4 ${className}`}>
      <div style={{ width: iconSize, height: iconSize, minWidth: iconSize }} className="flex items-center justify-center">
        <svg
          width={iconSize}
          height={iconSize}
          viewBox="0 0 120 120"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M60 6C35 6 14 32 14 61c0 30 24 45 46 51 22-6 46-21 46-51C106 32 85 6 60 6Z"
            fill="#0f2027"
            stroke="#00b4d8"
            strokeWidth="6"
          />
          <path
            d="M60 16c-18 0-34 16-34 35 0 24 26 43 34 51 8-8 34-27 34-51 0-19-16-35-34-35Z"
            fill="#162d3a"
          />
          <path
            d="M60 28c-8.8 0-16 7.2-16 16 0 8.8 16 28 16 28s16-19.2 16-28c0-8.8-7.2-16-16-16Z"
            fill="#00b4d8"
          />
          <circle cx="60" cy="44" r="7" fill="#ffffff" />
          <path
            d="M33 86c10-5 18-12 27-8 8 4 16 10 24 6"
            stroke="#00b4d8"
            strokeWidth="5"
            strokeLinecap="round"
            fill="none"
          />
          <circle cx="33" cy="86" r="4.5" fill="#00b4d8" />
          <circle cx="81" cy="84" r="4.5" fill="#00b4d8" />
        </svg>
      </div>

      {showText && (
        <div className="flex min-w-0 flex-col gap-2">
          <div className="flex flex-wrap items-end gap-2">
            <span className="text-[42px] font-medium leading-none text-[#ffffff]">SafeRoute</span>
            <span className="text-[42px] font-medium leading-none text-[#00b4d8]">SA</span>
          </div>
          <div className="h-px w-full max-w-[340px] bg-[#00b4d8]" />
          <div className="text-xs uppercase tracking-[0.35em] text-[#7ecfe0]">
            MZANSI SAFETY NAVIGATION
          </div>
        </div>
      )}
    </div>
  );
};

export default Logo;
