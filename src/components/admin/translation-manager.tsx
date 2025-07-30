import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useTranslations, Translation } from '@/hooks/use-translations';
import { useToast } from '@/hooks/use-toast';
import { Trash2, Edit, Plus } from 'lucide-react';

export const TranslationManager = () => {
  const { translations, addTranslation, updateTranslation, deleteTranslation, isLoading } = useTranslations();
  const { toast } = useToast();
  const [editingTranslation, setEditingTranslation] = useState<Translation | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    key: '',
    namespace: 'common',
    arabic_text: '',
    english_text: '',
    description: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      if (editingTranslation) {
        await updateTranslation(editingTranslation.id, formData);
        toast({ title: 'Translation updated successfully' });
      } else {
        await addTranslation(formData);
        toast({ title: 'Translation added successfully' });
      }
      
      setIsDialogOpen(false);
      resetForm();
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to save translation',
        variant: 'destructive',
      });
    }
  };

  const handleEdit = (translation: Translation) => {
    setEditingTranslation(translation);
    setFormData({
      key: translation.key,
      namespace: translation.namespace,
      arabic_text: translation.arabic_text,
      english_text: translation.english_text,
      description: translation.description || '',
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this translation?')) {
      try {
        await deleteTranslation(id);
        toast({ title: 'Translation deleted successfully' });
      } catch (error) {
        toast({
          title: 'Error',
          description: 'Failed to delete translation',
          variant: 'destructive',
        });
      }
    }
  };

  const resetForm = () => {
    setFormData({
      key: '',
      namespace: 'common',
      arabic_text: '',
      english_text: '',
      description: '',
    });
    setEditingTranslation(null);
  };

  const groupedTranslations = translations.reduce((acc, translation) => {
    if (!acc[translation.namespace]) {
      acc[translation.namespace] = [];
    }
    acc[translation.namespace].push(translation);
    return acc;
  }, {} as Record<string, Translation[]>);

  if (isLoading) {
    return <div className="p-4">Loading translations...</div>;
  }

  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Translation Manager</h1>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={resetForm}>
              <Plus className="w-4 h-4 mr-2" />
              Add Translation
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>
                {editingTranslation ? 'Edit Translation' : 'Add New Translation'}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="key">Translation Key</Label>
                  <Input
                    id="key"
                    value={formData.key}
                    onChange={(e) => setFormData({ ...formData, key: e.target.value })}
                    placeholder="e.g., common.save"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="namespace">Namespace</Label>
                  <Input
                    id="namespace"
                    value={formData.namespace}
                    onChange={(e) => setFormData({ ...formData, namespace: e.target.value })}
                    placeholder="e.g., common, auth, hero"
                    required
                  />
                </div>
              </div>
              
              <div>
                <Label htmlFor="arabic_text">Arabic Text</Label>
                <Textarea
                  id="arabic_text"
                  value={formData.arabic_text}
                  onChange={(e) => setFormData({ ...formData, arabic_text: e.target.value })}
                  placeholder="النص باللغة العربية"
                  required
                  dir="rtl"
                />
              </div>
              
              <div>
                <Label htmlFor="english_text">English Text</Label>
                <Textarea
                  id="english_text"
                  value={formData.english_text}
                  onChange={(e) => setFormData({ ...formData, english_text: e.target.value })}
                  placeholder="Text in English"
                  required
                />
              </div>
              
              <div>
                <Label htmlFor="description">Description (Optional)</Label>
                <Input
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Description of this translation"
                />
              </div>
              
              <div className="flex justify-end space-x-2">
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit">
                  {editingTranslation ? 'Update' : 'Add'} Translation
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="space-y-6">
        {Object.entries(groupedTranslations).map(([namespace, namespaceTranslations]) => (
          <Card key={namespace}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Badge variant="secondary">{namespace}</Badge>
                <span className="text-sm text-muted-foreground">
                  ({namespaceTranslations.length} translations)
                </span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {namespaceTranslations.map((translation) => (
                  <div key={translation.id} className="border rounded-lg p-4">
                    <div className="flex justify-between items-start mb-2">
                      <div className="flex-1">
                        <h4 className="font-medium text-sm text-muted-foreground mb-1">
                          {translation.key}
                        </h4>
                        {translation.description && (
                          <p className="text-xs text-muted-foreground mb-2">
                            {translation.description}
                          </p>
                        )}
                      </div>
                      <div className="flex space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEdit(translation)}
                        >
                          <Edit className="w-3 h-3" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDelete(translation.id)}
                        >
                          <Trash2 className="w-3 h-3" />
                        </Button>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label className="text-xs text-muted-foreground">Arabic</Label>
                        <p className="text-sm p-2 bg-muted rounded" dir="rtl">
                          {translation.arabic_text}
                        </p>
                      </div>
                      <div>
                        <Label className="text-xs text-muted-foreground">English</Label>
                        <p className="text-sm p-2 bg-muted rounded">
                          {translation.english_text}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};