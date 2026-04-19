import { useEffect } from 'react';
import { useRouter } from 'next/router';

export default function AuthCallback() {
  const router = useRouter();

  useEffect(() => {
    // URL থেকে হ্যাশ বের করা
    const hash = window.location.hash;
    if (hash && hash.includes('access_token')) {
      // পুরো URL টা auth/callback এ রিডাইরেক্ট করা
      window.location.href = `/api/auth/callback${hash}`;
    } else {
      router.push('/');
    }
  }, []);

  return <div>ভেরিফাই করা হচ্ছে...</div>;
}