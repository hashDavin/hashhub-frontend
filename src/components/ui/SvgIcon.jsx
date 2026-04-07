function SvgIcon({ name, size = 18, className = '' }) {
  const commonProps = {
    width: size,
    height: size,
    viewBox: '0 0 24 24',
    fill: 'none',
    className,
    'aria-hidden': true,
  }

  switch (name) {
    case 'arrowRight':
      return (
        <svg {...commonProps}>
          <path
            d="M5 12h14m0 0-5-5m5 5-5 5"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      )

    case 'plus':
      return (
        <svg {...commonProps}>
          <path d="M12 4v16m8-8H4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      )
    case 'trash':
      return (
        <svg {...commonProps}>
          <path d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      )

    case 'eye':
      return (
        <svg {...commonProps}>
          <path
            d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7-11-7-11-7Z"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="2" />
        </svg>
      )

    case 'eyeOff':
      return (
        <svg {...commonProps}>
          <path
            d="M3 3 21 21m-3.3-3.3A10.3 10.3 0 0 1 12 19c-7 0-11-7-11-7a20 20 0 0 1 5.2-5.9M9.9 5.1A10.9 10.9 0 0 1 12 5c7 0 11 7 11 7a20.8 20.8 0 0 1-2.9 4.2"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M14.1 14.1A3 3 0 0 1 9.9 9.9"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      )

    default:
      return null
  }
}

export default SvgIcon
