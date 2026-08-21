import { useState } from "react";
import Head from "next/head";
import { useRouter } from "next/router";
import { ShoppingBag } from "lucide-react";
import {
  MerchHero,
  MerchFeatures,
  MerchCollections,
  MerchProductGrid,
  MerchWhyUs,
  MerchTestimonial,
  MerchStatsBanner,
  MerchCTA,
  CartDrawer,
} from "@/components/merchandise";

// ── Products Matching Figma Specification ─────────────
const NEW_ARRIVALS = [
  {
    id: "new-1",
    title: "Breathable Mesh Height-Increasing Casual",
    category: "CASUAL SNEAKERS",
    rating: 5,
    reviewsCount: 128,
    price: 15000,
    badge: "New",
    image: "/assets/img/merchandise/prod-red-sneaker.jpg",
  },
  {
    id: "new-2",
    title: "10 Sizes Available. Women's High Heels.",
    category: "WOMENS PUMP",
    rating: 5,
    reviewsCount: 128,
    price: 9800,
    badge: "New",
    image: "/assets/img/merchandise/prod-burgundy-pump.jpg",
  },
  {
    id: "new-3",
    title: "Men's Casual Cargo Wide Leg Pants",
    category: "WOMEN'S PANTS",
    rating: 5,
    reviewsCount: 128,
    price: 8500,
    badge: "New",
    image: "/assets/img/merchandise/prod-houndstooth-pants.jpg",
  },
  {
    id: "new-4",
    title: "Elegant Women Shoes Classy Lady Shoes",
    category: "HEEL SANDALS",
    rating: 5,
    reviewsCount: 128,
    price: 5500,
    badge: "New",
    image: "/assets/img/merchandise/prod-white-platforms.jpg",
  },
  {
    id: "new-5",
    title: "Movement Tree",
    category: "SNEAKERS",
    rating: 5,
    reviewsCount: 128,
    price: 9800,
    badge: "New",
    image: "/assets/img/merchandise/prod-retro-sneakers.jpg",
  },
];

const COMMUNITY_FAVORITES = [
  {
    id: "fav-1",
    title: "Vibrant Fuchsia Slingback Stilettos",
    category: "HEELS / LUXURY",
    rating: "5.0",
    price: 48000,
    oldPrice: 55000,
    badge: "Top",
    image: "/assets/img/merchandise/collection-pink-heels.jpg",
  },
  {
    id: "fav-2",
    title: "Gold Chronograph Wristwatch",
    category: "ACCESSORIES / WATCHES",
    rating: "4.9",
    price: 85000,
    oldPrice: 95000,
    badge: "Best Seller",
    image: "/assets/img/merchandise/collection-luxury-watch.jpg",
  },
  {
    id: "fav-3",
    title: "Blush Pink Quilted Leather Bag",
    category: "WOMEN'S / BAGS",
    rating: "4.9",
    price: 52000,
    oldPrice: 60000,
    badge: "Top",
    image: "/assets/img/merchandise/collection-pink-bag.jpg",
  },
  {
    id: "fav-4",
    title: "Classic Two-Tone Suede Trainers",
    category: "MEN'S / FOOTWEAR",
    rating: "4.8",
    price: 40000,
    oldPrice: 46000,
    badge: "Best Seller",
    image: "/assets/img/merchandise/collection-men-sneakers.jpg",
  },
  {
    id: "fav-5",
    title: "Open-Toe High Block Platform Mules",
    category: "WOMEN'S / HEELS",
    rating: "4.9",
    price: 36000,
    oldPrice: 42000,
    badge: "Top",
    image: "/assets/img/merchandise/prod-white-platforms.jpg",
  },
];

/**
 * Merchandise / Store Page
 */
export default function MerchandisePage() {
  const router = useRouter();
  const [cart, setCart] = useState([
    {
      id: "new-1",
      title: "Breathable Running Sneakers",
      category: "FOOTWEAR / SNEAKERS",
      price: 35000,
      quantity: 1,
      image: "/assets/img/merchandise/prod-red-sneaker.jpg",
    },
  ]);
  const [isCartOpen, setIsCartOpen] = useState(false);

  const handleAddToCart = (product) => {
    setCart((prev) => {
      const existing = prev.find((item) => item.id === product.id);
      if (existing) {
        return prev.map((item) =>
          item.id === product.id
            ? { ...item, quantity: (item.quantity || 1) + 1 }
            : item
        );
      }
      return [...prev, { ...product, quantity: 1 }];
    });
    setIsCartOpen(true);
  };

  const handleUpdateQuantity = (id, newQty) => {
    setCart((prev) =>
      prev.map((item) => (item.id === id ? { ...item, quantity: newQty } : item))
    );
  };

  const handleRemoveItem = (id) => {
    setCart((prev) => prev.filter((item) => item.id !== id));
  };

  const handleScrollToArrivals = () => {
    const el = document.getElementById("new-arrivals");
    if (el) {
      el.scrollIntoView({ behavior: "smooth" });
    }
  };

  const handleSelectCategory = (categoryId) => {
    router.push(`/merchandise/category/${categoryId}`);
  };

  const totalCartCount = cart.reduce((sum, item) => sum + (item.quantity || 1), 0);

  return (
    <>
      <Head>
        <title>Merchandise &amp; Sustainable Fashion Store — Royz House</title>
        <meta
          name="description"
          content="Discover stylish body-care and fashion essentials on Royz House. Every purchase empowers creative talents and sustainable programs across Africa."
        />
        <meta
          property="og:title"
          content="Merchandise & Sustainable Fashion Store — Royz House"
        />
        <meta
          property="og:description"
          content="Explore curated collections that combine luxury, elegance, and social impact."
        />
        <meta property="og:type" content="website" />
      </Head>

      <main className="min-h-screen bg-white">
        {/* 1. Hero Section */}
        <MerchHero onShopNowClick={handleScrollToArrivals} />

        {/* 2. Key Value Propositions Bar */}
        <MerchFeatures />

        {/* 3. Explore Our Collections Grid */}
        <MerchCollections onSelectCategory={handleSelectCategory} />

        {/* 4. New Arrivals Product Row */}
        <div id="new-arrivals">
          <MerchProductGrid
            sectionTag="JUST IN"
            title="New Arrivals"
            subtitle="Fresh pieces. New energy. Discover what just landed."
            viewAllLink={true}
            products={NEW_ARRIVALS}
            onAddToCart={handleAddToCart}
            onBottomAction={() => router.push("/merchandise/category/casual")}
          />
        </div>

        {/* 5. Loved by the Community Row */}
        <MerchProductGrid
          sectionTag="COMMUNITY FAVORITES"
          title="Loved by the Community"
          subtitle="Top rated pieces worn and recommended by our creative network"
          viewAllLink={true}
          products={COMMUNITY_FAVORITES}
          onAddToCart={handleAddToCart}
          bottomActionText="View All Bestsellers"
          onBottomAction={() => router.push("/merchandise/category/casual")}
        />

        {/* 6. Why Shop at Royz House */}
        <MerchWhyUs />

        {/* 7. Community Testimonial Stories */}
        <MerchTestimonial />

        {/* 8. What Makes Us Different & Stats */}
        <MerchStatsBanner />

        {/* 9. Elevate Your Wardrobe Promotion Banner */}
        <MerchCTA onShopNowClick={() => router.push("/merchandise/category/casual")} />

        {/* ── Floating Bag Notification Trigger ────────── */}
        <button
          type="button"
          onClick={() => setIsCartOpen(true)}
          className="fixed bottom-6 right-6 z-40 bg-[#0A0D14] hover:bg-[#B46A2C] text-white p-3.5 sm:p-4 rounded-full shadow-2xl transition-all duration-300 flex items-center gap-2 cursor-pointer hover:scale-105 active:scale-95 group"
          aria-label="Open Cart"
        >
          <ShoppingBag className="w-5 h-5 group-hover:scale-110 transition-transform" />
          {totalCartCount > 0 && (
            <span className="bg-[#B46A2C] group-hover:bg-white group-hover:text-[#B46A2C] text-white text-xs font-extrabold w-5 h-5 rounded-full flex items-center justify-center transition-colors">
              {totalCartCount}
            </span>
          )}
        </button>

        {/* ── Slide-Over Shopping Cart Drawer ─────────── */}
        <CartDrawer
          isOpen={isCartOpen}
          onClose={() => setIsCartOpen(false)}
          cartItems={cart}
          onUpdateQuantity={handleUpdateQuantity}
          onRemoveItem={handleRemoveItem}
          onCheckout={() => {
            alert("Redirecting to secure payment for your Royz House merchandise order!");
            setIsCartOpen(false);
          }}
        />
      </main>
    </>
  );
}
