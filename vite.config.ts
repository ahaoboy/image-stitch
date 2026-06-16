import { defineConfig } from "vite"
import react from "@vitejs/plugin-react"
import { visualizer } from "rollup-plugin-visualizer"

const isDev = process.env["NODE_ENV"] === "development"

// https://vite.dev/config/
export default defineConfig({
  base: "/image-stitch/",
  plugins: [
    react(),
    ...(process.env["ANALYZE"] ? [visualizer({ open: true, gzipSize: true })] : []),
  ],
  resolve: {
    alias: isDev
      ? {}
      : {
        react: "https://esm.sh/react@19",
        "react-dom": "https://esm.sh/react-dom@19",
        "@mui/material": "https://esm.sh/@mui/material@9?standalone",
        "@mui/icons-material": "https://esm.sh/@mui/icons-material@9",
        "@emotion/react": "https://esm.sh/@emotion/react@11",
        "@emotion/styled": "https://esm.sh/@emotion/styled@11",
        zustand: "https://esm.sh/zustand@5",
        i18next: "https://esm.sh/i18next@26",
        "react-i18next": "https://esm.sh/react-i18next@17",
        "lodash-es": "https://esm.sh/lodash-es@4",
        nanoid: "https://esm.sh/nanoid@5",
        md5: "https://esm.sh/md5@2",
        "idb-keyval": "https://esm.sh/idb-keyval@6",
        "lena-ts": "https://esm.sh/lena-ts@0.1",
        regl: "https://esm.sh/regl@2",
      },
  }
})
