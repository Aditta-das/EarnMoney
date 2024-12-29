import './App.css'
import { Routes, Route } from "react-router"
import Login from './components/Login';
import Signup from './components/Signup';
import Feed from './components/Feed';
import Profile from './components/Profile';

function App() {
  return (
    <div className='App'>
      <Routes>
        <Route path="/" element={<Login />}></Route>
        <Route path="/login" index element={<Login></Login>}></Route>
        <Route path="/signup" element={<Signup></Signup>}></Route>
        <Route path="/feed" element={<Feed></Feed>}></Route>
        <Route path="/profile" element={<Profile></Profile>}></Route>
      </Routes>
    </div>
  )
}

export default App
