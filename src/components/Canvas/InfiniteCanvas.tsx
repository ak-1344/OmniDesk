import { Tldraw } from '@tldraw/tldraw';
import '@tldraw/tldraw/tldraw.css';
import './InfiniteCanvas.css';

interface InfiniteCanvasProps {
  ideaId: string;
  initialData?: any;
  onSave?: (snapshot: any) => void;
  readOnly?: boolean;
}

export const InfiniteCanvas = ({ ideaId, onSave, readOnly = false }: InfiniteCanvasProps) => {
  return (
    <div className="infinite-canvas-container" data-idea-id={ideaId}>
      <Tldraw
        persistenceKey={`idea-${ideaId}`}
        onMount={(editor) => {
          // Setup auto-save on editor changes
          if (onSave && !readOnly) {
            editor.store.listen(() => {
              // Auto-save canvas state
              try {
                onSave(editor.store.serialize());
              } catch (error) {
                console.error('Canvas save error:', error);
              }
            });
          }
        }}
      />
    </div>
  );
};
