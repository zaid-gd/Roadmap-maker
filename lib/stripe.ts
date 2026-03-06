import 'server-only'

import Stripe from 'stripe'

export const stripe = new Stripe(process.env.Roadmap_nexus_STRIPE_SECRET_KEY as string, {
    // https://github.com/stripe/stripe-node#configuration
    apiVersion: '2026-02-25.clover', // Best practice is to set a specific API version
    appInfo: {
        name: 'Roadmap Nexus',
        url: 'https://roadmapnexus.com'
    }
})
