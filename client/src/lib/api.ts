// API client to replace Supabase functionality
interface ApiResponse<T = any> {
  data?: T;
  error?: string;
}

class ApiClient {
  private baseUrl = '/api';
  private userId: string | null = null;

  setUserId(userId: string | null) {
    this.userId = userId;
  }

  private async request<T>(
    endpoint: string, 
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    try {
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        ...options.headers as Record<string, string>,
      };

      if (this.userId) {
        headers['x-user-id'] = this.userId;
      }

      const response = await fetch(`${this.baseUrl}${endpoint}`, {
        ...options,
        headers,
      });

      const data = await response.json();

      if (!response.ok) {
        return { error: data.error || 'Request failed' };
      }

      return { data };
    } catch (error) {
      return { error: 'Network error' };
    }
  }

  // Events API
  async getEvents() {
    return this.request('/events');
  }

  async createEvent(event: {
    title: string;
    eventDate: string;
    eventType?: string;
    calculationType?: string;
    repeatOption?: string;
    backgroundImage?: string;
  }) {
    return this.request('/events', {
      method: 'POST',
      body: JSON.stringify(event),
    });
  }

  async updateEvent(eventId: string, updates: {
    title?: string;
    eventDate?: string;
    eventType?: string;
    calculationType?: string;
    repeatOption?: string;
    backgroundImage?: string;
  }) {
    return this.request(`/events/${eventId}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
  }

  async deleteEvent(eventId: string) {
    return this.request(`/events/${eventId}`, {
      method: 'DELETE',
    });
  }

  // Profile API
  async getProfile() {
    return this.request('/profile');
  }

  async createProfile(profile: {
    displayName?: string;
    username?: string;
    bio?: string;
    avatarUrl?: string;
  }) {
    return this.request('/profile', {
      method: 'POST',
      body: JSON.stringify(profile),
    });
  }

  async updateProfile(updates: {
    displayName?: string;
    username?: string;
    bio?: string;
    avatarUrl?: string;
  }) {
    return this.request('/profile', {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
  }

  // User roles API
  async getUserRole() {
    return this.request('/user/role');
  }

  async hasRole(role: string) {
    return this.request('/user/role/check', {
      method: 'POST',
      body: JSON.stringify({ role }),
    });
  }

  // Translations API
  async getTranslations() {
    return this.request('/translations');
  }

  async createTranslation(translation: {
    key: string;
    namespace?: string;
    arabicText: string;
    englishText: string;
    description?: string;
  }) {
    return this.request('/translations', {
      method: 'POST',
      body: JSON.stringify(translation),
    });
  }

  async updateTranslation(key: string, updates: {
    namespace?: string;
    arabicText?: string;
    englishText?: string;
    description?: string;
  }) {
    return this.request(`/translations/${key}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
  }

  async deleteTranslation(key: string) {
    return this.request(`/translations/${key}`, {
      method: 'DELETE',
    });
  }

  // Email API
  async sendEmail(email: {
    to: string;
    subject: string;
    html: string;
  }) {
    return this.request('/send-email', {
      method: 'POST',
      body: JSON.stringify(email),
    });
  }

  // Image generation API
  async generateImage(prompt: string) {
    return this.request('/generate-image', {
      method: 'POST',
      body: JSON.stringify({ prompt }),
    });
  }
}

export const api = new ApiClient();

// Mock authentication functions to replace Supabase auth
export const auth = {
  getSession: () => Promise.resolve({ data: { session: null } }),
  onAuthStateChange: (callback: (event: string, session: any) => void) => {
    // Mock implementation - in a real app, you'd implement proper auth
    return { data: { subscription: { unsubscribe: () => {} } } };
  },
  signUp: (credentials: { email: string; password: string; options?: any }) => {
    // Mock implementation - return success for now
    return Promise.resolve({ data: { user: null }, error: null });
  },
  signInWithPassword: (credentials: { email: string; password: string }) => {
    // Mock implementation - return success for now
    return Promise.resolve({ data: { user: null }, error: null });
  },
  signInWithOAuth: (options: { provider: string; options?: any }) => {
    // Mock implementation for OAuth
    return Promise.resolve({ data: { url: null }, error: null });
  },
  signOut: () => {
    // Mock implementation
    return Promise.resolve({ error: null });
  },
  getUser: (token?: string) => {
    // Mock implementation - return no user for now
    return Promise.resolve({ data: { user: null }, error: null });
  }
};