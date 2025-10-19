import { Button, Stack, Typography } from "@mui/material";
import PageWrapper from "../components/PageWrapper";
import LabeledTextField from "../components/LabeledTextField";
import { Link } from "react-router";

const Signup = () => {
  return (
    <PageWrapper
      sx={{
        width: {
          xs: "90%",
          sm: "50%",
          md: "30%",
        },
        maxWidth: "500px",
        minWidth: {
          xs: 0,
          md: "400px",
        },
      }}
    >
      <Stack gap={3}>
        <Typography variant="h5">계정 생성하기</Typography>

        <LabeledTextField label="이메일" type="email" required />

        <LabeledTextField label="사용자명" type="text" required />

        <LabeledTextField label="비밀번호" type="password" required />

        <LabeledTextField label="비밀번호 확인" type="password" required />

        <Button variant="contained">
          <Typography variant="subtitle1" fontWeight="bold">
            가입하기
          </Typography>
        </Button>

        <Link
          to="/login"
          style={{
            textDecoration: "none",
            color: "inherit",
            alignSelf: "flex-start",
          }}
        >
          <Typography variant="body2" color="secondary">
            이미 계정이 있으신가요?
          </Typography>
        </Link>
      </Stack>
    </PageWrapper>
  );
};

export default Signup;
