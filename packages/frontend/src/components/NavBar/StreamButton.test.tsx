import { cleanup, render, screen } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import StreamButton from './StreamButton'

describe('StreamButton', () => {
  let startStreamMock: () => void
  let stopStreamMock: () => void

  beforeEach(() => {
    startStreamMock = vi.fn()
    stopStreamMock = vi.fn()
  })

  afterEach(() => {
    cleanup()
    vi.restoreAllMocks()
  })

  it('should render a button element', () => {
    render(
      <StreamButton
        streamOnline="online"
        streamState="stopped"
        startStream={startStreamMock}
        stopStream={stopStreamMock}
      />
    )
    expect(screen.getByTitle('Play stream')).toBeInTheDocument()
  })

  it('should show spinner when streamOnline is undefined', () => {
    render(
      <StreamButton
        streamOnline={undefined}
        streamState="stopped"
        startStream={startStreamMock}
        stopStream={stopStreamMock}
      />
    )
    expect(screen.getByRole('button')).toBeInTheDocument()
  })

  it('should show frown icon when streamOnline is offline', () => {
    render(
      <StreamButton
        streamOnline="offline"
        streamState="stopped"
        startStream={startStreamMock}
        stopStream={stopStreamMock}
      />
    )
    const button = screen.getByRole('button')
    const icon = button.querySelector('svg')
    expect(icon).toBeInTheDocument()
    expect(icon).toHaveAttribute('data-icon', 'face-frown-open')
  })

  it('should show play icon and "Play stream" title when online and stopped', () => {
    render(
      <StreamButton
        streamOnline="online"
        streamState="stopped"
        startStream={startStreamMock}
        stopStream={stopStreamMock}
      />
    )
    const button = screen.getByTitle('Play stream')
    const icon = button.querySelector('svg')
    expect(icon).toBeInTheDocument()
    expect(icon).toHaveAttribute('data-icon', 'circle-play')
    expect(button).toHaveAttribute('title', 'Play stream')
  })

  it('should show stop icon and "Stop stream" title when online and playing', () => {
    render(
      <StreamButton
        streamOnline="online"
        streamState="playing"
        startStream={startStreamMock}
        stopStream={stopStreamMock}
      />
    )
    const button = screen.getByTitle('Stop stream')
    const icon = button.querySelector('svg')
    expect(icon).toBeInTheDocument()
    expect(icon).toHaveAttribute('data-icon', 'circle-stop')
    expect(button).toHaveAttribute('title', 'Stop stream')
  })

  it('should show spinner when loading', () => {
    render(
      <StreamButton
        streamOnline="online"
        streamState="loading"
        startStream={startStreamMock}
        stopStream={stopStreamMock}
      />
    )
    const button = screen.getByRole('button')
    expect(button).toHaveAttribute('title', 'Starting stream…')
  })

  it('should show exclamation icon when in error state', () => {
    render(
      <StreamButton
        streamOnline="online"
        streamState="error"
        startStream={startStreamMock}
        stopStream={stopStreamMock}
      />
    )
    const button = screen.getByRole('button')
    const icon = button.querySelector('svg')
    expect(icon).toBeInTheDocument()
    expect(icon).toHaveAttribute('data-icon', 'circle-exclamation')
  })

  it('should call startStream when clicked and stream is stopped', () => {
    render(
      <StreamButton
        streamOnline="online"
        streamState="stopped"
        startStream={startStreamMock}
        stopStream={stopStreamMock}
      />
    )
    screen.getByTitle('Play stream').click()
    expect(startStreamMock).toHaveBeenCalledTimes(1)
    expect(stopStreamMock).not.toHaveBeenCalled()
  })

  it('should call stopStream when clicked and stream is playing', () => {
    render(
      <StreamButton
        streamOnline="online"
        streamState="playing"
        startStream={startStreamMock}
        stopStream={stopStreamMock}
      />
    )
    screen.getByTitle('Stop stream').click()
    expect(stopStreamMock).toHaveBeenCalledTimes(1)
    expect(startStreamMock).not.toHaveBeenCalled()
  })

  it('should be disabled when loading', () => {
    render(
      <StreamButton
        streamOnline="online"
        streamState="loading"
        startStream={startStreamMock}
        stopStream={stopStreamMock}
      />
    )
    expect(screen.getByRole('button')).toBeDisabled()
  })

  it('should be disabled when streamOnline is offline', () => {
    render(
      <StreamButton
        streamOnline="offline"
        streamState="stopped"
        startStream={startStreamMock}
        stopStream={stopStreamMock}
      />
    )
    expect(screen.getByRole('button')).toBeDisabled()
  })

  it('should be disabled when streamOnline is undefined', () => {
    render(
      <StreamButton
        streamOnline={undefined}
        streamState="stopped"
        startStream={startStreamMock}
        stopStream={stopStreamMock}
      />
    )
    expect(screen.getByRole('button')).toBeDisabled()
  })

  it('should not call startStream when disabled and loading', () => {
    render(
      <StreamButton
        streamOnline="online"
        streamState="loading"
        startStream={startStreamMock}
        stopStream={stopStreamMock}
      />
    )
    screen.getByRole('button').click()
    expect(startStreamMock).not.toHaveBeenCalled()
  })

  it('should not call stopStream when disabled and offline', () => {
    render(
      <StreamButton
        streamOnline="offline"
        streamState="playing"
        startStream={startStreamMock}
        stopStream={stopStreamMock}
      />
    )
    screen.getByRole('button').click()
    expect(stopStreamMock).not.toHaveBeenCalled()
  })

  it('should apply iconButton and playButton CSS classes', () => {
    render(
      <StreamButton
        streamOnline="online"
        streamState="stopped"
        startStream={startStreamMock}
        stopStream={stopStreamMock}
      />
    )
    const button = screen.getByTitle('Play stream')
    expect(button.className).toContain('iconButton')
    expect(button.className).toContain('playButton')
  })

  it('should handle streamOnline changing from undefined to online', () => {
    const { rerender } = render(
      <StreamButton
        streamOnline={undefined}
        streamState="stopped"
        startStream={startStreamMock}
        stopStream={stopStreamMock}
      />
    )
    expect(screen.getByRole('button')).toBeDisabled()

    rerender(
      <StreamButton
        streamOnline="online"
        streamState="stopped"
        startStream={startStreamMock}
        stopStream={stopStreamMock}
      />
    )

    expect(screen.getByTitle('Play stream')).not.toBeDisabled()
    expect(screen.getByTitle('Play stream')).toHaveAttribute('title', 'Play stream')
  })

  it('should handle streamState changing from stopped to playing', () => {
    const { rerender } = render(
      <StreamButton
        streamOnline="online"
        streamState="stopped"
        startStream={startStreamMock}
        stopStream={stopStreamMock}
      />
    )
    expect(screen.getByTitle('Play stream')).toBeInTheDocument()

    rerender(
      <StreamButton
        streamOnline="online"
        streamState="playing"
        startStream={startStreamMock}
        stopStream={stopStreamMock}
      />
    )

    expect(screen.getByTitle('Stop stream')).toBeInTheDocument()
  })
})
