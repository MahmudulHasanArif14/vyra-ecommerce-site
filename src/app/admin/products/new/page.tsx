import { createClient } from "@/lib/supabase/server";
import ProductForm from "@/components/admin/product-form";

export default async function NewProductPage() {
  const supabase = await createClient();
  const { data: categories } = await supabase
    .from("categories")
    .select("id, name")
    .eq("is_active", true)
    .order("sort_order");

  return (
    <div className="p-8 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Add New Product</h1>
        <p className="text-gray-500 mt-1">
          Create a new product for your store
        </p>
      </div>
      <ProductForm categories={categories || []} />
    </div>
  );
}
