import { useState, useEffect, useCallback } from 'react';
import type { PinnedSuggestion } from './types';

export function useSuggestions(suggestions: string[]) {
  const [visibleSuggestions, setVisibleSuggestions] = useState<PinnedSuggestion[]>([]);

  // Atualiza as sugestões apenas quando as props mudam
  useEffect(() => {
    setVisibleSuggestions(prevSuggestions => {
      const existingSuggestions = new Set(prevSuggestions.map(s => s.text));
      const newSuggestions = suggestions
        .filter(suggestion => !existingSuggestions.has(suggestion))
        .map(suggestion => ({ text: suggestion, isPinned: false, highlighted: false }));
      
      if (newSuggestions.length === 0) {
        return prevSuggestions;
      }

      const pinnedSuggestions = prevSuggestions.filter(s => s.isPinned);
      const unpinnedSuggestions = prevSuggestions.filter(s => !s.isPinned);
      
      return [
        ...pinnedSuggestions,
        ...newSuggestions,
        ...unpinnedSuggestions
      ];
    });
  }, [suggestions]);

  const handleClose = useCallback((index: number) => {
    setVisibleSuggestions(prev => prev.filter((_, i) => i !== index));
  }, []);

  const toggleHighlight = useCallback((index: number, event: React.MouseEvent) => {
    if ((event.target as HTMLElement).closest('button[aria-label="Close suggestion"]')) {
      return;
    }

    setVisibleSuggestions(prev => prev.map((suggestion, i) => 
      i === index ? { ...suggestion, highlighted: !suggestion.highlighted } : suggestion
    ));
  }, []);

  const pinHighlightedSuggestions = useCallback(() => {
    setVisibleSuggestions(prev => {
      const highlighted = prev.filter(s => s.highlighted && !s.isPinned);
      const notHighlighted = prev.filter(s => !s.highlighted || s.isPinned);
      
      const newPinnedSuggestions = highlighted.map(s => ({
        ...s,
        isPinned: true,
        highlighted: false
      }));

      const existingPinned = notHighlighted.filter(s => s.isPinned);
      const unpinned = notHighlighted.filter(s => !s.isPinned);

      return [
        ...existingPinned,
        ...newPinnedSuggestions,
        ...unpinned
      ];
    });
  }, []);

  const clearUnpinnedSuggestions = useCallback(() => {
    setVisibleSuggestions(prev => prev.filter(s => s.isPinned));
  }, []);

  const unpinSuggestion = useCallback((index: number) => {
    setVisibleSuggestions(prev => {
      const suggestion = prev[index];
      if (!suggestion.isPinned) return prev;

      const pinnedSuggestions = prev.filter((s, i) => s.isPinned && i !== index);
      const unpinnedSuggestions = prev.filter(s => !s.isPinned);
      
      return [
        ...pinnedSuggestions,
        { ...suggestion, isPinned: false, highlighted: false },
        ...unpinnedSuggestions
      ];
    });
  }, []);

  return {
    visibleSuggestions,
    handleClose,
    toggleHighlight,
    pinHighlightedSuggestions,
    clearUnpinnedSuggestions,
    unpinSuggestion
  };
}