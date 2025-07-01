import React, { createContext, useContext, useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';

const SupabaseContext = createContext();

export const useSupabase = () => {
  const context = useContext(SupabaseContext);
  if (!context) {
    throw new Error('useSupabase must be used within a SupabaseProvider');
  }
  return context;
};

export const SupabaseProvider = ({ children }) => {
  const [supabase] = useState(() => 
    createClient(
      'https://cwduwrlckcdgaucjnunb.supabase.co',
      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImN3ZHV3cmxja2NkZ2F1Y2pudW5iIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTEzODIxODksImV4cCI6MjA2Njk1ODE4OX0.sXe-K4oEwsv35dc6Hep69I_YaRR059xr4wxfLerzIwA'
    )
  );

  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Get initial session
    const getSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setUser(session?.user ?? null);
      setLoading(false);
    };

    getSession();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setUser(session?.user ?? null);
        setLoading(false);
      }
    );

    return () => subscription?.unsubscribe();
  }, [supabase]);

  const processTranscript = async (transcriptText, fileName) => {
    try {
      const { data, error } = await supabase.functions.invoke('hyper-function', {
        body: {
          transcript: transcriptText,
          fileName: fileName,
          timestamp: new Date().toISOString()
        }
      });

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error processing transcript:', error);
      throw error;
    }
  };

  const saveProcessedContent = async (content) => {
    try {
      const { data, error } = await supabase
        .from('processed_transcripts_ssa2024')
        .insert([content])
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error saving processed content:', error);
      throw error;
    }
  };

  const getProcessedContent = async (id) => {
    try {
      const { data, error } = await supabase
        .from('processed_transcripts_ssa2024')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error fetching processed content:', error);
      throw error;
    }
  };

  const getProcessingHistory = async () => {
    try {
      const { data, error } = await supabase
        .from('processed_transcripts_ssa2024')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching processing history:', error);
      throw error;
    }
  };

  const value = {
    supabase,
    user,
    loading,
    processTranscript,
    saveProcessedContent,
    getProcessedContent,
    getProcessingHistory
  };

  return (
    <SupabaseContext.Provider value={value}>
      {children}
    </SupabaseContext.Provider>
  );
};