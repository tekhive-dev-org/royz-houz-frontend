import { Header } from "../Header";
import { Footer } from "../Footer";
import styles from "./Layout.module.css";

export function Layout({ children }) {
  return (
    <div className={styles.layoutWrapper}>
      <Header />
      <main className={styles.mainContent}>{children}</main>
      <Footer />
    </div>
  );
}

export default Layout;
