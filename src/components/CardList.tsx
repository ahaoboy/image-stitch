import { useEffect, useCallback } from "react"
import { Box } from "@mui/material"
import { useTranslation } from "react-i18next"
import Card from "./Card"
import { useStore } from "../store"
import { degreeAdd, rotationImage } from "../gl-join/common"
import { getImgById, getImgUrl, setImg, setImgUrl } from "../gl-join/cache"
import { getFilterImage } from "../gl-join/filter"
import type { FilterType, ImageItem } from "../types"
import { cloneDeep } from "lodash-es"

// CardList displays all image cards and handles operations on them
export default function CardList() {
  const { t } = useTranslation()
  const imageList = useStore((s) => s.imageList)
  const activeCardIndex = useStore((s) => s.activeCardIndex)
  const setImageList = useStore((s) => s.setImageList)
  const setActiveCardIndex = useStore((s) => s.setActiveCardIndex)

  // Keyboard: select the card whose element has focus
  useEffect(() => {
    const handler = (e: Event) => {
      const card = (e.target as HTMLElement)?.closest?.("[data-card-index]")
      if (card) {
        const idx = parseInt(card.getAttribute("data-card-index")!)
        if (!isNaN(idx)) setActiveCardIndex(idx)
      }
    }
    document.addEventListener("focusin", handler)
    return () => document.removeEventListener("focusin", handler)
  }, [setActiveCardIndex])

  // Delete image at index
  const handleDelete = useCallback(
    (index: number) => {
      const newList = [...imageList]
      newList.splice(index, 1)
      setImageList(newList)
    },
    [imageList, setImageList],
  )

  // Move image up
  const handleMoveUp = useCallback(
    (index: number) => {
      if (index <= 0) return
      const newList = [...imageList]
        ;[newList[index - 1], newList[index]] = [newList[index], newList[index - 1]]
      setImageList(newList)
    },
    [imageList, setImageList],
  )

  // Move image down
  const handleMoveDown = useCallback(
    (index: number) => {
      if (index >= imageList.length - 1) return
      const newList = [...imageList]
        ;[newList[index], newList[index + 1]] = [newList[index + 1], newList[index]]
      setImageList(newList)
    },
    [imageList, setImageList],
  )

  // Add image at position
  const handleAdd = useCallback((index: number) => {
    useStore.getState().uploadImage(index + 1)
  }, [])

  // Copy image at index
  const handleCopy = useCallback(
    (index: number) => {
      const newList = [...imageList]
      const copy = cloneDeep(imageList[index])
      // Give the copy a new random ID so it gets a new cache key
      import("nanoid").then(({ nanoid }) => {
        copy.random = nanoid()
        newList.splice(index + 1, 0, copy)
        setImageList(newList)
      })
    },
    [imageList, setImageList],
  )

  // Rotate a single image
  const handleRotation = useCallback(
    async (index: number, delta: number) => {
      const item = imageList[index]
      const w = item.width
      const h = item.height
      const img = getImgById({ ...item, degree: 0 })
      if (!img) return

      const newDegree = degreeAdd(item.degree, delta)
      const newItem: ImageItem = { ...item, degree: newDegree }

      if (getImgUrl(newItem)) {
        // Cached — just update dimensions
      } else {
        const result = await rotationImage(img, newDegree)
        setImg(newItem, result.image)
        setImgUrl(newItem, result.url)
      }

      const newList = [...imageList]
      newList[index] = {
        ...item,
        degree: newDegree,
        width: h,
        height: w,
      }
      setImageList(newList)
    },
    [imageList, setImageList],
  )

  // Apply/remove a filter on an image
  const handleFilterChange = useCallback(
    async (index: number, filter: FilterType) => {
      const item = imageList[index]
      const newFilters = item.filters.includes(filter)
        ? item.filters.filter((f) => f !== filter)
        : [...item.filters, filter]

      const newItem = { ...item, filters: newFilters, loading: true }
      const newList = [...imageList]
      newList[index] = newItem
      setImageList(newList)

      try {
        await getFilterImage(newItem)
        const updatedList = [...useStore.getState().imageList]
        updatedList[index] = { ...newItem, loading: false }
        setImageList(updatedList)
      } catch (err) {
        console.error("Filter error:", err)
        const revertedList = [...useStore.getState().imageList]
        revertedList[index] = { ...item, loading: false }
        setImageList(revertedList)
      }
    },
    [imageList, setImageList],
  )

  // Update split lines with batch propagation for non-special images
  const handleLineChange = useCallback(
    (
      index: number,
      type: string,
      lines: { top: number; bottom: number; left: number; right: number },
    ) => {
      const state = useStore.getState()
      const item = state.imageList[index]
      const newList = [...state.imageList]
      let configUpdate: Partial<typeof state.config> | null = null

      if (["left", "right"].includes(type)) {
        if (item.specialLR) {
          newList[index] = { ...item, left: lines.left, right: lines.right }
        } else {
          for (let i = 0; i < newList.length; i++) {
            if (!newList[i].specialLR) {
              newList[i] = { ...newList[i], left: lines.left, right: lines.right }
            }
          }
          configUpdate = { commonLeft: lines.left, commonRight: lines.right }
        }
      } else {
        if (item.specialTB) {
          newList[index] = { ...item, top: lines.top, bottom: lines.bottom }
        } else {
          for (let i = 0; i < newList.length; i++) {
            if (!newList[i].specialTB) {
              newList[i] = { ...newList[i], top: lines.top, bottom: lines.bottom }
            }
          }
          configUpdate = { commonTop: lines.top, commonBottom: lines.bottom }
        }
      }

      // Atomic update: combine imageList + config into single state transition
      if (configUpdate) {
        useStore.setState((s) => ({
          imageList: newList,
          config: { ...s.config, ...configUpdate },
        }))
      } else {
        useStore.setState({ imageList: newList })
      }
    },
    [],
  )

  // Toggle special mode for split lines
  const handleChangeSpecial = useCallback(
    (index: number, type: "lr" | "tb") => {
      const newList = [...imageList]
      if (type === "lr") {
        newList[index] = { ...newList[index], specialLR: !newList[index].specialLR }
      } else {
        newList[index] = { ...newList[index], specialTB: !newList[index].specialTB }
      }
      setImageList(newList)
    },
    [imageList, setImageList],
  )

  // Change index (reorder by position input)
  const handleIndexChange = useCallback(
    (oldIndex: number, newIndex: number) => {
      if (newIndex < 0 || newIndex >= imageList.length || newIndex === oldIndex) return
      const newList = [...imageList]
      const [item] = newList.splice(oldIndex, 1)
      newList.splice(newIndex, 0, item)
      setImageList(newList)
    },
    [imageList, setImageList],
  )

  if (!imageList.length) {
    return <Box sx={{ p: 3, textAlign: "center", color: "text.secondary" }}>{t("btn.add")}</Box>
  }

  return (
    <Box>
      {imageList.map((image, idx) => (
        <Box key={image.random} data-card-index={idx}>
          <Card
            image={image}
            index={idx}
            length={imageList.length}
            activeCardIndex={activeCardIndex}
            onSelect={() => setActiveCardIndex(idx)}
            onDelete={() => handleDelete(idx)}
            onMoveUp={() => handleMoveUp(idx)}
            onMoveDown={() => handleMoveDown(idx)}
            onAdd={() => handleAdd(idx)}
            onCopy={() => handleCopy(idx)}
            onRotation={handleRotation}
            onFilterChange={handleFilterChange}
            onLineChange={handleLineChange}
            onChangeSpecial={handleChangeSpecial}
            onIndexChange={handleIndexChange}
          />
        </Box>
      ))}
    </Box>
  )
}
