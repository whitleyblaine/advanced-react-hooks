// useReducer: simple Counter
// http://localhost:3000/isolated/exercise/01.js

import * as React from 'react'

function countReducer(previousState, action) {
  switch (action.type) {
    case 'INCREMENT':
      const newCount = previousState.count + action.step
      return {
        ...previousState,
        ...{count: newCount},
      }
    default:
      throw new Error('unexpected action type')
  }
}

function Counter({initialCount = 0, step = 1}) {
  const [state, dispatch] = React.useReducer(countReducer, {
    count: initialCount,
  })
  const {count} = state
  const increment = () => dispatch({type: 'INCREMENT', step})

  return <button onClick={increment}>{count}</button>
}

function App() {
  return <Counter />
}

export default App
