import { Stack, Typography } from "@mui/material";

const ImageWatermark = () => {
  return (
    <Stack direction="row" gap={0.5} position="fixed" bottom={8} right={8}>
      <Typography variant="body2" color="text.secondary">
        Designed by
      </Typography>

      {/* Freepik 링크 */}
      <Typography
        component="a"
        href="https://www.freepik.com/"
        target="_blank"
        variant="body2"
        sx={{
          textDecoration: "none",
          color: "secondary.main",
        }}
      >
        Freepik
      </Typography>
    </Stack>
  );
};

export default ImageWatermark;
