import ResetDataButton from "@/components/ResetDataButton";

export default function SettingsPage() {
  return (
    <div className="flex flex-col gap-5 px-4 pt-5">
      <h1 className="text-lg font-bold">設定</h1>

      <section className="rounded-xl border border-zinc-200 bg-white p-4 text-sm dark:border-zinc-800 dark:bg-zinc-900">
        <p className="font-medium">Reizo（レイゾー）</p>
        <p className="text-zinc-500 dark:text-zinc-400">冷蔵庫在庫管理・レシピ提案アプリ MVP</p>
      </section>

      <section className="flex flex-col gap-2 rounded-xl border border-zinc-200 bg-white p-4 text-sm dark:border-zinc-800 dark:bg-zinc-900">
        <p className="font-medium">このMVPについて</p>
        <ul className="list-inside list-disc text-zinc-500 dark:text-zinc-400">
          <li>レシートOCR・バーコード読み取り・画像解析は今後のバージョンで対応予定です。</li>
          <li>自動消費ルールはホーム画面を開いたタイミングで実行判定を行います。</li>
          <li>在庫の変更はすべて履歴として保存され、在庫が0未満になることはありません。</li>
        </ul>
      </section>

      <ResetDataButton />
    </div>
  );
}
