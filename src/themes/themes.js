import { createTheme } from "@mui/material/styles";
const theme = createTheme({
  palette: {
    primary: {
      main: "#039BE5",
      dark: "#01579B",
    },
    secondary: {
      main: "#FAFAFA",
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
        outlined: {
          boxShadow: 1,
          borderRadius: 20,
          border: "1px solid #636363",
          color: "#636363",
          "&:hover": {
            border: "1px solid #039BE5",
            color: "#039BE5",
          },
        },
        text: {
          color: "#636363",
          "&:hover": {
            color: "#D32F2F",
            backgroundColor: "transparent",
          },
        },
      },
    },
    MuiDataGrid: {
      styleOverrides: {
        root: {
          "& .MuiDataGrid-renderingZone": {
            maxHeight: "none !important",
          },
          "& .MuiDataGrid-cell": {
            lineHeight: "unset !important",
            maxHeight: "none !important",
            whiteSpace: "normal",
            flexWrap: "wrap !important",
            textOverflow: "ellipsis",
          },
          "& .MuiDataGrid-row": {
            maxHeight: "none !important",
          },
          "& .MuiDataGrid-cell--withRenderer MuiDataGrid-cell MuiDataGrid-cell--textLeft":
            {
              maxHeight: "none !important",
            },
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: { height: "100%", display: "flex", flexDirection: "column" },
        label: {
          overflowWrap: "break-word",
          whiteSpace: "normal",
          textOverflow: "clip",
        },
      },
    },
  },
});
export default theme;
