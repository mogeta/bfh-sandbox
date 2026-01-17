# Brave Frontier Heroes Dashboard

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2Fmogeta%2Fbfh-sandbox&env=NEXT_PUBLIC_CLIENT_ID,CLIENT_SECRET)

Brave Frontier Heroes の Forge API を利用した Next.js ダッシュボードアプリケーション。

## 機能

- OAuth2認証による安全なログイン
- ユーザー情報の表示
- グラスモーフィズムデザイン
- ヒーローユニットのメタデータ表示
- バトルリプレイリンク
- TypeScript + TanStack Query による型安全なAPI連携

## 技術スタック

- **Framework:** Next.js 16 (App Router)
- **Styling:** Tailwind CSS 4 + shadcn/ui
- **API Client:** Orval (OpenAPI → TypeScript)
- **State Management:** TanStack Query
- **Language:** TypeScript

## セットアップ

### 1. 依存関係のインストール

```bash
npm install
```

### 2. 環境変数の設定

`.env.example` を `.env` にコピーして、必要な環境変数を設定してください。
`NEXT_PUBLIC_CLIENT_ID` と `CLIENT_SECRET` は [BFH Developer Portal](https://bfh-developer-portal-front.vercel.app/) で取得できます。

```bash
cp .env.example .env
```

`.env` ファイルを編集して、以下の値を設定します：

```env
NEXT_PUBLIC_CLIENT_ID=your_client_id_here
CLIENT_SECRET=your_client_secret_here
NEXT_PUBLIC_BFH_API_BASE_URL=https://api.bravefrontierheroes.com
NEXT_PUBLIC_BFH_AUTH_URL=https://auth.bravefrontierheroes.com/oauth2/auth
NEXT_PUBLIC_BFH_TOKEN_URL=https://auth.bravefrontierheroes.com/oauth2/token
```

### 3. APIクライアントの生成

Swagger定義から TypeScript クライアントコードを生成します。

```bash
npm run generate:api
```

### 4. 開発サーバーの起動

```bash
npm run dev
```

ブラウザで `http://localhost:3500` にアクセスしてください。

## プロジェクト構造

```
bfh-sandbox/
├── app/
│   ├── api/
│   │   ├── auth/
│   │   │   ├── callback/route.ts  # OAuth2 コールバック
│   │   │   └── logout/route.ts    # ログアウト
│   │   └── user/
│   │       └── me/route.ts        # ユーザー情報取得
│   ├── dashboard/
│   │   └── page.tsx               # ダッシュボード画面
│   ├── login/
│   │   └── page.tsx               # ログイン画面
│   ├── layout.tsx                 # ルートレイアウト
│   ├── page.tsx                   # ホーム（ログインへリダイレクト）
│   └── globals.css                # グローバルスタイル
├── src/
│   ├── api/
│   │   ├── generated/             # Orval生成コード
│   │   ├── model/                 # Orval生成モデル
│   │   └── mutator/
│   │       └── custom-instance.ts # Axiosカスタムインスタンス
│   ├── components/
│   │   ├── ui/                    # shadcn/uiコンポーネント
│   │   ├── providers/
│   │   │   └── query-provider.tsx # TanStack Queryプロバイダー
│   │   ├── unit-card.tsx          # ユニットカードコンポーネント
│   │   └── battle-replay-link.tsx # バトルリプレイリンク
│   └── lib/
│       └── utils.ts               # ユーティリティ関数
├── orval.config.ts                # Orval設定
├── components.json                # shadcn/ui設定
└── tsconfig.json                  # TypeScript設定
```

## 主要な機能

### OAuth2認証フロー

1. ユーザーが「ブレヒロでログイン」をクリック
2. BFH認証ページへリダイレクト
3. 認証成功後、`/auth/callback` へコールバック
4. サーバーサイドでトークン交換（CLIENT_SECRETを使用）
5. アクセストークンをHTTPOnly Cookieに保存
6. ダッシュボードへリダイレクト

### APIクライアント

Orvalにより、Swagger定義から自動生成された型安全なAPIクライアントを使用します。

```typescript
// 例: ユーザー情報の取得
import { useGetV1Me } from '@/src/api/generated/user/user';

const { data, isLoading, error } = useGetV1Me();
```

### ユーティリティ関数

```typescript
// ヒーローメタデータURLの生成
getHeroMetadataUrl(heroId: string | number): string

// バトルログURLの生成
getBattleLogUrl(battleId: string | number): string

// バトルリプレイURLの生成
getBattleReplayUrl(battleId: string | number, lang?: string): string
```

## コンポーネント

### UnitCard

ヒーローユニットのメタデータを表示するカードコンポーネント。

```tsx
<UnitCard heroId="200000058" />
```

### BattleReplayLink

バトルリプレイへのリンクを生成するコンポーネント。

```tsx
<BattleReplayLink battleId="12345678" lang="ja" />
```

## デザイン

グラスモーフィズムスタイルを使用した、ゲームの世界観に合うデザインを採用しています。

利用可能なユーティリティクラス：
- `.glass` - 基本的なガラス効果
- `.glass-card` - カード用のガラス効果
- `.glass-hover` - ホバーアニメーション

## スクリプト

- `npm run dev` - 開発サーバーを起動（ポート3500）
- `npm run build` - プロダクションビルド
- `npm run start` - プロダクションサーバーを起動
- `npm run generate:api` - APIクライアントコードを生成
- `npm run lint` - ESLintでコードをチェック

## 参考リンク

- [Brave Frontier Heroes API](https://api.bravefrontierheroes.com/swagger/doc.json)
- [Next.js Documentation](https://nextjs.org/docs)
- [TanStack Query](https://tanstack.com/query)
- [Orval](https://orval.dev/)
- [shadcn/ui](https://ui.shadcn.com/)
