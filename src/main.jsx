import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './styles/index.css'

console.log('Main.jsx is executing!');

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
