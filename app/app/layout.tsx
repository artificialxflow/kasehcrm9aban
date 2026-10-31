import { CartProvider } from "@/components/customer-app/CartContext";

export default function CustomerAppLayout({ children }: { children: React.ReactNode }) {
  return (
    <CartProvider>
      <div className="min-h-screen bg-slate-50 py-6">{children}</div>
    </CartProvider>
  );
}
