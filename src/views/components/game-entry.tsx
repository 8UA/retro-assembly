import { type FileWithDirectoryAndFileHandle } from 'browser-fs-access'
import classNames from 'classnames'
import { useEffect, useMemo, useState } from 'react'
import { useAsync } from 'react-use'
import { guessGameDetail, guessSystem } from '../../core/helpers/file'
import { getCover, parseGoodCode } from '../../core/helpers/misc'
import GameEntryImage from './game-entry-image'

export default function GameEntry({
  file,
  onClick,
}: {
  file: FileWithDirectoryAndFileHandle
  onClick: React.MouseEventHandler<HTMLButtonElement>
}) {
  const [gameImageStatus, setGameImageStatus] = useState({ valid: true, loading: true })
  const gameInfoPromise = useMemo(() => Promise.all([guessSystem(file), guessGameDetail(file)]), [file])
  const goodcode = useMemo(() => parseGoodCode(file.name), [file])

  const gameInfoAsyncState = useAsync(() => gameInfoPromise, [file])

  const [system, detail] = gameInfoAsyncState.value ?? []
  const gameImageSrc = gameInfoAsyncState.value ? getCover({ system, name: detail?.name }) : ''

  function onImgError() {
    setGameImageStatus({ valid: false, loading: false })
  }

  function onImageLoad() {
    setGameImageStatus({ valid: true, loading: false })
  }

  useEffect(() => {
    ;(async () => {
      let valid = true
      let loading = true
      try {
        // eslint-disable-next-line @typescript-eslint/no-shadow
        const [system, detail] = await gameInfoPromise
        valid = Boolean(getCover({ system, name: detail?.name }))
      } catch (error) {
        valid = false
        console.warn(error)
      }
      loading = valid
      setGameImageStatus({ valid, loading })
    })()
  }, [gameInfoPromise])

  const gameEntryImageWithLoader = (
    <>
      {gameImageStatus.loading && <div className='w-full h-full bg-slate-400' />}
      <GameEntryImage
        status={gameImageStatus}
        src={gameImageSrc}
        alt={goodcode.rom}
        onLoad={onImageLoad}
        onError={onImgError}
      />
    </>
  )

  const gameEntryText = (
    <div className='w-full h-full bg-gray-400 flex items-center justify-center font-bold'>{goodcode.rom}</div>
  )

  return (
    <button
      onClick={onClick}
      className={classNames(
        'w-[10%] aspect-square overflow-hidden text-left relative transition-transform transform-gpu border-white',
        gameImageStatus.loading
          ? 'scale-[98%]'
          : 'hover:scale-125 hover:z-10 hover:border-4 hover:rounded-sm hover:shadow-md'
      )}
    >
      {gameImageStatus.valid ? gameEntryImageWithLoader : gameEntryText}
    </button>
  )
}