import type { ImageItem, FilterType } from "../types"
import type { FilterList } from "lena-ts"
import { getSizeAndUrl } from "./common"
import { setImg, setImgUrl, getImageData, setImageData, imageDataCache, getId } from "./cache"
import FilterWorker from "./filter.worker?worker"

// Filter options available for image processing
export const filterList: { key: FilterType; name: string }[] = [
  { key: "bigGaussian", name: "Blur" },
  { key: "canny", name: "Edge Detection" },
  { key: "invert", name: "Invert" },
  { key: "mirror", name: "Mirror" },
  { key: "grayscale", name: "Grayscale" },
  { key: "thresholding", name: "Threshold" },
  { key: "cartoon", name: "Cartoon" },
]

// Apply filters to an image using a Web Worker
// Only applies new filters not yet cached, reusing previously computed results
export const getFilterImage = async (
  item: ImageItem,
): Promise<{ img: HTMLImageElement; url: string }> => {
  const keys = Object.keys(imageDataCache)

  // Find which filters are already cached
  const oldFilters: FilterType[] = []
  for (const f of item.filters) {
    if (keys.includes(getId({ ...item, filters: [...oldFilters, f] }))) {
      oldFilters.push(f)
    } else {
      break
    }
  }

  // Get the ImageData after already-applied filters
  const oldImageData = getImageData({
    ...item,
    filters: oldFilters,
  })
  if (!oldImageData) throw new Error("Missing cached ImageData")

  // Compute remaining filters in a Web Worker
  const remainingFilters: FilterList = item.filters.slice(oldFilters.length) as FilterList

  const newImageData = await new Promise<ImageData>((r) => {
    const worker = new FilterWorker()
    worker.onmessage = (e: MessageEvent) => {
      r(e.data.data as ImageData)
    }
    worker.postMessage({ data: oldImageData, filterList: remainingFilters }, [
      oldImageData.data.buffer,
    ])
  })

  // Render filtered ImageData to a canvas and produce a blob URL
  const canvas = document.createElement("canvas")
  canvas.width = newImageData.width
  canvas.height = newImageData.height
  canvas.getContext("2d")!.putImageData(newImageData, 0, 0)
  const { url } = await getSizeAndUrl(canvas)

  const newImg = new Image()
  newImg.src = url
  return new Promise<{ img: HTMLImageElement; url: string }>((r) => {
    newImg.onload = () => {
      setImg(item, newImg)
      setImgUrl(item, url)
      setImageData(item, newImageData)
      r({ url, img: newImg })
      canvas.remove()
    }
  })
}
