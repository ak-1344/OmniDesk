import { useCallback, useEffect, useState } from 'react';
import { Tldraw, TLEditorComponents, createTLStore, defaultShapeUtils, TLStoreSnapshot } from '@tldraw/tldraw';
import '@tldraw/tldraw/tldraw.css';
import './InfiniteCanvas.css';

interface InfiniteCanvasProps {
  ideaId: string;
  initialData?: TLStoreSnapshot;
  onSave?: (snapshot: TLStoreSnapshot) => void;
  readOnly?: boolean;
}

export const InfiniteCanvas = ({ ideaId, initialData, onSave, readOnly = false }: InfiniteCanvasProps) => {
  const [store] = useState(() => {
    const newStore = createTLStore({ shapeUtils: defaultShapeUtils });
    
    // Load initial data if provided
    if (initialData) {
      try {
        newStore.loadSnapshot(initialData);
      } catch (error) {
        console.error('Failed to load canvas snapshot:', error);
      }
    }
    
    return newStore;
  });

  // Auto-save functionality with debounce
  useEffect(() => {
    if (!onSave || readOnly) return;

    let timeoutId: NodeJS.Timeout;

    const handleChange = () => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        const snapshot = store.getSnapshot();
        onSave(snapshot);
      }, 1000); // Debounce for 1 second
    };

    // Listen to store changes
    const unsubscribe = store.listen(handleChange);

    return () => {
      clearTimeout(timeoutId);
      unsubscribe();
    };
  }, [store, onSave, readOnly]);

  const components: TLEditorComponents = {
    // Customize toolbar if needed
  };

  return (
    <div className="infinite-canvas-container" data-idea-id={ideaId}>
      <Tldraw
        store={store}
        components={components}
        hideUi={readOnly}
        inferDarkMode
      />
    </div>
  );
};
