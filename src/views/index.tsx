import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './components/app'

const rootElement = document.querySelector<HTMLDivElement>('#root')
if (rootElement) {
  createRoot(rootElement).render(
    <StrictMode>
      <App />
    </StrictMode>
  )
}