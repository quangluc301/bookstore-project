'use client';

import { useState } from 'react';
import Image from 'next/image';

export function BookCover({
  title,
  imageUrl,
  className = '',
}: {
  title: string;
  imageUrl?: string | null;
  className?: string;
}) {
  const [failedUrl, setFailedUrl] = useState<string | null>(null);
  const showImage = Boolean(imageUrl) && failedUrl !== imageUrl;

  return (
    <div
      role="img"
      aria-label={`${title} cover`}
      className={`relative flex items-center justify-center overflow-hidden bg-slate-100 ${className}`}
    >
      {showImage ? (
        <Image
          src={imageUrl as string}
          alt={`${title} cover`}
          fill
          unoptimized
          sizes="(max-width: 768px) 100vw, 400px"
          className="object-cover"
          onError={() => setFailedUrl(imageUrl || null)}
        />
      ) : (
        <span aria-hidden="true" className="font-serif text-4xl font-bold text-slate-500">
          {title.charAt(0).toLocaleUpperCase()}
        </span>
      )}
    </div>
  );
}