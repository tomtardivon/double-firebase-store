'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { collection, query, where, getDocs, orderBy } from 'firebase/firestore';
import { shopDb } from '@/lib/firebase/config';
import { OrderBatch, shipBatch } from '@/lib/batch-orders';
import { Package, Truck, Users, Clock } from 'lucide-react';
import { motion } from 'framer-motion';

export default function AdminBatchesPage() {
  const [batches, setBatches] = useState<OrderBatch[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadBatches();
  }, []);

  const loadBatches = async () => {
    try {
      const batchQuery = query(
        collection(shopDb, 'orderBatches'),
        orderBy('createdAt', 'desc')
      );
      
      const snapshot = await getDocs(batchQuery);
      const batchData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as OrderBatch));
      
      setBatches(batchData);
    } catch (error) {
      console.error('Erreur chargement lots:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleShipBatch = async (batchId: string) => {
    if (!confirm('Expédier ce lot ? Cette action est irréversible.')) return;
    
    try {
      await shipBatch(batchId);
      alert('Lot marqué comme expédié !');
      loadBatches();
    } catch (error) {
      console.error('Erreur expédition lot:', error);
      alert('Erreur lors de l\'expédition');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'collecting':
        return 'bg-yellow-100 text-yellow-800';
      case 'ready_to_ship':
        return 'bg-green-100 text-green-800';
      case 'shipping':
        return 'bg-blue-100 text-blue-800';
      case 'completed':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'collecting':
        return <Clock className="h-4 w-4" />;
      case 'ready_to_ship':
        return <Package className="h-4 w-4" />;
      case 'shipping':
        return <Truck className="h-4 w-4" />;
      case 'completed':
        return <Users className="h-4 w-4" />;
      default:
        return <Clock className="h-4 w-4" />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold">Gestion des lots de commandes</h1>
          <p className="text-gray-600 mt-2">
            Système de regroupement des commandes pour optimiser les coûts
          </p>
        </div>

        <div className="grid gap-6">
          {batches.map((batch) => (
            <motion.div
              key={batch.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <CardTitle>{batch.batchNumber}</CardTitle>
                      <div className={`flex items-center space-x-1 px-3 py-1 rounded-full ${getStatusColor(batch.status)}`}>
                        {getStatusIcon(batch.status)}
                        <span className="text-sm font-medium capitalize">
                          {batch.status.replace('_', ' ')}
                        </span>
                      </div>
                    </div>
                    {batch.status === 'ready_to_ship' && (
                      <Button 
                        onClick={() => handleShipBatch(batch.id)}
                        className="bg-green-600 hover:bg-green-700"
                      >
                        <Truck className="h-4 w-4 mr-2" />
                        Expédier le lot
                      </Button>
                    )}
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div>
                      <p className="text-sm text-gray-600">Commandes</p>
                      <p className="text-2xl font-bold">{batch.currentCount}/{batch.targetCount}</p>
                      <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                        <div 
                          className="h-full bg-primary-600 rounded-full"
                          style={{ width: `${(batch.currentCount / batch.targetCount) * 100}%` }}
                        />
                      </div>
                    </div>
                    
                    <div>
                      <p className="text-sm text-gray-600">Créé le</p>
                      <p className="font-medium">
                        {new Date(batch.createdAt).toLocaleDateString('fr-FR')}
                      </p>
                    </div>
                    
                    {batch.estimatedShipDate && (
                      <div>
                        <p className="text-sm text-gray-600">Expédition prévue</p>
                        <p className="font-medium">
                          {new Date(batch.estimatedShipDate).toLocaleDateString('fr-FR')}
                        </p>
                      </div>
                    )}
                    
                    {batch.actualShipDate && (
                      <div>
                        <p className="text-sm text-gray-600">Expédié le</p>
                        <p className="font-medium">
                          {new Date(batch.actualShipDate).toLocaleDateString('fr-FR')}
                        </p>
                      </div>
                    )}
                  </div>
                  
                  {batch.status === 'collecting' && (
                    <div className="mt-4 p-4 bg-yellow-50 rounded-lg">
                      <p className="text-sm text-yellow-800">
                        <strong>En cours de collecte :</strong> Il manque {batch.targetCount - batch.currentCount} commandes 
                        pour compléter ce lot et déclencher l'expédition.
                      </p>
                    </div>
                  )}
                  
                  {batch.status === 'ready_to_ship' && (
                    <div className="mt-4 p-4 bg-green-50 rounded-lg">
                      <p className="text-sm text-green-800">
                        <strong>Prêt à expédier !</strong> Ce lot est complet et peut être envoyé en production.
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {batches.length === 0 && (
          <Card>
            <CardContent className="text-center py-12">
              <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">Aucun lot de commandes pour le moment</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}