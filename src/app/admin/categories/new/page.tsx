import CategoryForm from "@/components/admin/category-form";

export default function NewCategoryPage() {
  return (
    <div className="p-8 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Add Category</h1>
        <p className="text-gray-500 mt-1">Create a new product category</p>
      </div>
      <CategoryForm />
    </div>
  );
}
