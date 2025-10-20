import { Box, Button, keyframes, Stack, Typography } from "@mui/material";
import PageWrapper from "../components/PageWrapper";
import LabeledTextField from "../components/LabeledTextField";
import ReactLogo from "../assets/react.svg";
import { Link } from "react-router";
import z from "zod";
import { useCallback, useState } from "react";
import { login } from "../services/auth";
import { AxiosError } from "axios";

const LoginSchema = z.object({
  email: z.email("유효한 이메일 주소를 입력해주세요."),
  password: z.string().min(8, "비밀번호는 최소 8자 이상이어야 합니다."),
});
type LoginFormData = z.infer<typeof LoginSchema>;

const SpinAnimation = keyframes`
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
`;

const Login = () => {
  const [values, setValues] = useState<LoginFormData>({
    email: "",
    password: "",
  });

  // 로그인 버튼 클릭
  const handleLoginButtonClick = useCallback(async () => {
    // 폼 유효성 검증
    const result = LoginSchema.safeParse(values);
    if (!result.success) {
      return;
    }

    // 로그인 API 호출
    try {
      const response = await login({
        email: values.email,
        password: values.password,
      });

      console.log("로그인 성공:", response);
    } catch (err: unknown) {
      if (err instanceof AxiosError) {
        console.error("- 상태 코드:", err.response?.status);
        console.error("- 에러 메시지:", err.response?.data?.message);
      }
    }
  }, [values]);

  return (
    <PageWrapper
      sx={{
        width: {
          xs: "90%",
          sm: "75%",
          md: "50%",
        },
        maxWidth: "800px",
        minWidth: {
          xs: 0,
          md: "550px",
        },
      }}
    >
      <Stack direction="row" justifyContent="space-between" gap={3}>
        {/* 로그인 폼 */}
        <Stack
          gap={3}
          width={{
            xs: "100%",
            md: "60%",
          }}
        >
          {/* 헤더 */}
          <Stack gap={1} alignItems="center">
            <Typography variant="h5">돌아오신 것을 환영해요!</Typography>
            <Typography variant="body1" color="text.secondary">
              놀라운 기능을 경험해보세요!
            </Typography>
          </Stack>

          {/* 이메일 입력란 */}
          <LabeledTextField
            label="이메일"
            type="email"
            required
            value={values.email}
            onChange={(e) =>
              setValues((prev) => ({ ...prev, email: e.target.value }))
            }
          />

          {/* 비밀번호 입력란 */}
          <LabeledTextField
            label="비밀번호"
            type="password"
            required
            value={values.password}
            onChange={(e) =>
              setValues((prev) => ({ ...prev, password: e.target.value }))
            }
          />

          {/* 로그인 버튼 */}
          <Button variant="contained" onClick={handleLoginButtonClick}>
            <Typography variant="subtitle1" fontWeight="bold">
              로그인
            </Typography>
          </Button>
          {/* 모바일용 회원가입 링크 */}
          <Stack
            display={{
              xs: "flex",
              md: "none",
            }}
            direction="row"
            alignItems="center"
            gap={1}
            flexWrap="wrap"
          >
            <Typography variant="body1" color="text.secondary">
              계정이 필요하신가요?
            </Typography>

            {/* 회원가입 링크 */}
            <Link
              to="/signup"
              style={{ textDecoration: "none", color: "#00A8FC" }}
            >
              <Typography variant="body1">가입하기</Typography>
            </Link>
          </Stack>
        </Stack>

        {/* 사이드 정보 */}
        <Stack
          display={{
            xs: "none",
            md: "flex",
          }}
          width="30%"
          justifySelf="stretch"
          justifyContent="space-between"
        >
          <Box
            component="img"
            src={ReactLogo}
            height="40%"
            sx={{
              animation: `${SpinAnimation} 10s linear infinite`,
            }}
          />

          <Stack alignItems="center" gap={1}>
            {/* 헤더 */}
            <Typography variant="h5">계정 생성하기</Typography>

            {/* 설명 */}
            <Typography variant="body1" color="text.secondary">
              간단한 과정을 통해 새로운 계정을 생성해보세요.
            </Typography>

            {/* 회원가입 링크 */}
            <Link
              to="/signup"
              style={{ textDecoration: "none", color: "#00A8FC" }}
            >
              <Typography variant="body1">가입하기</Typography>
            </Link>
          </Stack>
        </Stack>
      </Stack>
    </PageWrapper>
  );
};

export default Login;
