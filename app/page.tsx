'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { useCartStore } from '@/stores/cartStore';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { formatPrice } from '@/lib/utils';
import { Shield, Smartphone, Users, Zap, Award, Clock, Star, ChevronRight } from 'lucide-react';
import { Toast } from '@/components/ui/toast';
import Image from 'next/image';

const fadeInUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 }
};

const stagger = {
  visible: {
    transition: {
      staggerChildren: 0.1
    }
  }
};

export default function HomePage() {
  const { addItem } = useCartStore();
  const [showToast, setShowToast] = useState(false);
  const [childConfig, setChildConfig] = useState({
    firstName: '',
    birthDate: '',
    protectionLevel: 'strict' as 'strict' | 'moderate',
  });

  const handleAddToCart = () => {
    if (!childConfig.firstName || !childConfig.birthDate) {
      alert('Veuillez remplir tous les champs');
      return;
    }

    addItem({
      productName: 'SmarTeen Phone',
      price: 289,
      childConfig: {
        ...childConfig,
        birthDate: new Date(childConfig.birthDate),
      },
    });
    
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);
  };

  return (
    <div className="min-h-screen bg-white">
      {showToast && (
        <Toast 
          message="Produit ajouté au panier !" 
          type="success" 
          onClose={() => setShowToast(false)}
        />
      )}
      {/* Hero Section avec animation */}
      <motion.section 
        initial="hidden"
        animate="visible"
        className="bg-gradient-to-br from-blue-50 via-white to-purple-50 py-16 overflow-hidden"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <motion.div variants={stagger} className="space-y-6">
              <motion.div variants={fadeInUp}>
                <Badge variant="secondary" className="mb-4">
                  <Star className="h-3 w-3 mr-1" />
                  Nouveau produit révolutionnaire
                </Badge>
              </motion.div>
              
              <motion.h1 
                variants={fadeInUp}
                className="text-5xl lg:text-6xl font-bold text-gray-900 leading-tight"
              >
                SmarTeen Phone
              </motion.h1>
              
              <motion.p 
                variants={fadeInUp}
                className="text-xl text-gray-600"
              >
                Le premier smartphone conçu spécialement pour protéger et 
                accompagner votre enfant dans sa découverte du numérique
              </motion.p>
              
              <motion.div variants={fadeInUp} className="flex items-baseline space-x-4">
                <span className="text-4xl font-bold text-primary-600">
                  {formatPrice(289)}
                </span>
                <span className="text-gray-500">+ {formatPrice(9.99)}/mois</span>
              </motion.div>

              <motion.div variants={fadeInUp} className="space-y-4">
                {[
                  { icon: Shield, text: "Contrôle parental intégré et incontournable" },
                  { icon: Award, text: "Système éducatif TraiNeen gamifié" },
                  { icon: Clock, text: "Garantie 3 ans incluse dans l'abonnement" }
                ].map((feature, index) => (
                  <motion.div
                    key={index}
                    variants={fadeInUp}
                    whileHover={{ x: 5 }}
                    className="flex items-center space-x-3"
                  >
                    <div className="bg-primary-100 p-2 rounded-lg">
                      <feature.icon className="h-5 w-5 text-primary-600" />
                    </div>
                    <span className="text-gray-700">{feature.text}</span>
                  </motion.div>
                ))}
              </motion.div>
            </motion.div>
            
            <motion.div 
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="relative"
            >
              <div className="relative">
                <motion.div 
                  animate={{ 
                    rotate: [0, 5, -5, 0],
                  }}
                  transition={{ 
                    duration: 4,
                    repeat: Infinity,
                    repeatType: "reverse"
                  }}
                  className="bg-gradient-to-br from-primary-400 to-purple-400 rounded-3xl p-8 shadow-2xl"
                >
                  <div className="bg-white rounded-2xl p-4 shadow-xl">
                    <div className="aspect-[3/4] bg-gradient-to-br from-gray-100 to-gray-200 rounded-xl flex items-center justify-center relative">
                      <Image
                        src="/images/smarteen-phone.svg"
                        alt="SmarTeen Phone"
                        width={180}
                        height={360}
                        className="object-contain"
                      />
                    </div>
                  </div>
                </motion.div>
                
                {/* Floating badges */}
                <motion.div
                  animate={{ y: [-10, 10, -10] }}
                  transition={{ duration: 3, repeat: Infinity }}
                  className="absolute -top-4 -right-4 bg-green-500 text-white px-3 py-1 rounded-full text-sm font-semibold shadow-lg"
                >
                  100% Sécurisé
                </motion.div>
                
                <motion.div
                  animate={{ y: [10, -10, 10] }}
                  transition={{ duration: 3, repeat: Infinity, delay: 1 }}
                  className="absolute -bottom-4 -left-4 bg-primary-600 text-white px-3 py-1 rounded-full text-sm font-semibold shadow-lg"
                >
                  Éducatif
                </motion.div>
              </div>
            </motion.div>
          </div>
        </div>
      </motion.section>

      {/* Configuration Section avec animation */}
      <motion.section 
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        className="py-16 bg-gray-50"
      >
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <Card className="shadow-xl border-0">
              <CardContent className="p-8">
                <h2 className="text-3xl font-bold mb-8 text-center">
                  Personnalisez le téléphone pour votre enfant
                </h2>
                
                <div className="space-y-6">
                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.1 }}
                  >
                    <Label htmlFor="childName">Prénom de votre enfant</Label>
                    <Input
                      id="childName"
                      type="text"
                      value={childConfig.firstName}
                      onChange={(e) =>
                        setChildConfig({ ...childConfig, firstName: e.target.value })
                      }
                      placeholder="Prénom"
                      className="mt-1"
                    />
                  </motion.div>
                  
                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.2 }}
                  >
                    <Label htmlFor="birthDate">Date de naissance</Label>
                    <Input
                      id="birthDate"
                      type="date"
                      value={childConfig.birthDate}
                      onChange={(e) =>
                        setChildConfig({ ...childConfig, birthDate: e.target.value })
                      }
                      className="mt-1"
                    />
                    <p className="text-sm text-gray-600 mt-1">
                      Le SmarTeen Phone est adapté aux enfants de 8 à 14 ans
                    </p>
                  </motion.div>
                  
                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.3 }}
                  >
                    <Label>Niveau de protection</Label>
                    <div className="grid grid-cols-2 gap-4 mt-2">
                      {[
                        { level: 'strict', title: 'Protection stricte', age: '8-11 ans' },
                        { level: 'moderate', title: 'Protection modérée', age: '12-14 ans' }
                      ].map((option) => (
                        <motion.button
                          key={option.level}
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          className={`p-4 rounded-lg border-2 transition-all ${
                            childConfig.protectionLevel === option.level
                              ? 'border-primary-600 bg-primary-50'
                              : 'border-gray-200 hover:border-gray-300'
                          }`}
                          onClick={() =>
                            setChildConfig({ ...childConfig, protectionLevel: option.level as any })
                          }
                        >
                          <h4 className="font-semibold">{option.title}</h4>
                          <p className="text-sm text-gray-600 mt-1">
                            Recommandé pour {option.age}
                          </p>
                        </motion.button>
                      ))}
                    </div>
                  </motion.div>
                  
                  <motion.div
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <Button
                      size="lg"
                      className="w-full mt-6"
                      onClick={handleAddToCart}
                      disabled={!childConfig.firstName || !childConfig.birthDate}
                    >
                      Ajouter au panier
                      <ChevronRight className="ml-2 h-5 w-5" />
                    </Button>
                  </motion.div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </motion.section>

      {/* Features Grid avec animation */}
      <motion.section 
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        className="py-16"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-3xl font-bold text-center mb-12"
          >
            Une protection complète pour votre enfant
          </motion.h2>
          
          <motion.div 
            variants={stagger}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="grid grid-cols-1 md:grid-cols-3 gap-8"
          >
            {[
              {
                icon: Shield,
                title: "Sécurité maximale",
                description: "Filtrage intelligent des contenus et blocage des applications inappropriées",
                color: "bg-blue-500"
              },
              {
                icon: Users,
                title: "Supervision parentale",
                description: "Application dédiée pour suivre et gérer l'utilisation en temps réel",
                color: "bg-purple-500"
              },
              {
                icon: Zap,
                title: "Performance adaptée",
                description: "Batterie optimisée et interface simplifiée pour les enfants",
                color: "bg-green-500"
              }
            ].map((feature, index) => (
              <motion.div
                key={index}
                variants={fadeInUp}
                whileHover={{ y: -5, transition: { duration: 0.2 } }}
              >
                <Card className="h-full hover:shadow-xl transition-shadow duration-300">
                  <CardContent className="p-6">
                    <motion.div 
                      className={`${feature.color} w-16 h-16 rounded-2xl flex items-center justify-center mb-4`}
                      whileHover={{ rotate: 360 }}
                      transition={{ duration: 0.5 }}
                    >
                      <feature.icon className="h-8 w-8 text-white" />
                    </motion.div>
                    <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                    <p className="text-gray-600">{feature.description}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </motion.section>

      {/* CTA Section avec animation */}
      <motion.section 
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        className="py-16 bg-gradient-to-r from-primary-600 to-purple-600 text-white"
      >
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-4xl font-bold mb-6"
          >
            Offrez la tranquillité d&#39;esprit
          </motion.h2>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-xl mb-8 text-white/90"
          >
            Rejoignez des milliers de parents qui ont choisi SmarTeen
          </motion.p>
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="flex flex-wrap justify-center gap-8"
          >
            {[
              { number: "50K+", label: "Familles satisfaites" },
              { number: "4.8/5", label: "Note moyenne" },
              { number: "24/7", label: "Support disponible" }
            ].map((stat, index) => (
              <motion.div 
                key={index}
                whileHover={{ scale: 1.1 }}
                className="text-center"
              >
                <div className="text-3xl font-bold">{stat.number}</div>
                <div className="text-white/80">{stat.label}</div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </motion.section>
    </div>
  );
}