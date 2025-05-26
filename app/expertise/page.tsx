import { Metadata } from 'next'
import Link from 'next/link'
import { Calendar, User, ArrowRight, BookOpen } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

export const metadata: Metadata = {
  title: 'Expertise | SmarTeen',
  description: 'Découvrez nos conseils et articles sur l\'éducation numérique et la parentalité.',
}

// In a real app, this would come from a CMS or database
const articles = [
  {
    id: 1,
    slug: 'comment-proteger-enfants-internet',
    title: 'Comment protéger vos enfants sur Internet ?',
    description: 'Guide complet pour assurer la sécurité de vos enfants en ligne avec des conseils pratiques et des outils recommandés.',
    category: 'Sécurité',
    author: 'Dr. Marie Dupont',
    date: '2024-01-15',
    readTime: '8 min',
    featured: true,
  },
  {
    id: 2,
    slug: 'temps-ecran-recommandations-age',
    title: 'Temps d\'écran : les recommandations par âge',
    description: 'Découvrez les recommandations des experts sur le temps d\'écran adapté selon l\'âge de votre enfant.',
    category: 'Santé',
    author: 'Sophie Martin',
    date: '2024-01-12',
    readTime: '5 min',
    featured: true,
  },
  {
    id: 3,
    slug: 'cyberbullying-signes-solutions',
    title: 'Cyberharcèlement : reconnaître les signes et agir',
    description: 'Apprenez à identifier les signes du cyberharcèlement et découvrez comment protéger et accompagner votre enfant.',
    category: 'Prévention',
    author: 'Dr. Jean-Paul Rousseau',
    date: '2024-01-10',
    readTime: '10 min',
    featured: false,
  },
  {
    id: 4,
    slug: 'applications-educatives-2024',
    title: 'Les meilleures applications éducatives en 2024',
    description: 'Notre sélection des applications éducatives les plus efficaces pour l\'apprentissage de vos enfants.',
    category: 'Éducation',
    author: 'Claire Dubois',
    date: '2024-01-08',
    readTime: '6 min',
    featured: false,
  },
  {
    id: 5,
    slug: 'dialogue-parent-enfant-numerique',
    title: 'Établir un dialogue sain sur le numérique',
    description: 'Conseils pour communiquer efficacement avec vos enfants sur leur utilisation des technologies.',
    category: 'Communication',
    author: 'Dr. Marie Dupont',
    date: '2024-01-05',
    readTime: '7 min',
    featured: false,
  },
  {
    id: 6,
    slug: 'reseaux-sociaux-age-approprie',
    title: 'Réseaux sociaux : quel est l\'âge approprié ?',
    description: 'Analyse des différents réseaux sociaux et recommandations d\'âge pour une utilisation sécurisée.',
    category: 'Réseaux sociaux',
    author: 'Sophie Martin',
    date: '2024-01-03',
    readTime: '9 min',
    featured: false,
  },
]

const categories = [
  { name: 'Tous', count: articles.length },
  { name: 'Sécurité', count: 2 },
  { name: 'Santé', count: 1 },
  { name: 'Prévention', count: 1 },
  { name: 'Éducation', count: 1 },
  { name: 'Communication', count: 1 },
  { name: 'Réseaux sociaux', count: 1 },
]

export default function ExpertisePage() {
  const featuredArticles = articles.filter(article => article.featured)
  const regularArticles = articles.filter(article => !article.featured)

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center mb-4">
            <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
              <BookOpen className="h-6 w-6 text-primary" />
            </div>
          </div>
          <h1 className="text-4xl font-bold mb-4">Centre d&#39;expertise</h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Découvrez nos conseils d&#39;experts pour accompagner vos enfants dans leur vie numérique
          </p>
        </div>

        {/* Categories */}
        <div className="flex flex-wrap gap-2 justify-center mb-12">
          {categories.map((category) => (
            <Badge
              key={category.name}
              variant="secondary"
              className="px-4 py-2 cursor-pointer hover:bg-primary hover:text-primary-foreground transition-colors"
            >
              {category.name} ({category.count})
            </Badge>
          ))}
        </div>

        {/* Featured Articles */}
        {featuredArticles.length > 0 && (
          <div className="mb-12">
            <h2 className="text-2xl font-bold mb-6">Articles à la une</h2>
            <div className="grid md:grid-cols-2 gap-6">
              {featuredArticles.map((article) => (
                <Link key={article.id} href={`/expertise/${article.slug}`}>
                  <Card className="h-full hover:shadow-lg transition-shadow cursor-pointer">
                    <CardHeader>
                      <div className="flex items-center justify-between mb-2">
                        <Badge>{article.category}</Badge>
                        <span className="text-sm text-muted-foreground">{article.readTime}</span>
                      </div>
                      <CardTitle className="line-clamp-2">{article.title}</CardTitle>
                      <CardDescription className="line-clamp-3">
                        {article.description}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center justify-between text-sm text-muted-foreground">
                        <div className="flex items-center space-x-4">
                          <div className="flex items-center">
                            <User className="h-4 w-4 mr-1" />
                            {article.author}
                          </div>
                          <div className="flex items-center">
                            <Calendar className="h-4 w-4 mr-1" />
                            {new Date(article.date).toLocaleDateString('fr-FR')}
                          </div>
                        </div>
                        <ArrowRight className="h-4 w-4" />
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Regular Articles */}
        <div>
          <h2 className="text-2xl font-bold mb-6">Tous les articles</h2>
          <div className="grid gap-6">
            {regularArticles.map((article) => (
              <Link key={article.id} href={`/expertise/${article.slug}`}>
                <Card className="hover:shadow-md transition-shadow cursor-pointer">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-4 mb-2">
                          <Badge variant="outline">{article.category}</Badge>
                          <span className="text-sm text-muted-foreground">{article.readTime}</span>
                        </div>
                        <CardTitle className="text-lg mb-2">{article.title}</CardTitle>
                        <CardDescription className="line-clamp-2">
                          {article.description}
                        </CardDescription>
                        <div className="flex items-center space-x-4 mt-4 text-sm text-muted-foreground">
                          <div className="flex items-center">
                            <User className="h-4 w-4 mr-1" />
                            {article.author}
                          </div>
                          <div className="flex items-center">
                            <Calendar className="h-4 w-4 mr-1" />
                            {new Date(article.date).toLocaleDateString('fr-FR')}
                          </div>
                        </div>
                      </div>
                      <ArrowRight className="h-5 w-5 text-muted-foreground" />
                    </div>
                  </CardHeader>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}