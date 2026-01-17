'use client';

import { useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { Button } from '@/src/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/src/components/ui/card';
import { LogIn } from 'lucide-react';

function LoginForm() {
  const searchParams = useSearchParams();
  const error = searchParams.get('error');

  useEffect(() => {
    if (error) {
      console.error('Login error:', error);
    }
  }, [error]);

  const handleLogin = () => {
    const authUrl = process.env.NEXT_PUBLIC_BFH_AUTH_URL!;
    const clientId = process.env.NEXT_PUBLIC_CLIENT_ID;
    const redirectUri = `${window.location.origin}/api/auth/callback`;

    // CSRF対策用のstateパラメータを生成（最低8文字以上）
    const state = Array.from(crypto.getRandomValues(new Uint8Array(16)))
      .map(b => b.toString(16).padStart(2, '0'))
      .join('');

    // stateをsessionStorageに保存（コールバック時に検証）
    sessionStorage.setItem('oauth_state', state);

    const params = new URLSearchParams({
      response_type: 'code',
      client_id: clientId,
      redirect_uri: redirectUri,
      scope: 'openid profile email',
      state: state,
    });

    window.location.href = `${authUrl}?${params.toString()}`;
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <Card className="w-full max-w-md glass-card border-0">
        <CardHeader className="space-y-4 text-center">
          <div className="mx-auto w-20 h-20 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
            <LogIn className="w-10 h-10 text-white" />
          </div>
          <CardTitle className="text-3xl font-bold text-white">
            Brave Frontier Heroes
          </CardTitle>
          <CardDescription className="text-neutral-300">
            ブレヒロのアカウントでログインして、ダッシュボードにアクセス
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {error && (
            <div className="p-4 rounded-lg bg-red-500/10 border border-red-500/20 text-red-300 text-sm">
              {error === 'token_exchange_failed' && 'トークンの取得に失敗しました'}
              {error === 'no_code' && '認証コードが見つかりません'}
              {error === 'unexpected_error' && '予期しないエラーが発生しました'}
              {!['token_exchange_failed', 'no_code', 'unexpected_error'].includes(error) && error}
            </div>
          )}

          <Button
            onClick={handleLogin}
            className="w-full h-12 text-lg bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white border-0"
            size="lg"
          >
            <LogIn className="w-5 h-5 mr-2" />
            ブレヒロでログイン
          </Button>

          <p className="text-xs text-center text-neutral-400 mt-4">
            ログインすることで、利用規約とプライバシーポリシーに同意したものとみなされます
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card className="w-full max-w-md glass-card border-0">
          <CardHeader className="space-y-4 text-center">
            <div className="mx-auto w-20 h-20 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
              <LogIn className="w-10 h-10 text-white" />
            </div>
            <CardTitle className="text-3xl font-bold text-white">
              Brave Frontier Heroes
            </CardTitle>
          </CardHeader>
        </Card>
      </div>
    }>
      <LoginForm />
    </Suspense>
  );
}
