import { Quicksand } from "next/font/google";

/* Display (Times New Roman MT Condensed) e Sans (Helvetica Now Display) são
   fontes de sistema/licenciadas, não existem no Google Fonts — o valor real
   vem direto de app/globals.css (--font-display, --font-sans) como stack de
   sistema, sem precisar carregar nada aqui. */

export const quicksand = Quicksand({
  subsets: ["latin"],
  weight: ["500", "600", "700"],
  variable: "--font-mono",
  display: "swap",
});
