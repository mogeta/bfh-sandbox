'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/src/components/ui/card';
import { Button } from '@/src/components/ui/button';
import { ChevronLeft, RefreshCw, ShieldCheck, Clock, AlertCircle, Info } from 'lucide-react';
import { CLIENT_ID } from '@/src/config/env';
import Cookies from 'js-cookie';

export default function AuthDebugPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [tokenStatus, setTokenStatus] = useState<{ hasAccessToken: boolean; hasRefreshToken: boolean } | null>(null);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [remainingTime, setRemainingTime] = useState<number | null>(null);

  const fetchStatus = async () => {
    try {
      const res = await fetch('/api/auth/token-status');
      const data = await res.json();
      setTokenStatus(data);
    } catch (err) {
      console.error('Failed to fetch token status', err);
    }
  };

  useEffect(() => {
    fetchStatus();

    // アクセストークンの有効期限を簡易的にチェック（Cookieから）
    // 本来はサーバーから取得するのが望ましいが、デモ用
    const checkExpiry = () => {
      // Cookies.get('bfh_access_token') は値しか取れないので、
      // 実際には発行時のタイムスタンプを保存しておくなどの工夫が必要
      // ここでは、トークンが存在するかどうかを確認するに留める
    };

    checkExpiry();
  }, []);

  const handleRefresh = async () => {
    setLoading(true);
    setMessage(null);
    try {
      const res = await fetch('/api/auth/refresh', { method: 'POST' });
      const data = await res.json();

      if (res.ok) {
        setMessage({ type: 'success', text: `トークンを更新しました。新しい有効期限: ${data.expires_in}秒` });
        fetchStatus();
      } else {
        setMessage({ type: 'error', text: `更新に失敗しました: ${data.error}` });
      }
    } catch (err) {
      setMessage({ type: 'error', text: '通信エラーが発生しました' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen p-4 md:p-8">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="glass-card rounded-xl p-6 flex items-center space-x-4">
          <Button
            onClick={() => router.push('/dashboard')}
            variant="outline"
            size="icon"
            className="glass hover:glass-hover border-neutral-600 text-white"
          >
            <ChevronLeft className="w-5 h-5" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-white flex items-center">
              <ShieldCheck className="w-8 h-8 mr-2 text-green-400" />
              Auth Debug & Refresh
            </h1>
            <p className="text-neutral-300">
              OAuth2 トークンの状態確認とリフレッシュの技術解説
            </p>
          </div>
        </div>

        {/* Token Info */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="glass-card border-0">
            <CardHeader>
              <CardTitle className="text-white flex items-center">
                <Clock className="w-5 h-5 mr-2 text-blue-400" />
                現在のトークン状態
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between items-center p-3 rounded-lg bg-black/20">
                <span className="text-neutral-400">Access Token</span>
                {tokenStatus?.hasAccessToken ? (
                  <span className="text-green-400 font-medium flex items-center">
                    <ShieldCheck className="w-4 h-4 mr-1" /> 有効
                  </span>
                ) : (
                  <span className="text-red-400 font-medium flex items-center">
                    <AlertCircle className="w-4 h-4 mr-1" /> 無し
                  </span>
                )}
              </div>
              <div className="flex justify-between items-center p-3 rounded-lg bg-black/20">
                <span className="text-neutral-400">Refresh Token</span>
                {tokenStatus?.hasRefreshToken ? (
                  <span className="text-green-400 font-medium flex items-center">
                    <ShieldCheck className="w-4 h-4 mr-1" /> 有効
                  </span>
                ) : (
                  <span className="text-red-400 font-medium flex items-center">
                    <AlertCircle className="w-4 h-4 mr-1" /> 無し
                  </span>
                )}
              </div>

              <div className="pt-4">
                <Button
                  onClick={handleRefresh}
                  disabled={loading || !tokenStatus?.hasRefreshToken}
                  className="w-full bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white border-0"
                >
                  <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                  トークンをリフレッシュする
                </Button>
              </div>

              {message && (
                <div className={`p-4 rounded-lg text-sm border ${
                  message.type === 'success' 
                    ? 'bg-green-500/10 border-green-500/20 text-green-300' 
                    : 'bg-red-500/10 border-red-500/20 text-red-300'
                }`}>
                  {message.text}
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="glass-card border-0">
            <CardHeader>
              <CardTitle className="text-white flex items-center">
                <Info className="w-5 h-5 mr-2 text-purple-400" />
                技術解説
              </CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-neutral-300 space-y-4 leading-relaxed">
              <p>
                Brave Frontier Heroes の OAuth2 認証では、アクセストークンの有効期限が切れた際、
                <code className="text-purple-300 bg-black/30 px-1 rounded">refresh_token</code> 
                を使用して新しいアクセストークンを取得できます。
              </p>
              <div className="space-y-2">
                <h4 className="text-white font-semibold">リフレッシュの流れ:</h4>
                <ol className="list-decimal list-inside space-y-1 ml-2">
                  <li>ログイン時に <code className="text-pink-300">offline_access</code> スコープを要求</li>
                  <li>トークン取得時に <code className="text-pink-300">refresh_token</code> が発行される</li>
                  <li>有効期限が切れる前に、このトークンをトークンエンドポイントへ送信</li>
                  <li>新しいアクセストークン（および新しいリフレッシュトークン）を受け取る</li>
                </ol>
              </div>
              <p className="text-xs text-neutral-500 italic">
                ※ このデモでは、リフレッシュトークンをサーバーサイドの Secure/HttpOnly Cookie で管理し、
                ブラウザ側からは直接触れられない安全な構成をとっています。
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Developer Console Hint */}
        <Card className="glass-card border-0">
          <CardHeader>
            <CardTitle className="text-white text-lg">Developer Tips</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="bg-black/40 p-4 rounded-lg border border-white/10 font-mono text-xs text-neutral-200">
              <p className="text-blue-400">// Client-side (Publicly accessible)</p>
              <p>document.cookie.includes('bfh_access_token'); <span className="text-neutral-500">// true</span></p>
              <p className="mt-2 text-blue-400">// Server-side (HttpOnly)</p>
              <p>const refreshToken = cookies().get('bfh_refresh_token');</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
