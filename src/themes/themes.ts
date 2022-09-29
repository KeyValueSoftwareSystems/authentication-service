import { createTheme } from "@mui/material/styles";

const theme = createTheme({
  palette: {
    primary: {
      main: "#416cfd",
    },
    secondary: {
      main: "#00AEEF",
    },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        // Name of the slot
        root: {
          // Some CSS
          fontSize: "1rem",
        },
      },
    },
  },
});

export default theme;
