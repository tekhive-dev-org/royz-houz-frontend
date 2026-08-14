import "@/styles/globals.css";
import { Lato } from "next/font/google";
import { Layout } from "@/components/layout/Layout";

const lato = Lato({
  subsets: ["latin"],
  weight: ["100", "300", "400", "700", "900"],
  display: "swap",
});

export default function App({ Component, pageProps }) {
  // Support custom page layouts if specified, otherwise apply global Layout
  const getLayout = Component.getLayout || ((page) => <Layout>{page}</Layout>);

  return (
    <div className={lato.className}>
      {getLayout(<Component {...pageProps} />)}
    </div>
  );
}
