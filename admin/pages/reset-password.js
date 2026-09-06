import Head from "next/head";
import { AdminResetPasswordForm } from "@/components/auth/AdminResetPasswordForm";

export default function ResetPasswordPage() {
  return (
    <>
      <Head>
        <title>Set New Password | Royz Houz Admin</title>
        <meta name="robots" content="noindex, nofollow" />
      </Head>
      <AdminResetPasswordForm />
    </>
  );
}

ResetPasswordPage.getLayout = (page) => page;
