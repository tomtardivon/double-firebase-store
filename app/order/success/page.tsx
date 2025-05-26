'use client'

import { useEffect, useState, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { CheckCircle2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { shopDb } from '@/lib/firebase/config'
import { doc, getDoc } from 'firebase/firestore'
import { useCartStore } from '@/stores/cartStore'

function OrderSuccessContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const { clearCart } = useCartStore()
  const [order, setOrder] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  const sessionId = searchParams.get('session_id')

  useEffect(() => {
    // Vider le panier dès l'arrivée sur la page de succès
    clearCart()
  }, [clearCart])

  useEffect(() => {
    const fetchOrder = async () => {
      if (!sessionId) {
        setLoading(false)
        return
      }

      try {
        const orderDoc = await getDoc(doc(shopDb, 'smarteenOrders', sessionId))
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
  }, [sessionId])

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
            Votre SmarTeen Phone a été commandé ! Nous la traiterons dès que nous aurons suffisamment de commandes groupées.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {order && (
            <div className="border rounded-lg p-4 space-y-4">
              <div>
                <p className="text-sm text-muted-foreground">Numéro de commande</p>
                <p className="font-mono font-medium">#{order.orderNumber}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Produit</p>
                <p className="font-medium">{order.product?.name} pour {order.child?.firstName}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Montant payé aujourd&#39;hui</p>
                <p className="text-2xl font-bold">{order.product?.devicePrice} €</p>
                <p className="text-xs text-muted-foreground">+ {order.product?.subscriptionPrice}€/mois après livraison</p>
              </div>
            </div>
          )}
          
          <div className="bg-blue-50 dark:bg-blue-950 p-4 rounded-lg">
            <p className="text-blue-800 dark:text-blue-200 text-sm">
              📦 Votre commande sera traitée en lot pour optimiser les coûts. L&#39;abonnement de {order?.product?.subscriptionPrice}€/mois ne démarrera qu&#39;après réception du téléphone.
            </p>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-4">
            <Button 
              onClick={() => router.push('/account/orders')}
              className="flex-1"
            >
              Suivre ma commande
            </Button>
            <Button 
              onClick={() => router.push('/')}
              variant="outline"
              className="flex-1"
            >
              Retour à l&#39;accueil
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default function OrderSuccessPage() {
  return (
    <Suspense fallback={
      <div className="container mx-auto px-4 py-16 text-center">
        <p>Chargement...</p>
      </div>
    }>
      <OrderSuccessContent />
    </Suspense>
  )
}