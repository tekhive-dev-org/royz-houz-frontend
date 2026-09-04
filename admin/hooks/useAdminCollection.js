import { useCallback, useEffect, useState } from "react";

/**
 * Generic collection hook for admin settings entities. Manages initial loading,
 * optimistic mutations, silent background syncs, and reordering without full-screen flashes.
 */
export function useAdminCollection({ list, save, reorder, remove }) {
  const [items, setItems] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);
  const [error, setError] = useState(null);

  const refresh = useCallback(
    async (silent = false) => {
      if (!silent) setIsLoading(true);
      else setIsSyncing(true);
      setError(null);

      try {
        const data = await list();
        setItems(data || []);
      } catch (err) {
        setError(err.message || "Unable to load records.");
      } finally {
        if (!silent) setIsLoading(false);
        else setIsSyncing(false);
      }
    },
    [list]
  );

  useEffect(() => {
    void refresh(false);
  }, [refresh]);

  async function handleSave(data, id) {
    setIsSyncing(true);
    setError(null);
    try {
      await save(data, id);
      await refresh(true);
    } catch (err) {
      setError(err.message || "Unable to save record.");
      throw err;
    } finally {
      setIsSyncing(false);
    }
  }

  async function handleReorder(ids, optimisticItems = null) {
    if (optimisticItems) {
      setItems(optimisticItems);
    }
    setIsSyncing(true);
    setError(null);
    try {
      await reorder(ids);
      await refresh(true);
    } catch (err) {
      setError(err.message || "Unable to reorder records.");
      // Rollback to server state on error
      await refresh(false);
    } finally {
      setIsSyncing(false);
    }
  }

  async function handleDelete(id) {
    // Optimistic removal from state
    setItems((prev) => prev.filter((item) => item.id !== id));
    setIsSyncing(true);
    setError(null);
    try {
      await remove(id);
      await refresh(true);
    } catch (err) {
      setError(err.message || "Unable to delete record.");
      await refresh(false);
    } finally {
      setIsSyncing(false);
    }
  }

  return {
    items,
    isLoading,
    isSyncing,
    error,
    refresh,
    save: handleSave,
    reorder: handleReorder,
    remove: handleDelete,
  };
}
