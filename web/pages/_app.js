import "@splidejs/react-splide/css";
import "@/styles/globals.css";
import { Lato } from "next/font/google";
import { Layout } from "@/components/layout/Layout";
import { usePublicContentRealtime } from "@/hooks/usePublicContentRealtime";

const lato = Lato({
  subsets: ["latin"],
  weight: ["100", "300", "400", "700", "900"],
  variable: "--font-lato",
  display: "swap",
});

export default function App({ Component, pageProps }) {
  usePublicContentRealtime();

  // Support custom page layouts if specified, otherwise apply global Layout
  const getLayout = Component.getLayout || ((page) => <Layout>{page}</Layout>);

  return (
    <div className={`${lato.className} ${lato.variable} font-sans`}>
      {getLayout(<Component {...pageProps} />)}
    </div>
  );
}
