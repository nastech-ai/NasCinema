
import { lazy } from "react";

const FAQSectionComponent = lazy(() =>
  import("@/components/layout/sections/faq").then((mod) => ({ default: mod.FAQSection })),
);

export const FAQSectionClient = () => {
  return <FAQSectionComponent />;
};
