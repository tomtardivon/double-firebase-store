'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { motion } from 'framer-motion';
import { Package, Clock, Users, Truck, CheckCircle } from 'lucide-react';
import { getOrderWaitStatus } from '@/lib/batch-orders';
import { getOrder } from '@/lib/firebase/orders';
import { formatPrice } from '@/lib/utils';

export default function OrderStatusPage() {
  const params = useParams();
  const orderId = params.orderId as string;
  const [order, setOrder] = useState<any>(null);
  const [batchStatus, setBatchStatus] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadOrderStatus = async () => {
      try {
        const orderData = await getOrder(orderId);
        setOrder(orderData);
        
        const status = await getOrderWaitStatus(orderId);
        setBatchStatus(status);
      } catch (error) {
        console.error('Erreur chargement statut:', error);
      } finally {
        setLoading(false);
      }
    };

    loadOrderStatus();
    
    // Rafraîchir toutes les 30 secondes
    const interval = setInterval(loadOrderStatus, 30000);
    return () => clearInterval(interval);
  }, [orderId]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Commande non trouvée</p>
      </div>
    );
  }

  const getStatusIcon = () => {
    switch (order.status) {
      case 'confirmed':
        return <Clock className="h-6 w-6" />;
      case 'preparing_shipment':
        return <Package className="h-6 w-6" />;
      case 'shipped':
        return <Truck className="h-6 w-6" />;
      case 'delivered':
      case 'activated':
        return <CheckCircle className="h-6 w-6" />;
      default:
        return <Clock className="h-6 w-6" />;
    }
  };

  const getStatusColor = () => {
    switch (order.status) {
      case 'confirmed':
        return 'bg-yellow-100 text-yellow-800';
      case 'preparing_shipment':
        return 'bg-blue-100 text-blue-800';
      case 'shipped':
        return 'bg-purple-100 text-purple-800';
      case 'delivered':
      case 'activated':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h1 className="text-3xl font-bold mb-8">Suivi de votre commande</h1>

          <div className="grid gap-6">
            {/* Statut principal */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Commande #{order.orderNumber}</CardTitle>
                  <div className={`flex items-center space-x-2 px-3 py-1 rounded-full ${getStatusColor()}`}>
                    {getStatusIcon()}
                    <span className="font-medium capitalize">
                      {order.status.replace('_', ' ')}
                    </span>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-600">Produit</p>
                      <p className="font-medium">SmarTeen Phone</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Prix</p>
                      <p className="font-medium">{formatPrice(289)}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Pour</p>
                      <p className="font-medium">{order.child?.firstName}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Date commande</p>
                      <p className="font-medium">
                        {new Date(order.timeline?.ordered).toLocaleDateString('fr-FR')}
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Statut du lot */}
            {batchStatus?.inBatch && order.status === 'confirmed' && (
              <Card className="border-primary-200 bg-primary-50/50">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Users className="h-5 w-5" />
                    <span>Système de commande groupée</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <p className="text-gray-700">
                      Pour vous offrir le meilleur prix, nous regroupons les commandes avant expédition.
                    </p>
                    
                    {/* Barre de progression */}
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>{batchStatus.currentCount} commandes</span>
                        <span>{batchStatus.targetCount} nécessaires</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-4 overflow-hidden">
                        <motion.div
                          className="h-full bg-primary-600"
                          initial={{ width: 0 }}
                          animate={{ width: `${batchStatus.progress}%` }}
                          transition={{ duration: 1, ease: "easeOut" }}
                        />
                      </div>
                      <p className="text-center text-sm font-medium">
                        {batchStatus.progress}% - Plus que {batchStatus.remainingOrders} commandes !
                      </p>
                    </div>

                    <div className="bg-white p-4 rounded-lg">
                      <h4 className="font-medium mb-2">Ce que cela signifie :</h4>
                      <ul className="space-y-1 text-sm text-gray-600">
                        <li>• Votre commande est confirmée et payée ✓</li>
                        <li>• Elle sera expédiée dès que le lot sera complet</li>
                        <li>• Vous recevrez un email dès l&#39;expédition</li>
                        <li>• L&#39;abonnement ne démarrera qu&#39;à la réception</li>
                      </ul>
                    </div>

                    {batchStatus.progress >= 80 && (
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="bg-green-100 p-3 rounded-lg text-green-800 text-sm"
                      >
                        🎉 Bientôt ! Le lot est presque complet.
                      </motion.div>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Timeline */}
            <Card>
              <CardHeader>
                <CardTitle>Historique de votre commande</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {order.timeline?.ordered && (
                    <div className="flex items-start space-x-3">
                      <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
                      <div className="flex-1">
                        <p className="font-medium">Commande confirmée</p>
                        <p className="text-sm text-gray-600">
                          {new Date(order.timeline.ordered).toLocaleString('fr-FR')}
                        </p>
                      </div>
                    </div>
                  )}

                  {batchStatus?.inBatch && (
                    <div className="flex items-start space-x-3">
                      <div className="w-2 h-2 bg-yellow-500 rounded-full mt-2 animate-pulse"></div>
                      <div className="flex-1">
                        <p className="font-medium">En attente de regroupement</p>
                        <p className="text-sm text-gray-600">
                          {batchStatus.message}
                        </p>
                      </div>
                    </div>
                  )}

                  {order.timeline?.shipped && (
                    <div className="flex items-start space-x-3">
                      <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                      <div className="flex-1">
                        <p className="font-medium">Expédié</p>
                        <p className="text-sm text-gray-600">
                          {new Date(order.timeline.shipped).toLocaleString('fr-FR')}
                        </p>
                      </div>
                    </div>
                  )}

                  {order.timeline?.delivered && (
                    <div className="flex items-start space-x-3">
                      <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
                      <div className="flex-1">
                        <p className="font-medium">Livré</p>
                        <p className="text-sm text-gray-600">
                          {new Date(order.timeline.delivered).toLocaleString('fr-FR')}
                        </p>
                      </div>
                    </div>
                  )}

                  {order.timeline?.subscriptionActivated && (
                    <div className="flex items-start space-x-3">
                      <div className="w-2 h-2 bg-primary-600 rounded-full mt-2"></div>
                      <div className="flex-1">
                        <p className="font-medium">Abonnement activé</p>
                        <p className="text-sm text-gray-600">
                          {new Date(order.timeline.subscriptionActivated).toLocaleString('fr-FR')}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Information importante */}
            <Card className="bg-blue-50 border-blue-200">
              <CardContent className="pt-6">
                <div className="flex items-start space-x-3">
                  <div className="p-2 bg-blue-100 rounded-full">
                    <Clock className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <h4 className="font-medium text-blue-900">Pourquoi ce délai ?</h4>
                    <p className="text-sm text-blue-800 mt-1">
                      En regroupant les commandes, nous pouvons vous offrir le SmarTeen Phone 
                      à un prix exceptionnel tout en maintenant une qualité premium. 
                      Votre patience nous permet de démocratiser la sécurité numérique pour tous les enfants.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </motion.div>
      </div>
    </div>
  );
}