import React, { useEffect } from 'react';

interface EzoicAdProps {
  placeholderId: number;
  className?: string;
}

const EzoicAd: React.FC<EzoicAdProps> = ({ placeholderId, className = '' }) => {
  useEffect(() => {
    try {
      const ez = (window as any).ezstandalone;
      if (ez && ez.cmd) {
        ez.cmd.push(() => {
          ez.displayMore(placeholderId);
        });
      }
    } catch {
      // Ezoic not loaded yet or blocked
    }
  }, [placeholderId]);

  return (
    <div className={`ezoic-ad-container ${className}`}>
      <div id={`ezoic-pub-ad-placeholder-${placeholderId}`} />
    </div>
  );
};

export default EzoicAd;
