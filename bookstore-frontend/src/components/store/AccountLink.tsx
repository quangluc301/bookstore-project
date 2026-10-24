'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { UserRound } from 'lucide-react';
import { useAuthStore } from '@/store/authStore';

export default function AccountLink() {
  const token = useAuthStore((state) => state.token);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    if (useAuthStore.persist.hasHydrated()) {
      setHydrated(true);
      return;
    }

    const unsubscribe = useAuthStore.persist.onFinishHydration(() => setHydrated(true));
    void useAuthStore.persist.rehydrate();
    return unsubscribe;
  }, []);

  const href = hydrated && token ? '/account' : '/login';

  return (
    <Link href={href} aria-label="Account" title="Account" className="text-slate-700 transition hover:text-rose-600">
      <UserRound size={20} />
    </Link>
  );
}