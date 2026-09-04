import Image from "next/image";
import styles from "./ArticleBody.module.css";

function ArticleBlock({ block }) {
  if (block.type === "heading") {
    const level = Math.min(Math.max(Number(block.level) || 2, 2), 4);
    const headingClasses = {
      2: "text-2xl font-bold text-[#0A0D14] mt-6 mb-2 tracking-tight",
      3: "text-xl font-bold text-[#0A0D14] mt-5 mb-2",
      4: "text-lg font-semibold text-[#0A0D14] mt-4 mb-1",
    };
    const Heading = `h${level}`;
    return <Heading className={headingClasses[level] || styles.paragraph}>{block.text}</Heading>;
  }

  if (block.type === "quote") {
    return (
      <blockquote className={styles.blockquote}>
        <span className={styles.quoteMark}>“</span>
        <p className={styles.quoteText}>{block.text}</p>
        <span className={styles.quoteMark}>”</span>
      </blockquote>
    );
  }

  if (block.type === "callout") {
    return (
      <div className={styles.impactCard}>
        <span className={styles.impactTag}>{block.title || "KEY TAKEAWAY"}</span>
        <p className={styles.impactText}>{block.text}</p>
      </div>
    );
  }

  if (block.type === "image") {
    return (
      <figure className="my-6 flex flex-col gap-2">
        <div className="relative w-full h-[300px] sm:h-[420px] rounded-xl overflow-hidden bg-stone-100">
          <Image src={block.src} alt={block.alt || "Article visual"} fill sizes="(max-width: 1024px) 100vw, 750px" className="object-cover" />
        </div>
        {block.caption && <figcaption className="text-xs text-stone-500 italic text-center">{block.caption}</figcaption>}
      </figure>
    );
  }

  if (block.type === "list" || block.type === "listItem") {
    return <p className={styles.paragraph}>• {block.text}</p>;
  }

  if (block.type === "divider") return <hr className="my-6 border-stone-200" />;

  return <p className={styles.paragraph}>{block.text}</p>;
}

/**
 * Renders the sanitized structured article body supplied by the public post record.
 */
export function ArticleBody({ article }) {
  const blocks = article?.content || [];

  return (
    <div className={styles.bodyContainer}>
      {blocks.length > 0 ? (
        blocks.map((block, index) => <ArticleBlock key={`${block.type}-${index}`} block={block} />)
      ) : (
        <p className={styles.paragraph}>{article?.excerpt}</p>
      )}
    </div>
  );
}

export default ArticleBody;
