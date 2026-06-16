import type { ImageItem, JoinConfig } from "../types"
import { JoinDirection } from "../types"
import Regl from "regl"
import type IRegl from "regl"
import { getImgById, getTextureById, setTexture, setRegl } from "./cache"
import { rgbaToList } from "../utils"

// Regl configuration
const reglConfig = {}

// Uniforms passed to the shader
interface Uniforms {
  texture: IRegl.Texture
  degree: number
}

// Attributes for each vertex
interface Attributes {
  position: [number, number][]
  inUv: [number, number][]
}

// Props for each draw call
interface Props {
  degree: number
  inUv: [number, number][]
  texture: IRegl.Texture
  position: [number, number][]
  viewport: { x: number; y: number; width: number; height: number }
}

// Singleton Regl instance
let regl: Regl.Regl

// Get or create the Regl instance for a canvas
export const getRegl = (canvas: HTMLCanvasElement, width: number, height: number): Regl.Regl => {
  if (regl) return regl
  const gl = canvas.getContext("webgl", {
    antialias: false,
    stencil: true,
    preserveDrawingBuffer: true,
  })!
  regl = Regl({ gl, ...reglConfig })
  setRegl(regl, width, height)
  return regl
}

// Clear the canvas with a given color
export const clearCanvas = (
  canvas: HTMLCanvasElement,
  width: number,
  height: number,
  color: [number, number, number, number] = [0.9, 0.9, 0.9, 1],
): void => {
  const r = getRegl(canvas, width, height)
  r.clear({ color, depth: 1 })
}

// Calculate the total dimensions of the joined image
export const getJoinSize = (
  imageList: ImageItem[],
  option: JoinConfig,
): { width: number; height: number } => {
  let width = 0
  let height = 0
  for (const image of imageList) {
    const w = image.width * (image.right - image.left)
    const h = image.height * (image.bottom - image.top)
    if (option.direction === JoinDirection.Vertical) {
      width = Math.max(width, w)
      height += h
    } else {
      height = Math.max(height, h)
      width += w
    }
  }
  return { width, height }
}

// Cached draw command
let draw: Regl.DrawCommand

// Draw the list of images onto a canvas using WebGL
export const drawImageList = (
  canvas: HTMLCanvasElement,
  imageList: ImageItem[],
  option: JoinConfig,
): void => {
  const { outputDegree = 0 } = option
  const { width, height } = getJoinSize(imageList, option)

  // Set canvas dimensions (2:1 default for empty state)
  if (width && height) {
    canvas.width = width
    canvas.height = height
  } else {
    canvas.width = 2
    canvas.height = 1
  }

  const r = getRegl(canvas, width || 2, height || 1)
  const color = rgbaToList(option.bgColor)
  clearCanvas(canvas, width || 2, height || 1, color)

  // Compile the draw command once
  if (!draw) {
    draw = r<Uniforms, Attributes, Props>({
      frag: `precision highp float;
  uniform sampler2D texture;
  varying vec2 uv;
  void main () {
    gl_FragColor = texture2D(texture, uv);
  }`,

      vert: `precision highp float;
  attribute vec2 position;
  attribute vec2 inUv;
  uniform float degree;
  varying vec2 uv;
  void main () {
    uv = inUv;
    gl_Position = vec4(
      cos(degree) * position.x + sin(degree) * position.y,
      -sin(degree) * position.x + cos(degree) * position.y, 0, 1);
  }`,

      attributes: {
        position: r.prop<Props, "position">("position"),
        inUv: r.prop<Props, "inUv">("inUv"),
      },
      uniforms: {
        texture: r.prop<Props, "texture">("texture"),
        degree: r.prop<Props, "degree">("degree"),
      },
      count: 6,
      viewport: r.prop<Props, "viewport">("viewport"),
    })
  }

  if (!imageList.length) {
    return
  }

  // Check if output rotation swaps width/height (90° or 270°)
  const isRotated = (outputDegree / 90) % 2 === 1
  if (isRotated) {
    canvas.width = height
    canvas.height = width
  }

  // Build draw data for each image
  let dx = 0
  let dy = 0
  const itemList: Props[] = []

  for (const image of imageList) {
    const w = image.width * (image.right - image.left)
    const h = image.height * (image.bottom - image.top)

    // Get or create texture
    const texture =
      getTextureById(image) ||
      r.texture({
        data: getImgById(image)!,
        width: image.width,
        height: image.height,
      })
    setTexture(image, texture)

    const viewport = {
      x: 0,
      y: 0,
      width: isRotated ? height : width,
      height: isRotated ? width : height,
    }

    const inUv: [number, number][] = [
      [image.left, image.top],
      [image.right, image.top],
      [image.right, image.bottom],
      [image.left, image.top],
      [image.right, image.bottom],
      [image.left, image.bottom],
    ]

    const degreeRad = (outputDegree / 180) * Math.PI

    let position: [number, number][]

    if (option.direction === JoinDirection.Vertical) {
      // Vertical join: align horizontally based on alignment setting
      const gapX = (width - w) / width
      const alignDx = [-gapX, 0, +gapX][option.align]
      position = [
        [dx - w / 2, dy],
        [dx + w / 2, dy],
        [dx + w / 2, dy + h],
        [dx - w / 2, dy],
        [dx + w / 2, dy + h],
        [dx - w / 2, dy + h],
      ].map(([px, py]) => [(px * 2) / width + alignDx, 1 - (py * 2) / height]) as [number, number][]
      dy += h
    } else {
      // Horizontal join: align vertically based on alignment setting
      const gapY = (height - h) / height
      const alignDy = [gapY, 0, -gapY][option.align]
      position = [
        [dx, dy + h / 2],
        [dx + w, dy + h / 2],
        [dx + w, dy - h / 2],
        [dx, dy + h / 2],
        [dx + w, dy - h / 2],
        [dx, dy - h / 2],
      ].map(([px, py]) => [(px * 2) / width - 1, (py * 2) / height + alignDy]) as [number, number][]
      dx += w
    }

    itemList.push({
      position,
      inUv,
      texture,
      degree: degreeRad,
      viewport,
    })
  }

  draw(itemList)
}
