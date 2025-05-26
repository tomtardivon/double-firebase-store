'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';

interface GoogleButtonProps {
  onSuccess?: () => void;
  onError?: (error: any) => void;
  variant?: 'login' | 'register';
  loginWithGoogle: () => Promise<any>;
}

export function GoogleButton({ 
  onSuccess, 
  onError, 
  variant = 'login',
  loginWithGoogle 
}: GoogleButtonProps) {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleGoogleAuth = async () => {
    setIsLoading(true);
    
    try {
      await loginWithGoogle();
      
      toast({
        title: variant === 'login' ? 'Connexion réussie' : 'Inscription réussie',
        description: 'Vous êtes maintenant connecté avec Google.',
      });
      
      if (onSuccess) {
        onSuccess();
      }
    } catch (error: any) {
      console.error('Erreur Google Auth:', error);
      
      let errorMessage = 'Une erreur est survenue lors de la connexion avec Google.';
      
      if (error.code === 'auth/popup-closed-by-user') {
        errorMessage = 'La connexion a été annulée.';
      } else if (error.code === 'auth/popup-blocked') {
        errorMessage = 'Le popup de connexion a été bloqué. Veuillez autoriser les popups.';
      }
      
      toast({
        title: 'Erreur',
        description: errorMessage,
        variant: 'destructive',
      });
      
      if (onError) {
        onError(error);
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Button
      type="button"
      variant="outline"
      onClick={handleGoogleAuth}
      disabled={isLoading}
      className="w-full relative"
    >
      <svg
        className="mr-2 h-4 w-4"
        aria-hidden="true"
        focusable="false"
        data-prefix="fab"
        data-icon="google"
        role="img"
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 488 512"
      >
        <path
          fill="currentColor"
          d="M488 261.8C488 403.3 391.1 504 248 504 110.8 504 0 393.2 0 256S110.8 8 248 8c66.8 0 123 24.5 166.3 64.9l-67.5 64.9C258.5 52.6 94.3 116.6 94.3 256c0 86.5 69.1 156.6 153.7 156.6 98.2 0 135-70.4 140.8-106.9H248v-85.3h236.1c2.3 12.7 3.9 24.9 3.9 41.4z"
        ></path>
      </svg>
      {isLoading ? 'Connexion...' : variant === 'login' ? 'Continuer avec Google' : 'S\'inscrire avec Google'}
    </Button>
  );
}