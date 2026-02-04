import { cleanup, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it } from 'vitest'

import MessageContent from './MessageContent'

describe('MessageContent', () => {
  afterEach(() => {
    cleanup()
  })

  it('should render plain text when no URLs are present', () => {
    render(<MessageContent text="Hello, world!" />)
    expect(screen.getByText('Hello, world!')).toBeInTheDocument()
  })

  it('should render plain text in a span with text class', () => {
    render(<MessageContent text="Simple message" />)
    const textElement = screen.getByText('Simple message')
    expect(textElement).toBeInTheDocument()
  })

  it('should convert a URL to a clickable link', () => {
    render(<MessageContent text="Check out https://example.com for more info" />)
    const link = screen.getByRole('link', { name: 'https://example.com' })
    expect(link).toBeInTheDocument()
    expect(link).toHaveAttribute('href', 'https://example.com')
    expect(link).toHaveAttribute('target', '_blank')
    expect(link).toHaveAttribute('rel', 'noopener noreferrer')
  })

  it('should convert http URL to a clickable link', () => {
    render(<MessageContent text="Visit http://test.org today" />)
    const link = screen.getByRole('link', { name: 'http://test.org' })
    expect(link).toBeInTheDocument()
    expect(link).toHaveAttribute('href', 'http://test.org')
  })

  it('should handle multiple URLs in a single message', () => {
    render(<MessageContent text="Check https://first.com and http://second.com for details" />)
    expect(screen.getByRole('link', { name: 'https://first.com' })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'http://second.com' })).toBeInTheDocument()
  })

  it('should handle URL at the beginning of text', () => {
    render(<MessageContent text="https://start.com is cool" />)
    expect(screen.getByRole('link', { name: 'https://start.com' })).toBeInTheDocument()
  })

  it('should handle URL at the end of text', () => {
    render(<MessageContent text="Visit us at https://end.com" />)
    expect(screen.getByRole('link', { name: 'https://end.com' })).toBeInTheDocument()
  })

  it('should handle multiple URLs separated by spaces', () => {
    render(<MessageContent text="https://one.com https://two.com" />)
    expect(screen.getByRole('link', { name: 'https://one.com' })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'https://two.com' })).toBeInTheDocument()
  })

  it('should handle an empty string', () => {
    const { container } = render(<MessageContent text="" />)
    expect(container).toBeInTheDocument()
  })

  it('should handle text with only a URL', () => {
    render(<MessageContent text="https://only.com" />)
    const link = screen.getByRole('link', { name: 'https://only.com' })
    expect(link).toBeInTheDocument()
  })

  it('should preserve special characters in plain text', () => {
    render(<MessageContent text="Hello! How are you? 😊 #testing @user" />)
    expect(screen.getByText('Hello! How are you? 😊 #testing @user')).toBeInTheDocument()
  })

  it('should handle email addresses', () => {
    render(<MessageContent text="Contact test@example.com for support" />)
    expect(screen.getByRole('link', { name: 'test@example.com' })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'test@example.com' })).toHaveAttribute(
      'href',
      'mailto:test@example.com'
    )
  })

  it('should handle www URLs without protocol', () => {
    render(<MessageContent text="Visit www.example.com for help" />)
    expect(screen.getByRole('link', { name: 'www.example.com' })).toBeInTheDocument()
  })

  it('should handle URLs with query parameters', () => {
    render(<MessageContent text="See https://example.com/path?foo=bar&baz=qux" />)
    const link = screen.getByRole('link', { name: 'https://example.com/path?foo=bar&baz=qux' })
    expect(link).toBeInTheDocument()
    expect(link).toHaveAttribute('href', 'https://example.com/path?foo=bar&baz=qux')
  })

  it('should handle URLs with fragments', () => {
    render(<MessageContent text="Go to https://example.com#section" />)
    const link = screen.getByRole('link', { name: 'https://example.com#section' })
    expect(link).toBeInTheDocument()
    expect(link).toHaveAttribute('href', 'https://example.com#section')
  })

  it('should handle URLs with port numbers', () => {
    render(<MessageContent text="Access http://localhost:3000 for dev" />)
    const link = screen.getByRole('link', { name: 'http://localhost:3000' })
    expect(link).toBeInTheDocument()
    expect(link).toHaveAttribute('href', 'http://localhost:3000')
  })

  it('should handle FTP URLs', () => {
    render(<MessageContent text="FTP at ftp://files.example.com" />)
    expect(screen.getByRole('link', { name: 'ftp://files.example.com' })).toBeInTheDocument()
  })

  it('should handle URLs in complex messages', () => {
    render(
      <MessageContent text="Hey @user, check https://example.com/docs?section=1&id=123 for docs!" />
    )
    expect(
      screen.getByRole('link', {
        name: 'https://example.com/docs?section=1&id=123',
      })
    ).toBeInTheDocument()
  })

  it('should handle trailing punctuation after URL', () => {
    render(<MessageContent text="Visit https://example.com." />)
    const link = screen.getByRole('link', { name: 'https://example.com' })
    expect(link).toBeInTheDocument()
  })

  it('should handle multiple links with surrounding text', () => {
    render(
      <MessageContent text="First: https://one.com, then https://two.com, finally https://three.com" />
    )
    expect(screen.getByRole('link', { name: 'https://one.com' })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'https://two.com' })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'https://three.com' })).toBeInTheDocument()
  })

  it('should return a single element when no matches (not an array)', () => {
    render(<MessageContent text="Plain text no links" />)
    const container = screen.getByText('Plain text no links').parentElement
    expect(container).toBeInTheDocument()
    expect(container?.children.length).toBe(1)
  })

  it('should return an array of elements when URLs are present', () => {
    render(<MessageContent text="Text https://link.com more" />)
    const span = screen.getByRole('link').closest('span')
    expect(span).toBeInTheDocument()
    expect(span?.childNodes.length).toBeGreaterThan(1)
  })

  it('should handle very long URLs', () => {
    const longUrl = `https://example.com/path/to/resource?id=${'a'.repeat(100)}&ref=${'b'.repeat(100)}`
    render(<MessageContent text={`Visit ${longUrl} today`} />)
    const link = screen.getByRole('link', { name: longUrl })
    expect(link).toBeInTheDocument()
    expect(link).toHaveAttribute('href', longUrl)
  })

  it('should handle URLs with international domain names', () => {
    render(<MessageContent text="Visit https://münchen.example.com" />)
    const link = screen.getByRole('link', { name: 'https://münchen.example.com' })
    expect(link).toBeInTheDocument()
  })

  it('should handle URLs with underscores and hyphens', () => {
    render(<MessageContent text="Check https://my-test.example.com/path" />)
    const link = screen.getByRole('link', { name: 'https://my-test.example.com/path' })
    expect(link).toBeInTheDocument()
  })
})
