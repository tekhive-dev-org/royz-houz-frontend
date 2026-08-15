import MediaWatchDetailPage, { getStaticProps as getDetailProps } from "./[mediaId]";

export default MediaWatchDetailPage;

export async function getStaticProps() {
  return getDetailProps({ params: { mediaId: "the-beat-behind-the-hit" } });
}
