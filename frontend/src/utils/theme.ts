import { createTheme, responsiveFontSizes } from "@mui/material";
import BackgroundImage from "/background.jpg";

// MUI 테마
export const theme = responsiveFontSizes(
  createTheme({
    palette: {
      primary: {
        main: "#5865F2",
      },
      secondary: {
        main: "#00A8FC",
      },
      text: {
        primary: "#ffffff",
        secondary: "#b0b0b0",
      },
    },
    typography: {
      fontFamily: ["Noto Sans KR", "sans-serif"].join(","),
      h1: {
        fontWeight: 700,
      },
      h2: {
        fontWeight: 700,
      },
      h3: {
        fontWeight: 700,
      },
      h4: {
        fontWeight: 700,
      },
      h5: {
        fontWeight: 700,
      },
      h6: {
        fontWeight: 700,
      },
    },
    components: {
      MuiCssBaseline: {
        styleOverrides: {
          body: {
            "&::before": {
              content: '""',
              position: "fixed",
              top: 0,
              left: 0,
              width: "100vw",
              height: "100vh",
              backgroundImage: `url(${BackgroundImage})`,
              backgroundSize: "cover",
              backgroundPosition: "center",
              backgroundRepeat: "no-repeat",
              filter: "blur(3px)",
              transform: "scale(1.05)",
            },
            height: "100vh",
          },
        },
      },
      MuiTypography: {
        defaultProps: {
          sx: {
            wordBreak: "keep-all",
            textWrap: "balance",
            textAlign: "center",
          },
        },
      },
      MuiButton: {
        defaultProps: {
          sx: {
            padding: "8px 16px",
          },
        },
      },
    },
  })
);
