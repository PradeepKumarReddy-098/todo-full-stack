import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Login from './components/Login';
import Register from './components/Register';
import Todo from './components/Todo'
import Profile from './components/Profile';
import BadRequest from './components/BadRequest';
import './App.css';

const App =() => (
  <div className='App'>
    <BrowserRouter>
    <Routes>
      <Route path='/login' element={<Login />} />
      <Route path='/register' element={<Register />} />
      <Route path='/' element={<Todo />} />
      <Route exact path='/profile' element={<Profile />} />
      <Route path='*' element={<BadRequest />} />
    </Routes>
    </BrowserRouter>
  </div>
)

export default App;
