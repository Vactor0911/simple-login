import { atom } from "jotai";

export type UserType = {
  uuid: string;
  username: string;
  authorities: string[];
};

export const accessTokenAtom = atom<string | null>(null);
export const userAtom = atom<UserType | null>(null);
export const loadingAtom = atom<boolean>(false);
