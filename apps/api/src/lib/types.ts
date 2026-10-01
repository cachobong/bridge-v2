import type { CurrentUser } from "@bridge/shared";

export type AppEnv = {
  Variables: {
    user: CurrentUser;
  };
};
