import Link from "next/link";
import RuleForm from "@/components/RuleForm";
import { listInventory } from "@/lib/store";

export const dynamic = "force-dynamic";

export default async function NewRulePage() {
  const items = listInventory();
  return (
    <div className="flex flex-col gap-4 px-4 pt-5">
      <Link href="/rules" className="text-sm text-zinc-500 hover:underline">
        ← 自動消費ルール一覧
      </Link>
      <h1 className="text-lg font-bold">自動消費ルールを作成</h1>
      <RuleForm items={items} />
    </div>
  );
}
