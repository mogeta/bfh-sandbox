import { redirect } from 'next/navigation';
import { CLIENT_ID, CLIENT_SECRET } from '@/src/config/env';

export default function Home() {
  if (!CLIENT_ID || !CLIENT_SECRET) {
    redirect('/env-warning');
  }

  redirect('/login');
}
