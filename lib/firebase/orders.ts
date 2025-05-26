import { 
  collection, 
  doc, 
  getDoc, 
  getDocs, 
  query, 
  where, 
  orderBy, 
  addDoc,
  updateDoc,
  serverTimestamp 
} from 'firebase/firestore';
import { shopDb } from './config';
import { SmarTeenOrder, SmarTeenSubscription } from '@/types';

// Récupérer une commande par ID
export const getOrder = async (orderId: string): Promise<SmarTeenOrder | null> => {
  try {
    const orderDoc = await getDoc(doc(shopDb, 'smarteenOrders', orderId));
    if (orderDoc.exists()) {
      return { id: orderDoc.id, ...orderDoc.data() } as SmarTeenOrder;
    }
    return null;
  } catch (error) {
    console.error('Erreur récupération commande:', error);
    throw error;
  }
};

// Récupérer les commandes d'un utilisateur
export const getUserOrders = async (userId: string): Promise<SmarTeenOrder[]> => {
  try {
    const ordersQuery = query(
      collection(shopDb, 'smarteenOrders'),
      where('userId', '==', userId),
      orderBy('timeline.ordered', 'desc')
    );
    
    const snapshot = await getDocs(ordersQuery);
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as SmarTeenOrder));
  } catch (error) {
    console.error('Erreur récupération commandes utilisateur:', error);
    throw error;
  }
};

// Récupérer les abonnements d'un utilisateur
export const getUserSubscriptions = async (userId: string): Promise<SmarTeenSubscription[]> => {
  try {
    const subsQuery = query(
      collection(shopDb, 'smarteenSubscriptions'),
      where('userId', '==', userId),
      orderBy('createdAt', 'desc')
    );
    
    const snapshot = await getDocs(subsQuery);
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as SmarTeenSubscription));
  } catch (error) {
    console.error('Erreur récupération abonnements:', error);
    throw error;
  }
};

// Mettre à jour le statut d'une commande
export const updateOrderStatus = async (
  orderId: string, 
  status: SmarTeenOrder['status']
) => {
  try {
    const updates: any = {
      status,
      updatedAt: serverTimestamp()
    };
    
    // Ajouter les timestamps selon le statut
    switch (status) {
      case 'shipped':
        updates['timeline.shipped'] = serverTimestamp();
        break;
      case 'delivered':
        updates['timeline.delivered'] = serverTimestamp();
        break;
      case 'activated':
        updates['timeline.subscriptionActivated'] = serverTimestamp();
        break;
    }
    
    await updateDoc(doc(shopDb, 'smarteenOrders', orderId), updates);
  } catch (error) {
    console.error('Erreur mise à jour statut commande:', error);
    throw error;
  }
};

// Simuler la livraison (pour les tests)
export const simulateDelivery = async (orderId: string) => {
  try {
    // Récupérer la commande
    const order = await getOrder(orderId);
    if (!order) throw new Error('Commande non trouvée');
    
    // Marquer comme livrée
    await updateOrderStatus(orderId, 'delivered');
    
    // Activer l'abonnement via API
    const response = await fetch('/api/orders/activate-subscription', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ orderId })
    });
    
    if (!response.ok) {
      throw new Error('Erreur activation abonnement');
    }
    
    return true;
  } catch (error) {
    console.error('Erreur simulation livraison:', error);
    throw error;
  }
};