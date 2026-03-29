import { useEffect, useRef, useState } from 'react'

type EmbyPlayerProps = {
  src: string
  poster: string
  isActive: boolean
  isNearActive: boolean
}

export default function EmbyPlayer({ src, poster, isActive, isNearActive }: EmbyPlayerProps) {
  const videoRef = useRef<HTMLVideoElement | null>(null)
  const [isMuted, setIsMuted] = useState(true)
  const [hasError, setHasError] = useState(false)
  const [isVertical, setIsVertical] = useState(true)
  const [isFull, setIsFull] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [isPaused, setIsPaused] = useState(false)
  const [showError, setShowError] = useState(false)

  const activeSrc = isActive || isNearActive ? src : ''

  const seekBy = (delta: number) => {
    const video = videoRef.current
    if (!video) {
      return
    }
    const nextTime = Math.min(Math.max(0, video.currentTime + delta), duration || video.duration || 0)
    video.currentTime = nextTime
    setCurrentTime(nextTime)
  }

  useEffect(() => {
    const video = videoRef.current
    if (!video) {
      return
    }

    if (isActive || isNearActive) {
      if (isActive) {
        const playPromise = video.play()
        if (playPromise) {
          playPromise.catch(() => {
            setHasError(true)
            setShowError(true)
          })
        }
      }
    } else {
      video.pause()
      video.removeAttribute('src')
      video.load()
    }
  }, [isActive, isNearActive, src])

  const togglePlay = () => {
    const video = videoRef.current
    if (!video) {
      return
    }
    if (video.paused) {
      video.play().catch(() => {
        setHasError(true)
        setShowError(true)
      })
    } else {
      video.pause()
    }
  }

  useEffect(() => {
    if (!showError) {
      return
    }
    const timer = window.setTimeout(() => {
      setShowError(false)
    }, 5000)
    return () => window.clearTimeout(timer)
  }, [showError])

  const formatTime = (value: number) => {
    if (!Number.isFinite(value) || value <= 0) {
      return '0:00'
    }
    const minutes = Math.floor(value / 60)
    const seconds = Math.floor(value % 60)
    return `${minutes}:${seconds.toString().padStart(2, '0')}`
  }

  return (
    <div
      className={`player ${isVertical ? 'player--vertical' : 'player--horizontal'} ${
        isFull ? 'player--full' : 'player--fit'
      }`}
    >
      <div
        className="player__bg"
        style={{ backgroundImage: poster ? `url(${poster})` : 'none' }}
        aria-hidden="true"
      />
      <video
        ref={videoRef}
        className="player__video"
        src={activeSrc}
        poster={poster}
        muted={isMuted}
        playsInline
        loop
        preload={isActive ? 'auto' : 'metadata'}
        onLoadedMetadata={(event) => {
          const target = event.currentTarget
          if (target.videoWidth && target.videoHeight) {
            setIsVertical(target.videoHeight >= target.videoWidth)
          }
          setDuration(target.duration || 0)
        }}
        onPlay={() => {
          setIsPaused(false)
        }}
        onPause={() => {
          setIsPaused(true)
        }}
        onTimeUpdate={(event) => {
          setCurrentTime(event.currentTarget.currentTime)
        }}
        onError={() => {
          setHasError(true)
          setShowError(true)
        }}
      />
      {isActive ? (
        <div className="player__controls">
          <button
            className="player__button"
            type="button"
            onClick={() => seekBy(-10)}
            aria-label="Retroceder 10 segundos"
          >
            <span className="sr-only">Retroceder 10s</span>
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <path
                d="M12 6v4l-3-3m3 3a6 6 0 1 1-4.24 1.76"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                fill="none"
              />
            </svg>
          </button>
          <button
            className="player__button"
            type="button"
            onClick={() => setIsMuted((prev) => !prev)}
            aria-label={isMuted ? 'Unmute' : 'Mute'}
          >
            <span className="sr-only">{isMuted ? 'Unmute' : 'Mute'}</span>
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <path
                d="M4 10v4h4l5 4V6L8 10H4z"
                fill="currentColor"
              />
              {isMuted ? (
                <path
                  d="M16 9l4 4m0-4l-4 4"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
              ) : (
                <path
                  d="M16 8c1.5 1.5 1.5 6 0 7.5"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  fill="none"
                />
              )}
            </svg>
          </button>
          <button
            className="player__button"
            type="button"
            onClick={togglePlay}
            aria-label={isPaused ? 'Reproducir' : 'Pausar'}
          >
            <span className="sr-only">{isPaused ? 'Reproducir' : 'Pausar'}</span>
            {isPaused ? (
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <path d="M8 5l11 7-11 7z" fill="currentColor" />
              </svg>
            ) : (
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <path d="M7 5h4v14H7zM13 5h4v14h-4z" fill="currentColor" />
              </svg>
            )}
          </button>
          <button
            className="player__button"
            type="button"
            onClick={() => setIsFull((prev) => !prev)}
            aria-label={isFull ? 'Ajustar' : 'Pantalla completa'}
          >
            <span className="sr-only">{isFull ? 'Ajustar' : 'Pantalla completa'}</span>
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <path
                d="M4 9V4h5M20 9V4h-5M4 15v5h5M20 15v5h-5"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                fill="none"
              />
            </svg>
          </button>
          <button
            className="player__button"
            type="button"
            onClick={() => seekBy(10)}
            aria-label="Adelantar 10 segundos"
          >
            <span className="sr-only">Adelantar 10s</span>
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <path
                d="M12 6v4l3-3m-3 3a6 6 0 1 0 4.24 1.76"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                fill="none"
              />
            </svg>
          </button>
        </div>
      ) : null}
      {isActive ? (
        <div className="player__timeline">
          <input
            className="player__range"
            type="range"
            min={0}
            max={duration || 0}
            step={0.1}
            value={currentTime}
            onChange={(event) => {
              const value = Number(event.target.value)
              setCurrentTime(value)
              if (videoRef.current) {
                videoRef.current.currentTime = value
              }
            }}
          />
          <div className="player__time">
            {formatTime(currentTime)} / {formatTime(duration)}
          </div>
        </div>
      ) : null}
      {hasError && showError ? (
        <div className="player__error">No se pudo reproducir este video.</div>
      ) : null}
    </div>
  )
}
