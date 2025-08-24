// Migration from Supabase to local API
import { api, auth } from '@/lib/api';

// Export the api client as supabase for compatibility
export const supabase = {
  // Auth methods
  auth: {
    getSession: auth.getSession,
    onAuthStateChange: auth.onAuthStateChange,
    signUp: auth.signUp,
    signInWithPassword: auth.signInWithPassword,
    signInWithOAuth: auth.signInWithOAuth,
    signOut: auth.signOut,
    getUser: auth.getUser,
  },
  
  // Database methods (compatible with Supabase pattern)
  from: (table: string) => ({
    select: (columns = '*') => ({
      eq: (column: string, value: any) => ({
        order: (column: string, options?: any) => {
          // Mock implementation that returns events
          if (table === 'events') {
            return api.getEvents();
          }
          return Promise.resolve({ data: [], error: null });
        },
        then: (callback: any) => {
          if (table === 'events') {
            return api.getEvents().then(result => {
              callback({ data: result.data || [], error: result.error });
            });
          }
          return Promise.resolve({ data: [], error: null });
        }
      }),
      then: (callback: any) => {
        if (table === 'events') {
          return api.getEvents().then(result => {
            callback({ data: result.data || [], error: result.error });
          });
        }
        return Promise.resolve({ data: [], error: null });
      }
    }),
    insert: (data: any) => ({
      returning: () => {
        if (table === 'events') {
          return api.createEvent(data);
        }
        return Promise.resolve({ data: null, error: null });
      }
    }),
    update: (data: any) => ({
      eq: (column: string, value: any) => ({
        returning: () => {
          if (table === 'events') {
            return api.updateEvent(value, data);
          }
          return Promise.resolve({ data: null, error: null });
        }
      })
    }),
    delete: () => ({
      eq: (column: string, value: any) => ({
        returning: () => {
          if (table === 'events') {
            return api.deleteEvent(value);
          }
          return Promise.resolve({ data: null, error: null });
        }
      })
    })
  }),
  
  // RPC methods for role checking
  rpc: (functionName: string, params?: any) => {
    if (functionName === 'has_role') {
      return api.hasRole(params._role).then(result => ({
        data: result.data?.hasRole || false,
        error: result.error
      }));
    }
    return Promise.resolve({ data: null, error: 'Function not found' });
  }
};