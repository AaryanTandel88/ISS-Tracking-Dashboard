import { useState, useEffect } from 'react'

export default function useDarkMode() {
  const [isDark, setIsDark] = useState(() => {
    const saved = localStorage.getItem('iss-dark-mode')
    return saved !== null ? JSON.parse(saved) : true
  })

  useEffect(() => {
    if (isDark) {
      document.body.classList.remove('light')
    } else {
      document.body.classList.add('light')
    }
    localStorage.setItem('iss-dark-mode', JSON.stringify(isDark))
  }, [isDark])

  return [isDark, setIsDark]
}
