import './styles/index.sass'
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './components/app'
import './lib/spatial-navigation'

const rootElement = document.querySelector<HTMLDivElement>('#root')
if (rootElement) {
  createRoot(rootElement).render(<App />)
}
