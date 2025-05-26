'use client';

import { motion } from 'framer-motion';
import { Shield, Heart, Users, Target, Award, Globe } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

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

export default function AboutPage() {
  const teamMembers = [
    {
      name: "Marie Dupont",
      role: "CEO & Fondatrice",
      bio: "Mère de 3 enfants et experte en sécurité numérique",
      image: "/team/marie.jpg"
    },
    {
      name: "Thomas Martin",
      role: "CTO",
      bio: "15 ans d'expérience en développement mobile",
      image: "/team/thomas.jpg"
    },
    {
      name: "Sophie Bernard",
      role: "Responsable Pédagogique",
      bio: "Docteure en psychologie de l'enfant",
      image: "/team/sophie.jpg"
    },
    {
      name: "Lucas Moreau",
      role: "Head of Product",
      bio: "Expert en UX/UI pour les jeunes utilisateurs",
      image: "/team/lucas.jpg"
    }
  ];

  const values = [
    {
      icon: Shield,
      title: "Sécurité avant tout",
      description: "Nous mettons la protection des enfants au cœur de chaque décision"
    },
    {
      icon: Heart,
      title: "Bienveillance",
      description: "Accompagner les familles avec empathie et compréhension"
    },
    {
      icon: Users,
      title: "Collaboration",
      description: "Travailler main dans la main avec parents et éducateurs"
    },
    {
      icon: Target,
      title: "Innovation responsable",
      description: "Utiliser la technologie pour créer un impact positif"
    }
  ];

  const milestones = [
    { year: "2021", event: "Création de SmarTeen" },
    { year: "2022", event: "Lancement du premier prototype" },
    { year: "2023", event: "50 000 familles utilisatrices" },
    { year: "2024", event: "Expansion internationale" }
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <motion.section 
        initial="hidden"
        animate="visible"
        className="bg-gradient-to-br from-primary-50 to-purple-50 py-20"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div variants={stagger} className="text-center">
            <motion.h1 
              variants={fadeInUp}
              className="text-5xl font-bold text-gray-900 mb-6"
            >
              Notre mission
            </motion.h1>
            <motion.p 
              variants={fadeInUp}
              className="text-xl text-gray-600 max-w-3xl mx-auto"
            >
              Permettre aux enfants de profiter du numérique en toute sécurité, 
              tout en rassurant les parents et en favorisant un usage responsable 
              et éducatif de la technologie.
            </motion.p>
          </motion.div>
        </div>
      </motion.section>

      {/* Story Section */}
      <motion.section 
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        className="py-16"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <h2 className="text-3xl font-bold mb-6">Notre histoire</h2>
              <div className="space-y-4 text-gray-600">
                <p>
                  SmarTeen est né d&apos;un constat simple : les parents sont inquiets 
                  de donner un smartphone à leurs enfants, mais ces derniers en 
                  ont besoin pour rester connectés et apprendre.
                </p>
                <p>
                  En 2021, Marie Dupont, mère de trois enfants et experte en 
                  cybersécurité, a décidé de créer une solution qui réconcilie 
                  sécurité et autonomie. Avec une équipe passionnée de parents, 
                  d&apos;éducateurs et de technologues, SmarTeen a vu le jour.
                </p>
                <p>
                  Aujourd&apos;hui, nous sommes fiers d&apos;accompagner des milliers de 
                  familles dans leur transition numérique, en offrant un produit 
                  qui grandit avec l&apos;enfant.
                </p>
              </div>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="relative"
            >
              <div className="bg-gradient-to-br from-primary-100 to-purple-100 rounded-2xl p-8">
                <div className="grid grid-cols-2 gap-4">
                  {milestones.map((milestone, index) => (
                    <motion.div
                      key={index}
                      whileHover={{ scale: 1.05 }}
                      className="bg-white rounded-lg p-4 text-center shadow-sm"
                    >
                      <div className="text-2xl font-bold text-primary-600">
                        {milestone.year}
                      </div>
                      <div className="text-sm text-gray-600 mt-1">
                        {milestone.event}
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </motion.section>

      {/* Values Section */}
      <motion.section 
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        className="py-16 bg-gray-50"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-3xl font-bold text-center mb-12"
          >
            Nos valeurs
          </motion.h2>
          <motion.div 
            variants={stagger}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
          >
            {values.map((value, index) => (
              <motion.div
                key={index}
                variants={fadeInUp}
                whileHover={{ y: -5 }}
              >
                <Card className="h-full hover:shadow-lg transition-shadow">
                  <CardContent className="p-6 text-center">
                    <motion.div
                      whileHover={{ rotate: 360 }}
                      transition={{ duration: 0.5 }}
                      className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4"
                    >
                      <value.icon className="h-8 w-8 text-primary-600" />
                    </motion.div>
                    <h3 className="font-semibold text-lg mb-2">{value.title}</h3>
                    <p className="text-gray-600 text-sm">{value.description}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </motion.section>

      {/* Team Section */}
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
            Notre équipe
          </motion.h2>
          <motion.div 
            variants={stagger}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8"
          >
            {teamMembers.map((member, index) => (
              <motion.div
                key={index}
                variants={fadeInUp}
                whileHover={{ y: -5 }}
                className="text-center"
              >
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  className="w-32 h-32 bg-gradient-to-br from-primary-200 to-purple-200 rounded-full mx-auto mb-4 flex items-center justify-center"
                >
                  <div className="text-3xl font-bold text-white">
                    {member.name.split(' ').map(n => n[0]).join('')}
                  </div>
                </motion.div>
                <h3 className="font-semibold text-lg">{member.name}</h3>
                <p className="text-primary-600 text-sm mb-2">{member.role}</p>
                <p className="text-gray-600 text-sm">{member.bio}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </motion.section>

      {/* Partners Section */}
      <motion.section 
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        className="py-16 bg-gray-50"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-3xl font-bold text-center mb-12"
          >
            Ils nous font confiance
          </motion.h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {['Éducation Nationale', 'UNICEF', 'e-Enfance', 'CNIL'].map((partner, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="bg-white rounded-lg p-6 text-center shadow-sm"
              >
                <Globe className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                <p className="text-gray-600 font-medium">{partner}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.section>

      {/* CTA Section */}
      <motion.section 
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        className="py-16 bg-gradient-to-r from-primary-600 to-purple-600"
      >
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-4xl font-bold text-white mb-6"
          >
            Rejoignez le mouvement SmarTeen
          </motion.h2>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-xl text-white/90 mb-8"
          >
            Ensemble, créons un environnement numérique plus sûr pour nos enfants
          </motion.p>
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="flex flex-wrap justify-center gap-4"
          >
            <Link href="/smarteen-phone">
              <Button size="lg" variant="secondary">
                Découvrir le SmarTeen Phone
              </Button>
            </Link>
            <Link href="/expertise">
              <Button size="lg" variant="outline" className="bg-white/10 text-white border-white hover:bg-white/20">
                Lire nos articles
              </Button>
            </Link>
          </motion.div>
        </div>
      </motion.section>

      {/* Awards Section */}
      <motion.section 
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        className="py-16"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-3xl font-bold mb-12"
          >
            Nos récompenses
          </motion.h2>
          <div className="flex flex-wrap justify-center gap-8">
            {[
              "Prix de l'Innovation 2023",
              "Meilleur Produit Famille",
              "Label Sécurité Enfant",
              "Tech for Good Award"
            ].map((award, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ scale: 1.1 }}
                className="flex flex-col items-center"
              >
                <Award className="h-16 w-16 text-yellow-500 mb-2" />
                <p className="text-gray-700 font-medium">{award}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.section>
    </div>
  );
}