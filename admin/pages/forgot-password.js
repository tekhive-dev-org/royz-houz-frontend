import Head from "next/head";
import { AdminForgotPasswordForm } from "@/components/auth/AdminForgotPasswordForm";

export default function ForgotPasswordPage() {
  return (
    <>
      <Head>
        <title>Forgot Password | Royz Houz Admin</title>
        <meta name="robots" content="noindex, nofollow" />
      </Head>
      <AdminForgotPasswordForm />
    </>
  );
}

ForgotPasswordPage.getLayout = (page) => page;
