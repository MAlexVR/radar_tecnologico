import type { Preview } from '@storybook/nextjs-vite'
import "@/app/globals.css";

const preview: Preview = {
  parameters: {
    controls: {
      matchers: {
       color: /(background|color)$/i,
       date: /Date$/i,
      },
    },

    a11y: {
      // 'todo'  - show a11y violations in the test UI only (cosmetic)
      // 'warn'  - log violations but do not fail CI (transitional)
      // 'error' - fail CI on a11y violations (target once 'warn' is clean)
      // 'off'   - skip a11y checks entirely
      test: 'warn'
    }
  },
};

export default preview;