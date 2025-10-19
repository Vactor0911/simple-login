import {
  Stack,
  TextField,
  Typography,
  type TextFieldProps,
} from "@mui/material";

const LabeledTextField = (props: TextFieldProps) => {
  const { label, required, ...others } = props;

  return (
    <Stack gap={0.5}>
      <Stack direction="row" gap={0.5}>
        {/* 라벨 */}
        <Typography variant="caption" color="text.secondary" fontWeight="bold">
          {label}
        </Typography>

        {/* 필수 여부 */}
        <Typography variant="caption" color="error" fontWeight="bold">
          {required ? "*" : ""}
        </Typography>
      </Stack>

      <TextField
        {...others}
        slotProps={{
          input: {
            sx: {
              background: "#1e1f22",
              "& input:-webkit-autofill": {
                WebkitBoxShadow: "0 0 0 100px #1e1f22 inset",
                WebkitTextFillColor: "white",
                color: "white",
              },
            },
          },
          htmlInput: {
            style: {
              padding: 10,
              caretColor: "white",
            },
          },
        }}
      />
    </Stack>
  );
};

export default LabeledTextField;
