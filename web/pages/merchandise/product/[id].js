import { useState } from "react";
import Head from "next/head";
import { ShoppingBag } from "lucide-react";
import {
  CategoryBreadcrumb,
  ProductGallery,
  ProductInfo,
  PDPFeatures,
  ProductEditorial,
  ProductReviews,
  RecentlyViewed,
  CartDrawer,
} from "@/components/merchandise";

const DEFAULT_PRODUCT = {
  id: "womens-neckline-fitted-top",
  title: "Women's Neckline Buttoned Elegant Fitted Top",
  category: "Women",
  price: 8500,
  oldPrice: 12500,
  discountPercent: "-32%",
  rating: 5,
  reviewsCount: 128,
  description:
    "An ultra-elegant, fitted knit short-sleeve silhouette with a draped asymmetric neckline featuring a signature gold button pin. Crafted from luxury textured chevron stretch knit, giving both structured elegance and breathable all-day comfort.",
  images: [
    "/assets/img/merchandise/pdp-blouse-front.jpg",
    "/assets/img/merchandise/pdp-blouse-detail.jpg",
    "/assets/img/merchandise/pdp-blouse-back.jpg",
    "/assets/img/merchandise/pdp-blouse-angled.jpg",
  ],
  editorialImages: [
    "/assets/img/merchandise/prod-brown-blouse.jpg",
    "/assets/img/merchandise/pdp-blouse-detail.jpg",
  ],
};

/**
 * ProductDetailPage
 * Full e-commerce PDP featuring multi-angle photo gallery, sticky purchase panel,
 * value props, editorial lookbook, verified customer reviews, and recently viewed products.
 */
export default function ProductDetailPage() {
  const product = DEFAULT_PRODUCT;

  // Cart state
  const [cart, setCart] = useState([]);
  const [isCartOpen, setIsCartOpen] = useState(false);

  const handleAddToCart = (itemConfig) => {
    setCart((prev) => {
      const existing = prev.find(
        (item) =>
          item.id === product.id &&
          item.selectedSize === itemConfig.selectedSize &&
          item.selectedColor === itemConfig.selectedColor
      );
      if (existing) {
        return prev.map((item) =>
          item === existing
            ? { ...item, quantity: item.quantity + (itemConfig.quantity || 1) }
            : item
        );
      }
      return [
        ...prev,
        {
          id: product.id,
          title: product.title,
          price: product.price,
          image: product.images[0],
          selectedColor: itemConfig.selectedColor || "brown",
          selectedSize: itemConfig.selectedSize || "Large",
          quantity: itemConfig.quantity || 1,
        },
      ];
    });
    setIsCartOpen(true);
  };

  const handleUpdateQuantity = (cartItemId, newQty) => {
    setCart((prev) =>
      prev.map((item) => (item.id === cartItemId ? { ...item, quantity: newQty } : item))
    );
  };

  const handleRemoveItem = (cartItemId) => {
    setCart((prev) => prev.filter((item) => item.id !== cartItemId));
  };

  const totalCartCount = cart.reduce((sum, item) => sum + (item.quantity || 1), 0);

  return (
    <>
      <Head>
        <title>{product.title} — Royz House Store</title>
        <meta
          name="description"
          content={`${product.title}. Discover handcrafted luxury fashion on Royz House Store.`}
        />
        <meta property="og:title" content={`${product.title} — Royz House`} />
        <meta property="og:image" content={product.images[0]} />
      </Head>

      <main className="min-h-screen bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4 pb-20">
          {/* Breadcrumb Navigation: Home > Shop > Women > Title */}
          <CategoryBreadcrumb
            categoryName={product.category}
            currentProductTitle={product.title}
          />

          {/* Main 2-Column Product Showcase */}
          <div className="flex flex-col lg:flex-row items-start gap-8 lg:gap-14">
            {/* Left: 4-Angle Gallery Stack */}
            <ProductGallery
              images={product.images}
              productTitle={product.title}
            />

            {/* Right: Sticky Purchase & Info Panel */}
            <ProductInfo
              title={product.title}
              price={product.price}
              oldPrice={product.oldPrice}
              discountPercent={product.discountPercent}
              rating={product.rating}
              reviewsCount={product.reviewsCount}
              description={product.description}
              onAddToCart={handleAddToCart}
            />
          </div>

          {/* 3-Column Value Propositions Banner */}
          <PDPFeatures />

          {/* Editorial Lookbook Showcase */}
          <ProductEditorial
            title="Elegant Line"
            subtitle="EXPLORE OUR EXCLUSIVE EDITORIAL"
            images={product.editorialImages}
          />

          {/* Customer Reviews & Ratings */}
          <ProductReviews
            overallRating="4.9"
            totalReviews={product.reviewsCount}
          />

          {/* Recently Viewed Carousel / Grid */}
          <RecentlyViewed
            onAddToCart={(p) => {
              setCart((prev) => [...prev, { ...p, quantity: 1 }]);
              setIsCartOpen(true);
            }}
            onQuickView={(p) => {
              setCart((prev) => [...prev, { ...p, quantity: 1 }]);
              setIsCartOpen(true);
            }}
          />
        </div>

        {/* Floating Cart Button */}
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
