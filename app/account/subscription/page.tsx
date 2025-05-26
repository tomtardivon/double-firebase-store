'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { CreditCard, Calendar, CheckCircle2, AlertCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { useToast } from '@/components/ui/use-toast'
import { useAuth } from '@/hooks/useAuth'
import { shopDb } from '@/lib/firebase/config'
import { doc, getDoc, collection, query, where, getDocs, orderBy, limit } from 'firebase/firestore'
import { format } from 'date-fns'
import { fr } from 'date-fns/locale'

interface SmarTeenSubscription {
  id: string
  userId: string
  orderId: string
  stripeSubscriptionId: string
  status: 'pending' | 'active' | 'cancelled'
  activation: {
    method: string
    actualDate?: any
    cancelledDate?: any
  }
  billing: {
    amount: number
    nextBilling?: any
  }
}

interface Invoice {
  id: string
  amount: number
  status: string
  created: any
  invoicePdf?: string
}

const statusLabels = {
  pending: 'En attente',
  active: 'Actif',
  cancelled: 'Annulé'
}

const statusColors = {
  pending: 'secondary',
  active: 'default',
  cancelled: 'destructive'
} as const

export default function SubscriptionPage() {
  const router = useRouter()
  const { user } = useAuth()
  const { toast } = useToast()
  const [subscriptions, setSubscriptions] = useState<SmarTeenSubscription[]>([])
  const [invoices, setInvoices] = useState<Invoice[]>([])
  const [loading, setLoading] = useState(true)

  const fetchSubscriptionData = useCallback(async () => {
    if (!user) return

    try {
      // Fetch SmarTeen subscriptions
      const subscriptionsQuery = query(
        collection(shopDb, 'smarteenSubscriptions'),
        where('userId', '==', user.uid),
        orderBy('billing.nextBilling', 'desc')
      )
      const subscriptionsSnapshot = await getDocs(subscriptionsQuery)
      const subscriptionsData: SmarTeenSubscription[] = []
      
      subscriptionsSnapshot.forEach((doc) => {
        subscriptionsData.push({
          id: doc.id,
          ...doc.data()
        } as SmarTeenSubscription)
      })
      
      setSubscriptions(subscriptionsData)
      
      // TODO: Fetch invoices from Stripe if needed
      setInvoices([])
    } catch (error) {
      console.error('Error fetching subscription data:', error)
      toast({
        title: 'Erreur',
        description: 'Impossible de charger les données d&apos;abonnement.',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }, [user, toast])

  useEffect(() => {
    if (!user) {
      router.push('/login')
      return
    }
    fetchSubscriptionData()
  }, [user, router, fetchSubscriptionData])

  const handleManageSubscription = async (customerId: string) => {
    try {
      const response = await fetch('/api/stripe/portal', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          customerId: customerId,
        }),
      })

      const { url } = await response.json()
      window.location.href = url
    } catch (error) {
      console.error('Error creating portal session:', error)
      toast({
        title: 'Erreur',
        description: 'Impossible d\'accéder au portail de gestion.',
        variant: 'destructive',
      })
    }
  }

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
            <CreditCard className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">Mon abonnement</h1>
            <p className="text-muted-foreground">Gérez votre abonnement et vos factures</p>
          </div>
        </div>

        {subscriptions.length > 0 ? (
          <>
            <div className="space-y-6 mb-6">
              {subscriptions.map((subscription) => (
                <Card key={subscription.id}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle>Abonnement SmarTeen</CardTitle>
                        <CardDescription>
                          Commande #{subscription.orderId}
                        </CardDescription>
                      </div>
                      <Badge variant={statusColors[subscription.status]}>
                        {statusLabels[subscription.status]}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2 text-muted-foreground">
                        <CreditCard className="h-4 w-4" />
                        <span>Montant mensuel</span>
                      </div>
                      <span className="font-medium">
                        {subscription.billing.amount} €/mois
                      </span>
                    </div>

                    {subscription.billing.nextBilling && (
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2 text-muted-foreground">
                          <Calendar className="h-4 w-4" />
                          <span>Prochaine facturation</span>
                        </div>
                        <span className="font-medium">
                          {format(subscription.billing.nextBilling.toDate(), 'PPP', { locale: fr })}
                        </span>
                      </div>
                    )}

                    {subscription.status === 'pending' && (
                      <div className="flex items-center space-x-2 text-blue-600 bg-blue-50 p-3 rounded-md">
                        <AlertCircle className="h-4 w-4" />
                        <p className="text-sm">
                          L&apos;abonnement démarrera après la livraison de votre téléphone.
                        </p>
                      </div>
                    )}

                    {subscription.status === 'cancelled' && subscription.activation.cancelledDate && (
                      <div className="flex items-center space-x-2 text-red-600 bg-red-50 p-3 rounded-md">
                        <AlertCircle className="h-4 w-4" />
                        <p className="text-sm">
                          Abonnement annulé le {format(subscription.activation.cancelledDate.toDate(), 'PPP', { locale: fr })}
                        </p>
                      </div>
                    )}

                    {subscription.status === 'active' && subscription.stripeSubscriptionId && (
                      <div className="flex space-x-4">
                        <Button onClick={() => {
                          // Pour récupérer le customerId, il faut le chercher dans la commande
                          // TODO: Récupérer le customerId depuis la commande associée
                          toast({
                            title: 'Fonctionnalité à venir',
                            description: 'Le portail de gestion sera bientôt disponible.',
                          })
                        }}>
                          Gérer l&apos;abonnement
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Historique des factures</CardTitle>
                <CardDescription>
                  Consultez et téléchargez vos factures précédentes
                </CardDescription>
              </CardHeader>
              <CardContent>
                {invoices.length === 0 ? (
                  <p className="text-muted-foreground text-center py-8">
                    Aucune facture disponible
                  </p>
                ) : (
                  <div className="space-y-3">
                    {invoices.map((invoice) => (
                      <div
                        key={invoice.id}
                        className="flex items-center justify-between p-3 rounded-lg border"
                      >
                        <div>
                          <p className="font-medium">
                            {format(invoice.created.toDate(), 'PPP', { locale: fr })}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {invoice.amount / 100} €
                          </p>
                        </div>
                        <div className="flex items-center space-x-3">
                          {invoice.status === 'paid' && (
                            <CheckCircle2 className="h-4 w-4 text-green-600" />
                          )}
                          {invoice.invoicePdf && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => window.open(invoice.invoicePdf, '_blank')}
                            >
                              Télécharger
                            </Button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </>
        ) : (
          <Card>
            <CardContent className="text-center py-12">
              <CreditCard className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground mb-4">
                Vous n&apos;avez pas d&apos;abonnement
              </p>
              <Button onClick={() => router.push('/smarteen-phone')}>
                Commander un SmarTeen Phone
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}