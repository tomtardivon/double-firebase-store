'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { format } from 'date-fns'
import { fr } from 'date-fns/locale'
import { Package, ChevronRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { useAuth } from '@/hooks/useAuth'
import { shopDb } from '@/lib/firebase/config'
import { collection, query, where, orderBy, getDocs } from 'firebase/firestore'

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
  timeline: {
    ordered: any
    confirmed?: any
    processed?: any
    shipped?: any
    delivered?: any
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

export default function OrdersPage() {
  const router = useRouter()
  const { user } = useAuth()
  const [orders, setOrders] = useState<SmarTeenOrder[]>([])
  const [loading, setLoading] = useState(true)

  const fetchOrders = useCallback(async () => {
    if (!user) return

    try {
      const q = query(
        collection(shopDb, 'smarteenOrders'),
        where('userId', '==', user.uid),
        orderBy('timeline.ordered', 'desc')
      )
      const querySnapshot = await getDocs(q)
      const ordersData: SmarTeenOrder[] = []
      
      querySnapshot.forEach((doc) => {
        ordersData.push({
          id: doc.id,
          ...doc.data()
        } as SmarTeenOrder)
      })
      
      setOrders(ordersData)
    } catch (error) {
      console.error('Error fetching orders:', error)
    } finally {
      setLoading(false)
    }
  }, [user])

  useEffect(() => {
    if (!user) {
      router.push('/login')
      return
    }
    fetchOrders()
  }, [user, router, fetchOrders])

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <p>Chargement...</p>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center space-x-4 mb-8">
          <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
            <Package className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">Mes commandes</h1>
            <p className="text-muted-foreground">Consultez l&apos;historique de vos achats</p>
          </div>
        </div>

        {orders.length === 0 ? (
          <Card>
            <CardContent className="text-center py-12">
              <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground mb-4">
                Vous n&apos;avez pas encore passé de commande
              </p>
              <Button onClick={() => router.push('/products')}>
                Découvrir nos produits
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {orders.map((order) => (
              <Card key={order.id} className="cursor-pointer hover:shadow-md transition-shadow">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-lg">
                        Commande #{order.orderNumber}
                      </CardTitle>
                      <CardDescription>
                        {format(order.timeline.ordered.toDate(), 'PPP', { locale: fr })}
                      </CardDescription>
                    </div>
                    <div className="flex items-center space-x-4">
                      <Badge variant={statusColors[order.status]}>
                        {statusLabels[order.status]}
                      </Badge>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => router.push(`/order/${order.id}`)}
                      >
                        <ChevronRight className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">
                        Pour {order.child.firstName}, {order.child.age} ans
                      </p>
                      <p className="text-sm">
                        {order.product.name} - Protection {order.child.protectionLevel}
                      </p>
                    </div>
                    <p className="text-lg font-medium">
                      {order.product.devicePrice} €
                    </p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}