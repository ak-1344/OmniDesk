import { Tldraw } from '@tldraw/tldraw';
import '@tldraw/tldraw/tldraw.css';
import './InfiniteCanvas.css';

interface InfiniteCanvasProps {
  ideaId: string;
  initialData?: unknown;
  onSave?: (snapshot: unknown) => void;
  readOnly?: boolean;
}

export const InfiniteCanvas = ({ ideaId, initialData, onSave, readOnly = false }: InfiniteCanvasProps) => {
  return (
    <div className="infinite-canvas-container" data-idea-id={ideaId}>
      <Tldraw
        onMount={(editor) => {
          console.log('Canvas mounted for idea:', ideaId);

          // Load initial data if provided
          if (initialData && typeof initialData === 'object') {
            try {
              console.log('Loading initial canvas data...');
              // Use compatible API methods
              if (typeof (editor.store as any).loadStoreSnapshot === 'function') {
                (editor.store as any).loadStoreSnapshot(initialData);
              } else if (typeof (editor as any).loadSnapshot === 'function') {
                (editor as any).loadSnapshot(initialData);
              }
            } catch (error) {
              console.warn('Could not load canvas data:', error);
            }
          }

          // Setup auto-save on editor changes
          if (onSave && !readOnly) {
            let saveTimeout: ReturnType<typeof setTimeout>;

            const unsubscribe = editor.store.listen(() => {
              // Debounce saves
              clearTimeout(saveTimeout);
              saveTimeout = setTimeout(() => {
                try {
                  // Use compatible API methods
                  let snapshot: unknown;
                  if (typeof (editor.store as any).getStoreSnapshot === 'function') {
                    snapshot = (editor.store as any).getStoreSnapshot();
                  } else if (typeof (editor as any).getSnapshot === 'function') {
                    snapshot = (editor as any).getSnapshot();
                  } else {
                    snapshot = (editor.store as any).serialize?.() || {};
                  }
                  console.log('Saving canvas state...');
                  onSave(snapshot);
                } catch (error) {
                  console.error('Canvas save error:', error);
                }
              }, 1000); // Save after 1 second of inactivity
            });

            // Cleanup listener when component unmounts
            return () => {
              clearTimeout(saveTimeout);
              unsubscribe();
            };
          }
        }}
      />
    </div>
  );
};
