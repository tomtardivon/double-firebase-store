import { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { Calendar, User, Clock, ArrowLeft, Share2, BookOpen, ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

// In a real app, this would come from a CMS or database
const articles = {
  'comment-proteger-enfants-internet': {
    title: 'Comment protéger vos enfants sur Internet ?',
    description: 'Guide complet pour assurer la sécurité de vos enfants en ligne avec des conseils pratiques et des outils recommandés.',
    category: 'Sécurité',
    author: 'Dr. Marie Dupont',
    authorRole: 'Psychologue spécialisée en cyberpsychologie',
    date: '2024-01-15',
    readTime: '8 min',
    content: `
      <h2>Introduction</h2>
      <p>Dans notre ère numérique, protéger nos enfants sur Internet est devenu une priorité absolue pour les parents. Avec l'omniprésence des écrans et l'accès facilité à Internet, il est crucial de mettre en place des stratégies efficaces pour assurer la sécurité de nos jeunes en ligne.</p>

      <h2>Les risques principaux</h2>
      <p>Avant de parler de protection, il est important de comprendre les risques auxquels nos enfants peuvent être exposés :</p>
      <ul>
        <li><strong>Contenu inapproprié :</strong> Violence, pornographie, discours haineux</li>
        <li><strong>Cyberharcèlement :</strong> Intimidation et harcèlement en ligne</li>
        <li><strong>Prédateurs en ligne :</strong> Adultes malintentionnés cherchant à exploiter les enfants</li>
        <li><strong>Addiction aux écrans :</strong> Usage excessif pouvant impacter la santé mentale et physique</li>
        <li><strong>Partage d'informations personnelles :</strong> Risques liés à la divulgation de données sensibles</li>
      </ul>

      <h2>Stratégies de protection efficaces</h2>
      
      <h3>1. Communication ouverte</h3>
      <p>La première ligne de défense est une communication honnête et ouverte avec vos enfants. Créez un environnement où ils se sentent à l'aise de partager leurs expériences en ligne, bonnes ou mauvaises.</p>

      <h3>2. Établir des règles claires</h3>
      <p>Définissez des règles familiales pour l'utilisation d'Internet :</p>
      <ul>
        <li>Horaires d'utilisation</li>
        <li>Sites autorisés/interdits</li>
        <li>Partage d'informations personnelles</li>
        <li>Téléchargements et achats en ligne</li>
      </ul>

      <h3>3. Utiliser des outils de contrôle parental</h3>
      <p>Les solutions comme SmarTeen offrent des fonctionnalités avancées pour surveiller et contrôler l'activité en ligne de vos enfants tout en respectant leur vie privée.</p>

      <h3>4. Éducation à la citoyenneté numérique</h3>
      <p>Enseignez à vos enfants :</p>
      <ul>
        <li>À reconnaître les tentatives de phishing</li>
        <li>L'importance de mots de passe forts</li>
        <li>Le respect des autres en ligne</li>
        <li>La vérification des sources d'information</li>
      </ul>

      <h2>Outils recommandés</h2>
      <p>Voici quelques outils qui peuvent vous aider dans votre démarche de protection :</p>
      <ul>
        <li><strong>SmarTeen :</strong> Solution complète de contrôle parental</li>
        <li><strong>Google Family Link :</strong> Pour les appareils Android</li>
        <li><strong>Screen Time :</strong> Pour les appareils Apple</li>
        <li><strong>Qustodio :</strong> Solution multi-plateforme</li>
      </ul>

      <h2>Conclusion</h2>
      <p>Protéger nos enfants sur Internet est un défi constant qui nécessite vigilance, éducation et les bons outils. En combinant communication, règles claires et technologie appropriée, nous pouvons créer un environnement numérique plus sûr pour nos jeunes.</p>

      <p>N'oubliez pas que l'objectif n'est pas d'interdire complètement l'accès à Internet, mais plutôt d'enseigner une utilisation responsable et sécurisée qui préparera vos enfants à naviguer de manière autonome dans le monde numérique.</p>
    `,
    relatedArticles: [
      'temps-ecran-recommandations-age',
      'cyberbullying-signes-solutions',
      'dialogue-parent-enfant-numerique'
    ]
  },
  'temps-ecran-recommandations-age': {
    title: 'Temps d\'écran : les recommandations par âge',
    description: 'Découvrez les recommandations des experts sur le temps d\'écran adapté selon l\'âge de votre enfant.',
    category: 'Santé',
    author: 'Sophie Martin',
    authorRole: 'Pédiatre et experte en développement de l\'enfant',
    date: '2024-01-12',
    readTime: '5 min',
    content: `
      <h2>L'importance de limiter le temps d'écran</h2>
      <p>Le temps passé devant les écrans est devenu une préoccupation majeure pour les parents et les professionnels de santé. Des études montrent que l'exposition excessive aux écrans peut avoir des impacts négatifs sur le développement physique, cognitif et social des enfants.</p>

      <h2>Recommandations par tranche d'âge</h2>
      
      <h3>0-2 ans : Éviter les écrans</h3>
      <p>L'Organisation Mondiale de la Santé recommande :</p>
      <ul>
        <li>Aucun écran avant 2 ans</li>
        <li>Privilégier les interactions humaines</li>
        <li>Favoriser le jeu libre et l'exploration</li>
      </ul>

      <h3>2-5 ans : Maximum 1 heure par jour</h3>
      <p>Pour les enfants d'âge préscolaire :</p>
      <ul>
        <li>Limiter à 1 heure de contenu de qualité</li>
        <li>Toujours accompagner le visionnage</li>
        <li>Choisir des programmes éducatifs adaptés</li>
      </ul>

      <h3>6-12 ans : 1 à 2 heures en semaine</h3>
      <p>Pour les enfants d'âge scolaire :</p>
      <ul>
        <li>1 à 2 heures les jours d'école</li>
        <li>Jusqu'à 3 heures le week-end</li>
        <li>Équilibrer avec activités physiques et sociales</li>
      </ul>

      <h3>13 ans et plus : Gestion responsable</h3>
      <p>Pour les adolescents :</p>
      <ul>
        <li>Établir des limites raisonnables</li>
        <li>Encourager l'auto-régulation</li>
        <li>Maintenir des zones sans écran (repas, chambre)</li>
      </ul>

      <h2>Conseils pratiques</h2>
      <p>Pour une gestion saine du temps d'écran :</p>
      <ul>
        <li>Créer un planning familial</li>
        <li>Utiliser des minuteurs visuels</li>
        <li>Proposer des alternatives attractives</li>
        <li>Être un modèle positif</li>
      </ul>

      <h2>Conclusion</h2>
      <p>Les recommandations de temps d'écran doivent être adaptées à chaque enfant et chaque famille. L'objectif est de trouver un équilibre sain entre vie numérique et activités du monde réel.</p>
    `,
    relatedArticles: [
      'comment-proteger-enfants-internet',
      'applications-educatives-2024',
      'dialogue-parent-enfant-numerique'
    ]
  },
  // Add more articles here...
}

export async function generateStaticParams() {
  return Object.keys(articles).map((slug) => ({
    slug: slug,
  }))
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const resolvedParams = await params
  const article = articles[resolvedParams.slug as keyof typeof articles]
  
  if (!article) {
    return {
      title: 'Article non trouvé | SmarTeen',
    }
  }

  return {
    title: `${article.title} | SmarTeen`,
    description: article.description,
  }
}

export default async function ArticlePage({ params }: { params: Promise<{ slug: string }> }) {
  const resolvedParams = await params
  const article = articles[resolvedParams.slug as keyof typeof articles]

  if (!article) {
    notFound()
  }

  const relatedArticles = article.relatedArticles
    .map(slug => {
      const related = articles[slug as keyof typeof articles]
      return related ? { slug, ...related } : null
    })
    .filter(Boolean)
    .slice(0, 3)

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        {/* Back button */}
        <Link href="/expertise">
          <Button variant="ghost" className="mb-6">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Retour aux articles
          </Button>
        </Link>

        {/* Article header */}
        <article>
          <header className="mb-8">
            <Badge className="mb-4">{article.category}</Badge>
            <h1 className="text-4xl font-bold mb-4">{article.title}</h1>
            <p className="text-xl text-muted-foreground mb-6">{article.description}</p>
            
            <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
              <div className="flex items-center">
                <User className="h-4 w-4 mr-2" />
                <div>
                  <span className="font-medium">{article.author}</span>
                  <span className="mx-2">•</span>
                  <span>{article.authorRole}</span>
                </div>
              </div>
              <div className="flex items-center">
                <Calendar className="h-4 w-4 mr-2" />
                {new Date(article.date).toLocaleDateString('fr-FR', { 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                })}
              </div>
              <div className="flex items-center">
                <Clock className="h-4 w-4 mr-2" />
                {article.readTime} de lecture
              </div>
            </div>
          </header>

          <Separator className="my-8" />

          {/* Article content */}
          <div 
            className="prose prose-lg max-w-none
              prose-headings:font-bold
              prose-h2:text-2xl prose-h2:mt-8 prose-h2:mb-4
              prose-h3:text-xl prose-h3:mt-6 prose-h3:mb-3
              prose-p:text-muted-foreground prose-p:leading-7 prose-p:mb-4
              prose-ul:my-4 prose-ul:list-disc prose-ul:pl-6
              prose-li:text-muted-foreground prose-li:mb-2
              prose-strong:font-semibold prose-strong:text-foreground"
            dangerouslySetInnerHTML={{ __html: article.content }}
          />

          {/* Share section */}
          <Separator className="my-8" />
          
          <div className="flex items-center justify-between">
            <p className="text-muted-foreground">Cet article vous a été utile ? Partagez-le !</p>
            <Button variant="outline" size="sm">
              <Share2 className="h-4 w-4 mr-2" />
              Partager
            </Button>
          </div>
        </article>

        {/* Related articles */}
        {relatedArticles.length > 0 && (
          <>
            <Separator className="my-12" />
            
            <section>
              <h2 className="text-2xl font-bold mb-6">Articles similaires</h2>
              <div className="grid gap-4">
                {relatedArticles.map((related) => related && (
                  <Link key={related.slug} href={`/expertise/${related.slug}`}>
                    <Card className="hover:shadow-md transition-shadow">
                      <CardHeader>
                        <div className="flex items-center justify-between">
                          <div>
                            <Badge variant="outline" className="mb-2">{related.category}</Badge>
                            <CardTitle className="text-lg">{related.title}</CardTitle>
                            <CardDescription className="line-clamp-2 mt-2">
                              {related.description}
                            </CardDescription>
                          </div>
                          <ArrowRight className="h-5 w-5 text-muted-foreground flex-shrink-0" />
                        </div>
                      </CardHeader>
                    </Card>
                  </Link>
                ))}
              </div>
            </section>
          </>
        )}
      </div>
    </div>
  )
}