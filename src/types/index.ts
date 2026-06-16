// Image file type enum
export const ImageType = {
  png: "png",
  jpg: "jpg",
  webp: "webp",
} as const
export type ImageType = (typeof ImageType)[keyof typeof ImageType]

// Filter types available for image processing
export type FilterType =
  | "grayscale"
  | "bigGaussian"
  | "canny"
  | "invert"
  | "mirror"
  | "thresholding"
  | "cartoon"

// Represents a single image item in the stitch list
export interface ImageItem {
  width: number
  height: number
  degree: number // rotation degree (0, 90, 180, 270)
  name: string
  specialLR: boolean // whether left/right split lines use special mode
  specialTB: boolean // whether top/bottom split lines use special mode
  size: string | number // human-readable file size
  id: string // MD5 hash of file content
  top: number // top crop line (0-1 fraction)
  bottom: number // bottom crop line (0-1 fraction)
  left: number // left crop line (0-1 fraction)
  right: number // right crop line (0-1 fraction)
  fileType: ImageType
  index: number // position in the image list
  filters: FilterType[] // ordered list of applied filters
  random: string // unique ID (nanoid)
  loading: boolean // whether the image is being processed
}

// Direction for joining images
export const JoinDirection = {
  Vertical: 0,
  Horizontal: 1,
} as const
export type JoinDirection = (typeof JoinDirection)[keyof typeof JoinDirection]

// Alignment for image stitching
export const JoinAlign = {
  Top: 0,
  Center: 1,
  Bottom: 2,
} as const
export type JoinAlign = (typeof JoinAlign)[keyof typeof JoinAlign]

// Configuration for the join operation
export interface JoinConfig {
  direction: JoinDirection
  quality: number // output image quality (1-100)
  autoOutput: boolean // auto-generate output on changes
  commonBottom: number // default bottom crop for new images
  commonLeft: number // default left crop for new images
  commonTop: number // default top crop for new images
  commonRight: number // default right crop for new images
  loading: boolean // whether the app is in loading state
  outputDegree: number // overall output rotation
  prefix: string // download filename prefix
  bgColor: string // background color (rgba format)
  align: JoinAlign
  outputDebounceTime: number // debounce time for output updates (ms)
}

// Serializable config subset for persistence
export interface ConfigType {
  direction: JoinDirection
  quality: number
  autoOutput: boolean
  commonTop: number
  commonBottom: number
  commonRight: number
  commonLeft: number
  outputDegree: number
  loading: boolean
  bgColor: string
  align: JoinAlign
  prefix: string
}

export type ConfigKey = keyof ConfigType

// Plugin definition for the toolbar
export interface Plugin {
  name: string
  id: string
  init?: () => void
  invoke: () => void
}
