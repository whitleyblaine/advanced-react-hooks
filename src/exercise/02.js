// useCallback: custom hooks
// http://localhost:3000/isolated/exercise/02.js

import * as React from 'react'
import {
  fetchPokemon,
  PokemonForm,
  PokemonDataView,
  PokemonInfoFallback,
  PokemonErrorBoundary,
} from '../pokemon'

// 🐨 this is going to be our generic asyncReducer
function asyncReducer(state, action) {
  switch (action.type) {
    case 'pending': {
      return {status: 'pending', data: null, error: null}
    }
    case 'resolved': {
      return {status: 'resolved', data: action.data, error: null}
    }
    case 'rejected': {
      return {status: 'rejected', data: null, error: action.error}
    }
    default: {
      throw new Error(`Unhandled action type: ${action.type}`)
    }
  }
}

function useAsync(initialState, isMounted) {
  const [state, dispatch] = React.useReducer(asyncReducer, {
    status: 'idle',
    data: null,
    error: null,
    // allows user to overwrite status (or data or error)
    ...initialState,
  })

  const run = React.useCallback(
    promise => {
      dispatch({type: 'pending'})
      promise.then(
        data => {
          // if not mounted, don't update state
          if (!isMounted.current) {
            console.log('you did it whit')
            return
          }
          dispatch({type: 'resolved', data})
        },
        error => {
          // if not mounted, don't update state
          if (!isMounted.current) return
          dispatch({type: 'rejected', error})
        },
      )
    },
    [isMounted],
  )

  return {...state, run}
}

function PokemonInfo({pokemonName}) {
  const isMounted = React.useRef(true)
  const {
    data: pokemon,
    status,
    error,
    run,
  } = useAsync({status: pokemonName ? 'pending' : 'idle'}, isMounted)

  React.useEffect(() => {
    if (!pokemonName) {
      return
    }
    const pokemonPromise = fetchPokemon(pokemonName)
    run(pokemonPromise)

    return function cleanup() {
      isMounted.current = false
    }
  }, [pokemonName, run])

  switch (status) {
    case 'idle':
      return <span>Submit a pokemon</span>
    case 'pending':
      return <PokemonInfoFallback name={pokemonName} />
    case 'rejected':
      throw error
    case 'resolved':
      return <PokemonDataView pokemon={pokemon} />
    default:
      throw new Error('This should be impossible')
  }
}

function App() {
  const [pokemonName, setPokemonName] = React.useState('')

  function handleSubmit(newPokemonName) {
    setPokemonName(newPokemonName)
  }

  function handleReset() {
    setPokemonName('')
  }

  return (
    <div className="pokemon-info-app">
      <PokemonForm pokemonName={pokemonName} onSubmit={handleSubmit} />
      <hr />
      <div className="pokemon-info">
        <PokemonErrorBoundary onReset={handleReset} resetKeys={[pokemonName]}>
          <PokemonInfo pokemonName={pokemonName} />
        </PokemonErrorBoundary>
      </div>
    </div>
  )
}

function AppWithUnmountCheckbox() {
  const [mountApp, setMountApp] = React.useState(true)
  return (
    <div>
      <label>
        <input
          type="checkbox"
          checked={mountApp}
          onChange={e => setMountApp(e.target.checked)}
        />{' '}
        Mount Component
      </label>
      <hr />
      {mountApp ? <App /> : null}
    </div>
  )
}

export default AppWithUnmountCheckbox
