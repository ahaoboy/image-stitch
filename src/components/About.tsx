import {
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Typography,
  Slider,
  Switch,
  RadioGroup,
  FormControlLabel,
  Radio,
  TextField,
  Button,
  Box,
  Stack,
  ToggleButtonGroup,
  ToggleButton,
} from "@mui/material"
import { ExpandMore as ExpandMoreIcon } from "@mui/icons-material"
import { useTranslation } from "react-i18next"
import { useStore } from "../store"
import { JoinDirection, JoinAlign } from "../types"
import { saveConfig } from "../config"

// Configuration panel
export default function About() {
  const { t, i18n } = useTranslation()
  const config = useStore((s) => s.config)
  const setConfig = useStore((s) => s.setConfig)
  const resetConfig = useStore((s) => s.resetConfig)

  return (
    <Box>
      <Accordion>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Typography variant="subtitle2" sx={{ fontWeight: "bold" }}>
            {t("about.config")}
          </Typography>
        </AccordionSummary>
        <AccordionDetails>
          <Stack sx={{ gap: 2.5 }}>
            {/* Language */}
            <Stack direction="row" sx={{ alignItems: "center", justifyContent: "space-between" }}>
              <Typography variant="body2" color="text.secondary">
                {t("about.language")}
              </Typography>
              <ToggleButtonGroup
                size="small"
                value={i18n.language.split("-")[0]}
                exclusive
                onChange={(_, lang) => {
                  if (lang) i18n.changeLanguage(lang)
                }}
              >
                <ToggleButton value="en">EN</ToggleButton>
                <ToggleButton value="zh">中文</ToggleButton>
              </ToggleButtonGroup>
            </Stack>

            {/* Quality */}
            <Box>
              <Stack
                direction="row"
                sx={{ justifyContent: "space-between", alignItems: "baseline" }}
              >
                <Typography variant="body2" color="text.secondary">
                  {t("config.quality")}
                </Typography>
                <Typography variant="body2" sx={{ fontWeight: "medium" }}>
                  {config.quality}
                </Typography>
              </Stack>
              <Slider
                size="small"
                min={50}
                max={100}
                value={config.quality}
                onChange={(_, v) => {
                  const val = v as number
                  setConfig({ quality: val })
                  saveConfig({ ...config, quality: val })
                }}
              />
            </Box>

            {/* Auto output */}
            <Stack direction="row" sx={{ alignItems: "center", justifyContent: "space-between" }}>
              <Typography variant="body2" color="text.secondary">
                {t("config.auto")}
              </Typography>
              <Switch
                size="small"
                checked={config.autoOutput}
                onChange={(_, v) => {
                  setConfig({ autoOutput: v })
                  saveConfig({ ...config, autoOutput: v })
                }}
              />
            </Stack>

            {/* Direction */}
            <Box>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                {t("config.direction")}
              </Typography>
              <RadioGroup
                row
                value={config.direction}
                onChange={(_, v) => {
                  const dir = parseInt(v) as JoinDirection
                  setConfig({ direction: dir })
                  saveConfig({ ...config, direction: dir })
                }}
              >
                <FormControlLabel
                  value={JoinDirection.Vertical}
                  control={<Radio size="small" />}
                  label={t("config.directionV")}
                />
                <FormControlLabel
                  value={JoinDirection.Horizontal}
                  control={<Radio size="small" />}
                  label={t("config.directionH")}
                />
              </RadioGroup>
            </Box>

            {/* Alignment */}
            <Box>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                {t("config.align")}
              </Typography>
              <RadioGroup
                row
                value={config.align}
                onChange={(_, v) => {
                  const align = parseInt(v) as JoinAlign
                  setConfig({ align })
                  saveConfig({ ...config, align })
                }}
              >
                <FormControlLabel
                  value={JoinAlign.Top}
                  control={<Radio size="small" />}
                  label={t("config.alignL")}
                />
                <FormControlLabel
                  value={JoinAlign.Center}
                  control={<Radio size="small" />}
                  label={t("config.alignC")}
                />
                <FormControlLabel
                  value={JoinAlign.Bottom}
                  control={<Radio size="small" />}
                  label={t("config.alignR")}
                />
              </RadioGroup>
            </Box>

            {/* Filename prefix */}
            <TextField
              size="small"
              fullWidth
              label={t("config.prefix")}
              value={config.prefix}
              onChange={(e) => {
                setConfig({ prefix: e.target.value })
                saveConfig({ ...config, prefix: e.target.value })
              }}
            />

            {/* Reset */}
            <Button
              variant="outlined"
              size="small"
              color="error"
              fullWidth
              onClick={() => {
                resetConfig()
                saveConfig()
              }}
            >
              {t("config.reset")}
            </Button>
          </Stack>
        </AccordionDetails>
      </Accordion>
    </Box>
  )
}
