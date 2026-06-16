import { useState, useRef, useCallback, useEffect } from "react"
import { Box, IconButton, Tooltip, Badge, Button, TextField, Chip } from "@mui/material"
import {
  Refresh as RotateRightIcon,
  Delete as DeleteIcon,
  KeyboardArrowUp as ArrowUpIcon,
  KeyboardArrowDown as ArrowDownIcon,
  Add as AddIcon,
  ContentCopy as CopyIcon,
  SwapHoriz as SwapHorizIcon,
  SwapVert as SwapVertIcon,
  AutoFixHigh as FilterIcon,
} from "@mui/icons-material"
import { useTranslation } from "react-i18next"
import { clamp } from "lodash-es"
import { isPC } from "../gl-join/common"
import { getImgUrl } from "../gl-join/cache"
import { filterList } from "../gl-join/filter"
import type { ImageItem, FilterType } from "../types"

interface CardProps {
  image: ImageItem
  index: number
  length: number
  activeCardIndex: number
  onSelect: () => void
  onDelete: () => void
  onMoveUp: () => void
  onMoveDown: () => void
  onAdd: () => void
  onCopy: () => void
  onRotation: (index: number, degree: number) => void
  onFilterChange: (index: number, filter: FilterType) => void
  onLineChange: (
    index: number,
    type: string,
    lines: { top: number; bottom: number; left: number; right: number },
  ) => void
  onChangeSpecial: (index: number, type: "lr" | "tb") => void
  onIndexChange: (index: number, newIndex: number) => void
}

interface DragState {
  type: string
  startPageX: number
  startPageY: number
  startTop: number
  startBottom: number
  startLeft: number
  startRight: number
  lastClickTime: number
}

function eventPos(e: MouseEvent | TouchEvent | React.MouseEvent | React.TouchEvent) {
  if ("touches" in e) return { pageX: e.touches[0].pageX, pageY: e.touches[0].pageY }
  return { pageX: e.pageX, pageY: e.pageY }
}

export default function Card({
  image,
  index,
  length,
  activeCardIndex,
  onSelect,
  onDelete,
  onMoveUp,
  onMoveDown,
  onAdd,
  onCopy,
  onRotation,
  onFilterChange,
  onChangeSpecial,
  onLineChange,
  onIndexChange,
}: CardProps) {
  const { t } = useTranslation()
  const [localIndex, setLocalIndex] = useState(index)
  const cardRef = useRef<HTMLDivElement>(null)
  const dragRef = useRef<DragState | null>(null)
  const dragActiveRef = useRef("")
  const lastClickRef = useRef({ time: 0, type: "" })

  const isActive = activeCardIndex === index
  const showFilter = isPC()
  const imageUrl = getImgUrl(image) || ""
  const imgId = `img_${image.random}`

  useEffect(() => {
    setLocalIndex(index)
  }, [index])

  const handleMove = useCallback(
    (e: MouseEvent | TouchEvent) => {
      const drag = dragRef.current
      if (!drag) return
      e.preventDefault()
      const imgEl = cardRef.current?.querySelector<HTMLImageElement>(`#${imgId}`)
      if (!imgEl) return
      const { pageX, pageY } = eventPos(e)
      const h = imgEl.offsetHeight
      const w = imgEl.offsetWidth
      let top = drag.startTop,
        bottom = drag.startBottom,
        left = drag.startLeft,
        right = drag.startRight
      const minGap = 0.02
      switch (drag.type) {
        case "up":
          top = clamp(top + (pageY - drag.startPageY) / h, 0, bottom - minGap)
          break
        case "down":
          bottom = clamp(bottom + (pageY - drag.startPageY) / h, top + minGap, 1)
          break
        case "left":
          left = clamp(left + (pageX - drag.startPageX) / w, 0, right - minGap)
          break
        case "right":
          right = clamp(right + (pageX - drag.startPageX) / w, left + minGap, 1)
          break
      }
      onLineChange(index, drag.type, { top, bottom, left, right })
    },
    [index, imgId, onLineChange],
  )

  const handleUp = useCallback(() => {
    dragRef.current = null
  }, [])

  const startDrag = useCallback(
    (type: string) => (e: React.MouseEvent | React.TouchEvent) => {
      e.stopPropagation()
      e.preventDefault()
      const now = Date.now()
      const last = lastClickRef.current
      if (last.type === type && now - last.time < 300) {
        onChangeSpecial(index, ["left", "right"].includes(type) ? "lr" : "tb")
        lastClickRef.current = { time: now, type }
        return
      }
      lastClickRef.current = { time: now, type }
      const { pageX, pageY } = eventPos(e)
      dragRef.current = {
        type,
        startPageX: pageX,
        startPageY: pageY,
        startTop: image.top,
        startBottom: image.bottom,
        startLeft: image.left,
        startRight: image.right,
        lastClickTime: now,
      }
      dragActiveRef.current = type
      const pc = isPC()
      const moveEvt = pc ? "mousemove" : "touchmove"
      const upEvt = pc ? "mouseup" : "touchend"
      document.addEventListener(moveEvt, handleMove as EventListener, { passive: false })
      document.addEventListener(upEvt, handleUp)
      document.addEventListener(
        upEvt,
        () => {
          document.removeEventListener(moveEvt, handleMove as EventListener)
          document.removeEventListener(upEvt, handleUp)
        },
        { once: true },
      )
    },
    [image, index, onChangeSpecial, handleMove, handleUp],
  )

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      const type = dragActiveRef.current
      if (!type && (/^[0-9]$/.test(e.key) || e.key === "Enter" || e.key === "Tab")) return
      if (!type) return
      const step = 0.005,
        gap = 0.01
      let { top, bottom, left, right } = image
      switch (e.key) {
        case "w":
        case "ArrowUp":
          if (type === "up") top = clamp(top - step, 0, bottom - gap)
          else if (type === "down") bottom = clamp(bottom - step, top + gap, 1)
          break
        case "s":
        case "ArrowDown":
          if (type === "up") top = clamp(top + step, 0, bottom - gap)
          else if (type === "down") bottom = clamp(bottom + step, top + gap, 1)
          break
        case "a":
        case "ArrowLeft":
          if (type === "right") right = clamp(right - step, left + gap, 1)
          else if (type === "left") left = clamp(left - step, 0, right - gap)
          break
        case "d":
        case "ArrowRight":
          if (type === "right") right = clamp(right + step, left + gap, 1)
          else if (type === "left") left = clamp(left + step, 0, right - gap)
          break
        default:
          return
      }
      onLineChange(index, type, { top, bottom, left, right })
    },
    [image, index, onLineChange],
  )

  const topPct = `${image.top * 100}%`
  const bottomPct = `${image.bottom * 100}%`
  const leftPct = `${image.left * 100}%`
  const rightPct = `${image.right * 100}%`
  const dragging = dragRef.current !== null
  const dragType = dragRef.current?.type

  return (
    <Box
      id={`img_card_${image.random}`}
      ref={cardRef}
      tabIndex={0}
      onClick={onSelect}
      onKeyDown={handleKeyDown}
      sx={{
        position: "relative",
        my: 1.5,
        borderRadius: 2,
        overflow: "hidden",
        width: 1,
        lineHeight: 0,
        outline: isActive ? (t) => `2px solid ${t.palette.primary.main}` : "none",
        boxShadow: isActive
          ? (t) => `inset 0 10px 10px rgba(0,0,0,0.1), 0 0 15px ${t.palette.primary.main}`
          : undefined,
      }}
    >
      {/* Toolbar — absolute top-right */}
      <Box
        sx={(t) => ({
          position: "absolute",
          right: 0,
          top: 0,
          zIndex: 999,
          display: "flex",
          flexWrap: "wrap",
          gap: 0.25,
          p: "2px 4px",
          alignItems: "center",
          color: "common.white",
          bgcolor: t.palette.overlay.button,
          borderRadius: 1,
        })}
      >
        <Chip
          label={String(image.size)}
          size="small"
          sx={(t) => ({
            bgcolor: t.palette.overlay.mask,
            color: "#fff",
            fontSize: 11,
            height: 22,
          })}
        />

        {showFilter && (
          <Tooltip
            title={
              <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5, maxWidth: 280 }}>
                {filterList.map((f) => {
                  const active = image.filters.includes(f.key)
                  const idx = image.filters.indexOf(f.key)
                  return (
                    <Badge
                      key={f.key}
                      badgeContent={active ? idx + 1 : 0}
                      color="primary"
                      invisible={!active}
                    >
                      <Button
                        size="small"
                        variant={active ? "contained" : "outlined"}
                        onMouseDown={(e) => {
                          e.preventDefault()
                          onFilterChange(index, f.key)
                        }}
                        sx={{ fontSize: 11 }}
                      >
                        {t(`filter.${f.key}`)}
                      </Button>
                    </Badge>
                  )
                })}
              </Box>
            }
          >
            <span>
              <IconButton size="small">
                <FilterIcon fontSize="small" />
              </IconButton>
            </span>
          </Tooltip>
        )}

        <Tooltip title={t("imageItem.rotateRight")}>
          <span>
            <IconButton
              size="small"
              onMouseDown={(e) => {
                e.preventDefault()
                onRotation(index, 90)
              }}
            >
              <RotateRightIcon fontSize="small" />
            </IconButton>
          </span>
        </Tooltip>
        <Tooltip title={t("imageItem.rotateLeft")}>
          <span>
            <IconButton
              size="small"
              onMouseDown={(e) => {
                e.preventDefault()
                onRotation(index, -90)
              }}
              sx={{ transform: "scaleX(-1)" }}
            >
              <RotateRightIcon fontSize="small" />
            </IconButton>
          </span>
        </Tooltip>

        <Tooltip title={t("imageItem.lr")}>
          <span>
            <IconButton
              size="small"
              onMouseDown={(e) => {
                e.preventDefault()
                onChangeSpecial(index, "lr")
              }}
              sx={(t) => ({
                border: 1,
                borderColor: image.specialLR ? t.palette.primary.main : t.palette.error.main,
              })}
            >
              <SwapHorizIcon
                fontSize="small"
                sx={(t) => ({
                  color: image.specialLR ? t.palette.primary.main : t.palette.error.main,
                })}
              />
            </IconButton>
          </span>
        </Tooltip>

        <Tooltip title={t("imageItem.tb")}>
          <span>
            <IconButton
              size="small"
              onMouseDown={(e) => {
                e.preventDefault()
                onChangeSpecial(index, "tb")
              }}
              sx={(t) => ({
                border: 1,
                borderColor: image.specialTB ? t.palette.primary.main : t.palette.error.main,
              })}
            >
              <SwapVertIcon
                fontSize="small"
                sx={(t) => ({
                  color: image.specialTB ? t.palette.primary.main : t.palette.error.main,
                })}
              />
            </IconButton>
          </span>
        </Tooltip>

        <Tooltip title={t("imageItem.delete")}>
          <span>
            <IconButton
              size="small"
              onMouseDown={(e) => {
                e.preventDefault()
                onDelete()
              }}
            >
              <DeleteIcon fontSize="small" />
            </IconButton>
          </span>
        </Tooltip>
        {index > 0 && (
          <Tooltip title={t("imageItem.up")}>
            <span>
              <IconButton
                size="small"
                onMouseDown={(e) => {
                  e.preventDefault()
                  onMoveUp()
                }}
              >
                <ArrowUpIcon fontSize="small" />
              </IconButton>
            </span>
          </Tooltip>
        )}
        {index < length - 1 && (
          <Tooltip title={t("imageItem.down")}>
            <span>
              <IconButton
                size="small"
                onMouseDown={(e) => {
                  e.preventDefault()
                  onMoveDown()
                }}
              >
                <ArrowDownIcon fontSize="small" />
              </IconButton>
            </span>
          </Tooltip>
        )}
        <Tooltip title={t("imageItem.add")}>
          <span>
            <IconButton
              size="small"
              onMouseDown={(e) => {
                e.preventDefault()
                onAdd()
              }}
            >
              <AddIcon fontSize="small" />
            </IconButton>
          </span>
        </Tooltip>
        <Tooltip title={t("imageItem.copy")}>
          <span>
            <IconButton
              size="small"
              onMouseDown={(e) => {
                e.preventDefault()
                onCopy()
              }}
            >
              <CopyIcon fontSize="small" />
            </IconButton>
          </span>
        </Tooltip>

        <Tooltip title={t("imageItem.input")}>
          <TextField
            type="number"
            size="small"
            value={localIndex}
            onChange={(e) => setLocalIndex(parseInt(e.target.value) || 0)}
            onBlur={() => onIndexChange(index, localIndex)}
            onKeyDown={(e) => {
              if (e.key === "Enter") onIndexChange(index, localIndex)
            }}
            slotProps={{
              htmlInput: {
                sx: { width: 40, px: 0.5, textAlign: "center", fontSize: 12 },
              },
            }}
            sx={(t) => ({
              width: 56,
              "& .MuiInputBase-root": { bgcolor: t.palette.overlay.button },
            })}
          />
        </Tooltip>
      </Box>

      {/* Crop masks */}
      <Box
        sx={(t) => ({
          position: "absolute",
          top: 0,
          left: 0,
          height: topPct,
          width: 1,
          bgcolor: t.palette.overlay.mask,
          zIndex: 1,
          pointerEvents: "none",
        })}
      />
      <Box
        sx={(t) => ({
          position: "absolute",
          top: bottomPct,
          left: 0,
          height: `${(1 - image.bottom) * 100}%`,
          width: 1,
          bgcolor: t.palette.overlay.mask,
          zIndex: 1,
          pointerEvents: "none",
        })}
      />
      <Box
        sx={(t) => ({
          position: "absolute",
          top: 0,
          left: 0,
          width: leftPct,
          height: 1,
          bgcolor: t.palette.overlay.mask,
          zIndex: 1,
          pointerEvents: "none",
        })}
      />
      <Box
        sx={(t) => ({
          position: "absolute",
          top: 0,
          left: rightPct,
          width: `${(1 - image.right) * 100}%`,
          height: 1,
          bgcolor: t.palette.overlay.mask,
          zIndex: 1,
          pointerEvents: "none",
        })}
      />

      {/* Image */}
      <Box
        component="img"
        id={imgId}
        crossOrigin="anonymous"
        src={imageUrl}
        alt={image.name}
        sx={{ width: 1, display: "block" }}
      />

      {/* Split lines + drag thumbs */}
      {(["up", "down"] as const).map((type) => (
        <Box
          key={type}
          onMouseDown={startDrag(type)}
          onTouchStart={startDrag(type)}
          sx={(t) => ({
            position: "absolute",
            top: `calc(${type === "up" ? topPct : bottomPct})`,
            left: 0,
            right: 0,
            height: 0,
            borderTop: 3,
            borderColor: image.specialTB ? t.palette.primary.main : t.palette.error.main,
            zIndex: 1000,
          })}
        />
      ))}
      {(["left", "right"] as const).map((type) => (
        <Box
          key={type}
          onMouseDown={startDrag(type)}
          onTouchStart={startDrag(type)}
          sx={(t) => ({
            position: "absolute",
            left: `calc(${type === "left" ? leftPct : rightPct})`,
            top: 0,
            bottom: 0,
            width: 0,
            borderLeft: 3,
            borderColor: image.specialLR ? t.palette.primary.main : t.palette.error.main,
            zIndex: 1000,
          })}
        />
      ))}
      {(["up", "down"] as const).map((type) => (
        <Box
          key={`thumb-${type}`}
          onMouseDown={startDrag(type)}
          onTouchStart={startDrag(type)}
          sx={(t) => ({
            position: "absolute",
            top: `calc(${type === "up" ? topPct : bottomPct} - 7px)`,
            left: "50%",
            width: 16,
            height: 16,
            borderRadius: "50%",
            bgcolor:
              dragging && dragType === type
                ? image.specialTB
                  ? t.palette.primary.dark
                  : t.palette.error.dark
                : image.specialTB
                  ? t.palette.primary.main
                  : t.palette.error.main,
            border: 2,
            borderColor: image.specialTB ? t.palette.primary.main : t.palette.error.main,
            cursor: "row-resize",
            zIndex: 1000,
            userSelect: "none",
            transform: "translateX(-50%)",
          })}
        />
      ))}
      {(["left", "right"] as const).map((type) => (
        <Box
          key={`thumb-${type}`}
          onMouseDown={startDrag(type)}
          onTouchStart={startDrag(type)}
          sx={(t) => ({
            position: "absolute",
            left: `calc(${type === "left" ? leftPct : rightPct} - 7px)`,
            top: "50%",
            width: 16,
            height: 16,
            borderRadius: "50%",
            bgcolor:
              dragging && dragType === type
                ? image.specialLR
                  ? t.palette.primary.dark
                  : t.palette.error.dark
                : image.specialLR
                  ? t.palette.primary.main
                  : t.palette.error.main,
            border: 2,
            borderColor: image.specialLR ? t.palette.primary.main : t.palette.error.main,
            cursor: "col-resize",
            zIndex: 1000,
            userSelect: "none",
            transform: "translateY(-50%)",
          })}
        />
      ))}
    </Box>
  )
}

// Shared toolbar button style — references theme.palette.overlay.button
