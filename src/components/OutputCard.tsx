import { useRef, useEffect, useState, useCallback, useMemo } from "react"
import { Box, Button, IconButton, Tooltip, Typography, Stack } from "@mui/material"
import {
  Refresh as ResetIcon,
  RotateRight as RotateRightIcon,
  ThumbUp as ThumbIcon,
} from "@mui/icons-material"
import { useTranslation } from "react-i18next"
import { useStore } from "../store"
import { drawImageList } from "../gl-join"
import { downloadUrl } from "../utils"
import { getSizeAndUrl } from "../gl-join/common"
import { debounce } from "lodash-es"

export default function OutputCard() {
  const { t } = useTranslation()
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const imageList = useStore((s) => s.imageList)
  const config = useStore((s) => s.config)
  const setConfig = useStore((s) => s.setConfig)

  const [sizeJpg, setSizeJpg] = useState("")
  const [sizePng, setSizePng] = useState("")
  const [previewHorizontal, setPreviewHorizontal] = useState(false)

  const updateSize = useMemo(
    () =>
      debounce(async () => {
        const canvas = canvasRef.current
        if (!canvas) return
        const [jpg, png] = await Promise.all([
          getSizeAndUrl(canvas, "jpg", config.quality),
          getSizeAndUrl(canvas, "png", config.quality),
        ])
        setSizeJpg(jpg.size)
        setSizePng(png.size)
      }, config.outputDebounceTime),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  )

  const draw = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    drawImageList(canvas, imageList, config)
    const { width, height } = canvas
    setPreviewHorizontal(width / 4 > height)
    updateSize()
  }, [imageList, config, updateSize])

  useEffect(() => {
    draw()
  }, [draw])

  const handleRotateOutput = (degree: number) => setConfig({ outputDegree: degree })

  const handleDownload = async (type: "jpg" | "png") => {
    const canvas = canvasRef.current
    if (!canvas || !imageList.length) return
    const result = await getSizeAndUrl(canvas, type, config.quality)
    const filename = `${config.prefix}${imageList[0].name}.${type}`
    downloadUrl(result.url, filename)
  }

  const canRotate = imageList.length > 0

  return (
    <Stack sx={{ width: 1, height: 1 }}>
      {/* Header */}
      <Stack
        direction="row"
        sx={{ justifyContent: "space-between", alignItems: "center", px: 2, py: 1 }}
      >
        <Typography variant="subtitle1" sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
          {t("output.preview")}
          <ThumbIcon fontSize="small" sx={{ transform: "scaleY(-1)" }} />
        </Typography>
        <Stack direction="row" sx={{ gap: 0.5 }}>
          <Tooltip title={t("output.reset")}>
            <span>
              <IconButton
                disabled={!canRotate}
                size="small"
                onMouseDown={() => handleRotateOutput(0)}
              >
                <ResetIcon />
              </IconButton>
            </span>
          </Tooltip>
          <Tooltip title={t("output.rotateRight")}>
            <span>
              <IconButton
                disabled={!canRotate}
                size="small"
                onMouseDown={() => handleRotateOutput((config.outputDegree + 90) % 360)}
              >
                <RotateRightIcon />
              </IconButton>
            </span>
          </Tooltip>
          <Tooltip title={t("output.rotateLeft")}>
            <span>
              <IconButton
                disabled={!canRotate}
                size="small"
                onMouseDown={() => handleRotateOutput((config.outputDegree - 90 + 360) % 360)}
                sx={{ transform: "scaleX(-1)" }}
              >
                <RotateRightIcon />
              </IconButton>
            </span>
          </Tooltip>
        </Stack>
      </Stack>

      {/* Preview canvas */}
      <Box
        sx={{
          flex: 1,
          overflow: "auto",
          border: 2,
          borderColor: "divider",
          borderRadius: 2,
          mx: 2,
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          minHeight: 350,
          minWidth: 300,
          ...(previewHorizontal ? {} : { maxHeight: "calc(100vh - 300px)" }),
        }}
      >
        <Box
          component="canvas"
          ref={canvasRef}
          id="gl"
          sx={{
            display: "block",
            maxWidth: 1,
            ...(previewHorizontal
              ? { maxHeight: 600, minHeight: 300, height: "fit-content" }
              : { width: 1, height: "fit-content" }),
          }}
        />
      </Box>

      {/* Download buttons */}
      <Stack direction="row" sx={{ px: 2, py: 1, gap: 1 }}>
        <Button
          variant="contained"
          fullWidth
          disabled={!imageList.length}
          onClick={() => handleDownload("jpg")}
        >
          {t("output.jpg")} ({sizeJpg || "—"})
        </Button>
        <Button
          variant="contained"
          fullWidth
          disabled={!imageList.length}
          onClick={() => handleDownload("png")}
        >
          {t("output.png")} ({sizePng || "—"})
        </Button>
      </Stack>
    </Stack>
  )
}
