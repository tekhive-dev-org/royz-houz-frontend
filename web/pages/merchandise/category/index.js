import { useState } from "react";
import Head from "next/head";
import { useRouter } from "next/router";
import { ShoppingBag } from "lucide-react";
import {
  CategoryBreadcrumb,
  CategorySidebar,
  CategoryProductGrid,
  MerchCTA,
  CartDrawer,
} from "@/components/merchandise";

const CASUAL_PRODUCTS = [
  {
    id: "cat-1",
    title: "Women's Minimalist Pointed Toe High-Heel",
    category: "COVER TOE SHOE",
    price: 15000,
    badge: "New",
    rating: 5,
    reviewsCount: 128,
    image: "/assets/img/merchandise/collection-pink-heels.jpg",
  },
  {
    id: "cat-2",
    title: "Pants with Tipping Details",
    category: "WOMEN'S PANT",
    price: 9800,
    badge: "New",
    rating: 5,
    reviewsCount: 128,
    image: "/assets/img/merchandise/prod-pattern-pants.jpg",
  },
  {
    id: "cat-3",
    title: "Elegant European, Women's Fashion bag",
    category: "WOMEN'S",
    price: 8500,
    badge: "New",
    rating: 5,
    reviewsCount: 128,
    image: "/assets/img/merchandise/prod-croc-bag.jpg",
  },
  {
    id: "cat-4",
    title: "Women's Minimalist Open Toe High-Heel",
    category: "HIGH HEEL SHOES",
    price: 15000,
    badge: "New",
    rating: 5,
    reviewsCount: 128,
    image: "/assets/img/merchandise/prod-white-platforms.jpg",
  },
  {
    id: "cat-5",
    title: "Women's Sneakers with Red Color",
    category: "CASUAL SNEAKERS",
    price: 9800,
    badge: "New",
    rating: 5,
    reviewsCount: 128,
    image: "/assets/img/merchandise/prod-red-sneaker.jpg",
  },
  {
    id: "cat-6",
    title: "Elegant European, Women's Fashion shirt",
    category: "WOMEN'S ELEGANT",
    price: 8500,
    badge: "New",
    rating: 5,
    reviewsCount: 128,
    image: "/assets/img/merchandise/prod-brown-blouse.jpg",
  },
  {
    id: "cat-7",
    title: "Women's Casual Commuter Solid Pants",
    category: "WOMEN'S PANT",
    price: 15000,
    badge: "New",
    rating: 5,
    reviewsCount: 128,
    image: "/assets/img/merchandise/prod-houndstooth-pants.jpg",
  },
  {
    id: "cat-8",
    title: "High Fashion Bag, Versatile Women's Bag",
    category: "MOTHER HANDBAG",
    price: 9800,
    badge: "New",
    rating: 5,
    reviewsCount: 128,
    image: "/assets/img/merchandise/prod-red-handbag.jpg",
  },
  {
    id: "cat-9",
    title: "Elegant European, Women's Fashion Heel",
    category: "WOMEN'S SHOE",
    price: 8500,
    badge: "New",
    rating: 5,
    reviewsCount: 128,
    image: "/assets/img/merchandise/prod-burgundy-pump.jpg",
  },
];

/**
 * ProductCategoryPage
 * Full category catalogue view with interactive filters, 3-column product grid, and cart drawer.
 */
export default function ProductCategoryPage() {
  const router = useRouter();
  const { slug } = router.query;

  const categoryTitle =
    typeof slug === "string"
      ? slug.charAt(0).toUpperCase() + slug.slice(1)
      : "Casual";

  const [selectedCategory, setSelectedCategory] = useState(
    typeof slug === "string" ? slug : "casual"
  );
  const [selectedColor, setSelectedColor] = useState("blue");
  const [selectedSize, setSelectedSize] = useState("Large");
  const [selectedDressStyle, setSelectedDressStyle] = useState("casual");
  const [priceRange, setPriceRange] = useState([1000, 8000]);
  const [sortBy, setSortBy] = useState("popular");
  const [currentPage, setCurrentPage] = useState(1);

  // Cart state
  const [cart, setCart] = useState([]);
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

  const handleApplyFilters = () => {
    // Scroll smoothly to products grid
    const el = document.getElementById("catalog-grid");
    if (el) {
      el.scrollIntoView({ behavior: "smooth" });
    }
  };

  const totalCartCount = cart.reduce((sum, item) => sum + (item.quantity || 1), 0);

  return (
    <>
      <Head>
        <title>{categoryTitle} Collection — Royz House Store</title>
        <meta
          name="description"
          content={`Explore our exclusive ${categoryTitle} collection on Royz House. Discover handcrafted fashion, footwear, and accessories.`}
        />
        <meta
          property="og:title"
          content={`${categoryTitle} Collection — Royz House`}
        />
      </Head>

      <main className="min-h-screen bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 pb-16">
          {/* Breadcrumb Navigation */}
          <CategoryBreadcrumb categoryName={categoryTitle} />

          {/* Main Layout: Sidebar Filters + Product Grid */}
          <div id="catalog-grid" className="flex flex-col lg:flex-row items-start gap-8 lg:gap-10">
            {/* Left Filter Sidebar */}
            <CategorySidebar
              selectedCategory={selectedCategory}
              onSelectCategory={(catId) => {
                setSelectedCategory(catId);
                router.push(`/merchandise/category/${catId}`, undefined, { shallow: true });
              }}
              priceRange={priceRange}
              onPriceChange={setPriceRange}
              selectedColor={selectedColor}
              onSelectColor={setSelectedColor}
              selectedSize={selectedSize}
              onSelectSize={setSelectedSize}
              selectedDressStyle={selectedDressStyle}
              onSelectDressStyle={setSelectedDressStyle}
              onApplyFilters={handleApplyFilters}
            />

            {/* Right Product Grid */}
            <CategoryProductGrid
              categoryTitle={categoryTitle}
              products={CASUAL_PRODUCTS}
              totalProductsCount={100}
              sortBy={sortBy}
              onSortChange={setSortBy}
              currentPage={currentPage}
              onPageChange={setCurrentPage}
              onAddToCart={handleAddToCart}
              onQuickView={(p) => handleAddToCart(p)}
            />
          </div>
        </div>

        {/* Elevate Your Wardrobe Bottom CTA Banner */}
        <MerchCTA
          onShopNowClick={() => {
            const el = document.getElementById("catalog-grid");
            if (el) {
              el.scrollIntoView({ behavior: "smooth" });
            }
          }}
        />

        {/* Floating Cart Badge Button */}
        <button
          type="button"
          onClick={() => setIsCartOpen(true)}
          className="fixed bottom-6 right-6 z-40 bg-[#0A0D14] hover:bg-[#B46A2C] text-white p-3.5 sm:p-4 rounded-full shadow-2xl transition-all duration-300 flex items-center gap-2 cursor-pointer hover:scale-105 active:scale-95"
          aria-label="Open Cart"
        >
          <ShoppingBag className="w-5 h-5" />
          {totalCartCount > 0 && (
            <span className="bg-[#B46A2C] text-white text-xs font-extrabold w-5 h-5 rounded-full flex items-center justify-center">
              {totalCartCount}
            </span>
          )}
        </button>

        {/* Cart Drawer */}
        <CartDrawer
          isOpen={isCartOpen}
          onClose={() => setIsCartOpen(false)}
          cartItems={cart}
          onUpdateQuantity={handleUpdateQuantity}
          onRemoveItem={handleRemoveItem}
          onCheckout={() => {
            alert("Proceeding to secure checkout!");
            setIsCartOpen(false);
          }}
        />
      </main>
    </>
  );
}
