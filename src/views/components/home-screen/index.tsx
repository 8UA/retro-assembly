import { useAtom, useSetAtom, useStore } from 'jotai'
import { useEffect } from 'react'
import { useAsync, useAsyncRetry, useMeasure } from 'react-use'
import { getHistoryRoms, getSystemRoms, getSystems, peekHistoryRoms, peekSystemRoms, peekSystems } from '../../../core'
import { currentSystemNameAtom, romsAtom, systemsAtom } from './atoms'
import { historyDummySystem } from './constants'
import { ErrorContent } from './error-content'
import { GameEntryGrid } from './game-entries-grid'
import { GameMenus } from './game-menus'
import { HomeScreenLayout } from './home-screen-layout'
import { InputTips } from './input-tips'

function getColumnCount(width: number) {
  const idealItemWidth = 200
  const candicates = [20, 16, 10, 8, 5, 4, 2]
  for (const candicate of candicates) {
    if (width / candicate > idealItemWidth) {
      return candicate
    }
  }
  return candicates.at(-1) as number
}

const lastSelectedSystemStorageKey = 'last-selected-system'

export function HomeScreen() {
  const [roms, setRoms] = useAtom(romsAtom)
  const setSystems = useSetAtom(systemsAtom)
  const store = useStore()
  const [currentSystemName, setCurrentSystemName] = useAtom(currentSystemNameAtom)
  const [gridContainerRef, { width: gridWidth, height: gridHeight }] = useMeasure<HTMLDivElement>()

  const columnCount = getColumnCount(gridWidth)

  useAsyncRetry(async () => {
    const systems = await peekSystems()
    const lastSelectedSystem = localStorage.getItem(lastSelectedSystemStorageKey)
    const newCurrentSystemName =
      lastSelectedSystem && [historyDummySystem, ...systems].some(({ name }) => name === lastSelectedSystem)
        ? lastSelectedSystem
        : systems[0].name

    if (!systems) {
      return
    }
    setSystems(systems)
    setCurrentSystemName(newCurrentSystemName)
  }, [setSystems, setCurrentSystemName])

  const systemsState = useAsyncRetry(async () => {
    const systems = await getSystems()

    const lastSelectedSystem = localStorage.getItem(lastSelectedSystemStorageKey)
    const newCurrentSystemName =
      lastSelectedSystem && [historyDummySystem, ...systems].some(({ name }) => name === lastSelectedSystem)
        ? lastSelectedSystem
        : systems[0].name

    setSystems(systems)
    setCurrentSystemName(newCurrentSystemName)
  }, [setSystems, setCurrentSystemName])

  useEffect(() => {
    return () => {
      setCurrentSystemName('')
    }
  }, [setCurrentSystemName])

  const peekRomsState = useAsync(async () => {
    if (!currentSystemName) {
      return
    }

    const roms = await (currentSystemName === 'history' ? peekHistoryRoms() : peekSystemRoms(currentSystemName))
    if (currentSystemName === store.get(currentSystemNameAtom) && roms) {
      setRoms(roms)
      return true
    }

    return false
  }, [currentSystemName])

  const romsState = useAsyncRetry(async () => {
    if (!currentSystemName) {
      return
    }

    const roms = await (currentSystemName === 'history' ? getHistoryRoms() : getSystemRoms(currentSystemName))
    if (currentSystemName === store.get(currentSystemNameAtom)) {
      setRoms(roms)
    }
  }, [currentSystemName])

  const error = systemsState.error || romsState.error
  const loading = peekRomsState.loading || (!peekRomsState.value && (systemsState.loading || romsState.loading))

  function retry() {
    if (systemsState.error) {
      systemsState.retry()
    }
    if (romsState.error) {
      romsState.retry()
    }
  }

  if (error) {
    return (
      <HomeScreenLayout>
        <ErrorContent error={error} onSolve={retry} />
      </HomeScreenLayout>
    )
  }

  if (loading) {
    return (
      <HomeScreenLayout>
        <span className='icon-[line-md--loading-loop] h-16 w-16 text-rose-700' />
      </HomeScreenLayout>
    )
  }

  const columnWidth = gridWidth / columnCount
  return (
    <HomeScreenLayout>
      <div className='h-full w-full' ref={gridContainerRef}>
        <GameEntryGrid
          className='game-entry-grid absolute bottom-0 flex-1 !overflow-x-hidden'
          columnCount={columnCount}
          columnWidth={columnWidth}
          height={gridHeight}
          roms={roms}
          rowCount={Math.ceil(roms?.length ? roms.length / columnCount : 0)}
          rowHeight={columnWidth}
          width={gridWidth}
        />
      </div>

      <GameMenus />

      <InputTips />
    </HomeScreenLayout>
  )
}
