import Head from "next/head";
import { AdminDashboard } from "@/components/dashboard/AdminDashboard";
import { requireAdminPage } from "@/lib/auth/requireAdminPage";

export default function AdminHomePage() {
  return (
    <>
      <Head>
        <title>Dashboard | Royz Houz Admin</title>
        <meta name="description" content="Royz Houz administration dashboard." />
      </Head>
      <AdminDashboard />
    </>
  );
}

export async function getServerSideProps(context) {
  return requireAdminPage(context);
}
