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
    MuiMenu: {
      styleOverrides: {
        paper: {
          minWidth: "250px !important",
          overflow: "visible !important",
          filter: "drop-shadow(0px 2px 8px rgba(0,0,0,0.32)) !important",
          mt: "1.5 !important",
          "& .MuiAvatar-root": {
            width: 38,
            height: 38,
            marginRight: 6,
          },
          "&:before": {
            content: '""',
            display: "block",
            position: "absolute",
            top: 0,
            right: 14,
            width: 10,
            height: 10,
            backgroundColor: "#fff !important",
            transform: "translateY(-50%) rotate(45deg)",
            zIndex: 0,
          },
        },
      },
    },
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
          flexDirection: "row",
          color: "#01579B",
          backgroundColor: "#EDF6FF",
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
