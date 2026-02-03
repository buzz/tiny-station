import { act, cleanup, render, screen } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import OnlineCounter from './OnlineCounter'

describe('OnlineCounter', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    cleanup()
    vi.useRealTimers()
  })

  it('should not render anything when streamOnline is undefined', () => {
    render(<OnlineCounter streamOnline={undefined} streamStart={undefined} />)
    expect(screen.queryByTitle(/Online since/i)).not.toBeInTheDocument()
  })

  it('should not render anything when streamOnline is offline', () => {
    render(<OnlineCounter streamOnline="offline" streamStart={undefined} />)
    expect(screen.queryByTitle(/Online since/i)).not.toBeInTheDocument()
  })

  it('should not render anything when streamOnline is online but streamStart is undefined', () => {
    render(<OnlineCounter streamOnline="online" streamStart={undefined} />)
    expect(screen.queryByTitle(/Online since/i)).not.toBeInTheDocument()
  })

  it('should render the counter when streamOnline is online and streamStart exists', () => {
    const now = new Date()
    render(<OnlineCounter streamOnline="online" streamStart={now} />)

    const counter = screen.getByTitle(/Online since/i)
    expect(counter).toBeInTheDocument()
  })

  it('should render FontAwesomeIcon with clock icon', () => {
    const now = new Date()
    render(<OnlineCounter streamOnline="online" streamStart={now} />)

    const container = screen.getByTitle(/Online since/i)
    const icon = container.querySelector('svg')

    expect(icon).toBeInTheDocument()
    // FontAwesome SVGs usually have this attribute, making it a stronger check than just 'svg'
    expect(icon).toHaveAttribute('data-icon', 'clock')
  })

  it('should render the time display', () => {
    const now = new Date()
    render(<OnlineCounter streamOnline="online" streamStart={now} />)

    expect(screen.getByText(/less than 1 min/i)).toBeInTheDocument()
  })

  it('should show "Online since" with formatted time when online with streamStart', () => {
    const startTime = new Date('2024-01-15T10:30:00')
    render(<OnlineCounter streamOnline="online" streamStart={startTime} />)

    const expectedTitle = `Online since ${startTime.toLocaleTimeString()}`
    expect(screen.getByTitle(expectedTitle)).toBeInTheDocument()
  })

  it('should display "less than 1 min" when stream started less than a minute ago', () => {
    const now = Date.now()
    const startTime = new Date(now - 30_000) // 30 seconds ago
    render(<OnlineCounter streamOnline="online" streamStart={startTime} />)

    const timeLabel = screen.getByText('less than 1 min')
    expect(timeLabel).toBeInTheDocument()
  })

  it('should display formatted time when stream started more than a minute ago', () => {
    const now = Date.now()
    const startTime = new Date(now - 65_000) // 1 minute 5 seconds ago
    render(<OnlineCounter streamOnline="online" streamStart={startTime} />)

    const timeLabel = screen.getByText(/^\d{1,2}:\d{2}$/)
    expect(timeLabel).toBeInTheDocument()
  })

  it('should display hours when stream started more than an hour ago', () => {
    const now = Date.now()
    const startTime = new Date(now - 3_661_000) // 1 hour 1 minute 1 second ago
    render(<OnlineCounter streamOnline="online" streamStart={startTime} />)

    const timeLabel = screen.getByText(/^\d+:\d{2}:\d{2}$/)
    expect(timeLabel).toBeInTheDocument()
  })

  it('should update time every second when online', () => {
    const mockNow = new Date('2026-02-03T10:00:00Z').getTime()
    vi.setSystemTime(mockNow)

    const startTime = new Date(mockNow - 65_000) // 1:05 minutes ago
    render(<OnlineCounter streamOnline="online" streamStart={startTime} />)

    expect(screen.getByText('01:05')).toBeInTheDocument()

    // Advance time by 1 second (1:05 -> 1:06)
    act(() => {
      vi.advanceTimersByTime(1000)
      vi.setSystemTime(mockNow + 1000)
    })

    expect(screen.getByText('01:06')).toBeInTheDocument()
  })

  it('should clear interval when unmounted', () => {
    const clearIntervalSpy = vi.spyOn(globalThis, 'clearInterval')
    const setIntervalSpy = vi.spyOn(globalThis, 'setInterval')
    const startTime = new Date()
    const { unmount } = render(<OnlineCounter streamOnline="online" streamStart={startTime} />)

    expect(setIntervalSpy).toHaveBeenCalled()
    unmount()
    expect(clearIntervalSpy).toHaveBeenCalled()
  })

  it('should stop interval when streamStart changes', () => {
    const clearIntervalSpy = vi.spyOn(globalThis, 'clearInterval')
    const now = new Date()
    const later = new Date(now.getTime() + 1000)

    const { rerender } = render(<OnlineCounter streamOnline="online" streamStart={now} />)
    const initialCalls = clearIntervalSpy.mock.calls.length

    rerender(<OnlineCounter streamOnline="online" streamStart={later} />)

    expect(clearIntervalSpy.mock.calls.length).toBeGreaterThan(initialCalls)
  })

  it('should handle streamOnline changing from online to offline', () => {
    const now = new Date()
    const { rerender } = render(<OnlineCounter streamOnline="online" streamStart={now} />)

    expect(screen.getByTitle(/Online since/i)).toBeInTheDocument()

    rerender(<OnlineCounter streamOnline="offline" streamStart={now} />)

    expect(screen.queryByTitle(/Online since/i)).not.toBeInTheDocument()
  })

  it('should display correct time immediately on first render', () => {
    const startTime = new Date(Date.now() - 65_000) // 1:05 minutes ago
    render(<OnlineCounter streamOnline="online" streamStart={startTime} />)

    expect(screen.getByText('01:05')).toBeInTheDocument()
  })
})
