export default function MediaWatchIndex() {
  return null;
}

export async function getStaticProps() {
  return { notFound: true, revalidate: 60 };
}
