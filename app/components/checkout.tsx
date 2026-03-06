'use client'

import { useCallback } from 'react'
import {
    EmbeddedCheckout,
    EmbeddedCheckoutProvider
} from '@stripe/react-stripe-js'
import { loadStripe } from '@stripe/stripe-js'
import { startCheckoutSession } from '@/app/actions/stripe'

// Initialize Stripe outside of the component render cycle
const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY as string)

export default function Checkout({ productId }: { productId: string }) {
    const startCheckoutSessionForProduct = useCallback(
        () => startCheckoutSession(productId),
        [productId]
    )

    return (
        <div id="checkout">
            <EmbeddedCheckoutProvider
                stripe={stripePromise}
                options={{ fetchClientSecret: startCheckoutSessionForProduct }}
            >
                <EmbeddedCheckout />
            </EmbeddedCheckoutProvider>
        </div>
    )
}
