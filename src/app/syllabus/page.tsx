
'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

// This component is a workaround to resolve a routing conflict.
// It redirects to the correct syllabus page within the main layout.
export default function SyllabusRedirectPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/syllabus');
  }, [router]);

  return null; // Render nothing as the redirect happens
}
