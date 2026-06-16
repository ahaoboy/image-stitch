import { Box, Stack, Divider } from "@mui/material"
import ButtonGroup from "../components/ButtonGroup"
import CardList from "../components/CardList"
import OutputCard from "../components/OutputCard"
import About from "../components/About"

export default function MainPage() {
  return (
    <Stack direction="row" sx={{ width: "100vw", height: "100vh", overflow: "hidden" }}>
      <Box sx={{ width: "50%", p: 2, pl: 3, overflowY: "auto", overflowX: "hidden" }}>
        <About />
        <ButtonGroup />
        <Divider sx={{ my: 1 }} />
        <CardList />
      </Box>
      <Box sx={{ width: "50%", borderLeft: 1, borderColor: "divider" }}>
        <OutputCard />
      </Box>
    </Stack>
  )
}
