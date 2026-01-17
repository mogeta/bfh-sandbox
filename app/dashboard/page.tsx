'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/src/components/ui/card';
import { Button } from '@/src/components/ui/button';
import { LogOut, User, Wallet, Trophy, Swords, Grid, ExternalLink } from 'lucide-react';
import { CLIENT_ID, CLIENT_SECRET } from '@/src/config/env';
import { redirect } from 'next/navigation';
import { useGetV1Me } from '@/src/api/generated/user/user';

export default function DashboardPage() {
  const router = useRouter();
  if (!CLIENT_ID || (typeof window === 'undefined' && !CLIENT_SECRET)) {
    if (typeof window !== 'undefined') {
      window.location.href = '/env-warning';
      return null;
    }
    redirect('/env-warning');
  }

  // Orval generated React Query hooks
  const { data: userDataRaw, isLoading: isLoadingUser, error: userError } = useGetV1Me();

  // Type assertion for user data (API returns dynamic object)
  const userData = userDataRaw as {
    user?: {
      uid: number;
      name: string;
      eth: string;
      ipfs?: string;
      country_code?: number;
      guild_id?: number;
      land_type?: number;
      registerd?: number;
      [key: string]: any;
    };
  } | undefined;

  // Handle auth errors
  useEffect(() => {
    if (userError && typeof userError === 'object' && 'status' in userError) {
      const error = userError as any;
      if (error.status === 401) {
        router.push('/login');
      }
    }
  }, [userError, router]);

  const loading = isLoadingUser;
  const error = userError ? (userError instanceof Error ? userError.message : 'Failed to load user data') : null;

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
              Welcome back, {userData?.user?.name || 'Player'}!
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
                {userData?.user?.uid || 'N/A'}
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
                {userData?.user?.name || 'N/A'}
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
                {userData?.user?.eth ?
                  `${userData.user.eth.slice(0, 6)}...${userData.user.eth.slice(-4)}`
                  : 'Not Connected'}
              </div>
            </CardContent>
          </Card>

          <Card className="glass-card glass-hover border-0">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-neutral-300">
                Guild ID
              </CardTitle>
              <Trophy className="h-4 w-4 text-yellow-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">
                {userData?.user?.guild_id || 'No Guild'}
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
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <div className="text-sm text-neutral-400">Name</div>
                  <div className="text-lg font-semibold text-white">
                    {userData?.user?.name || 'N/A'}
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="text-sm text-neutral-400">User ID (UID)</div>
                  <div className="text-lg font-semibold text-white font-mono">
                    {userData?.user?.uid || 'N/A'}
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="text-sm text-neutral-400">Wallet Address (ETH)</div>
                  <div className="text-lg font-semibold text-white font-mono break-all">
                    {userData?.user?.eth || 'Not Connected'}
                  </div>
                </div>

                {userData?.user?.ipfs && (
                  <div className="space-y-2">
                    <div className="text-sm text-neutral-400">IPFS</div>
                    <div className="text-lg font-semibold text-white font-mono break-all">
                      {userData.user.ipfs}
                    </div>
                  </div>
                )}

                {userData?.user?.guild_id && (
                  <div className="space-y-2">
                    <div className="text-sm text-neutral-400">Guild ID</div>
                    <div className="text-lg font-semibold text-white">
                      {userData.user.guild_id}
                    </div>
                  </div>
                )}

                {userData?.user?.land_type !== undefined && (
                  <div className="space-y-2">
                    <div className="text-sm text-neutral-400">Land Type</div>
                    <div className="text-lg font-semibold text-white">
                      {userData.user.land_type}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Units Section Link */}
        <Card className="glass-card glass-hover border-0 cursor-pointer" onClick={() => router.push('/units')}>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-white flex items-center">
                <Grid className="w-6 h-6 mr-2 text-purple-400" />
                My Units
              </CardTitle>
              <CardDescription className="text-neutral-300">
                View and manage your hero units
              </CardDescription>
            </div>
            <ExternalLink className="w-6 h-6 text-neutral-400" />
          </CardHeader>
        </Card>
      </div>
    </div>
  );
}
