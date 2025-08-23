import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useCallback } from 'react';

export interface Translation {
  id: string;
  key: string;
  namespace: string;
  arabic_text: string;
  english_text: string;
  description?: string;
  created_at: string;
  updated_at: string;
}

export const useTranslations = () => {
  const queryClient = useQueryClient();

  const { data: translations = [], isLoading } = useQuery({
    queryKey: ['translations'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('translations')
        .select('*')
        .order('namespace, key');

      if (error) throw error;
      return data as Translation[];
    },
  });

  const addTranslation = useCallback(async (translation: Omit<Translation, 'id' | 'created_at' | 'updated_at'>) => {
    const { error } = await supabase
      .from('translations')
      .insert([translation]);

    if (error) throw error;
    queryClient.invalidateQueries({ queryKey: ['translations'] });
  }, [queryClient]);

  const updateTranslation = useCallback(async (id: string, updates: Partial<Omit<Translation, 'id' | 'created_at' | 'updated_at'>>) => {
    const { error } = await supabase
      .from('translations')
      .update(updates)
      .eq('id', id);

    if (error) throw error;
    queryClient.invalidateQueries({ queryKey: ['translations'] });
  }, [queryClient]);

  const deleteTranslation = useCallback(async (id: string) => {
    const { error } = await supabase
      .from('translations')
      .delete()
      .eq('id', id);

    if (error) throw error;
    queryClient.invalidateQueries({ queryKey: ['translations'] });
  }, [queryClient]);

  // Convert translations to i18n format
  const formatForI18n = useCallback((language: 'ar' | 'en') => {
    const result: Record<string, any> = {};
    
    translations.forEach((translation) => {
      const text = language === 'ar' ? translation.arabic_text : translation.english_text;
      const keyParts = translation.key.split('.');
      
      let current = result;
      for (let i = 0; i < keyParts.length - 1; i++) {
        if (!current[keyParts[i]]) {
          current[keyParts[i]] = {};
        }
        current = current[keyParts[i]];
      }
      current[keyParts[keyParts.length - 1]] = text;
    });

    return result;
  }, [translations]);

  return {
    translations,
    isLoading,
    addTranslation,
    updateTranslation,
    deleteTranslation,
    formatForI18n,
  };
};