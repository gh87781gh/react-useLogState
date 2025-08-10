# React useLogState

一個功能豐富的 React Hook 庫，提供帶有日誌記錄、撤銷/重做功能的狀態管理。

## 功能特色

- 🔄 **撤銷/重做**: 內建狀態歷史管理
- 📝 **日誌記錄**: 詳細的狀態變更日誌
- 🎯 **TypeScript**: 完整的類型支持
- ⚡ **輕量級**: 零依賴，僅依賴 React
- 🔧 **可配置**: 靈活的配置選項
- 📦 **模組化**: ES6 模組，支持 tree-shaking

## 安裝

```bash
npm install react-uselogstate
# 或
yarn add react-uselogstate
# 或
pnpm add react-uselogstate
```

## 基本用法

```tsx
import React from 'react'
import { useLogState } from 'react-uselogstate'

function Counter() {
  const counter = useLogState({
    initialValue: 0,
    stateName: 'counter'
  })

  return (
    <div>
      <p>計數: {counter.value}</p>
      <button onClick={() => counter.setValue(counter.value + 1, 'increment')}>
        +1
      </button>
      <button onClick={() => counter.setValue(counter.value - 1, 'decrement')}>
        -1
      </button>
      <button onClick={counter.undo} disabled={!counter.canUndo}>
        撤銷
      </button>
      <button onClick={counter.redo} disabled={!counter.canRedo}>
        重做
      </button>
    </div>
  )
}
```

## 複雜對象狀態

```tsx
interface User {
  name: string
  age: number
  email: string
}

function UserProfile() {
  const user = useLogState<User>({
    initialValue: { name: 'John', age: 25, email: 'john@example.com' },
    stateName: 'userProfile',
    maxLogEntries: 50
  })

  const updateAge = () => {
    user.setValue((prev) => ({ ...prev, age: prev.age + 1 }), 'birthday', {
      reason: 'User had a birthday'
    })
  }

  return (
    <div>
      <h2>{user.value.name}</h2>
      <p>年齡: {user.value.age}</p>
      <p>郵箱: {user.value.email}</p>
      <button onClick={updateAge}>生日 +1</button>

      {/* 顯示最近的日誌 */}
      <div>
        <h3>最近操作</h3>
        {user.logs.slice(-3).map((log, index) => (
          <div key={index}>
            {log.timestamp.toLocaleTimeString()}: {log.action}
          </div>
        ))}
      </div>
    </div>
  )
}
```

## API 參考

### useLogState(options)

#### 參數

```typescript
interface UseLogStateOptions<T> {
  /** 初始值 */
  initialValue: T
  /** 是否啟用日誌記錄，預設為 true */
  enableLogging?: boolean
  /** 最大日誌條目數量，預設為 100 */
  maxLogEntries?: number
  /** 自定義日誌處理函數 */
  onLog?: (entry: LogEntry) => void
  /** 狀態名稱，用於日誌記錄 */
  stateName?: string
}
```

#### 返回值

```typescript
interface UseLogStateReturn<T> {
  /** 當前狀態值 */
  value: T
  /** 設置狀態值的函數 */
  setValue: (
    newValue: T | ((prevValue: T) => T),
    action?: string,
    metadata?: Record<string, any>
  ) => void
  /** 日誌歷史記錄 */
  logs: LogEntry[]
  /** 清除所有日誌 */
  clearLogs: () => void
  /** 導出日誌為 JSON 字符串 */
  exportLogs: () => string
  /** 獲取指定等級的日誌 */
  getLogsByLevel: (level: LogLevel) => LogEntry[]
  /** 撤銷到上一個狀態 */
  undo: () => boolean
  /** 重做到下一個狀態 */
  redo: () => boolean
  /** 是否可以撤銷 */
  canUndo: boolean
  /** 是否可以重做 */
  canRedo: boolean
}
```

### 日誌條目類型

```typescript
interface LogEntry {
  timestamp: Date
  level: LogLevel
  action: string
  previousValue: any
  newValue: any
  metadata?: Record<string, any>
}

type LogLevel = 'debug' | 'info' | 'warn' | 'error'
```

## 高級用法

### 自定義日誌處理

```tsx
const state = useLogState({
  initialValue: 0,
  onLog: (entry) => {
    // 發送到分析服務
    analytics.track('state_change', {
      action: entry.action,
      timestamp: entry.timestamp
    })
  }
})
```

### 過濾日誌等級

```tsx
// 只顯示錯誤日誌
const errorLogs = state.getLogsByLevel('error')

// 只顯示警告和錯誤
const warningAndErrorLogs = state.logs.filter((log) =>
  ['warn', 'error'].includes(log.level)
)
```

### 導出日誌數據

```tsx
const exportData = () => {
  const jsonData = state.exportLogs()
  const blob = new Blob([jsonData], { type: 'application/json' })
  const url = URL.createObjectURL(blob)

  const a = document.createElement('a')
  a.href = url
  a.download = 'state-logs.json'
  a.click()
}
```

## 開發

### 本地開發

```bash
# 安裝依賴
npm install

# 啟動開發服務器
npm run dev

# 構建庫
npm run build

# 運行 ESLint
npm run lint
```

### 項目結構

```
src/
├── hooks/
│   └── useLogState.ts    # 主要 Hook 實現
├── demo/                 # 演示應用
│   ├── App.tsx
│   ├── App.css
│   └── main.tsx
└── index.ts             # 主要導出文件
```

## 版本要求

- React >= 16.8.0
- TypeScript >= 4.0.0 (如果使用 TypeScript)

## 授權

MIT License

## 貢獻

歡迎提交 Issues 和 Pull Requests！

## 更新日誌

### v1.0.0

- 初始版本
- 基本的狀態管理和日誌記錄功能
- 撤銷/重做支持
- TypeScript 完整支持
