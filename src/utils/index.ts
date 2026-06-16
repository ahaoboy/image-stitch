import { clamp } from "lodash-es"

// Generate a random integer in [low, high)
export function randomInt(low = 0, high = 10): number {
  return 0 | random(low, high)
}

// Generate a random float in [low, high)
export function random(low = 0, high = 10): number {
  return Math.random() * (high - low) + low
}

// Generate a random RGBA color array
export function randomColor(normalize = false): number[] {
  const c = [
    clamp(randomInt(0, 255), 0, 255),
    clamp(randomInt(0, 255), 0, 255),
    clamp(randomInt(0, 255), 0, 255),
    clamp(randomInt(100, 255), 0, 255),
  ]
  return normalize ? c.map((i) => i / 255) : c
}

// Inject a script tag into the document
export const injectScript = (
  url: string,
  { async = true, type = "text/javascript" } = {},
): Promise<void> => {
  const sc = document.createElement("script")
  sc.type = type
  sc.async = async
  const s = document.getElementsByTagName("script")[0]
  sc.src = url
  s.parentNode?.insertBefore(sc, s)
  return new Promise((r) => {
    sc.onload = () => r()
  })
}

// Sleep for a given number of milliseconds
export const sleep = (time: number): Promise<void> => new Promise((r) => setTimeout(r, time))

// Convert bytes to human-readable string (B/KB/MB)
export const bitToString = (size: number): string => {
  if (size < 1024) return size + "B"
  if (size < 1024 * 1024) return (size / 1024).toFixed(2).replace(/0+$/, "") + "KB"
  if (size < 1024 * 1024 * 1024) return (size / 1024 / 1024).toFixed(2).replace(/0+$/, "") + "MB"
  return "0B"
}

// Open a file picker dialog and return selected files
export const uploadFile = (options: Record<string, string> = {}): Promise<File[]> => {
  const input = document.createElement("input")
  for (const k in options) {
    input.setAttribute(k, options[k])
  }
  return new Promise<File[]>((r) => {
    input.addEventListener("change", () => {
      const files: File[] = Array.from(input.files || [])
      r(files)
    })
    input.click()
  })
}

// Read a file as ArrayBuffer
export const fileToBuffer = (file: Blob): Promise<ArrayBuffer | null> => {
  return new Promise<ArrayBuffer | null>((r) => {
    const reader = new FileReader()
    reader.onload = () => {
      const content = reader.result as ArrayBuffer | null
      if (!content) {
        r(null)
        return
      }
      r(content)
    }
    reader.readAsArrayBuffer(file)
  })
}

// Trigger a download of a URL as a file
export const downloadUrl = (url: string, name: string): void => {
  const link = document.createElement("a")
  link.href = url
  link.download = name
  link.click()
}

// Load an image from a URL
export const getImg = (url: string): Promise<HTMLImageElement> => {
  const img = new Image()
  img.src = url
  return new Promise<HTMLImageElement>((r) => {
    img.onload = () => r(img)
  })
}

// Parse "rgba(r, g, b, a)" string into normalized [0,1] array
export const rgbaToList = (rgb: string): [number, number, number, number] => {
  const normal = [255, 255, 255, 1]
  return rgb
    .slice(5, -1)
    .split(",")
    .map((v, k) => parseFloat(v.trim()) / normal[k]) as [number, number, number, number]
}

// Extract ImageData from an image or canvas element
export const imgToImageData = (img: HTMLImageElement | HTMLCanvasElement): ImageData => {
  if (img.nodeName === "CANVAS") {
    return (img as HTMLCanvasElement).getContext("2d")!.getImageData(0, 0, img.width, img.height)
  }
  const c = document.createElement("canvas")
  c.width = img.width
  c.height = img.height
  const ctx = c.getContext("2d")!
  ctx.drawImage(img, 0, 0)
  return ctx.getImageData(0, 0, img.width, img.height)
}

// Deep clone an ImageData object
export const cloneImageData = (data: ImageData): ImageData => {
  return new ImageData(new Uint8ClampedArray(data.data), data.width, data.height)
}
