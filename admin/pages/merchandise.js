import Head from "next/head";
import { MerchandiseComingSoon } from "@/components/placeholders/MerchandiseComingSoon";
import { requireAdminPage } from "@/lib/auth/requireAdminPage";

export default function MerchandisePage() {
  return (
    <>
      <Head>
        <title>Merchandise | Royz Houz Admin</title>
        <meta name="robots" content="noindex, nofollow" />
      </Head>
      <MerchandiseComingSoon />
    </>
  );
}

export async function getServerSideProps(context) {
  return requireAdminPage(context);
}
