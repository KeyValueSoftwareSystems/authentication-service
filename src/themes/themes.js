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
          // backgroundColor: "#039BE5",
          fontSize: "1rem",
          height: "43px",
        },
        outlined: {
          boxShadow: 1,
          borderRadius: 20,
          border: "1px solid #039BE5",
          color: "#039BE5",
          "&:hover": {
            border: "1px solid #01579B",
            color: "#01579B",
          },
        },
        text: {
          color: "#636363",
          backgroundColor: "transparent",
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
        root: {
          height: "100%",
          display: "flex",
          flexDirection: "column",
          color: "#01579B",
        },
        label: {
          overflowWrap: "break-word",
          whiteSpace: "normal",
          textOverflow: "clip",
          padding: "4px 12px",
        },
      },
    },
    MuiTooltip: {
      styleOverrides: {
        tooltip: {
          fontSize: "14px",
        },
      },
    },
  },
});
export default theme;
