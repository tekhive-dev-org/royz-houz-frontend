import { useState } from "react";
import Head from "next/head";
import Link from "next/link";
import { ChevronRight } from "lucide-react";
import {
  CartItemsList,
  OrderSummary,
} from "@/components/merchandise";

const INITIAL_CART_ITEMS = [
  {
    id: "cart-item-1",
    title: "Elegant V-Neck Blouse",
    size: "Large",
    color: "Red",
    price: 3500,
    quantity: 1,
    image: "/assets/img/merchandise/prod-brown-blouse.jpg",
  },
  {
    id: "cart-item-2",
    title: "Causal Outdoor Sneakers",
    size: "Medium",
    color: "Whit & Green",
    price: 15000,
    quantity: 1,
    image: "/assets/img/merchandise/prod-red-sneaker.jpg",
  },
  {
    id: "cart-item-3",
    title: "Skinny Fit Jeans",
    size: "Large",
    color: "Red",
    price: 25500,
    quantity: 1,
    image: "/assets/img/merchandise/prod-burgundy-pump.jpg",
  },
];

/**
 * CartPage Component
 * Full-page shopping cart with item list, quantity updates, delete action,
 * promo code application, order summary calculations, and checkout trigger.
 */
export default function CartPage() {
  const [items, setItems] = useState(INITIAL_CART_ITEMS);

  const handleUpdateQuantity = (id, newQty) => {
    setItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, quantity: newQty } : item))
    );
  };

  const handleRemoveItem = (id) => {
    setItems((prev) => prev.filter((item) => item.id !== id));
  };

  const subtotal = items.reduce(
    (sum, item) => sum + item.price * (item.quantity || 1),
    0
  );
  const discountAmount = subtotal > 0 ? 500 : 0;
  const deliveryFee = subtotal > 0 ? 600 : 0;

  const handleCheckout = () => {
    alert("Proceeding to secure checkout!");
  };

  return (
    <>
      <Head>
        <title>Your Cart — Royz House Store</title>
        <meta
          name="description"
          content="Review items in your Royz House shopping cart and proceed to secure checkout."
        />
        <meta property="og:title" content="Your Cart — Royz House" />
      </Head>

      <main className="min-h-screen bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 pb-24">
          {/* Breadcrumb Navigation: Home > Cart */}
          <nav aria-label="Breadcrumb" className="mb-6">
            <ol className="flex items-center gap-2 text-xs sm:text-sm text-[#868C98]">
              <li>
                <Link href="/" className="hover:text-[#0A0D14] transition-colors">
                  Home
                </Link>
              </li>
              <li aria-hidden="true">
                <ChevronRight className="w-3.5 h-3.5" />
              </li>
              <li aria-current="page" className="font-semibold text-[#0A0D14]">
                Cart
              </li>
            </ol>
          </nav>

          {/* Page Heading */}
          <h1 className="text-3xl sm:text-4xl font-extrabold text-[#0A0D14] tracking-tight mb-8">
            Your cart
          </h1>

          {/* 2-Column Cart Layout */}
          <div className="flex flex-col lg:flex-row items-start gap-8 lg:gap-12">
            {/* Left: Cart Items List */}
            <div className="flex-1 w-full">
              <CartItemsList
                items={items}
                onUpdateQuantity={handleUpdateQuantity}
                onRemoveItem={handleRemoveItem}
              />
            </div>

            {/* Right: Order Summary Card */}
            {items.length > 0 && (
              <OrderSummary
                subtotal={subtotal}
                discountAmount={discountAmount}
                discountLabel="Discount (-20%)"
                deliveryFee={deliveryFee}
                onCheckout={handleCheckout}
              />
            )}
          </div>
        </div>
      </main>
    </>
  );
}
