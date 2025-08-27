import React from 'react'
import { Skeleton } from '@/components/ui/skeleton';

function Loading() {
  return (
      <div className="p-8 space-y-4">
        <Skeleton className="h-12 w-1/2" />
        <Skeleton className="h-8 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
}

export default Loading