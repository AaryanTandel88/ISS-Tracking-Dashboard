import { useState, useCallback } from 'react'
import { createPortal } from 'react-dom'

let toastId = 0
const subscribers = new Set()
let toasts = []

function notify(message, type = 'info', duration = 4000) {
  const id = ++toastId
  const toast = { id, message, type, duration }
  toasts = [...toasts, toast]
  subscribers.forEach(fn => fn([...toasts]))
  setTimeout(() => {
    toasts = toasts.filter(t => t.id !== id)
    subscribers.forEach(fn => fn([...toasts]))
  }, duration)
}

export const toast = {
  success: (msg) => notify(msg, 'success'),
  error: (msg) => notify(msg, 'error'),
  info: (msg) => notify(msg, 'info'),
  warning: (msg) => notify(msg, 'warning'),
}

export function ToastContainer() {
  const [items, setItems] = useState([])

  useState(() => {
    subscribers.add(setItems)
    return () => subscribers.delete(setItems)
  })

  const icons = {
    success: '✅',
    error: '❌',
    info: 'ℹ️',
    warning: '⚠️',
  }

  const colors = {
    success: '#10b981',
    error: '#ef4444',
    info: '#3b82f6',
    warning: '#f59e0b',
  }

  return createPortal(
    <div style={{
      position: 'fixed',
      top: 24,
      right: 24,
      zIndex: 9999,
      display: 'flex',
      flexDirection: 'column',
      gap: 10,
      pointerEvents: 'none',
    }}>
      {items.map(t => (
        <div key={t.id} style={{
          background: 'var(--bg-card)',
          border: `1px solid ${colors[t.type]}40`,
          borderLeft: `4px solid ${colors[t.type]}`,
          borderRadius: 10,
          padding: '12px 16px',
          display: 'flex',
          alignItems: 'center',
          gap: 10,
          minWidth: 280,
          maxWidth: 360,
          boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
          animation: 'toast-in 0.3s ease forwards',
          pointerEvents: 'auto',
          fontSize: 14,
          color: 'var(--text-primary)',
        }}>
          <span style={{ fontSize: 16 }}>{icons[t.type]}</span>
          <span style={{ flex: 1 }}>{t.message}</span>
        </div>
      ))}
    </div>,
    document.getElementById('toast-root') || document.body
  )
}
