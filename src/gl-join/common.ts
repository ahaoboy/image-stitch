import { bitToString, getImg } from "../utils"

// Check if a MIME type represents PNG or WebP
export const isPng = (type: string): boolean => {
  return ["image/png", "image/webp"].some((i) => type.includes(i))
}

// Check if the browser is Chrome
export const isChrome = (): boolean => {
  return navigator.userAgent.toLowerCase().includes("chrome")
}

// Check if the device is a PC (not mobile)
export const isPC = (): boolean => {
  return typeof window.orientation === "undefined"
}

// Add degrees with wrap-around at 360
export const degreeAdd = (d: number, dx: number): number => {
  return (d + dx + 360) % 360
}

// Convert a canvas to a Blob URL and get size info
export const getSizeAndUrl = async (
  canvas: HTMLCanvasElement,
  type = "jpg",
  q = 1,
): Promise<{
  url: string
  size: string
  width: number
  height: number
}> => {
  if (q > 1) q /= 100
  return new Promise((r) => {
    const option =
      type === "png"
        ? { type: "image/png" as const, quality: q }
        : { type: "image/jpeg" as const, quality: q }
    canvas.toBlob(
      (blob) => {
        r({
          url: URL.createObjectURL(blob!),
          size: bitToString(blob?.size || 0),
          width: canvas.width,
          height: canvas.height,
        })
      },
      option.type,
      option.quality,
    )
  })
}

// Scale dimensions to fit within a limit while preserving aspect ratio
export function scale(
  size: { width?: number; height?: number } = {},
  limit: number,
): { width: number; height: number } {
  const { width = 300, height = 300 } = size
  const r = limit / Math.max(height, width)
  return {
    width: r * width,
    height: r * height,
  }
}

// Rotate an image by a given degree and return the new image with its URL
export const rotationImage = async (
  img: HTMLImageElement,
  degree = 90,
): Promise<{ image: HTMLImageElement; url: string }> => {
  // Draw original image onto a canvas
  const image = document.createElement("canvas")
  image.width = img.width
  image.height = img.height
  image.getContext("2d")!.drawImage(img, 0, 0)

  const d = (degree * Math.PI) / 180
  const canvasWidth = image.width
  const canvasHeight = image.height
  const rotationCanvas = document.createElement("canvas")
  const direction = (degree / 90) % 4
  const ctx = rotationCanvas.getContext("2d")!

  if (direction === 0) {
    rotationCanvas.width = canvasWidth
    rotationCanvas.height = canvasHeight
    ctx.drawImage(image, 0, 0)
  } else if (direction === 1) {
    rotationCanvas.width = canvasHeight
    rotationCanvas.height = canvasWidth
    ctx.translate(rotationCanvas.width * 0.5, rotationCanvas.height * 0.5)
    ctx.rotate(d)
    ctx.drawImage(image, -rotationCanvas.height / 2, -rotationCanvas.width / 2)
  } else if (direction === 2) {
    rotationCanvas.width = canvasWidth
    rotationCanvas.height = canvasHeight
    ctx.translate(rotationCanvas.width * 0.5, rotationCanvas.height * 0.5)
    ctx.rotate(d)
    ctx.drawImage(image, -rotationCanvas.width / 2, -rotationCanvas.height / 2)
  } else if (direction === 3) {
    rotationCanvas.width = canvasHeight
    rotationCanvas.height = canvasWidth
    ctx.translate(rotationCanvas.width * 0.5, rotationCanvas.height * 0.5)
    ctx.rotate(d)
    ctx.drawImage(image, -rotationCanvas.height / 2, -rotationCanvas.width / 2)
  }

  const { url } = await getSizeAndUrl(rotationCanvas)
  const rotateImg = await getImg(url)
  return { image: rotateImg, url }
}
