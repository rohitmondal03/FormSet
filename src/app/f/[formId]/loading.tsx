import React from 'react'
import { Skeleton } from '@/components/ui/skeleton';
import { Separator } from '@/components/ui/separator';

function Loading() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-2xl space-y-8">
        <Skeleton className="h-10 w-3/4" />
        <Skeleton className="h-6 w-full" />
        <Separator />
        <div className="space-y-8">
          <div className="space-y-2">
            <Skeleton className="h-4 w-1/4" />
            <Skeleton className="h-10 w-full" />
          </div>
          <div className="space-y-2">
            <Skeleton className="h-4 w-1/4" />
            <Skeleton className="h-20 w-full" />
          </div>
        </div>
      </div>
    </div>
  );
}

export default Loading