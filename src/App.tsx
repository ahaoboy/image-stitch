import { useMemo } from "react"
import { ThemeProvider, createTheme, CssBaseline, useMediaQuery } from "@mui/material"
import type {} from "@mui/material/themeCssVarsAugmentation"
import MainPage from "./pages/MainPage"
import "./i18n"

// Extend MUI palette with custom overlay colors for image cards
declare module "@mui/material/styles" {
  interface Palette {
    overlay: {
      button: string
      mask: string
    }
  }
  interface PaletteOptions {
    overlay?: {
      button?: string
      mask?: string
    }
  }
}

function ThemedApp() {
  const prefersDarkMode = useMediaQuery("(prefers-color-scheme: dark)")

  const theme = useMemo(
    () =>
      createTheme({
        palette: {
          mode: prefersDarkMode ? "dark" : "light",
          overlay: prefersDarkMode
            ? { button: "rgba(255,255,255,0.12)", mask: "rgba(0,0,0,0.72)" }
            : { button: "rgba(0,0,0,0.45)", mask: "rgba(0,0,0,0.6)" },
        },
        components: {
          MuiAccordion: {
            defaultProps: { disableGutters: true, elevation: 0 },
          },
          MuiAccordionSummary: {
            styleOverrides: { root: { minHeight: 36 } },
          },
        },
      }),
    [prefersDarkMode],
  )

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <MainPage />
    </ThemeProvider>
  )
}

export default ThemedApp
