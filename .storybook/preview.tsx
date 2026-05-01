import type { Preview } from '@storybook/nextjs-vite'
import "@/app/globals.css";
import { NextIntlClientProvider } from 'next-intl';
import messages from '../messages/es.json';

const preview: Preview = {
  decorators: [
    (Story) => (
      <NextIntlClientProvider locale="es" messages={messages}>
        <Story />
      </NextIntlClientProvider>
    ),
  ],
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
      test: 'warn',
      config: {
        rules: [
          // Desactivar temporalmente color-contrast hasta ajustar paleta SENA
          { id: 'color-contrast', enabled: false },
        ],
      },
    }
  },
};

export default preview;
