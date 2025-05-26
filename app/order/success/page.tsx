'use client'

import { useEffect, useState } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { CheckCircle2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { db } from '@/lib/firebase'
import { doc, getDoc } from 'firebase/firestore'

export default function OrderSuccessPage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const [order, setOrder] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  const orderId = searchParams.get('orderId')
  const sessionId = searchParams.get('session_id')

  useEffect(() => {
    const fetchOrder = async () => {
      if (!orderId) {
        setLoading(false)
        return
      }

      try {
        const orderDoc = await getDoc(doc(db, 'orders', orderId))
        if (orderDoc.exists()) {
          setOrder({ id: orderDoc.id, ...orderDoc.data() })
        }
      } catch (error) {
        console.error('Error fetching order:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchOrder()
  }, [orderId])

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <p>Chargement...</p>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-16">
      <Card className="max-w-2xl mx-auto">
        <CardHeader className="text-center">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle2 className="h-10 w-10 text-green-600" />
          </div>
          <CardTitle className="text-2xl">Commande confirmée !</CardTitle>
          <CardDescription>
            Merci pour votre commande. Vous recevrez un email de confirmation dans quelques instants.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {order && (
            <div className="border rounded-lg p-4 space-y-2">
              <p className="text-sm text-muted-foreground">Numéro de commande</p>
              <p className="font-mono font-medium">{order.id}</p>
              <p className="text-sm text-muted-foreground mt-4">Montant total</p>
              <p className="text-2xl font-bold">{order.amount / 100} €</p>
            </div>
          )}
          
          <div className="flex flex-col sm:flex-row gap-4">
            <Button 
              onClick={() => router.push('/account/orders')}
              className="flex-1"
            >
              Voir mes commandes
            </Button>
            <Button 
              onClick={() => router.push('/')}
              variant="outline"
              className="flex-1"
            >
              Retour à l'accueil
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}