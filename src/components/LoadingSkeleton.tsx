import './LoadingSkeleton.css';

interface LoadingSkeletonProps {
  type?: 'card' | 'list' | 'text' | 'circle';
  count?: number;
  height?: string;
  width?: string;
}

export const LoadingSkeleton = ({ 
  type = 'card', 
  count = 1,
  height,
  width 
}: LoadingSkeletonProps) => {
  const items = Array.from({ length: count }, (_, i) => i);

  if (type === 'card') {
    return (
      <div className="skeleton-container">
        {items.map(i => (
          <div key={i} className="skeleton-card">
            <div className="skeleton-header">
              <div className="skeleton-circle" />
              <div className="skeleton-text-short" />
            </div>
            <div className="skeleton-text" />
            <div className="skeleton-text" />
            <div className="skeleton-text-short" />
          </div>
        ))}
      </div>
    );
  }

  if (type === 'list') {
    return (
      <div className="skeleton-list">
        {items.map(i => (
          <div key={i} className="skeleton-list-item">
            <div className="skeleton-circle-sm" />
            <div className="skeleton-text" />
          </div>
        ))}
      </div>
    );
  }

  if (type === 'circle') {
    return (
      <div className="skeleton-circle" style={{ height, width }} />
    );
  }

  return (
    <div className="skeleton-text" style={{ height, width }} />
  );
};
