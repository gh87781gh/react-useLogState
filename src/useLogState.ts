import { useState, useEffect, useRef } from 'react'
import LogStateDashboard from './LogStateDashboard'

class StateLogger {
  private states = new Map<string, any>()
  private listeners = new Set<(states: Map<string, any>) => void>()

  logState(key: string, data: any) {
    this.states.set(key, {
      ...data,
      timestamp: new Date().toISOString()
    })

    // console.groupCollapsed(`[${key}]:`, data.value)
    // console.log('📂 檔案路徑:', data.fullPath)
    // console.log('🎯 組件:', data.component)
    // console.log('🏷️ 類型:', typeof data.value)
    // console.log('💎 值:', data.value)
    // console.groupEnd()

    this.notifyListeners()
  }

  removeState(key: string) {
    this.states.delete(key)
    this.notifyListeners()
  }

  getAllStates() {
    return new Map(this.states)
  }

  subscribe(listener: (states: Map<string, any>) => void) {
    this.listeners.add(listener)
    return () => this.listeners.delete(listener)
  }

  private notifyListeners() {
    this.listeners.forEach((listener) => listener(new Map(this.states)))
  }
}
const globalStateLogger = new StateLogger()
function getCallerInfo() {
  const stack = new Error().stack
  const lines = stack?.split('\n') || []

  for (let i = 3; i < lines.length; i++) {
    const line = lines[i]
    if (
      line &&
      !line.includes('useLogState') &&
      !line.includes('getCallerInfo')
    ) {
      const functionMatch = line.match(/at (\w+)/)
      const fullPathMatch = line.match(/(\/[^:]+)/)

      return {
        function: functionMatch?.[1] || 'Unknown',
        fullPath: fullPathMatch?.[1] || 'Unknown'
      }
    }
  }

  return {
    function: 'Unknown',
    fullPath: 'Unknown'
  }
}

function useLogState<T>(
  initialValue: T,
  stateName: string
): [T, React.Dispatch<React.SetStateAction<T>>] {
  const caller = getCallerInfo()
  const stateKey = `${stateName}`

  const [value, setValue] = useState(initialValue)
  const isFirstRender = useRef(true)

  useEffect(() => {
    if (isFirstRender.current) {
      globalStateLogger.logState(stateKey, {
        component: caller.function,
        fullPath: caller.fullPath,
        value: initialValue,
        type: typeof initialValue,
        isInitial: true
      })
      isFirstRender.current = false
    } else {
      globalStateLogger.logState(stateKey, {
        component: caller.function,
        fullPath: caller.fullPath,
        value,
        type: typeof value,
        isInitial: JSON.stringify(value) === JSON.stringify(initialValue)
      })
    }
  }, [value])

  useEffect(() => {
    return () => {
      globalStateLogger.removeState(stateKey)
    }
  }, [stateKey])

  return [value, setValue]
}

export { useLogState, globalStateLogger, LogStateDashboard }
