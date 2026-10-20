import React, { useEffect, useState } from 'react';

const FALLBACK_IMAGE = '/images/complaints/complaint-image-unavailable.svg';

interface EvidenceImageProps {
  src: string;
  alt: string;
  className?: string;
  fallbackClassName?: string;
  fallbackSrc?: string;
}

export const EvidenceImage: React.FC<EvidenceImageProps> = ({
  src,
  alt,
  className = 'w-full h-full object-cover',
  fallbackClassName = 'w-full h-full flex items-center justify-center text-slate-500 text-xs',
  fallbackSrc,
}) => {
  const [failed, setFailed] = useState(false);
  const [fallbackFailed, setFallbackFailed] = useState(false);

  useEffect(() => {
    setFailed(false);
    setFallbackFailed(false);
  }, [src, fallbackSrc]);

  if (failed) {
    if (fallbackFailed) {
      return <div className={fallbackClassName}>Evidence image could not be loaded</div>;
    }
    return (
      <img
        src={fallbackSrc || FALLBACK_IMAGE}
        alt={`${alt} (image unavailable)`}
        className={className}
        onError={() => setFallbackFailed(true)}
      />
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      referrerPolicy="no-referrer"
      className={className}
      onError={() => setFailed(src !== FALLBACK_IMAGE)}
    />
  );
};
