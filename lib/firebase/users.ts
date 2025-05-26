import { 
  doc, 
  getDoc, 
  setDoc, 
  updateDoc,
  collection,
  addDoc,
  deleteDoc,
  serverTimestamp 
} from 'firebase/firestore';
import { shopDb } from './config';
import { SmarTeenUser } from '@/types';
import { updatePassword, updateEmail } from 'firebase/auth';
import { authService } from './config';

// Récupérer un utilisateur
export const getUser = async (userId: string): Promise<SmarTeenUser | null> => {
  try {
    const userDoc = await getDoc(doc(shopDb, 'smarteenUsers', userId));
    if (userDoc.exists()) {
      return { uid: userId, ...userDoc.data() } as SmarTeenUser;
    }
    return null;
  } catch (error) {
    console.error('Erreur récupération utilisateur:', error);
    throw error;
  }
};

// Créer un utilisateur
export const createUser = async (userId: string, userData: Partial<SmarTeenUser>) => {
  try {
    const userDoc = {
      ...userData,
      uid: userId,
      children: [],
      orders: {
        totalOrders: 0,
        activeSubscriptions: 0,
      },
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    };
    
    await setDoc(doc(shopDb, 'smarteenUsers', userId), userDoc);
    return userDoc;
  } catch (error) {
    console.error('Erreur création utilisateur:', error);
    throw error;
  }
};

// Mettre à jour le profil utilisateur
export const updateUserProfile = async (
  userId: string, 
  updates: Partial<SmarTeenUser['profile']>
) => {
  try {
    const userRef = doc(shopDb, 'smarteenUsers', userId);
    const updateData: any = {
      updatedAt: serverTimestamp(),
    };
    
    if (updates.firstName !== undefined) updateData['profile.firstName'] = updates.firstName;
    if (updates.lastName !== undefined) updateData['profile.lastName'] = updates.lastName;
    if (updates.phone !== undefined) updateData['profile.phone'] = updates.phone;
    if (updates.address !== undefined) {
      updateData['profile.address.street'] = updates.address.street;
      updateData['profile.address.city'] = updates.address.city;
      updateData['profile.address.postalCode'] = updates.address.postalCode;
      updateData['profile.address.country'] = updates.address.country || 'FR';
    }
    
    await updateDoc(userRef, updateData);
  } catch (error) {
    console.error('Erreur mise à jour profil:', error);
    throw error;
  }
};

// Ajouter un enfant
export const addChild = async (
  userId: string, 
  childData: {
    firstName: string;
    birthDate: Date;
    hasSmartteen: boolean;
  }
) => {
  try {
    const childRef = await addDoc(
      collection(shopDb, 'smarteenUsers', userId, 'children'),
      {
        ...childData,
        id: doc(collection(shopDb, '_')).id,
        createdAt: serverTimestamp(),
      }
    );
    
    // Mettre à jour le tableau des enfants dans le document principal
    const userDoc = await getUser(userId);
    if (userDoc) {
      const updatedChildren = [...userDoc.children, {
        id: childRef.id,
        ...childData
      }];
      
      await updateDoc(doc(shopDb, 'smarteenUsers', userId), {
        children: updatedChildren,
        updatedAt: serverTimestamp(),
      });
    }
    
    return childRef.id;
  } catch (error) {
    console.error('Erreur ajout enfant:', error);
    throw error;
  }
};

// Mettre à jour un enfant
export const updateChild = async (
  userId: string, 
  childId: string, 
  updates: Partial<SmarTeenUser['children'][0]>
) => {
  try {
    // Mettre à jour dans la sous-collection
    await updateDoc(
      doc(shopDb, 'smarteenUsers', userId, 'children', childId),
      {
        ...updates,
        updatedAt: serverTimestamp(),
      }
    );
    
    // Mettre à jour dans le tableau du document principal
    const userDoc = await getUser(userId);
    if (userDoc) {
      const updatedChildren = userDoc.children.map(child =>
        child.id === childId ? { ...child, ...updates } : child
      );
      
      await updateDoc(doc(shopDb, 'smarteenUsers', userId), {
        children: updatedChildren,
        updatedAt: serverTimestamp(),
      });
    }
  } catch (error) {
    console.error('Erreur mise à jour enfant:', error);
    throw error;
  }
};

// Supprimer un enfant
export const deleteChild = async (userId: string, childId: string) => {
  try {
    // Supprimer de la sous-collection
    await deleteDoc(doc(shopDb, 'smarteenUsers', userId, 'children', childId));
    
    // Mettre à jour le tableau dans le document principal
    const userDoc = await getUser(userId);
    if (userDoc) {
      const updatedChildren = userDoc.children.filter(child => child.id !== childId);
      
      await updateDoc(doc(shopDb, 'smarteenUsers', userId), {
        children: updatedChildren,
        updatedAt: serverTimestamp(),
      });
    }
  } catch (error) {
    console.error('Erreur suppression enfant:', error);
    throw error;
  }
};

// Mettre à jour le mot de passe
export const updateUserPassword = async (newPassword: string) => {
  try {
    const user = authService.currentUser;
    if (!user) throw new Error('Utilisateur non connecté');
    
    await updatePassword(user, newPassword);
  } catch (error) {
    console.error('Erreur mise à jour mot de passe:', error);
    throw error;
  }
};

// Mettre à jour l'email
export const updateUserEmail = async (newEmail: string) => {
  try {
    const user = authService.currentUser;
    if (!user) throw new Error('Utilisateur non connecté');
    
    await updateEmail(user, newEmail);
    
    // Mettre à jour aussi dans Firestore
    await updateDoc(doc(shopDb, 'smarteenUsers', user.uid), {
      email: newEmail,
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    console.error('Erreur mise à jour email:', error);
    throw error;
  }
};