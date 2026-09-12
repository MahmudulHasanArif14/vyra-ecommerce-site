import { createClient } from "@/lib/supabase/server";
import SettingsForm from "./settings-form";

export default async function AdminSettingsPage() {
  const supabase = await createClient();

  const { data: settings } = await supabase
    .from("site_settings")
    .select("*")
    .order("category")
    .order("key");

  return (
    <div className="p-8 space-y-6 max-w-4xl">
      <div>
        <h1 className="text-3xl font-bold">Site Settings</h1>
        <p className="text-gray-500 mt-1">
          Manage your store details. Changes are visible on the storefront
          immediately.
        </p>
      </div>

      <SettingsForm initialSettings={settings || []} />
    </div>
  );
}
