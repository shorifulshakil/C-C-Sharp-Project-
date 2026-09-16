'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import { useAuth } from '@/features/auth';
import { customerApi } from '@/services/api';
import { ProtectedRoute } from '@/features/auth/ProtectedRoute';
import { Button, Input, Card, CardBody, CardFooter, Spinner } from '@/components/ui';
import { formatPrice } from '@/lib/utils';

function CheckoutContent() {
  const router = useRouter();
  const { user } = useAuth();
  const [address, setAddress] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [cart, setCart] = useState<{ totalAmount: number; items: Array<{ productId: string; quantity: number; productName: string; subtotal: number }> } | null>(null);

  const fetchCart = async () => {
    try {
      const response = await customerApi.getCart();
      if (!response.data.items || response.data.items.length === 0) {
        toast.error('Your cart is empty');
        router.push('/cart');
        return;
      }
      setCart(response.data);
    } catch {
      toast.error('Failed to load cart');
    }
  };

  useEffect(() => { fetchCart(); }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!address.trim()) {
      toast.error('Please enter a shipping address');
      return;
    }
    setIsLoading(true);
    try {
      await customerApi.createOrder({ shippingAddress: address });
      toast.success('Order placed successfully!');
      router.push('/orders');
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      toast.error(error.response?.data?.message || 'Failed to place order');
    } finally {
      setIsLoading(false);
    }
  };

  if (!cart) {
    return (
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-12 flex justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-2xl font-bold text-neutral-900 mb-6 font-heading">Checkout</h1>
      <Card>
        <CardBody>
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input label="Shipping Address" value={address} onChange={(e) => setAddress(e.target.value)} placeholder="Enter your full shipping address" required />
            {cart.items && cart.items.length > 0 && (
              <div className="border-t border-neutral-200 pt-4 space-y-3">
                <p className="text-sm font-semibold text-neutral-900">Order Items</p>
                {cart.items.map((item) => (
                  <div key={item.productId} className="flex justify-between text-sm">
                    <span className="text-neutral-600">{item.productName} x{item.quantity}</span>
                    <span className="font-medium">{formatPrice(item.subtotal)}</span>
                  </div>
                ))}
              </div>
            )}
            <div className="border-t border-neutral-200 pt-4">
              <p className="text-sm text-neutral-600 mb-1">Order Total</p>
              <p className="text-2xl font-bold text-primary-600">{formatPrice(cart.totalAmount)}</p>
            </div>
          </form>
        </CardBody>
        <CardFooter className="flex justify-between">
          <Button variant="outline" onClick={() => router.back()}>Back</Button>
          <Button onClick={handleSubmit} isLoading={isLoading}>Place Order</Button>
        </CardFooter>
      </Card>
    </div>
  );
}

export default function CheckoutPage() {
  return (
    <ProtectedRoute allowedRoles={['Customer']}>
      <CheckoutContent />
    </ProtectedRoute>
  );
}
