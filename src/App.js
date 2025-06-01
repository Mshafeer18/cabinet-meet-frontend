// src/App.js
import React from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import AppLayout from './layout/AppLayout';

function App() {
  return (
    <React.StrictMode>
      <Router>
        <AppLayout />
      </Router>
    </React.StrictMode>
  );
}

export default App;
