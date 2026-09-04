import { useEffect, useRef, useState } from "react";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import DragIndicatorIcon from "@mui/icons-material/DragIndicator";
import ArrowUpwardIcon from "@mui/icons-material/ArrowUpward";
import ArrowDownwardIcon from "@mui/icons-material/ArrowDownward";
import { Box, IconButton, List, Paper, Tooltip, Typography } from "@mui/material";
import styles from "./SortableList.module.css";

const defaultGetKey = (item) => item?.id ?? item?.slug ?? item?.key ?? String(item);
const defaultRender = (item) => item?.title || item?.name || String(item);

/**
 * Interactive drag-and-drop sortable list with live item displacement.
 * As an item is dragged over other items, the list immediately shifts to accommodate it.
 * Also supports keyboard accessibility (Enter/Space to lift, Arrow keys to shift, Enter/Esc to drop).
 */
export function SortableList({
  items = [],
  onMove,
  onChange,
  onEdit,
  onDelete,
  getKey = defaultGetKey,
  renderPrimary,
  renderItem,
}) {
  const safeGetKey = typeof getKey === "function" ? getKey : defaultGetKey;
  const renderContent = renderPrimary || renderItem || defaultRender;

  const [displayItems, setDisplayItems] = useState(items || []);
  const [draggedId, setDraggedId] = useState(null);
  const [initialIndex, setInitialIndex] = useState(null);
  const [keyboardActiveIndex, setKeyboardActiveIndex] = useState(null);
  const isDraggingRef = useRef(false);

  // Sync internal displayItems when parent items change (unless currently dragging)
  useEffect(() => {
    if (!isDraggingRef.current) {
      setDisplayItems(items || []);
    }
  }, [items]);

  function onDragStart(event, index) {
    const item = displayItems[index];
    if (!item) return;
    const key = safeGetKey(item);
    isDraggingRef.current = true;
    setDraggedId(key);
    setInitialIndex(index);
    setKeyboardActiveIndex(null);

    event.dataTransfer.effectAllowed = "move";
    event.dataTransfer.setData("text/plain", String(key));
  }

  function onDragEnter(event, targetIndex) {
    event.preventDefault();
    if (!draggedId) return;

    const currentIndex = displayItems.findIndex((item) => safeGetKey(item) === draggedId);
    if (currentIndex === -1 || currentIndex === targetIndex) return;

    // Real-time displacement: shift the dragged item to targetIndex so other items slide into place
    const updated = [...displayItems];
    const [moved] = updated.splice(currentIndex, 1);
    updated.splice(targetIndex, 0, moved);
    setDisplayItems(updated);
  }

  function onDragOver(event) {
    event.preventDefault();
    event.dataTransfer.dropEffect = "move";
  }

  function onDrop(event) {
    event.preventDefault();
    finalizeReorder();
  }

  function onDragEnd() {
    finalizeReorder();
  }

  function finalizeReorder() {
    if (!isDraggingRef.current && draggedId == null) return;

    const finalIndex = displayItems.findIndex((item) => safeGetKey(item) === draggedId);
    const start = initialIndex;

    isDraggingRef.current = false;
    setDraggedId(null);
    setInitialIndex(null);

    if (start != null && finalIndex !== -1 && start !== finalIndex) {
      if (typeof onMove === "function") {
        onMove(start, finalIndex, displayItems);
      }
      if (typeof onChange === "function") {
        onChange(displayItems);
      }
    }
  }

  function moveByStep(currentIndex, targetIndex) {
    if (targetIndex < 0 || targetIndex >= displayItems.length) return;
    const updated = [...displayItems];
    const [moved] = updated.splice(currentIndex, 1);
    updated.splice(targetIndex, 0, moved);
    setDisplayItems(updated);

    if (typeof onMove === "function") {
      onMove(currentIndex, targetIndex, updated);
    }
    if (typeof onChange === "function") {
      onChange(updated);
    }
  }

  function onKeyDown(event, index) {
    if (
      event.key !== "Enter" &&
      event.key !== " " &&
      event.key !== "ArrowUp" &&
      event.key !== "ArrowDown" &&
      event.key !== "Escape"
    ) {
      return;
    }

    if (event.key === "Escape") {
      setKeyboardActiveIndex(null);
      return;
    }

    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      setKeyboardActiveIndex((current) => (current === index ? null : index));
      return;
    }

    if (keyboardActiveIndex !== index) return;

    event.preventDefault();
    const direction = event.key === "ArrowUp" ? -1 : 1;
    const nextIndex = index + direction;
    if (nextIndex < 0 || nextIndex >= displayItems.length) return;

    moveByStep(index, nextIndex);
    setKeyboardActiveIndex(nextIndex);
  }

  return (
    <List disablePadding className={styles.list}>
      {displayItems.map((item, index) => {
        const key = safeGetKey(item) || `item-${index}`;
        const isDragging = draggedId === key;
        const isKeyboardActive = keyboardActiveIndex === index;

        return (
          <Paper
            key={key}
            elevation={0}
            component="li"
            draggable
            onDragStart={(event) => onDragStart(event, index)}
            onDragEnter={(event) => onDragEnter(event, index)}
            onDragOver={onDragOver}
            onDrop={onDrop}
            onDragEnd={onDragEnd}
            className={`${styles.item}${isDragging ? ` ${styles.dragging}` : ""}`}
          >
            <Box className={styles.leftCol}>
              <span
                role="button"
                tabIndex={0}
                aria-label={`Reorder item ${index + 1}`}
                aria-roledescription="sortable"
                aria-pressed={isKeyboardActive}
                className={styles.dragHandle}
                onKeyDown={(event) => onKeyDown(event, index)}
              >
                <DragIndicatorIcon fontSize="small" />
              </span>
              <span className={styles.indexBadge}>#{index + 1}</span>
              <Box className={styles.content}>{renderContent(item, index)}</Box>
            </Box>

            <Box className={styles.actions}>
              {isKeyboardActive ? (
                <Typography variant="caption" className={styles.keyboardHint}>
                  Use ↑ / ↓ to displace, Enter to release
                </Typography>
              ) : null}

              {/* Quick step arrows for extra accessibility */}
              <Tooltip title="Move up">
                <span>
                  <IconButton
                    aria-label="Move up"
                    size="small"
                    disabled={index === 0}
                    onClick={() => moveByStep(index, index - 1)}
                    className={styles.iconBtn}
                  >
                    <ArrowUpwardIcon fontSize="small" />
                  </IconButton>
                </span>
              </Tooltip>

              <Tooltip title="Move down">
                <span>
                  <IconButton
                    aria-label="Move down"
                    size="small"
                    disabled={index === displayItems.length - 1}
                    onClick={() => moveByStep(index, index + 1)}
                    className={styles.iconBtn}
                  >
                    <ArrowDownwardIcon fontSize="small" />
                  </IconButton>
                </span>
              </Tooltip>

              {onEdit ? (
                <Tooltip title="Edit record">
                  <IconButton aria-label="Edit" size="small" onClick={() => onEdit(item)} className={styles.iconBtn}>
                    <EditOutlinedIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
              ) : null}

              {onDelete ? (
                <Tooltip title="Delete record">
                  <IconButton
                    aria-label="Delete"
                    size="small"
                    onClick={() => onDelete(item)}
                    className={`${styles.iconBtn} ${styles.deleteBtn}`}
                  >
                    <DeleteOutlineIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
              ) : null}
            </Box>
          </Paper>
        );
      })}
    </List>
  );
}
