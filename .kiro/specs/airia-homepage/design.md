# デザイン設計書

## 概要

AiRiaのホームページは、女性ツインボーカルユニットの魅力を最大限に伝える、シンプルでおしゃれな動きのあるWebサイトです。モダンなWebテクノロジーを活用し、ファンとの接点を強化し、活動情報を効果的に発信するプラットフォームを提供します。

## アーキテクチャ

### 技術スタック

- **フロントエンド**: HTML5、CSS3、Vanilla JavaScript
- **スタイリング**: CSS Grid、Flexbox、CSS Animations
- **デプロイ**: GitHub Pages
- **ベースURL**: https://zhenya0626.github.io/airia/
- **データ管理**: JSON ファイル + JavaScript
- **アニメーション**: CSS Transitions + JavaScript

### ディレクトリ構造

```
airia/
├── index.html              # ホームページ
├── member/
│   ├── ai.html            # あいのプロフィールページ
│   └── ria.html           # リアのプロフィールページ
├── live/
│   └── [event-id].html    # 各ライブ詳細ページ
├── css/
│   ├── style.css          # メインスタイル
│   ├── components.css     # コンポーネントスタイル
│   └── animations.css     # アニメーション
├── js/
│   ├── main.js           # メイン機能
│   ├── calendar.js       # カレンダー機能
│   └── animations.js     # アニメーション制御
├── data/
│   ├── members.json      # メンバー情報
│   ├── events.json       # イベント情報
│   └── social.json       # SNSリンク
├── images/
│   ├── members/          # メンバー写真
│   ├── events/           # イベント画像
│   └── common/           # 共通画像
└── README.md
```

## コンポーネントとインターフェース

### 主要コンポーネント

#### 1. レイアウトコンポーネント
- **Header**: ナビゲーション、ロゴ
- **Footer**: ソーシャルメディアリンク、コピーライト
- **Navigation**: レスポンシブメニュー

#### 2. ホームページセクション
- **HeroSection**: メインビジュアル、キャッチコピー
- **MemberIntroSection**: あい・リアの簡単な紹介
- **CalendarSection**: 活動予定カレンダー
- **SocialLinksSection**: SNSリンク集

#### 3. 詳細ページコンポーネント
- **MemberProfile**: メンバー詳細情報
- **LiveEventDetail**: ライブイベント詳細
- **EventCard**: イベント情報カード

### データ構造定義

```javascript
// メンバー情報
const memberStructure = {
  id: "string",
  name: "string",
  displayName: "string", 
  bio: "string",
  image: "string",
  socialLinks: {
    instagram: "string (optional)",
    twitter: "string (optional)"
  }
};

// イベント情報
const eventStructure = {
  id: "string",
  title: "string",
  type: "live | street | streaming",
  date: "string (YYYY-MM-DD)",
  time: "string (optional)",
  venue: "string (optional)",
  description: "string",
  ticketUrl: "string (optional)",
  externalUrl: "string (optional)",
  image: "string (optional)",
  status: "upcoming | past"
};

// ソーシャルメディアリンク
const socialLinksStructure = {
  instagram: "string",
  tiktok: "string",
  line: "string"
};
```

## データモデル

### 静的データ構造

```json
// data/members.json
{
  "members": [
    {
      "id": "ai",
      "name": "あい",
      "displayName": "Ai",
      "bio": "...",
      "image": "/images/members/ai.jpg"
    },
    {
      "id": "ria",
      "name": "リア", 
      "displayName": "Ria",
      "bio": "...",
      "image": "/images/members/ria.jpg"
    }
  ]
}

// data/events.json
{
  "events": [
    {
      "id": "live-001",
      "title": "AiRia Live Concert",
      "type": "live",
      "date": "2024-03-15",
      "venue": "渋谷ライブハウス",
      "ticketUrl": "https://..."
    }
  ]
}

// data/social.json
{
  "instagram": "https://instagram.com/airia_official",
  "tiktok": "https://tiktok.com/@airia_official", 
  "line": "https://line.me/R/ti/p/@airia"
}
```

## デザインシステム

### カラーパレット
- **プライマリ**: グラデーション（ピンク〜パープル）
- **セカンダリ**: ソフトブルー
- **アクセント**: ゴールド
- **ニュートラル**: ホワイト、ライトグレー、ダークグレー

### タイポグラフィ
- **見出し**: Noto Sans JP (Bold)
- **本文**: Noto Sans JP (Regular)
- **アクセント**: 英数字は Inter

### アニメーション
- **ページトランジション**: フェードイン・スライド
- **ホバーエフェクト**: スケール・カラー変化
- **スクロールアニメーション**: 要素の段階的表示
- **ローディング**: スムーズなスケルトン表示

## エラーハンドリング

### エラー処理戦略

1. **404エラー**: カスタム404ページ
2. **画像読み込みエラー**: フォールバック画像
3. **外部リンクエラー**: リンク切れ検知
4. **データ読み込みエラー**: エラーバウンダリー

### エラー表示

```typescript
// エラーバウンダリーコンポーネント
interface ErrorBoundaryProps {
  fallback: React.ComponentType<{error: Error}>;
  children: React.ReactNode;
}

// 404ページ
export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <h1>ページが見つかりません</h1>
        <Link href="/">ホームに戻る</Link>
      </div>
    </div>
  );
}
```

## テスト戦略

### テスト種類

1. **ユニットテスト**: コンポーネント単体テスト
2. **統合テスト**: ページ全体の動作テスト
3. **E2Eテスト**: ユーザーフロー全体のテスト
4. **アクセシビリティテスト**: WCAG準拠確認

### テストツール

- **Jest**: ユニットテスト
- **React Testing Library**: コンポーネントテスト
- **Playwright**: E2Eテスト
- **axe-core**: アクセシビリティテスト

### テスト対象

- ナビゲーション機能
- レスポンシブデザイン
- アニメーション動作
- 外部リンク遷移
- フォーム動作（将来的な拡張）

## パフォーマンス最適化

### 最適化戦略

1. **画像最適化**: Next.js Image コンポーネント
2. **コード分割**: 動的インポート
3. **静的生成**: SSG for 静的コンテンツ
4. **キャッシュ戦略**: ISR for イベント情報
5. **バンドル最適化**: Tree shaking

### Core Web Vitals 目標

- **LCP**: < 2.5秒
- **FID**: < 100ms  
- **CLS**: < 0.1

## セキュリティ

### セキュリティ対策

1. **XSS防止**: React の自動エスケープ
2. **HTTPS強制**: Vercel 自動設定
3. **CSP設定**: Content Security Policy
4. **外部リンク**: rel="noopener noreferrer"

## 運用・保守

### コンテンツ更新

- イベント情報: JSONファイル更新
- メンバー情報: 静的ファイル更新
- 画像: public/images フォルダ管理

### 監視・分析

- **Vercel Analytics**: パフォーマンス監視
- **Google Analytics**: ユーザー行動分析
- **Error Tracking**: Sentry（将来的）