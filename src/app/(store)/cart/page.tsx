"use client";

import { useCart } from "@/hooks/use-cart";
import Image from "next/image";
import Link from "next/link";
import { Trash2, Plus, Minus } from "lucide-react";

export default function CartPage() {
  const { items, removeItem, updateQuantity, cartTotal, cartCount } = useCart();

  if (items.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-24 text-center">
        <h1 className="text-3xl font-bold mb-4">Your Cart is Empty</h1>
        <p className="text-gray-500 mb-8">
          Looks like you haven't added anything yet.
        </p>
        <Link
          href="/products"
          className="bg-black text-white px-8 py-3 text-sm tracking-widest hover:bg-gray-800 transition"
        >
          CONTINUE SHOPPING
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold mb-8">
        Shopping Cart ({cartCount} items)
      </h1>

      <div className="grid lg:grid-cols-3 gap-12">
        {/* Cart Items */}
        <div className="lg:col-span-2 space-y-6">
          {items.map((item) => (
            <div key={item.variantId} className="flex gap-6 border-b pb-6">
              <div className="relative w-24 h-24 rounded-md overflow-hidden bg-gray-100">
                <Image
                  src={
                    item.image ||
                    "https://images.unsplash.com/photo-1548036328-c9fa89d128fa?q=80&w=200"
                  }
                  alt={item.name}
                  fill
                  sizes="96px"
                  className="object-cover"
                />
              </div>
              <div className="flex-1 space-y-2">
                <h3 className="font-semibold">{item.name}</h3>
                <p className="text-sm text-gray-500">
                  {item.color && `Color: ${item.color}`}{" "}
                  {item.size && `| Size: ${item.size}`}
                </p>
                <p className="font-medium">৳{item.price}</p>

                <div className="flex items-center gap-4 mt-2">
                  <div className="flex items-center border rounded-md">
                    <button
                      onClick={() =>
                        updateQuantity(item.variantId, item.quantity - 1)
                      }
                      className="p-2 hover:bg-gray-100"
                    >
                      <Minus className="w-4 h-4" />
                    </button>
                    <span className="px-4 text-sm font-medium">
                      {item.quantity}
                    </span>
                    <button
                      onClick={() =>
                        updateQuantity(item.variantId, item.quantity + 1)
                      }
                      className="p-2 hover:bg-gray-100"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                  <button
                    onClick={() => removeItem(item.variantId)}
                    className="text-red-500 hover:text-red-700 p-2"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Order Summary */}
        <div className="bg-gray-50 p-6 rounded-lg h-fit space-y-4">
          <h2 className="text-xl font-bold">Order Summary</h2>
          <div className="flex justify-between text-sm">
            <span>Subtotal</span>
            <span>৳{cartTotal}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span>Delivery</span>
            <span>Calculated at checkout</span>
          </div>
          <div className="border-t pt-4 flex justify-between font-bold text-lg">
            <span>Total</span>
            <span>৳{cartTotal}</span>
          </div>
          <Link
            href="/checkout"
            className="block w-full text-center bg-black text-white py-4 text-sm tracking-widest hover:bg-gray-800 transition"
          >
            PROCEED TO CHECKOUT
          </Link>
        </div>
      </div>
    </div>
  );
}
