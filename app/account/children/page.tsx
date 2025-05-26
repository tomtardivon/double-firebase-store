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
import { db } from '@/lib/firebase'
import { collection, query, where, getDocs, addDoc, updateDoc, deleteDoc, doc } from 'firebase/firestore'

interface Child {
  id: string
  name: string
  age: number
  gender: 'male' | 'female' | 'other'
  birthDate: string
}

export default function ChildrenPage() {
  const router = useRouter()
  const { user } = useAuth()
  const { toast } = useToast()
  const [children, setChildren] = useState<Child[]>([])
  const [loading, setLoading] = useState(true)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingChild, setEditingChild] = useState<Child | null>(null)
  const [formData, setFormData] = useState({
    name: '',
    birthDate: '',
    gender: 'male' as 'male' | 'female' | 'other',
  })

  const fetchChildren = useCallback(async () => {
    if (!user) return

    try {
      const q = query(collection(db, 'children'), where('userId', '==', user.uid))
      const querySnapshot = await getDocs(q)
      const childrenData: Child[] = []
      
      querySnapshot.forEach((doc) => {
        const data = doc.data()
        const birthDate = data.birthDate.toDate()
        const age = calculateAge(birthDate)
        
        childrenData.push({
          id: doc.id,
          name: data.name,
          age,
          gender: data.gender,
          birthDate: birthDate.toISOString().split('T')[0],
        })
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

  const calculateAge = (birthDate: Date): number => {
    const today = new Date()
    let age = today.getFullYear() - birthDate.getFullYear()
    const monthDiff = today.getMonth() - birthDate.getMonth()
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--
    }
    
    return age
  }

  const handleSubmit = async () => {
    if (!user) return

    try {
      if (editingChild) {
        // Update existing child
        await updateDoc(doc(db, 'children', editingChild.id), {
          name: formData.name,
          birthDate: new Date(formData.birthDate),
          gender: formData.gender,
          updatedAt: new Date(),
        })
        
        toast({
          title: 'Enfant mis à jour',
          description: 'Les informations ont été mises à jour avec succès.',
        })
      } else {
        // Add new child
        await addDoc(collection(db, 'children'), {
          userId: user.uid,
          name: formData.name,
          birthDate: new Date(formData.birthDate),
          gender: formData.gender,
          createdAt: new Date(),
          updatedAt: new Date(),
        })
        
        toast({
          title: 'Enfant ajouté',
          description: 'L\'enfant a été ajouté avec succès.',
        })
      }
      
      setIsDialogOpen(false)
      setEditingChild(null)
      setFormData({ name: '', birthDate: '', gender: 'male' })
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

  const handleEdit = (child: Child) => {
    setEditingChild(child)
    setFormData({
      name: child.name,
      birthDate: child.birthDate,
      gender: child.gender,
    })
    setIsDialogOpen(true)
  }

  const handleDelete = async (childId: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cet enfant ?')) return

    try {
      await deleteDoc(doc(db, 'children', childId))
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
              <p className="text-muted-foreground">Gérez les profils de vos enfants</p>
            </div>
          </div>
          <Button
            onClick={() => {
              setEditingChild(null)
              setFormData({ name: '', birthDate: '', gender: 'male' })
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
                Vous n&apos;avez pas encore ajouté d&apos;enfant
              </p>
              <Button
                onClick={() => {
                  setEditingChild(null)
                  setFormData({ name: '', birthDate: '', gender: 'male' })
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
                    <CardTitle>{child.name}</CardTitle>
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
                    {child.age} ans • {child.gender === 'male' ? 'Garçon' : child.gender === 'female' ? 'Fille' : 'Autre'}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    Date de naissance: {new Date(child.birthDate).toLocaleDateString('fr-FR')}
                  </p>
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
                <Label htmlFor="name">Nom de l&apos;enfant</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
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
                <Label htmlFor="gender">Genre</Label>
                <Select
                  value={formData.gender}
                  onValueChange={(value: 'male' | 'female' | 'other') => 
                    setFormData({ ...formData, gender: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="male">Garçon</SelectItem>
                    <SelectItem value="female">Fille</SelectItem>
                    <SelectItem value="other">Autre</SelectItem>
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
                disabled={!formData.name || !formData.birthDate}
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