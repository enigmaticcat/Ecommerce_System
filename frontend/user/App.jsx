import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { UserContextProvider } from './UserContext';
import Navbar from './component/Navbar';
import ProtectedRoute from './component/ProtectedRoute';
import Home from './pages/Home';
import Collection from './pages/Collection';
import Login from './pages/Login';
import Register from './pages/Register';
import Profile from './pages/Profile';
import ProfileEdit from './pages/ProfileEdit';
import './styles/global.css';

function App() {
  return (
    <UserContextProvider>
      <BrowserRouter>
        <Navbar />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/collections" element={<Collection />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route 
            path="/profile" 
            element={
              <ProtectedRoute>
                <Profile />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/profile/edit" 
            element={
              <ProtectedRoute>
                <ProfileEdit />
              </ProtectedRoute>
            } 
          />
        </Routes>
      </BrowserRouter>
    </UserContextProvider>
  );
}

export default App;
