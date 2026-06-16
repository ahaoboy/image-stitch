import { create } from "zustand"
import type { ImageItem, JoinConfig } from "../types"
import { defaultConfig, IMAGE_UPLOAD_OPTION } from "../config"
import { uploadFile } from "../utils"
import { getImageItem } from "./common"
import { degreeAdd, rotationImage } from "../gl-join/common"
import { getImgById, getImgUrl, setImg, setImgUrl } from "../gl-join/cache"

// Store state shape
export interface StoreState {
  imageList: ImageItem[]
  config: JoinConfig
  activeCardIndex: number

  // Actions
  uploadImage: (index?: number) => Promise<void>
  rotateAll: () => Promise<void>
  resetConfig: () => void
  reverseAll: () => void
  clearAll: () => void
  setActiveCardIndex: (index: number) => void
  setConfig: (config: Partial<JoinConfig>) => void
  setImageList: (imageList: ImageItem[]) => void
}

// Create Zustand store
export const useStore = create<StoreState>((set, get) => ({
  imageList: [],
  config: { ...defaultConfig, outputDebounceTime: 1000 } as JoinConfig,
  activeCardIndex: -1,

  // Upload one or more images at the given position
  uploadImage: async (index?: number) => {
    const state = get()
    const insertIndex = index ?? state.imageList.length
    const files = await uploadFile(IMAGE_UPLOAD_OPTION)
    set((s) => ({ config: { ...s.config, loading: true } }))

    const itemList = await Promise.all(files.map((file, k) => getImageItem(file, insertIndex + k)))

    const newList = [...get().imageList]
    newList.splice(insertIndex, 0, ...itemList)
    set({ imageList: newList, config: { ...get().config, loading: false } })
  },

  // Rotate all images by 90 degrees
  rotateAll: async () => {
    const { imageList } = get()

    const rotateList = await Promise.all(
      imageList.map(async (item) => {
        const w = item.width
        const h = item.height
        const img = getImgById({ ...item, degree: 0 })
        if (!img) return { w, h, degree: item.degree }

        const degree = degreeAdd(item.degree, 90)
        const newItem = { ...item, degree }

        if (getImgUrl(newItem)) {
          return { w: h, h: w, degree }
        }

        const { image, url } = await rotationImage(img, degree)
        setImg(newItem, image)
        setImgUrl(newItem, url)
        return { w: h, h: w, degree }
      }),
    )

    const newList = imageList.map((item, i) => ({
      ...item,
      width: rotateList[i].w,
      height: rotateList[i].h,
      degree: rotateList[i].degree,
    }))
    set({ imageList: newList })
  },

  // Reset config to defaults
  resetConfig: () => {
    set({ config: { ...defaultConfig, outputDebounceTime: 1000 } as JoinConfig })
  },

  // Reverse the order of all images
  reverseAll: () => {
    set((s) => ({ imageList: [...s.imageList].reverse() }))
  },

  // Clear all images
  clearAll: () => {
    set({ imageList: [] })
  },

  setActiveCardIndex: (index: number) => {
    set({ activeCardIndex: index })
  },

  setConfig: (partial: Partial<JoinConfig>) => {
    set((s) => ({ config: { ...s.config, ...partial } }))
  },

  setImageList: (imageList: ImageItem[]) => {
    set({ imageList })
  },
}))
