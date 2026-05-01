import { NextIntlClientProvider } from "next-intl";
import { getMessages } from "next-intl/server";

export async function I18nProvider({ children }: { children: React.ReactNode }) {
  const messages = await getMessages();
  return (
    <NextIntlClientProvider messages={messages} locale="es">
      {children}
    </NextIntlClientProvider>
  );
}
