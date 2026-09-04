import { useState, useMemo } from "react";
import { useRouter } from "next/router";
import { CategoryFilter } from "./CategoryFilter";
import { DirectoryCard } from "./DirectoryCard";
import { Pagination } from "./Pagination";
import { isTalentAvailableForBooking } from "../TalentProfile/talentProfileData";
import styles from "./TalentDirectory.module.css";

/**
 * TalentDirectory component orchestrating filtering, grid rendering, and pagination.
 */
export function TalentDirectory({ talents = [], searchQuery = "", categories }) {
  const [activeCategory, setActiveCategory] = useState("all");
  const [sortBy, setSortBy] = useState("date");
  const [currentPage, setCurrentPage] = useState(1);
  const [perPage, setPerPage] = useState(8);

  // Filter talents by category and optional search query
  const filteredTalents = useMemo(() => {
    return talents.filter((item) => {
      // Category filter
      const matchesCategory =
        activeCategory === "all" ||
        item.categoryKey === activeCategory ||
        item.category?.toLowerCase() === activeCategory.toLowerCase() ||
        item.profession?.toLowerCase() === activeCategory.toLowerCase() ||
        item.primaryCategoryId === activeCategory ||
        (Array.isArray(item.categoryIds) && item.categoryIds.includes(activeCategory));

      // Search query filter
      const matchesSearch =
        !searchQuery ||
        item.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.category?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.subtitle?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.bio?.toLowerCase().includes(searchQuery.toLowerCase());

      return matchesCategory && matchesSearch;
    });
  }, [activeCategory, searchQuery, talents]);

  // Sort talents
  const sortedTalents = useMemo(() => {
    const list = [...filteredTalents];
    if (sortBy === "rating") {
      list.sort((a, b) => Number(b.rating) - Number(a.rating));
    } else if (sortBy === "name") {
      list.sort((a, b) => a.name.localeCompare(b.name));
    }
    return list;
  }, [filteredTalents, sortBy]);

  // Pagination slicing
  const totalPages = Math.ceil(sortedTalents.length / perPage) || 1;
  const paginatedTalents = useMemo(() => {
    const start = (currentPage - 1) * perPage;
    return sortedTalents.slice(start, start + perPage);
  }, [sortedTalents, currentPage, perPage]);

  const router = useRouter();

  const handleBook = (talent) => {
    const talentIdentifier = talent?.slug || talent?.id;
    if (!isTalentAvailableForBooking(talent) || !talentIdentifier) return;

    router.push(`/talents/${talentIdentifier}/book`);
  };

  const handleCategorySelect = (catId) => {
    setActiveCategory(catId);
    setCurrentPage(1);
  };

  return (
    <section className={styles.section} id="talent-directory" aria-label="Talent Directory">
      <div className={styles.container}>
        {/* Category Filter & Meta Bar */}
        <CategoryFilter
          categories={categories}
          activeCategory={activeCategory}
          onSelectCategory={handleCategorySelect}
          totalCount={sortedTalents.length}
          sortBy={sortBy}
          onSortChange={setSortBy}
        />

        {/* Directory Cards Grid */}
        <div className={styles.grid}>
          {paginatedTalents.map((talent) => (
            <DirectoryCard
              key={talent.id}
              talent={talent}
              onBook={handleBook}
            />
          ))}
        </div>

        {/* Pagination Bar */}
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages > 0 ? totalPages : 1}
          perPage={perPage}
          onPageChange={setCurrentPage}
          onPerPageChange={setPerPage}
        />
      </div>
    </section>
  );
}

export default TalentDirectory;
