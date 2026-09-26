import { Quicksand } from "next/font/google";

/* Display (Times New Roman MT Condensed) e Sans (Helvetica Now Display) são
   fontes de sistema/licenciadas, não existem no Google Fonts — o valor real
   vem direto de app/globals.css (--font-display, --font-sans) como stack de
   sistema, sem precisar carregar nada aqui. */

export const quicksand = Quicksand({
  subsets: ["latin"],
  /* 26/09/2026: Garet (que essa fonte aproxima) virou a fonte do corpo de
     texto do site inteiro, não só de eyebrow/legenda — precisa do peso 400
     carregado, senão o navegador tenta negritar sinteticamente o texto
     corrido inteiro. */
  weight: ["400", "500", "600", "700"],
  variable: "--font-mono",
  display: "swap",
});
