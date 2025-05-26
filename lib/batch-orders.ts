// Système de gestion des commandes par lots
// Les téléphones sont envoyés uniquement quand un certain nombre de commandes est atteint

import { doc, updateDoc, collection, query, where, getDocs, writeBatch, getDoc, addDoc } from 'firebase/firestore';
import { shopDb } from '@/lib/firebase/config';

export interface BatchConfig {
  minOrdersForBatch: number; // Ex: 1000 commandes minimum
  maxWaitTime: number; // Ex: 30 jours max d'attente
  currentBatchStartDate?: Date;
}

export interface OrderBatch {
  id: string;
  batchNumber: string;
  status: 'collecting' | 'ready_to_ship' | 'shipping' | 'completed';
  orders: string[]; // IDs des commandes
  targetCount: number;
  currentCount: number;
  createdAt: Date;
  estimatedShipDate?: Date;
  actualShipDate?: Date;
}

// Obtenir ou créer le batch actuel
export const getCurrentBatch = async (): Promise<OrderBatch | null> => {
  try {
    const batchQuery = query(
      collection(shopDb, 'orderBatches'),
      where('status', '==', 'collecting')
    );
    
    const snapshot = await getDocs(batchQuery);
    
    if (!snapshot.empty) {
      return {
        id: snapshot.docs[0].id,
        ...snapshot.docs[0].data()
      } as OrderBatch;
    }
    
    return null;
  } catch (error) {
    console.error('Erreur récupération batch:', error);
    return null;
  }
};

// Ajouter une commande au batch actuel
export const addOrderToBatch = async (orderId: string): Promise<OrderBatch> => {
  let currentBatch = await getCurrentBatch();
  
  if (!currentBatch) {
    // Créer un nouveau batch
    const batchRef = doc(collection(shopDb, 'orderBatches'));
    const newBatch: Omit<OrderBatch, 'id'> = {
      batchNumber: `BATCH-${Date.now()}`,
      status: 'collecting',
      orders: [orderId],
      targetCount: 1000, // Configuration par défaut
      currentCount: 1,
      createdAt: new Date(),
    };
    
    await updateDoc(batchRef, newBatch);
    
    currentBatch = { id: batchRef.id, ...newBatch };
  } else {
    // Ajouter au batch existant
    await updateDoc(doc(shopDb, 'orderBatches', currentBatch.id), {
      orders: [...currentBatch.orders, orderId],
      currentCount: currentBatch.currentCount + 1,
    });
    
    currentBatch.orders.push(orderId);
    currentBatch.currentCount += 1;
  }
  
  // Vérifier si le batch est prêt
  if (currentBatch.currentCount >= currentBatch.targetCount) {
    await markBatchReadyToShip(currentBatch.id);
  }
  
  return currentBatch;
};

// Marquer un batch comme prêt à expédier
export const markBatchReadyToShip = async (batchId: string) => {
  await updateDoc(doc(shopDb, 'orderBatches', batchId), {
    status: 'ready_to_ship',
    estimatedShipDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), // +3 jours
  });
  
  // Notifier l'admin
  await createAdminNotification({
    type: 'batch_ready',
    batchId,
    message: 'Un lot de commandes est prêt à être expédié',
  });
};

// Obtenir le statut d'attente d'une commande
export const getOrderWaitStatus = async (orderId: string) => {
  const batchQuery = query(
    collection(shopDb, 'orderBatches'),
    where('orders', 'array-contains', orderId)
  );
  
  const snapshot = await getDocs(batchQuery);
  
  if (snapshot.empty) {
    return {
      inBatch: false,
      message: 'Commande en cours de traitement',
    };
  }
  
  const batch = snapshot.docs[0].data() as OrderBatch;
  const remainingOrders = batch.targetCount - batch.currentCount;
  const progress = (batch.currentCount / batch.targetCount) * 100;
  
  return {
    inBatch: true,
    batchId: snapshot.docs[0].id,
    batchStatus: batch.status,
    progress: Math.round(progress),
    remainingOrders,
    currentCount: batch.currentCount,
    targetCount: batch.targetCount,
    message: batch.status === 'collecting' 
      ? `Votre commande fait partie d'un lot. ${remainingOrders} commandes restantes avant expédition.`
      : batch.status === 'ready_to_ship'
      ? 'Votre lot est complet ! Expédition sous 3 jours.'
      : batch.status === 'shipping'
      ? 'Votre téléphone est en cours d\'expédition !'
      : 'Commande traitée',
  };
};

// Fonction admin : expédier un batch
export const shipBatch = async (batchId: string) => {
  const batchRef = doc(shopDb, 'orderBatches', batchId);
  const batchDoc = await getDoc(batchRef);
  
  if (!batchDoc.exists()) {
    throw new Error('Batch non trouvé');
  }
  
  const batch = batchDoc.data() as OrderBatch;
  
  // Mettre à jour le statut du batch
  await updateDoc(batchRef, {
    status: 'shipping',
    actualShipDate: new Date(),
  });
  
  // Mettre à jour toutes les commandes du batch
  const writeBatchOp = writeBatch(shopDb);
  
  for (const orderId of batch.orders) {
    const orderRef = doc(shopDb, 'smarteenOrders', orderId);
    writeBatchOp.update(orderRef, {
      status: 'preparing_shipment',
      'timeline.batchShipped': new Date(),
      'batch.id': batchId,
      'batch.number': batch.batchNumber,
    });
  }
  
  await writeBatchOp.commit();
  
  // Envoyer les notifications aux clients
  await notifyBatchCustomers(batch);
};

// Créer une notification admin
const createAdminNotification = async (notification: any) => {
  await addDoc(collection(shopDb, 'adminNotifications'), {
    ...notification,
    createdAt: new Date(),
    read: false,
  });
};

// Notifier les clients d'un batch
const notifyBatchCustomers = async (batch: OrderBatch) => {
  // Cette fonction enverrait des emails aux clients
  console.log(`Notification envoyée pour ${batch.orders.length} commandes`);
};