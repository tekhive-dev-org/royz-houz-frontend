import Head from "next/head";
import { AdminAcceptInviteForm } from "@/components/auth/AdminAcceptInviteForm";

export default function AcceptInvitePage() {
  return (
    <>
      <Head>
        <title>Accept Invitation | Royz Houz Admin</title>
        <meta name="robots" content="noindex, nofollow" />
      </Head>
      <AdminAcceptInviteForm />
    </>
  );
}

AcceptInvitePage.getLayout = (page) => page;
