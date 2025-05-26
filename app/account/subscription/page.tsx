'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { CreditCard, Calendar, CheckCircle2, AlertCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { useToast } from '@/components/ui/use-toast'
import { useAuth } from '@/hooks/useAuth'
import { db } from '@/lib/firebase'
import { doc, getDoc, collection, query, where, getDocs, orderBy, limit } from 'firebase/firestore'
import { format } from 'date-fns'
import { fr } from 'date-fns/locale'

interface Subscription {
  id: string
  userId: string
  status: 'active' | 'canceled' | 'past_due' | 'trialing'
  currentPeriodEnd: any
  priceId: string
  productId: string
  cancelAtPeriodEnd: boolean
}

interface Invoice {
  id: string
  amount: number
  status: string
  created: any
  invoicePdf?: string
}

const statusLabels = {
  active: 'Actif',
  canceled: 'Annulé',
  past_due: 'En retard',
  trialing: 'Période d&apos;essai'
}

const statusColors = {
  active: 'default',
  canceled: 'secondary',
  past_due: 'destructive',
  trialing: 'default'
} as const

export default function SubscriptionPage() {
  const router = useRouter()
  const { user } = useAuth()
  const { toast } = useToast()
  const [subscription, setSubscription] = useState<Subscription | null>(null)
  const [invoices, setInvoices] = useState<Invoice[]>([])
  const [loading, setLoading] = useState(true)

  const fetchSubscriptionData = useCallback(async () => {
    if (!user) return

    try {
      // Fetch active subscription
      const subscriptionsQuery = query(
        collection(db, 'customers', user.uid, 'subscriptions'),
        where('status', 'in', ['active', 'trialing', 'past_due']),
        limit(1)
      )
      const subscriptionsSnapshot = await getDocs(subscriptionsQuery)
      
      if (!subscriptionsSnapshot.empty) {
        const subDoc = subscriptionsSnapshot.docs[0]
        setSubscription({
          id: subDoc.id,
          ...subDoc.data()
        } as Subscription)
      }

      // Fetch recent invoices
      const invoicesQuery = query(
        collection(db, 'customers', user.uid, 'invoices'),
        orderBy('created', 'desc'),
        limit(5)
      )
      const invoicesSnapshot = await getDocs(invoicesQuery)
      const invoicesData: Invoice[] = []
      
      invoicesSnapshot.forEach((doc) => {
        invoicesData.push({
          id: doc.id,
          ...doc.data()
        } as Invoice)
      })
      
      setInvoices(invoicesData)
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

  const handleManageSubscription = async () => {
    try {
      // In production, this would redirect to Stripe Customer Portal
      const response = await fetch('/api/create-portal-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          customerId: user?.uid,
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

        {subscription ? (
          <>
            <Card className="mb-6">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Abonnement actuel</CardTitle>
                  <Badge variant={statusColors[subscription.status]}>
                    {statusLabels[subscription.status]}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2 text-muted-foreground">
                    <Calendar className="h-4 w-4" />
                    <span>Prochaine facturation</span>
                  </div>
                  <span className="font-medium">
                    {format(subscription.currentPeriodEnd.toDate(), 'PPP', { locale: fr })}
                  </span>
                </div>

                {subscription.cancelAtPeriodEnd && (
                  <div className="flex items-center space-x-2 text-amber-600 bg-amber-50 p-3 rounded-md">
                    <AlertCircle className="h-4 w-4" />
                    <p className="text-sm">
                      Votre abonnement sera annulé le {format(subscription.currentPeriodEnd.toDate(), 'PPP', { locale: fr })}
                    </p>
                  </div>
                )}

                <div className="flex space-x-4">
                  <Button onClick={handleManageSubscription}>
                    Gérer l&apos;abonnement
                  </Button>
                  {subscription.cancelAtPeriodEnd && (
                    <Button variant="outline" onClick={handleManageSubscription}>
                      Réactiver l&apos;abonnement
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>

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
                Vous n&apos;avez pas d&apos;abonnement actif
              </p>
              <Button onClick={() => router.push('/pricing')}>
                Voir les offres
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}