import Head from "next/head";
import { FeaturePlaceholder } from "./FeaturePlaceholder";

/** Composes a neutral, permission-guarded placeholder page for a future feature. */
export function createFeaturePage({ label, description }) {
  function FeaturePage() {
    return (
      <>
        <Head>
          <title>{`${label} | Royz Houz Admin`}</title>
          <meta name="robots" content="noindex, nofollow" />
        </Head>
        <FeaturePlaceholder title={label} description={description} />
      </>
    );
  }

  return FeaturePage;
}
