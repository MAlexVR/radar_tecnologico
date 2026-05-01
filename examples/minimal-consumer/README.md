# Minimal Consumer Example

This example shows how to consume `@/core` and `@/components/radar` in another project.

## Setup
1. Copy `public/data/ceet-telecom.json` to your project
2. Import the schema and mount the radar

## Usage
```tsx
import { RadarProvider } from "@/components/radar/RadarProvider";
import { RadarChart } from "@/components/organisms/RadarChart";
import schema from "./my-radar.json";

export default function MyPage() {
  return (
    <RadarProvider schema={schema}>
      <RadarChart />
    </RadarProvider>
  );
}
```
