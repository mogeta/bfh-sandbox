'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/src/components/ui/card';
import { Button } from '@/src/components/ui/button';
import { LogOut, User, Wallet, Trophy, Swords } from 'lucide-react';

interface UserData {
  id: string;
  username: string;
  email?: string;
  [key: string]: any;
}

export default function DashboardPage() {
  const router = useRouter();
  const [userData, setUserData] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchUserData();
  }, []);

  const fetchUserData = async () => {
    try {
      const response = await fetch('/api/user/me');

      if (response.status === 401) {
        router.push('/login');
        return;
      }

      if (!response.ok) {
        throw new Error('Failed to fetch user data');
      }

      const data = await response.json();
      setUserData(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      router.push('/login');
    } catch (err) {
      console.error('Logout failed:', err);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="glass-card p-8 rounded-xl">
          <div className="animate-pulse text-white">Loading...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="glass-card border-0 max-w-md">
          <CardHeader>
            <CardTitle className="text-red-400">Error</CardTitle>
            <CardDescription className="text-neutral-300">{error}</CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => router.push('/login')} className="w-full">
              Back to Login
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="glass-card rounded-xl p-6 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">
              Brave Frontier Heroes Dashboard
            </h1>
            <p className="text-neutral-300">
              Welcome back, {userData?.username || 'Player'}!
            </p>
          </div>
          <Button
            onClick={handleLogout}
            variant="outline"
            className="glass hover:glass-hover border-neutral-600 text-white"
          >
            <LogOut className="w-4 h-4 mr-2" />
            Logout
          </Button>
        </div>

        {/* User Info Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="glass-card glass-hover border-0">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-neutral-300">
                User ID
              </CardTitle>
              <User className="h-4 w-4 text-purple-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">
                {userData?.id || 'N/A'}
              </div>
            </CardContent>
          </Card>

          <Card className="glass-card glass-hover border-0">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-neutral-300">
                Username
              </CardTitle>
              <Swords className="h-4 w-4 text-pink-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">
                {userData?.username || 'N/A'}
              </div>
            </CardContent>
          </Card>

          <Card className="glass-card glass-hover border-0">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-neutral-300">
                Wallet
              </CardTitle>
              <Wallet className="h-4 w-4 text-blue-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">
                {userData?.wallet_address ?
                  `${userData.wallet_address.slice(0, 6)}...${userData.wallet_address.slice(-4)}`
                  : 'Not Connected'}
              </div>
            </CardContent>
          </Card>

          <Card className="glass-card glass-hover border-0">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-neutral-300">
                Rank
              </CardTitle>
              <Trophy className="h-4 w-4 text-yellow-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">
                {userData?.rank || 'Unranked'}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* User Details */}
        <Card className="glass-card border-0">
          <CardHeader>
            <CardTitle className="text-white">Profile Information</CardTitle>
            <CardDescription className="text-neutral-300">
              Your account details and statistics
            </CardDescription>
          </CardHeader>
          <CardContent>
            <pre className="text-sm text-neutral-300 overflow-auto bg-black/20 p-4 rounded-lg">
              {JSON.stringify(userData, null, 2)}
            </pre>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
