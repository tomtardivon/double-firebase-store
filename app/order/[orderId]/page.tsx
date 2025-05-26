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
import { db } from '@/lib/firebase'
import { doc, getDoc } from 'firebase/firestore'
import { useAuth } from '@/hooks/useAuth'
import Image from 'next/image'

interface OrderItem {
  id: string
  name: string
  price: number
  quantity: number
  image?: string
}

interface Order {
  id: string
  userId: string
  items: OrderItem[]
  amount: number
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled'
  createdAt: any
  shippingAddress?: {
    name: string
    line1: string
    line2?: string
    city: string
    postalCode: string
    country: string
  }
  paymentMethod?: {
    type: string
    last4?: string
  }
}

const statusLabels = {
  pending: 'En attente',
  processing: 'En cours de traitement',
  shipped: 'Expédiée',
  delivered: 'Livrée',
  cancelled: 'Annulée'
}

const statusColors = {
  pending: 'secondary',
  processing: 'default',
  shipped: 'default',
  delivered: 'default',
  cancelled: 'destructive'
} as const

export default function OrderDetailsPage() {
  const params = useParams()
  const router = useRouter()
  const { user } = useAuth()
  const [order, setOrder] = useState<Order | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchOrder = async () => {
      if (!params.orderId || !user) {
        setLoading(false)
        return
      }

      try {
        const orderDoc = await getDoc(doc(db, 'orders', params.orderId as string))
        if (orderDoc.exists()) {
          const orderData = { id: orderDoc.id, ...orderDoc.data() } as Order
          
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
                  <CardTitle>Commande #{order.id.slice(-8)}</CardTitle>
                  <CardDescription>
                    Passée le {format(order.createdAt.toDate(), 'PPP', { locale: fr })}
                  </CardDescription>
                </div>
                <Badge variant={statusColors[order.status]}>
                  {statusLabels[order.status]}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {order.items.map((item) => (
                  <div key={item.id} className="flex items-center space-x-4">
                    {item.image && (
                      <Image
                        src={item.image}
                        alt={item.name}
                        width={64}
                        height={64}
                        className="rounded-md object-cover"
                      />
                    )}
                    <div className="flex-1">
                      <p className="font-medium">{item.name}</p>
                      <p className="text-sm text-muted-foreground">
                        Quantité: {item.quantity}
                      </p>
                    </div>
                    <p className="font-medium">{(item.price * item.quantity) / 100} €</p>
                  </div>
                ))}
              </div>
              
              <Separator className="my-4" />
              
              <div className="flex justify-between text-lg font-medium">
                <span>Total</span>
                <span>{order.amount / 100} €</span>
              </div>
            </CardContent>
          </Card>

          {order.shippingAddress && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center text-base">
                  <MapPin className="mr-2 h-4 w-4" />
                  Adresse de livraison
                </CardTitle>
              </CardHeader>
              <CardContent>
                <address className="not-italic text-sm">
                  <p className="font-medium">{order.shippingAddress.name}</p>
                  <p>{order.shippingAddress.line1}</p>
                  {order.shippingAddress.line2 && <p>{order.shippingAddress.line2}</p>}
                  <p>
                    {order.shippingAddress.postalCode} {order.shippingAddress.city}
                  </p>
                  <p>{order.shippingAddress.country}</p>
                </address>
              </CardContent>
            </Card>
          )}
        </div>

        <div className="space-y-6">
          {order.paymentMethod && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center text-base">
                  <CreditCard className="mr-2 h-4 w-4" />
                  Méthode de paiement
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm">
                  {order.paymentMethod.type === 'card' && order.paymentMethod.last4
                    ? `Carte se terminant par ${order.paymentMethod.last4}`
                    : order.paymentMethod.type}
                </p>
              </CardContent>
            </Card>
          )}

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center text-base">
                <Package className="mr-2 h-4 w-4" />
                Suivi de commande
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Statut</span>
                  <span className="font-medium">{statusLabels[order.status]}</span>
                </div>
                {order.status === 'shipped' && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Numéro de suivi</span>
                    <span className="font-medium">Bientôt disponible</span>
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