import { useState, useEffect } from 'react'
import { globalStateLogger } from './useLogState'
import config from '../package.json'

const LogStateDashboard = () => {
  const [allStates, setAllStates] = useState<Map<string, any>>(new Map())
  const [isVisible, setIsVisible] = useState(true)

  useEffect(() => {
    const unsubscribe = globalStateLogger.subscribe(setAllStates)

    return () => {
      unsubscribe()
    }
  }, [])

  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.shiftKey && e.key === 'S') {
        e.preventDefault()
        setIsVisible(!isVisible)
      }

      // ESC 關閉
      if (e.key === 'Escape' && isVisible) {
        setIsVisible(false)
      }
    }

    window.addEventListener('keydown', handleKeyPress)
    return () => window.removeEventListener('keydown', handleKeyPress)
  }, [isVisible])

  if (!isVisible) return null
  return (
    <div
      style={{
        position: 'fixed',
        bottom: '1rem',
        right: '1rem',
        width: '500px',
        height: '500px',
        background: 'rgba(0,0,0,0.5)',
        borderRadius: '10px',
        color: '#00ff00',
        padding: '20px',
        fontSize: '12px',
        fontFamily: 'monospace',
        zIndex: 10000,
        overflow: 'hidden'
      }}
    >
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '15px',
          paddingBottom: '10px',
          borderBottom: '1px solid #333'
        }}
      >
        <h3 style={{ margin: 0, color: '#ffffff' }}>
          🔍 全域 State 監控台 ({allStates.size} 個狀態)
        </h3>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span style={{ fontSize: '10px', color: '#ffffff' }}>
            Ctrl+Shift+S 切換 | ESC 關閉
          </span>
          <button
            onClick={() => setIsVisible(false)}
            style={{
              background: '#ff4444',
              color: 'white',
              border: 'none',
              padding: '5px 10px',
              borderRadius: '3px',
              cursor: 'pointer'
            }}
          >
            ✕
          </button>
        </div>
      </div>
      <div
        style={{
          flex: 1,
          overflow: 'auto',
          maxHeight: '400px'
        }}
      >
        {Array.from(allStates.entries())
          .sort(
            ([, a], [, b]) =>
              new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
          )
          .map(([key, data]) => (
            <div
              key={key}
              style={{
                marginBottom: '12px',
                padding: '10px',
                borderTop: '1px solid #444',
                borderBottom: '1px solid #444',
                borderRight: '1px solid #444',
                borderRadius: '6px',
                backgroundColor: data.isInitial
                  ? 'rgba(0,255,0,0.05)'
                  : 'rgba(255,255,255,0.05)',
                borderLeft: data.isInitial
                  ? '3px solid #00ff00'
                  : '3px solid #ffaa00'
              }}
            >
              {/* 狀態標題 */}
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'flex-start',
                  marginBottom: '8px'
                }}
              >
                <div
                  style={{
                    color: '#ffff00',
                    fontWeight: 'bold',
                    fontSize: '13px'
                  }}
                >
                  {key}
                  {data.isInitial && (
                    <span style={{ color: '#00ff00' }}> (初始)</span>
                  )}
                </div>
                <div style={{ fontSize: '9px', color: '#ffffff' }}>
                  {new Date(data.timestamp).toLocaleTimeString()}
                </div>
              </div>

              {/* 檔案資訊 */}
              <div
                style={{
                  fontSize: '10px',
                  color: '#ffffff',
                  marginBottom: '5px'
                }}
              >
                🎯 {data.component} • 📂{' '}
                {data.fullPath.replace('///(app-pages-browser)', '') ||
                  'Unknown'}
              </div>

              {/* 狀態值 */}
              <div
                style={{
                  background: 'rgba(0,0,0,0.3)',
                  padding: '8px',
                  borderRadius: '4px',
                  border: '1px solid #333'
                }}
              >
                <div
                  style={{
                    color: '#ffffff',
                    fontSize: '10px',
                    marginBottom: '5px'
                  }}
                >
                  📦 值 ({Array.isArray(data.value) ? 'Array' : data.type})
                </div>
                <pre
                  style={{
                    margin: 0,
                    fontSize: '10px',
                    color: '#00ffaa',
                    whiteSpace: 'pre-wrap',
                    wordBreak: 'break-all'
                  }}
                >
                  {typeof data.value === 'object'
                    ? JSON.stringify(data.value, null, 2)
                    : String(data.value)}
                </pre>
              </div>
            </div>
          ))}

        {allStates.size === 0 && (
          <div
            style={{
              textAlign: 'center',
              color: '#ffffff',
              padding: '40px',
              fontSize: '14px'
            }}
          >
            📭 尚未偵測到任何狀態
          </div>
        )}
      </div>
      <div
        style={{
          textAlign: 'center',
          color: '#ffffff',
          fontSize: '12px',
          marginTop: '5px'
        }}
      >
        v{config.version}
      </div>
    </div>
  )
}
export default LogStateDashboard
