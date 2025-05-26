'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { Plus, Edit2, Trash2, Users } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useToast } from '@/components/ui/use-toast'
import { useAuth } from '@/hooks/useAuth'
import { shopDb } from '@/lib/firebase/config'
import { collection, query, getDocs, addDoc, updateDoc, deleteDoc, doc } from 'firebase/firestore'

interface SmarTeenChild {
  id: string
  firstName: string
  age: number
  protectionLevel: 'strict' | 'moderate'
  birthDate: any
  orderId?: string
  status: 'pending' | 'confirmed' | 'delivered' | 'manual'
  links?: {
    subscriptionId?: string
    orderId?: string
  }
  createdAt: any
  confirmedAt?: any
}

export default function ChildrenPage() {
  const router = useRouter()
  const { user } = useAuth()
  const { toast } = useToast()
  const [children, setChildren] = useState<SmarTeenChild[]>([])
  const [loading, setLoading] = useState(true)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingChild, setEditingChild] = useState<SmarTeenChild | null>(null)
  const [formData, setFormData] = useState({
    firstName: '',
    birthDate: '',
    protectionLevel: 'moderate' as 'strict' | 'moderate',
  })

  const fetchChildren = useCallback(async () => {
    if (!user) return

    try {
      const q = query(collection(shopDb, 'smarteenUsers', user.uid, 'children'))
      const querySnapshot = await getDocs(q)
      const childrenData: SmarTeenChild[] = []
      
      querySnapshot.forEach((doc) => {
        const data = doc.data()
        childrenData.push({
          id: doc.id,
          ...data
        } as SmarTeenChild)
      })
      
      setChildren(childrenData)
    } catch (error) {
      console.error('Error fetching children:', error)
      toast({
        title: 'Erreur',
        description: 'Impossible de charger les enfants.',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }, [user, toast])

  useEffect(() => {
    if (!user) {
      router.push('/login')
      return
    }
    fetchChildren()
  }, [user, router, fetchChildren])


  const handleSubmit = async () => {
    if (!user) return

    try {
      if (editingChild) {
        // Update existing child
        await updateDoc(doc(shopDb, 'smarteenUsers', user.uid, 'children', editingChild.id), {
          firstName: formData.firstName,
          birthDate: new Date(formData.birthDate),
          age: new Date().getFullYear() - new Date(formData.birthDate).getFullYear(),
          protectionLevel: formData.protectionLevel,
          updatedAt: new Date(),
        })
        
        toast({
          title: 'Enfant mis à jour',
          description: 'Les informations ont été mises à jour avec succès.',
        })
      } else {
        // Add new child (non lié à une commande)
        await addDoc(collection(shopDb, 'smarteenUsers', user.uid, 'children'), {
          firstName: formData.firstName,
          birthDate: new Date(formData.birthDate),
          age: new Date().getFullYear() - new Date(formData.birthDate).getFullYear(),
          protectionLevel: formData.protectionLevel,
          status: 'manual', // Différent des enfants créés via commande
          createdAt: new Date(),
        })
        
        toast({
          title: 'Enfant ajouté',
          description: 'L\'enfant a été ajouté avec succès.',
        })
      }
      
      setIsDialogOpen(false)
      setEditingChild(null)
      setFormData({ firstName: '', birthDate: '', protectionLevel: 'moderate' })
      fetchChildren()
    } catch (error) {
      console.error('Error saving child:', error)
      toast({
        title: 'Erreur',
        description: 'Une erreur est survenue lors de l\'enregistrement.',
        variant: 'destructive',
      })
    }
  }

  const handleEdit = (child: SmarTeenChild) => {
    setEditingChild(child)
    setFormData({
      firstName: child.firstName,
      birthDate: child.birthDate.toDate().toISOString().split('T')[0],
      protectionLevel: child.protectionLevel,
    })
    setIsDialogOpen(true)
  }

  const handleDelete = async (childId: string) => {
    if (!user) return
    if (!confirm('Êtes-vous sûr de vouloir supprimer cet enfant ?')) return

    try {
      await deleteDoc(doc(shopDb, 'smarteenUsers', user.uid, 'children', childId))
      toast({
        title: 'Enfant supprimé',
        description: 'L\'enfant a été supprimé avec succès.',
      })
      fetchChildren()
    } catch (error) {
      console.error('Error deleting child:', error)
      toast({
        title: 'Erreur',
        description: 'Une erreur est survenue lors de la suppression.',
        variant: 'destructive',
      })
    }
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <p>Chargement...</p>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-4">
            <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
              <Users className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">Mes enfants</h1>
              <p className="text-muted-foreground">Gérez les profils de vos enfants SmarTeen</p>
            </div>
          </div>
          <Button
            onClick={() => {
              setEditingChild(null)
              setFormData({ firstName: '', birthDate: '', protectionLevel: 'moderate' })
              setIsDialogOpen(true)
            }}
          >
            <Plus className="mr-2 h-4 w-4" />
            Ajouter un enfant
          </Button>
        </div>

        {children.length === 0 ? (
          <Card>
            <CardContent className="text-center py-12">
              <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground mb-4">
                Vous n&apos;avez pas encore d&apos;enfant enregistré
              </p>
              <Button
                onClick={() => {
                  setEditingChild(null)
                  setFormData({ firstName: '', birthDate: '', protectionLevel: 'moderate' })
                  setIsDialogOpen(true)
                }}
              >
                Ajouter votre premier enfant
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {children.map((child) => (
              <Card key={child.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle>{child.firstName}</CardTitle>
                    <div className="flex space-x-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleEdit(child)}
                      >
                        <Edit2 className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDelete(child.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  <CardDescription>
                    {child.age} ans • Protection {child.protectionLevel}
                    {child.status && (
                      <span className="ml-2 px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded">
                        {child.status === 'confirmed' ? 'Commandé' : child.status === 'pending' ? 'En attente' : child.status}
                      </span>
                    )}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">
                      Date de naissance: {new Date(child.birthDate.toDate()).toLocaleDateString('fr-FR')}
                    </p>
                    {child.orderId && (
                      <p className="text-sm text-muted-foreground">
                        Commande: #{child.orderId}
                      </p>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {editingChild ? 'Modifier l&apos;enfant' : 'Ajouter un enfant'}
              </DialogTitle>
              <DialogDescription>
                {editingChild 
                  ? 'Modifiez les informations de votre enfant'
                  : 'Ajoutez un nouvel enfant à votre compte'}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="firstName">Prénom de l&apos;enfant</Label>
                <Input
                  id="firstName"
                  value={formData.firstName}
                  onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                  placeholder="Prénom"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="birthDate">Date de naissance</Label>
                <Input
                  id="birthDate"
                  type="date"
                  value={formData.birthDate}
                  onChange={(e) => setFormData({ ...formData, birthDate: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="protectionLevel">Niveau de protection</Label>
                <Select
                  value={formData.protectionLevel}
                  onValueChange={(value: 'strict' | 'moderate') => 
                    setFormData({ ...formData, protectionLevel: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="moderate">Modérée</SelectItem>
                    <SelectItem value="strict">Stricte</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setIsDialogOpen(false)}
              >
                Annuler
              </Button>
              <Button
                onClick={handleSubmit}
                disabled={!formData.firstName || !formData.birthDate}
              >
                {editingChild ? 'Mettre à jour' : 'Ajouter'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
}