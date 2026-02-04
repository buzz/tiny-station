import { act, cleanup, render, screen } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import TimeSince from './TimeSince'

describe('TimeSince', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    cleanup()
    vi.useRealTimers()
  })

  it('should render a span element with time class', () => {
    const timestamp = Date.now() - 65_000
    render(<TimeSince timestamp={timestamp} />)

    const timeElement = screen.getByTitle(new Date(timestamp).toLocaleString())
    expect(timeElement).toBeInTheDocument()
    expect(timeElement.tagName).toBe('SPAN')
  })

  it('should not render anything when timestamp is less than 1 minute ago', () => {
    const timestamp = Date.now() - 30_000
    render(<TimeSince timestamp={timestamp} />)

    const timeElement = screen.getByTitle(new Date(timestamp).toLocaleString())
    expect(timeElement).toBeInTheDocument()
    expect(timeElement).toHaveTextContent('')
  })

  it('should render "X min ago" when timestamp is between 1 minute and 1 hour', () => {
    const timestamp = Date.now() - 300_000
    render(<TimeSince timestamp={timestamp} />)

    expect(screen.getByText(/^\d+ min ago$/)).toBeInTheDocument()
  })

  it('should render "5 min ago" for 5 minutes elapsed', () => {
    const timestamp = Date.now() - 300_000
    render(<TimeSince timestamp={timestamp} />)

    expect(screen.getByText('5 min ago')).toBeInTheDocument()
  })

  it('should render "X h ago" when timestamp is between 1 hour and 1 day', () => {
    const timestamp = Date.now() - 7_200_000
    render(<TimeSince timestamp={timestamp} />)

    expect(screen.getByText(/^\d+ h ago$/)).toBeInTheDocument()
  })

  it('should render "2 h ago" for 2 hours elapsed', () => {
    const timestamp = Date.now() - 7_200_000
    render(<TimeSince timestamp={timestamp} />)

    expect(screen.getByText('2 h ago')).toBeInTheDocument()
  })

  it('should render "X day(s) ago" when timestamp is between 1 day and 1 month', () => {
    const timestamp = Date.now() - 172_800_000
    render(<TimeSince timestamp={timestamp} />)

    expect(screen.getByText(/^\d+ day(s)? ago$/)).toBeInTheDocument()
  })

  it('should render "2 days ago" for 2 days elapsed', () => {
    const timestamp = Date.now() - 172_800_000
    render(<TimeSince timestamp={timestamp} />)

    expect(screen.getByText('2 days ago')).toBeInTheDocument()
  })

  it('should render "23 h ago" for just under 24 hours', () => {
    const timestamp = Date.now() - 86_399_000
    render(<TimeSince timestamp={timestamp} />)

    expect(screen.getByText('23 h ago')).toBeInTheDocument()
  })

  it('should render "X month(s) ago" when timestamp is between 1 month and 1 year', () => {
    const timestamp = Date.now() - 5_184_000_000
    render(<TimeSince timestamp={timestamp} />)

    expect(screen.getByText(/^\d+ month(s)? ago$/)).toBeInTheDocument()
  })

  it('should render "2 months ago" for 2 months elapsed', () => {
    const timestamp = Date.now() - 5_184_000_000
    render(<TimeSince timestamp={timestamp} />)

    expect(screen.getByText('2 months ago')).toBeInTheDocument()
  })

  it('should render "29 days ago" for just under 30 days', () => {
    const timestamp = Date.now() - 2_591_999_000
    render(<TimeSince timestamp={timestamp} />)

    expect(screen.getByText('29 days ago')).toBeInTheDocument()
  })

  it('should render "12 months ago" for just under 1 year', () => {
    const timestamp = Date.now() - 31_535_999_000
    render(<TimeSince timestamp={timestamp} />)

    expect(screen.getByText('12 months ago')).toBeInTheDocument()
  })

  it('should render "2 years ago" for 2 years elapsed', () => {
    const timestamp = Date.now() - 63_072_000_000
    render(<TimeSince timestamp={timestamp} />)

    expect(screen.getByText('2 years ago')).toBeInTheDocument()
  })

  it('should render "2 years ago" for over 2 years', () => {
    const timestamp = Date.now() - 63_072_000_000
    render(<TimeSince timestamp={timestamp} />)

    expect(screen.getByText('2 years ago')).toBeInTheDocument()
  })

  it('should render correct title with formatted date', () => {
    const timestamp = new Date('2024-06-15T14:30:00').getTime()
    render(<TimeSince timestamp={timestamp} />)

    const expectedTitle = new Date(timestamp).toLocaleString()
    expect(screen.getByTitle(expectedTitle)).toBeInTheDocument()
  })

  it('should update time every 15 seconds', () => {
    const mockNow = new Date('2026-02-03T10:00:00Z').getTime()
    vi.setSystemTime(mockNow)

    const startTime = mockNow - 300_000 // 5 minutes ago
    render(<TimeSince timestamp={startTime} />)

    expect(screen.getByText('5 min ago')).toBeInTheDocument()

    // Advance time by 60 seconds (crosses into hours)
    act(() => {
      vi.advanceTimersByTime(60_000)
    })

    expect(screen.getByText('6 min ago')).toBeInTheDocument()
  })

  it('should clear interval on unmount', () => {
    const clearIntervalSpy = vi.spyOn(globalThis, 'clearInterval')
    const setIntervalSpy = vi.spyOn(globalThis, 'setInterval')
    const timestamp = Date.now() - 65_000

    const { unmount } = render(<TimeSince timestamp={timestamp} />)

    expect(setIntervalSpy).toHaveBeenCalled()
    unmount()
    expect(clearIntervalSpy).toHaveBeenCalled()
  })

  it('should clear and re-create interval when timestamp changes', () => {
    const clearIntervalSpy = vi.spyOn(globalThis, 'clearInterval')
    const setIntervalSpy = vi.spyOn(globalThis, 'setInterval')
    const now = Date.now()
    const initialTimestamp = now - 65_000
    const newTimestamp = now - 300_000

    const { rerender } = render(<TimeSince timestamp={initialTimestamp} />)
    const initialSetIntervalCalls = setIntervalSpy.mock.calls.length

    rerender(<TimeSince timestamp={newTimestamp} />)

    expect(clearIntervalSpy.mock.calls.length).toBeGreaterThan(0)
    expect(setIntervalSpy.mock.calls.length).toBeGreaterThan(initialSetIntervalCalls)
  })

  it('should handle timestamp just over 1 minute', () => {
    const timestamp = Date.now() - 61_000
    render(<TimeSince timestamp={timestamp} />)

    expect(screen.getByText('1 min ago')).toBeInTheDocument()
  })

  it('should render "60 min ago" for just over 1 hour', () => {
    const timestamp = Date.now() - 3_600_001
    render(<TimeSince timestamp={timestamp} />)

    expect(screen.getByText('60 min ago')).toBeInTheDocument()
  })
})
