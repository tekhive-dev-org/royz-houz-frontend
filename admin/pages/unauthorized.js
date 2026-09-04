import Head from "next/head";
import { UnauthorizedState } from "@/components/auth/UnauthorizedState";

export default function UnauthorizedPage() {
  return (
    <>
      <Head>
        <title>Unauthorized | Royz Houz Admin</title>
        <meta name="robots" content="noindex, nofollow" />
      </Head>
      <UnauthorizedState />
    </>
  );
}

UnauthorizedPage.getLayout = (page) => page;
