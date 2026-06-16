import { set, get } from "idb-keyval"
import { JoinDirection, JoinAlign } from "../types"
import type { ConfigType } from "../types"
import { cloneDeep } from "lodash-es"

// Storage key for persisting config in IndexedDB
export const CONFIG_KEY = "__picstitch_config__"

// File input options for image upload dialog
export const IMAGE_UPLOAD_OPTION = {
  type: "file",
  accept: "image/*",
  multiple: "true",
}

// Default top crop position for images (85% from top)
export const INIT_COMMON_TOP = 0.85

// Default bottom crop position for images (98% from top)
export const INIT_COMMON_BOTTOM = 0.98

// Default left/right crop for images
export const INIT_COMMON_LEFT = 0
export const INIT_COMMON_RIGHT = 1

// Default output rotation angle
export const INIT_OUTPUT_DEGREE = 0

// Max/min display width for images
export const INIT_SIZE_MAX = 450
export const INIT_SIZE_MIN = 250

// Default JPG output quality
export const INIT_IMAGE_QUALITY = 85

// Filter options shown in the UI
export const FILTER_LIST: { key: string; name: string }[] = [
  { key: "grayscale", name: "Grayscale" },
  { key: "invert", name: "Invert" },
  { key: "canny", name: "Edge Detection" },
  { key: "mirror", name: "Mirror" },
  { key: "bigGaussian", name: "Blur" },
  { key: "thresholding", name: "Threshold" },
  { key: "cartoon", name: "Cartoon" },
]

// Default configuration for image joining
export const defaultConfig: ConfigType & { outputDebounceTime: number } = {
  direction: JoinDirection.Vertical,
  quality: INIT_IMAGE_QUALITY,
  autoOutput: true,
  commonTop: INIT_COMMON_TOP,
  commonBottom: INIT_COMMON_BOTTOM,
  commonRight: INIT_COMMON_RIGHT,
  commonLeft: INIT_COMMON_LEFT,
  outputDegree: INIT_OUTPUT_DEGREE,
  loading: false,
  bgColor: "rgba(233, 233, 233, 1)",
  align: JoinAlign.Center,
  prefix: "join_",
  outputDebounceTime: 1000,
}

// Backup of default config for reset
export const bkConfig = cloneDeep(defaultConfig)

// Save config to IndexedDB
export function saveConfig(config: ConfigType = defaultConfig): Promise<void> {
  return set(CONFIG_KEY, config)
}

// Load config from IndexedDB, merge with defaults
export async function loadConfig(): Promise<ConfigType> {
  const saved = await get<ConfigType>(CONFIG_KEY)
  if (saved) {
    Object.assign(defaultConfig, saved)
  }
  return defaultConfig as ConfigType
}
