// src/main.jsx
import React from 'react' // o StrictMode
import ReactDOM from 'react-dom/client' // o createRoot
import App from './App.jsx'
import './index.css' // <--- ESTA LÍNEA ES CRUCIAL

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)