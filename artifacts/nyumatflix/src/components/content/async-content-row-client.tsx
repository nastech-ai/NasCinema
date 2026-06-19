
import { lazy } from "react";

export const DynamicAsyncContentRow = lazy(
  () => import("./async-content-row").then((m) => m.AsyncContentRow),
);
