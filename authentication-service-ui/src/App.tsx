import React from "react";
import { HashRouter as Router } from "react-router-dom";
import { ThemeProvider } from "@mui/material/styles";

import "./App.css";
import RoutesLayout from "./routes/routesLayout";
import theme from "./themes/themes";

function App() {
  return (
    <ThemeProvider theme={theme}>
      <Router>
        <RoutesLayout />
      </Router>
    </ThemeProvider>
  );
}

export default App;
