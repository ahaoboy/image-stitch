import { Button, Stack } from "@mui/material"
import { useTranslation } from "react-i18next"
import { useStore } from "../store"
import { JoinDirection } from "../types"
import { useCallback } from "react"

// Toolbar with action buttons — direction toggle swaps vertical/horizontal
export default function ButtonGroup() {
  const { t } = useTranslation()
  const direction = useStore((s) => s.config.direction)
  const uploadImage = useStore((s) => s.uploadImage)
  const reverseAll = useStore((s) => s.reverseAll)
  const clearAll = useStore((s) => s.clearAll)
  const rotateAll = useStore((s) => s.rotateAll)
  const setConfig = useStore((s) => s.setConfig)

  const isVertical = direction === JoinDirection.Vertical

  const handleToggleDirection = useCallback(() => {
    setConfig({ direction: isVertical ? JoinDirection.Horizontal : JoinDirection.Vertical })
  }, [isVertical, setConfig])

  return (
    <Stack direction="row" sx={{ flexWrap: "wrap", gap: 1, py: 1 }}>
      <Button variant="outlined" size="small" onClick={() => uploadImage()}>
        {t("btn.add")}
      </Button>
      <Button variant="outlined" size="small" onClick={reverseAll}>
        {t("btn.reverseAll")}
      </Button>
      <Button variant="outlined" size="small" onClick={clearAll}>
        {t("btn.clearAll")}
      </Button>
      <Button variant="outlined" size="small" onClick={rotateAll}>
        {t("btn.rotateAll")}
      </Button>
      <Button variant="outlined" size="small" onClick={handleToggleDirection}>
        {isVertical ? t("btn.horizontal") : t("btn.vertical")}
      </Button>
    </Stack>
  )
}
