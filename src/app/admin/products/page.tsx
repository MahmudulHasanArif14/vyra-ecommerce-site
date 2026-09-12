import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import Image from "next/image";
import { Plus, Edit, Eye } from "lucide-react";

export default async function AdminProductsPage() {
  const supabase = await createClient();

  const { data: products } = await supabase
    .from("products")
    .select(
      `
      id, name, slug, base_price, is_active, featured, created_at,
      categories(name),
      product_images(image_url, is_primary),
      product_variants(stock_quantity)
    `,
    )
    .order("created_at", { ascending: false });

  return (
    <div className="p-8 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Products</h1>
          <p className="text-gray-500 mt-1">Manage your product catalog</p>
        </div>
        <Link
          href="/admin/products/new"
          className="flex items-center gap-2 bg-black text-white px-5 py-3 rounded-md text-sm tracking-wider hover:bg-gray-800"
        >
          <Plus className="w-4 h-4" />
          ADD PRODUCT
        </Link>
      </div>

      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="text-left p-4 text-xs font-semibold uppercase text-gray-500">
                Product
              </th>
              <th className="text-left p-4 text-xs font-semibold uppercase text-gray-500">
                Category
              </th>
              <th className="text-left p-4 text-xs font-semibold uppercase text-gray-500">
                Price
              </th>
              <th className="text-left p-4 text-xs font-semibold uppercase text-gray-500">
                Stock
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
            {products?.map((product: any) => {
              const primaryImage =
                product.product_images?.find((i: any) => i.is_primary)
                  ?.image_url || product.product_images?.[0]?.image_url;
              const totalStock =
                product.product_variants?.reduce(
                  (sum: number, v: any) => sum + (v.stock_quantity || 0),
                  0,
                ) || 0;

              return (
                <tr key={product.id} className="hover:bg-gray-50">
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="relative w-12 h-12 rounded-md overflow-hidden bg-gray-100 shrink-0">
                        {primaryImage ? (
                          <Image
                            src={primaryImage}
                            alt={product.name}
                            fill
                            className="object-cover"
                          />
                        ) : (
                          <div className="w-full h-full bg-gray-200" />
                        )}
                      </div>
                      <div>
                        <p className="font-medium text-sm">{product.name}</p>
                        <p className="text-xs text-gray-500">{product.slug}</p>
                      </div>
                    </div>
                  </td>
                  <td className="p-4 text-sm">
                    {product.categories?.name || "—"}
                  </td>
                  <td className="p-4 text-sm font-medium">
                    ৳{product.base_price}
                  </td>
                  <td className="p-4">
                    <span
                      className={`text-sm font-medium ${
                        totalStock === 0
                          ? "text-red-600"
                          : totalStock < 10
                            ? "text-yellow-600"
                            : "text-green-600"
                      }`}
                    >
                      {totalStock}
                    </span>
                  </td>
                  <td className="p-4">
                    <span
                      className={`text-[10px] uppercase px-2 py-1 rounded ${
                        product.is_active
                          ? "bg-green-100 text-green-800"
                          : "bg-gray-100 text-gray-800"
                      }`}
                    >
                      {product.is_active ? "Active" : "Draft"}
                    </span>
                    {product.featured && (
                      <span className="ml-1 text-[10px] uppercase px-2 py-1 rounded bg-purple-100 text-purple-800">
                        Featured
                      </span>
                    )}
                  </td>
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <Link
                        href={`/admin/products/${product.id}`}
                        className="text-gray-600 hover:text-black"
                      >
                        <Edit className="w-4 h-4" />
                      </Link>
                      <Link
                        href={`/products/${product.slug}`}
                        target="_blank"
                        className="text-gray-600 hover:text-black"
                      >
                        <Eye className="w-4 h-4" />
                      </Link>
                    </div>
                  </td>
                </tr>
              );
            })}
            {!products?.length && (
              <tr>
                <td colSpan={6} className="p-12 text-center text-gray-500">
                  No products yet.{" "}
                  <Link
                    href="/admin/products/new"
                    className="text-black underline"
                  >
                    Add your first product
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
