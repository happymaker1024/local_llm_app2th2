import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from './assets/vite.svg'
import heroImg from './assets/hero.png'
// import './App.css'
import Header from './components/Header'
import Greeting from './components/Greeting'
import Counter from './components/Counter'
import InputState from './components/InputSate'
import ListRending from './components/ListRending'
import UseEffectRender from './components/UseEffectRender'
import OllamaChat from './components/OllamaChat'

function App() {

  return (
    <>

      <OllamaChat />
      <UseEffectRender />
      <ListRending />
      <InputState />
      <Counter />
      <h1>안녕 리액트</h1>
      {/* <Header></Header> */}
      <Header />
      <Greeting name ="joy" age="20" />
    </>
  )
}

export default App
