import { useHotkeys } from 'react-hotkeys-hook';

interface KeyboardShortcutsProps {
  onRefresh?: () => void;
  onExport?: () => void;
  onPrint?: () => void;
  onClearFilters?: () => void;
  onToggleFilters?: () => void;
  onNextPage?: () => void;
  onPreviousPage?: () => void;
  onFirstPage?: () => void;
  onLastPage?: () => void;
  disabled?: boolean;
}

export function KeyboardShortcuts({
  onRefresh,
  onExport,
  onPrint,
  onClearFilters,
  onToggleFilters,
  onNextPage,
  onPreviousPage,
  onFirstPage,
  onLastPage,
  disabled = false
}: KeyboardShortcutsProps) {
  // Refresh data
  useHotkeys('ctrl+r, cmd+r', (e) => {
    e.preventDefault();
    if (!disabled && onRefresh) {
      onRefresh();
    }
  }, { enabled: !disabled });

  // Export data
  useHotkeys('ctrl+e, cmd+e', (e) => {
    e.preventDefault();
    if (!disabled && onExport) {
      onExport();
    }
  }, { enabled: !disabled });

  // Print data
  useHotkeys('ctrl+p, cmd+p', (e) => {
    e.preventDefault();
    if (!disabled && onPrint) {
      onPrint();
    }
  }, { enabled: !disabled });

  // Clear filters
  useHotkeys('ctrl+shift+c, cmd+shift+c', (e) => {
    e.preventDefault();
    if (!disabled && onClearFilters) {
      onClearFilters();
    }
  }, { enabled: !disabled });

  // Toggle filters
  useHotkeys('ctrl+f, cmd+f', (e) => {
    e.preventDefault();
    if (!disabled && onToggleFilters) {
      onToggleFilters();
    }
  }, { enabled: !disabled });

  // Pagination shortcuts
  useHotkeys('ctrl+right, cmd+right', (e) => {
    e.preventDefault();
    if (!disabled && onNextPage) {
      onNextPage();
    }
  }, { enabled: !disabled });

  useHotkeys('ctrl+left, cmd+left', (e) => {
    e.preventDefault();
    if (!disabled && onPreviousPage) {
      onPreviousPage();
    }
  }, { enabled: !disabled });

  useHotkeys('ctrl+home, cmd+home', (e) => {
    e.preventDefault();
    if (!disabled && onFirstPage) {
      onFirstPage();
    }
  }, { enabled: !disabled });

  useHotkeys('ctrl+end, cmd+end', (e) => {
    e.preventDefault();
    if (!disabled && onLastPage) {
      onLastPage();
    }
  }, { enabled: !disabled });

  return null; // This component doesn't render anything
}

export default KeyboardShortcuts;
