import { pipe } from "lena-ts"
import type { FilterList } from "lena-ts"

// Web Worker message handler for applying image filters
// Receives ImageData and a list of filter names, returns processed ImageData
self.addEventListener("message", (e: MessageEvent) => {
  const { data, filterList } = e.data as {
    data: ImageData
    filterList: FilterList
  }
  const imageData = pipe(data, filterList)
  self.postMessage({ data: imageData }, { transfer: [imageData.data.buffer] })
})
