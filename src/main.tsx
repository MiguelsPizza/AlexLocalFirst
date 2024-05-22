import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'



const init = async () => {

  ReactDOM.createRoot(document.getElementById('root')!).render(
    <React.StrictMode>
      {/* <Canvas style={{ height: '100vh', width: '100vw' }}> */}
      <App />
      {/* </Canvas> */}
    </React.StrictMode>,
  )

}


init()