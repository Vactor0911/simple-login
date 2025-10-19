import { Button, Stack, Typography } from "@mui/material";
import PageWrapper from "../components/PageWrapper";
import LabeledTextField from "../components/LabeledTextField";
import { Link, useNavigate } from "react-router";
import { useCallback, useState } from "react";
import z from "zod";
import { signup } from "../services/auth";

const isLoginSchema = z
  .object({
    email: z.email("유효한 이메일 주소를 입력해주세요."),
    username: z.string().min(1, "사용자명을 입력해주세요."),
    password: z.string().min(8, "비밀번호는 최소 8자 이상이어야 합니다."),
    passwordConfirm: z
      .string()
      .min(8, "비밀번호 확인은 최소 8자 이상이어야 합니다."),
  })
  .superRefine(({ password, passwordConfirm }, ctx) => {
    if (password !== passwordConfirm) {
      ctx.addIssue({
        code: "custom",
        message: "비밀번호가 일치하지 않습니다.",
        path: ["passwordConfirm"],
      });
    }
  });

type LoginFormData = z.infer<typeof isLoginSchema>;

const Signup = () => {
  const navigate = useNavigate();

  const [values, setValues] = useState<LoginFormData>({
    email: "",
    username: "",
    password: "",
    passwordConfirm: "",
  });
  const [errors, setErrors] = useState<
    Partial<Record<keyof LoginFormData, string>>
  >({});

  // 각 필드 블러 시 입력값 검증
  const handleBlur = useCallback(
    (field: keyof LoginFormData) => {
      // 해당 필드만 검증
      const fieldSchema = isLoginSchema.shape[field];
      const result = fieldSchema.safeParse(values[field]);
      if (!result.success) {
        setErrors((prev) => ({
          ...prev,
          [field]: result.error.issues[0].message,
        }));
      } else {
        setErrors((prev) => ({ ...prev, [field]: undefined }));
      }
    },
    [values]
  );

  // 회원가입 버튼 클릭
  const handleSubmitButtonClick = useCallback(async () => {
    // 폼 유효성 검증
    const result = isLoginSchema.safeParse(values);
    if (!result.success) {
      // 에러 메시지 추출
      const fieldErrors: Partial<Record<keyof LoginFormData, string>> = {};
      result.error.issues.forEach((err) => {
        const field = err.path[0] as keyof LoginFormData;
        fieldErrors[field] = err.message;
      });
      setErrors(fieldErrors);
      return;
    }

    const response = await signup({
      email: values.email,
      password: values.password,
      username: values.username,
    })
      .then(() => {
        console.log("회원가입 성공:", response);
        navigate("/login");
      })
      .catch((err) => {
        console.error(err.response.data.message);
      });
  }, [navigate, values]);

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

        {/* 이메일 */}
        <LabeledTextField
          label="이메일"
          type="email"
          required
          value={values.email}
          onChange={(e) =>
            setValues((prev) => ({ ...prev, email: e.target.value }))
          }
          error={!!errors.email}
          helperText={errors.email}
          onBlur={() => handleBlur("email")}
        />

        {/* 사용자명 */}
        <LabeledTextField
          label="사용자명"
          type="text"
          required
          value={values.username}
          onChange={(e) =>
            setValues((prev) => ({ ...prev, username: e.target.value }))
          }
          error={!!errors.username}
          helperText={errors.username}
          onBlur={() => handleBlur("username")}
        />

        {/* 비밀번호 */}
        <LabeledTextField
          label="비밀번호"
          type="password"
          required
          value={values.password}
          onChange={(e) =>
            setValues((prev) => ({ ...prev, password: e.target.value }))
          }
          error={!!errors.password}
          helperText={errors.password}
          onBlur={() => handleBlur("password")}
        />

        {/* 비밀번호 확인 */}
        <LabeledTextField
          label="비밀번호 확인"
          type="password"
          required
          value={values.passwordConfirm}
          onChange={(e) =>
            setValues((prev) => ({ ...prev, passwordConfirm: e.target.value }))
          }
          error={!!errors.passwordConfirm}
          helperText={errors.passwordConfirm}
          onBlur={() => handleBlur("passwordConfirm")}
        />

        <Button
          type="submit"
          variant="contained"
          onClick={handleSubmitButtonClick}
        >
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
