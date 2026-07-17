import Link from "next/link";
import InventoryForm from "@/components/InventoryForm";
import { listStorageAreas } from "@/lib/store";

export default function NewInventoryPage() {
  const storageAreas = listStorageAreas();
  return (
    <div className="flex flex-col gap-4 px-4 pt-5">
      <Link href="/" className="text-sm text-zinc-500 hover:underline">
        ← ホーム
      </Link>
      <h1 className="text-lg font-bold">食材を登録</h1>
      <p className="text-sm text-zinc-500 dark:text-zinc-400">
        レシートやバーコードでの読み取りは今後のバージョンで対応予定です。まずは手入力で登録できます。
      </p>
      <InventoryForm storageAreas={storageAreas} />
    </div>
  );
}
