import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import Image from "next/image";
import { Plus, Edit, Trash2 } from "lucide-react";
import CategoryDeleteButton from "./delete-button";

export default async function AdminCategoriesPage() {
  const supabase = await createClient();

  const { data: categories } = await supabase
    .from("categories")
    .select("*, products(count)")
    .order("sort_order", { ascending: true });

  return (
    <div className="p-8 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Categories</h1>
          <p className="text-gray-500 mt-1">
            Organize your products into categories
          </p>
        </div>
        <Link
          href="/admin/categories/new"
          className="flex items-center gap-2 bg-black text-white px-5 py-3 rounded-md text-sm tracking-wider hover:bg-gray-800"
        >
          <Plus className="w-4 h-4" />
          ADD CATEGORY
        </Link>
      </div>

      <div className="bg-white rounded-lg border overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="text-left p-4 text-xs font-semibold uppercase text-gray-500">
                Category
              </th>
              <th className="text-left p-4 text-xs font-semibold uppercase text-gray-500">
                Slug
              </th>
              <th className="text-left p-4 text-xs font-semibold uppercase text-gray-500">
                Products
              </th>
              <th className="text-left p-4 text-xs font-semibold uppercase text-gray-500">
                Order
              </th>
              <th className="text-left p-4 text-xs font-semibold uppercase text-gray-500">
                Status
              </th>
              <th className="text-left p-4 text-xs font-semibold uppercase text-gray-500">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {categories?.map((cat: any) => (
              <tr key={cat.id} className="hover:bg-gray-50">
                <td className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="relative w-12 h-12 rounded-md overflow-hidden bg-gray-100 shrink-0">
                      {cat.image_url ? (
                        <Image
                          src={cat.image_url}
                          alt={cat.name}
                          fill
                          className="object-cover"
                        />
                      ) : (
                        <div className="w-full h-full bg-gray-200" />
                      )}
                    </div>
                    <div>
                      <p className="font-medium text-sm">{cat.name}</p>
                      {cat.description && (
                        <p className="text-xs text-gray-500 truncate max-w-xs">
                          {cat.description}
                        </p>
                      )}
                    </div>
                  </div>
                </td>
                <td className="p-4 text-sm text-gray-600">{cat.slug}</td>
                <td className="p-4 text-sm">{cat.products?.[0]?.count || 0}</td>
                <td className="p-4 text-sm">{cat.sort_order}</td>
                <td className="p-4">
                  <span
                    className={`text-[10px] uppercase px-2 py-1 rounded ${
                      cat.is_active
                        ? "bg-green-100 text-green-800"
                        : "bg-gray-100 text-gray-800"
                    }`}
                  >
                    {cat.is_active ? "Active" : "Inactive"}
                  </span>
                </td>
                <td className="p-4">
                  <div className="flex items-center gap-3">
                    <Link
                      href={`/admin/categories/${cat.id}`}
                      className="text-gray-600 hover:text-black"
                    >
                      <Edit className="w-4 h-4" />
                    </Link>
                    <CategoryDeleteButton id={cat.id} name={cat.name} />
                  </div>
                </td>
              </tr>
            ))}
            {!categories?.length && (
              <tr>
                <td colSpan={6} className="p-12 text-center text-gray-500">
                  No categories yet.{" "}
                  <Link
                    href="/admin/categories/new"
                    className="text-black underline"
                  >
                    Add your first category
                  </Link>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
