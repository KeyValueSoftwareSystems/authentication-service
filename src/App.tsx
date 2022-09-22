import React from 'react';
import { HashRouter as Router } from 'react-router-dom';

import './App.css';
import RoutesLayout from './routes/routesLayout';

function App() {
  return (
    // <ThemeProvider theme={theme}>
        <Router>
          <RoutesLayout />
        </Router>
    // </ThemeProvider>
  );
}

export default App;
