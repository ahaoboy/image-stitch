import md5 from "md5"
import { nanoid } from "nanoid"
import type { ImageItem } from "../types"
import { ImageType } from "../types"
import { fileToBuffer, bitToString, getImg, imgToImageData } from "../utils"
import { INIT_COMMON_BOTTOM, INIT_COMMON_TOP } from "../config"
import { getImgById, setImg, getImgUrl, setImgUrl, setImageData } from "../gl-join/cache"

// Create an ImageItem from a File object
export const getImageItem = async (file: File, index = 0): Promise<ImageItem> => {
  const buffer = await fileToBuffer(file)
  if (!buffer) {
    throw new Error("getImageItem: buffer is null")
  }

  // MD5 hash as unique identifier for deduplication
  const id = md5(new Uint8Array(buffer))

  // Determine file type from extension
  const ext = file.name.split(".").pop()?.toLowerCase() || "jpg"
  const fileType = ["jpg", "jpeg"].includes(ext) ? ImageType.jpg : ImageType.png

  const fileName = file.name.split(".").slice(0, -1).join("_")

  const image: ImageItem = {
    index,
    id,
    degree: 0,
    height: 0,
    width: 0,
    filters: [],
    name: fileName,
    fileType,
    // First image uses full range, others use common defaults
    top: index === 0 ? 0 : INIT_COMMON_TOP,
    bottom: index === 0 ? 1 : INIT_COMMON_BOTTOM,
    left: 0,
    right: 1,
    specialLR: false,
    specialTB: index === 0,
    size: bitToString(file.size),
    random: nanoid(),
    loading: false,
  }

  // Use cached URL if available, otherwise create a new one
  const url = getImgUrl(image) || URL.createObjectURL(file)
  const img = (getImgById(image) || (await getImg(url)))!
  const imageData = imgToImageData(img)

  setImageData(image, imageData)
  image.width = img.width
  image.height = img.height
  setImg(image, img)
  setImgUrl(image, url)
  setImageData(image, imageData)

  return image
}
