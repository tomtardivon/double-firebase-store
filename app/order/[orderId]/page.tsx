'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { format } from 'date-fns'
import { fr } from 'date-fns/locale'
import { ArrowLeft, Package, CreditCard, MapPin } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { Badge } from '@/components/ui/badge'
import { shopDb } from '@/lib/firebase/config'
import { doc, getDoc } from 'firebase/firestore'
import { useAuth } from '@/hooks/useAuth'
import Image from 'next/image'

interface SmarTeenOrder {
  id: string
  orderNumber: string
  userId: string
  status: 'pending' | 'confirmed' | 'processed' | 'shipped' | 'delivered' | 'activated'
  product: {
    name: string
    devicePrice: number
    subscriptionPrice: number
  }
  child: {
    firstName: string
    age: number
    protectionLevel: string
  }
  shipping: {
    address: {
      street: string
      city: string
      postalCode: string
      country: string
    }
    phone: string
  }
  stripe: {
    checkoutSessionId: string
    customerId?: string
    subscriptionId?: string
    paymentIntentId?: string
  }
  timeline: {
    ordered: any
    confirmed?: any
    processed?: any
    shipped?: any
    delivered?: any
    subscriptionActivated?: any
  }
}

const statusLabels = {
  pending: 'En attente de paiement',
  confirmed: 'Confirmée',
  processed: 'En cours de traitement',
  shipped: 'Expédiée',
  delivered: 'Livrée',
  activated: 'Abonnement activé'
}

const statusColors = {
  pending: 'secondary',
  confirmed: 'default',
  processed: 'default',
  shipped: 'default',
  delivered: 'default',
  activated: 'default'
} as const

export default function OrderDetailsPage() {
  const params = useParams()
  const router = useRouter()
  const { user } = useAuth()
  const [order, setOrder] = useState<SmarTeenOrder | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchOrder = async () => {
      if (!params.orderId || !user) {
        setLoading(false)
        return
      }

      try {
        const orderDoc = await getDoc(doc(shopDb, 'smarteenOrders', params.orderId as string))
        if (orderDoc.exists()) {
          const orderData = { id: orderDoc.id, ...orderDoc.data() } as SmarTeenOrder
          
          // Verify the order belongs to the current user
          if (orderData.userId !== user.uid) {
            router.push('/account/orders')
            return
          }
          
          setOrder(orderData)
        } else {
          router.push('/account/orders')
        }
      } catch (error) {
        console.error('Error fetching order:', error)
        router.push('/account/orders')
      } finally {
        setLoading(false)
      }
    }

    fetchOrder()
  }, [params.orderId, user, router])

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <p>Chargement...</p>
      </div>
    )
  }

  if (!order) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <p>Commande introuvable</p>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <Button
        variant="ghost"
        onClick={() => router.push('/account/orders')}
        className="mb-6"
      >
        <ArrowLeft className="mr-2 h-4 w-4" />
        Retour aux commandes
      </Button>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Commande #{order.orderNumber}</CardTitle>
                  <CardDescription>
                    Passée le {format(order.timeline.ordered.toDate(), 'PPP', { locale: fr })}
                  </CardDescription>
                </div>
                <Badge variant={statusColors[order.status]}>
                  {statusLabels[order.status]}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center space-x-4">
                  <Image
                    src="/images/smarteen-phone.svg"
                    alt={order.product.name}
                    width={64}
                    height={64}
                    className="rounded-md object-cover"
                  />
                  <div className="flex-1">
                    <p className="font-medium">{order.product.name}</p>
                    <p className="text-sm text-muted-foreground">
                      Pour {order.child.firstName}, {order.child.age} ans
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Protection {order.child.protectionLevel}
                    </p>
                  </div>
                  <p className="font-medium">{order.product.devicePrice} €</p>
                </div>
              </div>
              
              <Separator className="my-4" />
              
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span>Téléphone</span>
                  <span>{order.product.devicePrice} €</span>
                </div>
                <div className="flex justify-between text-sm text-muted-foreground">
                  <span>Abonnement mensuel (après livraison)</span>
                  <span>{order.product.subscriptionPrice} €/mois</span>
                </div>
                <Separator className="my-2" />
                <div className="flex justify-between text-lg font-medium">
                  <span>Total à payer aujourd&rsquo;hui</span>
                  <span>{order.product.devicePrice} €</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center text-base">
                <MapPin className="mr-2 h-4 w-4" />
                Adresse de livraison
              </CardTitle>
            </CardHeader>
            <CardContent>
              <address className="not-italic text-sm">
                <p>{order.shipping.address.street}</p>
                <p>
                  {order.shipping.address.postalCode} {order.shipping.address.city}
                </p>
                <p>{order.shipping.address.country}</p>
                {order.shipping.phone && (
                  <p className="mt-2">
                    <span className="text-muted-foreground">Téléphone: </span>
                    {order.shipping.phone}
                  </p>
                )}
              </address>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center text-base">
                <CreditCard className="mr-2 h-4 w-4" />
                Paiement
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm">
                Paiement sécurisé via Stripe
              </p>
              {order.stripe.paymentIntentId && (
                <p className="text-xs text-muted-foreground mt-1">
                  ID: {order.stripe.paymentIntentId}
                </p>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center text-base">
                <Package className="mr-2 h-4 w-4" />
                Suivi de commande
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Statut</span>
                  <span className="font-medium">{statusLabels[order.status]}</span>
                </div>
                
                {order.timeline.confirmed && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Confirmée le</span>
                    <span>{format(order.timeline.confirmed.toDate(), 'PPp', { locale: fr })}</span>
                  </div>
                )}
                
                {order.timeline.processed && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">En traitement le</span>
                    <span>{format(order.timeline.processed.toDate(), 'PPp', { locale: fr })}</span>
                  </div>
                )}
                
                {order.timeline.shipped && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Expédiée le</span>
                    <span>{format(order.timeline.shipped.toDate(), 'PPp', { locale: fr })}</span>
                  </div>
                )}
                
                {order.timeline.delivered && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Livrée le</span>
                    <span>{format(order.timeline.delivered.toDate(), 'PPp', { locale: fr })}</span>
                  </div>
                )}
                
                {order.timeline.subscriptionActivated && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Abonnement activé le</span>
                    <span>{format(order.timeline.subscriptionActivated.toDate(), 'PPp', { locale: fr })}</span>
                  </div>
                )}
                
                {order.status === 'confirmed' && (
                  <div className="mt-3 p-3 bg-blue-50 dark:bg-blue-950 rounded-lg">
                    <p className="text-blue-800 dark:text-blue-200 text-xs">
                      📦 Votre commande est confirmée ! Nous la traiterons dès que nous aurons suffisamment de commandes groupées.
                    </p>
                  </div>
                )}
                
                {order.status === 'delivered' && order.stripe.subscriptionId && (
                  <div className="mt-3 p-3 bg-green-50 dark:bg-green-950 rounded-lg">
                    <p className="text-green-800 dark:text-green-200 text-xs">
                      🎉 Téléphone livré ! L&apos;abonnement de {order.product.subscriptionPrice}€/mois démarrera bientôt.
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}