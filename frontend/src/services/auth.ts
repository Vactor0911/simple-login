import {
  accessTokenAtom,
  csrfTokenAtom,
  loadingAtom,
  userAtom,
  type UserType,
} from "../states/auth";
import { jotaiStore } from "../states/jotaiStore";
import { api } from "../utils/api";

// 회원가입 요청 타입
type SignupRequest = {
  email: string;
  password: string;
  username: string;
};

// 로그인 요청 타입
type LoginRequest = {
  email: string;
  password: string;
};

// 회원가입
export const signup = async (req: SignupRequest) => {
  // 회원가입 API 호출
  return await api.post("/api/auth/signup", req);
};

// 로그인
export const login = async (req: LoginRequest) => {
  // 로그인 API 호출
  const { data } = await api.post<{ accessToken: string; csrfToken: string }>(
    "/api/auth/login",
    req
  );

  // 토큰 저장
  jotaiStore.set(accessTokenAtom, data.accessToken);
  jotaiStore.set(csrfTokenAtom, data.csrfToken);

  // await fetchMe();
};

// 내 정보 조회
export const fetchMe = async () => {
  jotaiStore.set(loadingAtom, true);

  try {
    const { data } = await api.get<UserType>("/api/user/me");
    jotaiStore.set(userAtom, {
      uuid: data.uuid,
      username: data.username,
      authorities: data.authorities,
    });
  } finally {
    jotaiStore.set(loadingAtom, false);
  }
};

// 로그아웃
export const logout = async () => {
  // 로그아웃 API 호출
  await api.post("/api/auth/logout");
  jotaiStore.set(accessTokenAtom, null);
  jotaiStore.set(userAtom, null);
};
