/**
 * Icon
 * 앱에서 쓰는 아이콘을 한 파일에 모아둔 인라인 SVG 모음.
 * 외부 아이콘 라이브러리를 설치하지 않아도 되고, 색은 글자색(currentColor)을 따라간다.
 *
 * 사용 예: <Icon name="send" />
 */

const PATHS = {
  menu: <path d="M3 6h18M3 12h18M3 18h18" />,
  close: <path d="M6 6l12 12M18 6L6 18" />,
  plus: <path d="M12 5v14M5 12h14" />,
  send: <path d="M12 19V5M5 12l7-7 7 7" />,
  stop: <rect x="7" y="7" width="10" height="10" rx="2" />,
  trash: <path d="M4 7h16M9 7V5h6v2M6 7l1 13h10l1-13M10 11v6M14 11v6" />,
  refresh: <path d="M20 11a8 8 0 10-2.3 5.7M20 5v6h-6" />,
  copy: (
    <>
      <rect x="9" y="9" width="11" height="11" rx="2" />
      <path d="M5 15V5a2 2 0 012-2h8" />
    </>
  ),
  check: <path d="M4 12l5 5L20 6" />,
  chat: <path d="M21 12a8 8 0 01-8 8H4l2-3a8 8 0 1115-5z" />,
  sliders: <path d="M4 8h10M18 8h2M4 16h4M12 16h8M15 5v6M8 13v6" />,
  sparkles: <path d="M12 3l1.8 4.7L18.5 9.5l-4.7 1.8L12 16l-1.8-4.7L5.5 9.5l4.7-1.8L12 3z" />,
  warning: <path d="M12 4l9 16H3l9-16zM12 10v4M12 17h.01" />,
  arrowDown: <path d="M12 5v14M5 12l7 7 7-7" />,
}

function Icon({ name, size = 18, className = '' }) {
  const path = PATHS[name]
  if (!path) {
    return null
  }

  return (
    <svg
      className={className}
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
    >
      {path}
    </svg>
  )
}

export default Icon
