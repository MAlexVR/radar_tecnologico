import { RadarProvider as CoreRadarProvider } from "@/core/store";
import type { RadarSchema } from "@/core/types";
import type { ReactNode } from "react";

export function RadarProvider({
  schema,
  children,
}: {
  schema: RadarSchema;
  children: ReactNode;
}) {
  return (
    <CoreRadarProvider schema={schema}>{children}</CoreRadarProvider>
  );
}
