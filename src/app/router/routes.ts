export const ROUTES = {
  LOGIN: "/login",
  REGISTER: "/register",
  PRESENTATIONS: "/presentations",
  EDITOR: "/editor",
  PLAYER: "/player",
  ROOT: "/",
} as const;

export type RoutePath = (typeof ROUTES)[keyof typeof ROUTES];
