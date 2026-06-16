import type { ImageItem } from "../types"
import { cloneImageData } from "../utils"
import type Regl from "regl"

// Cache: derived ID -> HTMLImageElement
const imgCache: Record<string, HTMLImageElement> = {}

// Cache: derived ID -> Regl Texture
const textureCache: Record<string, Regl.Texture> = {}

// Cache: derived ID -> blob URL
const urlCache: Record<string, string> = {}

// Cache: derived ID -> ImageData
export const imageDataCache: Record<string, ImageData> = {}

// Cache: size key -> Regl instance
const reglCache: Record<string, Regl.Regl> = {}

// Cache: size key -> DrawCommand
export const drawCache: Record<string, Regl.DrawCommand> = {}

// Generate a unique cache key for an image item based on id, degree, and filters
export const getId = (item: ImageItem): string => {
  return [item.id, item.degree, ...Array.from(item.filters)].join("_")
}

// Get cached image element
export const getImgById = (item: ImageItem): HTMLImageElement | undefined => {
  return imgCache[getId(item)]
}

// Store image element in cache
export const setImg = (item: ImageItem, img: HTMLImageElement): void => {
  imgCache[getId(item)] = img
}

// Get cached texture
export const getTextureById = (item: ImageItem): Regl.Texture | undefined => {
  return textureCache[getId(item)]
}

// Store texture in cache
export const setTexture = (item: ImageItem, texture: Regl.Texture): void => {
  textureCache[getId(item)] = texture
}

// Get cached blob URL
export const getImgUrl = (item: ImageItem): string | undefined => {
  return urlCache[getId(item)]
}

// Store blob URL in cache
export const setImgUrl = (item: ImageItem, url: string): void => {
  urlCache[getId(item)] = url
}

// Get cached Regl instance by canvas dimensions
export const getReglBySize = (h: number, w: number): Regl.Regl | undefined => {
  return reglCache[`${h}_${w}`]
}

// Store Regl instance keyed by canvas dimensions
export const setRegl = (regl: Regl.Regl, h: number, w: number): void => {
  reglCache[`${h}_${w}`] = regl
}

// Get cached draw command by canvas dimensions
export const getDrawBySize = (h: number, w: number): Regl.DrawCommand | undefined => {
  return drawCache[`${h}_${w}`]
}

// Store draw command keyed by canvas dimensions
export const setDraw = (draw: Regl.DrawCommand, h: number, w: number): void => {
  drawCache[`${h}_${w}`] = draw
}

// Store ImageData in cache
export const setImageData = (item: ImageItem, imageData: ImageData): void => {
  imageDataCache[getId(item)] = imageData
}

// Get a cloned copy of cached ImageData
export const getImageData = (item: ImageItem): ImageData | undefined => {
  const data = imageDataCache[getId(item)]
  return data ? cloneImageData(data) : undefined
}
