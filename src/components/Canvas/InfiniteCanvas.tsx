import { useEffect } from 'react';
import { Tldraw } from '@tldraw/tldraw';
import '@tldraw/tldraw/tldraw.css';
import './InfiniteCanvas.css';

interface InfiniteCanvasProps {
  ideaId: string;
  initialData?: any;
  onSave?: (snapshot: any) => void;
  readOnly?: boolean;
}

export const InfiniteCanvas = ({ ideaId, initialData, onSave, readOnly = false }: InfiniteCanvasProps) => {
  // Auto-save functionality with debounce
  useEffect(() => {
    if (!onSave || readOnly) return;

    let timeoutId: NodeJS.Timeout;

    const handleSave = () => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        // Save will be triggered by TLDraw's onChange
        console.log('Canvas auto-saved for idea:', ideaId);
      }, 1000);
    };

    return () => {
      clearTimeout(timeoutId);
    };
  }, [ideaId, onSave, readOnly]);

  return (
    <div className="infinite-canvas-container" data-idea-id={ideaId}>
      <Tldraw
        persistenceKey={`idea-${ideaId}`}
        onChange={(editor) => {
          if (onSave) {
            const snapshot = editor.store.getSnapshot();
            onSave(snapshot);
          }
        }}
      />
    </div>
  );
};
