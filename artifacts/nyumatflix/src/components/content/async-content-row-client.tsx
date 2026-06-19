
import { lazy } from "react";

const AsyncContentRowLazy = lazy(() =>
  import("./async-content-row").then((m) => ({
    default: m.AsyncContentRow,
  })),
);

export const DynamicAsyncContentRow = AsyncContentRowLazy;
