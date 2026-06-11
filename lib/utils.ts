import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'
import { useState, useEffect } from 'react'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Returns the platform modifier key symbol: '⌘' on macOS/iOS, 'Ctrl' elsewhere.
 * Starts as '⌘' on the server (SSR) and corrects on the client after mount.
 */
export function useModKey(): string {
  const [mod, setMod] = useState('⌘')
  useEffect(() => {
    const isMac = /Mac|iPhone|iPad|iPod/.test(navigator.platform)
    if (!isMac) setMod('Ctrl')
  }, [])
  return mod
}
