'use client';

import { useEffect, useState } from 'react';
import { authService, shopAuth } from '@/lib/firebase/config';
import { generateShopToken } from '@/lib/firebase/auth';
import { signInWithCustomToken, onAuthStateChanged } from 'firebase/auth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function TestAuthPage() {
  const [authUser, setAuthUser] = useState<any>(null);
  const [shopUser, setShopUser] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [logs, setLogs] = useState<string[]>([]);

  const addLog = (message: string) => {
    setLogs(prev => [...prev, `${new Date().toLocaleTimeString()}: ${message}`]);
  };

  const testAuth = async () => {
    setLoading(true);
    setLogs([]);
    
    try {
      addLog('🔐 Test de l&apos;authentification cross-project');
      
      // 1. Vérifier l'état Auth
      const currentAuthUser = authService.currentUser;
      if (!currentAuthUser) {
        addLog('❌ Aucun utilisateur connecté sur Auth project');
        return;
      }
      
      addLog(`✅ Utilisateur Auth: ${currentAuthUser.email}`);
      setAuthUser(currentAuthUser);
      
      // 2. Générer le token Shop
      addLog('🔄 Génération du token Shop via Cloud Function...');
      const shopToken = await generateShopToken(currentAuthUser);
      addLog('✅ Token Shop généré avec succès');
      
      // 3. Se connecter au Shop
      addLog('🔄 Connexion au projet Shop...');
      await signInWithCustomToken(shopAuth, shopToken);
      addLog('✅ Connexion Shop réussie');
      
      // 4. Vérifier l'utilisateur Shop
      const currentShopUser = shopAuth.currentUser;
      if (currentShopUser) {
        addLog(`✅ Utilisateur Shop: ${currentShopUser.uid}`);
        setShopUser(currentShopUser);
      }
      
      addLog('🎉 Test d&apos;authentification terminé avec succès !');
      
    } catch (error: any) {
      addLog(`❌ Erreur: ${error.message}`);
      console.error('Test auth error:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Écouter les changements d'état d'authentification
    const unsubscribeAuth = onAuthStateChanged(authService, (user) => {
      console.log('Auth state changed:', user?.email || 'No user');
      setAuthUser(user);
    });

    const unsubscribeShop = onAuthStateChanged(shopAuth, (user) => {
      console.log('Shop state changed:', user?.uid || 'No user');
      setShopUser(user);
    });

    return () => {
      unsubscribeAuth();
      unsubscribeShop();
    };
  }, []);

  return (
    <div className="container mx-auto py-8 max-w-4xl">
      <h1 className="text-3xl font-bold mb-8">Test Authentification Cross-Project</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <Card>
          <CardHeader>
            <CardTitle>Projet Auth</CardTitle>
            <CardDescription>test-firebase-auth-4ad79</CardDescription>
          </CardHeader>
          <CardContent>
            {authUser ? (
              <div className="space-y-2">
                <p><strong>Email:</strong> {authUser.email}</p>
                <p><strong>UID:</strong> {authUser.uid}</p>
                <p className="text-green-600">✅ Connecté</p>
              </div>
            ) : (
              <p className="text-red-600">❌ Non connecté</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Projet Shop</CardTitle>
            <CardDescription>smarteen-data</CardDescription>
          </CardHeader>
          <CardContent>
            {shopUser ? (
              <div className="space-y-2">
                <p><strong>UID:</strong> {shopUser.uid}</p>
                <p className="text-green-600">✅ Connecté</p>
              </div>
            ) : (
              <p className="text-red-600">❌ Non connecté</p>
            )}
          </CardContent>
        </Card>
      </div>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Test</CardTitle>
          <CardDescription>Testez la génération du token et la connexion cross-project</CardDescription>
        </CardHeader>
        <CardContent>
          <Button 
            onClick={testAuth} 
            disabled={loading || !authUser}
            className="w-full"
          >
            {loading ? 'Test en cours...' : 'Tester l&apos;authentification'}
          </Button>
          
          {!authUser && (
            <p className="text-sm text-gray-600 mt-2">
              Connectez-vous d&apos;abord sur <a href="/auth/login" className="text-blue-600 underline">la page de connexion</a>
            </p>
          )}
        </CardContent>
      </Card>

      {logs.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Logs</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="bg-gray-100 p-4 rounded font-mono text-sm max-h-60 overflow-y-auto">
              {logs.map((log, index) => (
                <div key={index} className="mb-1">{log}</div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}