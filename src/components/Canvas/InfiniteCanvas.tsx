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
  return (
    <div className="infinite-canvas-container" data-idea-id={ideaId}>
      <Tldraw
        onMount={(editor) => {
          console.log('Canvas mounted for idea:', ideaId);
          
          // Load initial data if provided
          if (initialData && typeof initialData === 'object') {
            try {
              console.log('Loading initial canvas data...');
              editor.store.loadSnapshot(initialData);
            } catch (error) {
              console.warn('Could not load canvas data:', error);
            }
          }

          // Setup auto-save on editor changes
          if (onSave && !readOnly) {
            let saveTimeout: NodeJS.Timeout;
            
            const unsubscribe = editor.store.listen(() => {
              // Debounce saves
              clearTimeout(saveTimeout);
              saveTimeout = setTimeout(() => {
                try {
                  const snapshot = editor.store.getSnapshot();
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
