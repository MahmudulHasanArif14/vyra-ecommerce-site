import { getSettings, getNumber } from "@/lib/settings";
import { createClient } from "@/lib/supabase/server";
import CheckoutClient from "./checkout-client";

export default async function CheckoutPage() {
  const settings = await getSettings();
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  let userDefaults = null;
  if (user) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("full_name, phone")
      .eq("id", user.id)
      .single();

    userDefaults = {
      fullName: profile?.full_name || "",
      email: user.email || "",
      phone: profile?.phone || "",
    };
  }

  return (
    <CheckoutClient
      deliveryCharge={getNumber(settings.delivery_charge, 100)}
      freeThreshold={getNumber(settings.free_delivery_threshold, 5000)}
      userDefaults={userDefaults}
    />
  );
}
