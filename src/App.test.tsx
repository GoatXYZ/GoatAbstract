import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'
import App from './App'

describe('App', () => {
  it('renders the generator controls and preview', () => {
    render(<App />)

    expect(screen.getByLabelText(/w \(px\)/i)).toHaveValue(1600)
    expect(screen.getByLabelText(/h \(px\)/i)).toHaveValue(900)
    expect(screen.getByLabelText(/seed/i)).toHaveValue('nightshift')
    expect(screen.getByRole('button', { name: /randomize/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /download svg/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /download png/i })).toBeInTheDocument()
    expect(screen.getByTitle(/wave art preview/i)).toBeInTheDocument()
  })

  it('renders the mode tab bar with all modes', () => {
    render(<App />)

    const tablist = screen.getByRole('tablist', { name: /art mode/i })
    expect(tablist).toBeInTheDocument()

    const tabs = screen.getAllByRole('tab')
    expect(tabs).toHaveLength(10)

    // Default mode is Noise Dunes
    expect(tabs[0]).toHaveAttribute('data-active')
    expect(tabs[0]).toHaveTextContent('Noise Dunes')
  })

  it('switches mode when clicking a tab', async () => {
    const user = userEvent.setup()
    render(<App />)

    const contourTab = screen.getByRole('tab', { name: /contour rings/i })
    await user.click(contourTab)

    expect(contourTab).toHaveAttribute('data-active')
    // The preview should still render
    expect(screen.getByTitle(/wave art preview/i)).toBeInTheDocument()
  })

  it('updates width, height, and seed controls', async () => {
    const user = userEvent.setup()
    render(<App />)

    const widthInput = screen.getByLabelText(/w \(px\)/i)
    const heightInput = screen.getByLabelText(/h \(px\)/i)
    const seedInput = screen.getByLabelText(/seed/i)

    await user.clear(widthInput)
    await user.type(widthInput, '1200')
    await user.clear(heightInput)
    await user.type(heightInput, '630')
    await user.clear(seedInput)
    await user.type(seedInput, 'posterwave')

    expect(widthInput).toHaveValue(1200)
    expect(heightInput).toHaveValue(630)
    expect(seedInput).toHaveValue('posterwave')
    expect(screen.getByText(/1200.*630/)).toBeInTheDocument()
  })

  it('randomizes the seed from the control panel', async () => {
    const user = userEvent.setup()
    render(<App />)

    const seedInput = screen.getByLabelText(/seed/i)
    const initialValue = seedInput.getAttribute('value')

    await user.click(screen.getByRole('button', { name: /randomize/i }))

    expect(seedInput).not.toHaveValue(initialValue)
  })
})
