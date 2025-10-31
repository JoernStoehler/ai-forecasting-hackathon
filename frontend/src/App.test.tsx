import { render, screen } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import App from './App'

const wrapper = ({ children }: { children: React.ReactNode }) => (
  <QueryClientProvider client={new QueryClient()}>
    <BrowserRouter>{children}</BrowserRouter>
  </QueryClientProvider>
)

describe('App', () => {
  it('renders welcome text', () => {
    render(<App />, { wrapper: (props) => wrapper(props) })
    expect(screen.getByText(/Starter scaffold is running/i)).toBeInTheDocument()
  })
})

