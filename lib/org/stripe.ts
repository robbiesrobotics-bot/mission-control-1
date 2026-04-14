/**
 * lib/org/stripe.ts
 * Stripe webhook handler for org events.
 * Verifies webhook signatures and routes events to the org schema.
 */

import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { upsertStripeEvent, markStripeEventProcessed } from './db'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2025-02-24.acacia',
})

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET || ''

export async function handleStripeWebhook(req: NextRequest): Promise<NextResponse> {
  const body = await req.text()
  const signature = req.headers.get('stripe-signature') || ''

  let event: Stripe.Event

  try {
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret)
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Webhook signature verification failed'
    console.error('[org/stripe] Webhook error:', message)
    return new NextResponse(`Webhook Error: ${message}`, { status: 400 })
  }

  // Idempotent processing — check if already handled
  try {
    upsertStripeEvent({
      stripeEventId: event.id,
      amount: event.data.object.amount ? (event.data.object.amount as number) / 100 : undefined,
      type: event.type,
    })
  } catch {
    // Event already recorded, skip
    return NextResponse.json({ received: true })
  }

  switch (event.type) {
    case 'invoice.paid': {
      const invoice = event.data.object as Stripe.Invoice
      console.log('[org/stripe] Invoice paid:', invoice.id)
      // Update invoice status in org.invoices if linked
      // In a full implementation, look up stripe_invoice_id
      break
    }

    case 'invoice.payment_failed': {
      const invoice = event.data.object as Stripe.Invoice
      console.log('[org/stripe] Invoice payment failed:', invoice.id)
      break
    }

    case 'payment_intent.succeeded': {
      const pi = event.data.object as Stripe.PaymentIntent
      console.log('[org/stripe] Payment intent succeeded:', pi.id)
      break
    }

    case 'payment_intent.payment_failed': {
      const pi = event.data.object as Stripe.PaymentIntent
      console.log('[org/stripe] Payment intent failed:', pi.id)
      break
    }

    case 'customer.subscription.updated':
    case 'customer.subscription.deleted': {
      const sub = event.data.object as Stripe.Subscription
      console.log(`[org/stripe] Subscription ${event.type}:`, sub.id)
      break
    }

    default:
      console.log(`[org/stripe] Unhandled event type: ${event.type}`)
  }

  markStripeEventProcessed(event.id)
  return NextResponse.json({ received: true })
}
