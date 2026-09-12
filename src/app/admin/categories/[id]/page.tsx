import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import CategoryForm from "@/components/admin/category-form";

export default async function EditCategoryPage({
  params,
}: {
  params: { id: string };
}) {
  const supabase = await createClient();
  const { id } = await params;

  const { data: category } = await supabase
    .from("categories")
    .select("*")
    .eq("id", id)
    .single();

  if (!category) notFound();

  return (
    <div className="p-8 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Edit Category</h1>
        <p className="text-gray-500 mt-1">{category.name}</p>
      </div>
      <CategoryForm initialData={category} />
    </div>
  );
}
