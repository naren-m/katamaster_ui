// Simple API service to communicate with backend
export class ApiService {
  private baseUrl = import.meta.env.VITE_API_BASE_URL || 
    (() => {
      // If accessing via IP or hostname, use the same host for API
      const hostname = window.location.hostname;
      return `http://${hostname}:8083`;
    })();

  // Make authenticated request with automatic token refresh
  private async makeAuthenticatedRequest(url: string, options: RequestInit = {}): Promise<Response> {
    const token = localStorage.getItem('katamaster_token');
    
    if (!token) {
      throw new Error('No authentication token available');
    }

    // Add Authorization header
    const headers = {
      ...options.headers,
      'Authorization': `Bearer ${token}`,
    };

    const response = await fetch(url, {
      ...options,
      headers,
    });

    // If token is expired, try to refresh it
    if (response.status === 401) {
      const refreshToken = localStorage.getItem('katamaster_refresh_token');
      if (refreshToken) {
        try {
          const refreshResponse = await fetch(`${this.baseUrl}/auth/refresh`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ refresh_token: refreshToken }),
          });

          if (refreshResponse.ok) {
            const authData = await refreshResponse.json();
            localStorage.setItem('katamaster_token', authData.token);
            if (authData.refresh_token) {
              localStorage.setItem('katamaster_refresh_token', authData.refresh_token);
            }

            // Retry the original request with new token
            return fetch(url, {
              ...options,
              headers: {
                ...options.headers,
                'Authorization': `Bearer ${authData.token}`,
              },
            });
          }
        } catch (refreshError) {
          console.error('Token refresh failed:', refreshError);
          // Clear invalid tokens
          localStorage.removeItem('katamaster_token');
          localStorage.removeItem('katamaster_refresh_token');
          throw new Error('Authentication failed - please sign in again');
        }
      }
      
      // If no refresh token or refresh failed, clear tokens
      localStorage.removeItem('katamaster_token');
      localStorage.removeItem('katamaster_refresh_token');
      throw new Error('Authentication failed - please sign in again');
    }

    return response;
  }

  async recordPracticeSession(sessionData: {
    kataId: string;
    userId: string;
    repetitions: number;
    notes: string;
    durationMinutes: number;
  }) {
    try {
      // For now, we'll use the gRPC recordPractice method via a simple HTTP call
      // In a real implementation, this would be a proper gRPC-Web call or REST endpoint
      
      const response = await fetch(`${this.baseUrl}/api/practice/record`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          kata_id: sessionData.kataId,
          user_id: sessionData.userId,
          repetitions: sessionData.repetitions,
          notes: sessionData.notes,
          duration_minutes: sessionData.durationMinutes,
          date: new Date().toISOString(),
          self_rating: 8.0,
          focus_areas: ['form', 'timing']
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Failed to record practice session:', error);
      throw error;
    }
  }

  async getKatas() {
    try {
      const response = await fetch(`${this.baseUrl}/api/katas`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error('Failed to fetch katas:', error);
      throw error;
    }
  }

  async getKataDetail(kataId: string) {
    try {
      const response = await fetch(`${this.baseUrl}/api/katas/${kataId}`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error('Failed to fetch kata detail:', error);
      throw error;
    }
  }

  async getUserProgress(userId: string) {
    try {
      const response = await fetch(`${this.baseUrl}/api/users/${userId}/progress`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error('Failed to fetch user progress:', error);
      throw error;
    }
  }

  async recordComprehensivePracticeSession(sessionData: {
    userId: string;
    sessionDate: string;
    durationMinutes: number;
    punches: number;
    kicks: number;
    katas: Array<{name: string, repetitions: number}>;
    techniques: Array<{techniqueId: string, count: number}>;
    notes: string;
    pointsEarned: number;
  }) {
    try {
      const response = await fetch(`${this.baseUrl}/api/practice/session`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          user_id: sessionData.userId,
          session_date: sessionData.sessionDate,
          duration_minutes: sessionData.durationMinutes,
          punches: sessionData.punches,
          kicks: sessionData.kicks,
          katas: sessionData.katas.map(k => ({
            name: k.name,
            repetitions: k.repetitions
          })),
          techniques: sessionData.techniques.map(t => ({
            technique_id: t.techniqueId,
            count: t.count
          })),
          notes: sessionData.notes,
          points_earned: sessionData.pointsEarned
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Failed to record comprehensive practice session:', error);
      throw error;
    }
  }

  async getPointsAudit(userId: string, startDate?: string, endDate?: string) {
    try {
      let url = `${this.baseUrl}/api/users/${userId}/points/audit`;
      const params = new URLSearchParams();
      if (startDate) params.append('start_date', startDate);
      if (endDate) params.append('end_date', endDate);
      if (params.toString()) url += `?${params.toString()}`;

      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error('Failed to fetch points audit:', error);
      return {
        user_id: userId,
        audit_entries: [],
        total_points: 0
      };
    }
  }

  async getCalendarData(userId: string, year?: string, month?: string) {
    try {
      let url = `${this.baseUrl}/api/users/${userId}/calendar`;
      const params = new URLSearchParams();
      if (year) params.append('year', year);
      if (month) params.append('month', month);
      if (params.toString()) url += `?${params.toString()}`;

      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error('Failed to fetch calendar data:', error);
      return {
        user_id: userId,
        calendar_data: [],
        total_days: 0
      };
    }
  }

  async getPracticeHistory(userId: string, page: number = 1, limit: number = 10, date?: string) {
    try {
      let url = `${this.baseUrl}/api/users/${userId}/practice/history`;
      const params = new URLSearchParams();
      params.append('page', page.toString());
      params.append('limit', limit.toString());
      if (date) params.append('date', date);
      url += `?${params.toString()}`;

      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error('Failed to fetch practice history:', error);
      return {
        user_id: userId,
        practice_history: [],
        total_sessions: 0
      };
    }
  }

  // Authentication methods
  async signInWithGoogle(data: { googleToken: string; userInfo: any }) {
    try {
      const response = await fetch(`${this.baseUrl}/api/auth/google`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error('Failed to sign in with Google:', error);
      throw error;
    }
  }

  async signIn(data: { email: string; password: string }) {
    try {
      const response = await fetch(`${this.baseUrl}/api/auth/signin`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error('Failed to sign in:', error);
      throw error;
    }
  }

  async signUp(data: { email: string; password: string }) {
    try {
      const response = await fetch(`${this.baseUrl}/api/auth/signup`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error('Failed to sign up:', error);
      throw error;
    }
  }

  async validateSession(token: string) {
    try {
      const response = await this.makeAuthenticatedRequest(`${this.baseUrl}/api/auth/validate`, {
        method: 'GET',
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error('Failed to validate session:', error);
      return null;
    }
  }

  async signOut(token: string) {
    try {
      const response = await fetch(`${this.baseUrl}/api/auth/signout`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error('Failed to sign out:', error);
      throw error;
    }
  }

  // Movement Service methods
  async getAvailableMoves(moveType?: string) {
    try {
      let url = `${this.baseUrl}/api/movement/moves`;
      if (moveType) {
        url += `?type=${moveType}`;
      }

      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error('Failed to fetch available moves:', error);
      throw error;
    }
  }

  async addCombination(combination: {
    user_id: string;
    name: string;
    moves: Array<{
      type: string;
      name: string;
      description: string;
      duration_seconds: number;
    }>;
    repeat_count: number;
  }) {
    try {
      console.log('📤 Sending combination to API:', combination);
      const response = await fetch(`${this.baseUrl}/api/movement/combinations`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(combination),
      });

      console.log('📡 API Response status:', response.status);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ API Error response:', errorText);
        throw new Error(`HTTP error! status: ${response.status}, response: ${errorText}`);
      }
      
      const result = await response.json();
      console.log('✅ API Response data:', result);
      return result;
    } catch (error) {
      console.error('❌ Failed to add combination:', error);
      throw error;
    }
  }

  async getCombinations(userId: string) {
    try {
      console.log('📡 Fetching combinations for user:', userId);
      console.log('🌐 API URL:', `${this.baseUrl}/api/movement/combinations?user_id=${userId}`);
      
      const response = await fetch(`${this.baseUrl}/api/movement/combinations?user_id=${userId}`);
      console.log('📊 Response status:', response.status);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ Error response:', errorText);
        throw new Error(`HTTP error! status: ${response.status}, response: ${errorText}`);
      }
      
      const result = await response.json();
      console.log('✅ Combinations fetched:', result);
      return result;
    } catch (error) {
      console.error('❌ Failed to fetch combinations:', error);
      throw error;
    }
  }

  async createMovementSession(sessionData: {
    user_id: string;
    combination_ids: string[];
    notes?: string;
  }) {
    try {
      const response = await fetch(`${this.baseUrl}/api/movement/sessions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(sessionData),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error('Failed to create movement session:', error);
      throw error;
    }
  }

  async endMovementSession(sessionId: string, notes: string) {
    try {
      const response = await fetch(`${this.baseUrl}/api/movement/sessions/${sessionId}/end`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ notes }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error('Failed to end movement session:', error);
      throw error;
    }
  }

  async getMovementSessions(userId: string) {
    try {
      const response = await fetch(`${this.baseUrl}/api/movement/sessions?user_id=${userId}`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error('Failed to fetch movement sessions:', error);
      throw error;
    }
  }

  async getMoveCounters(userId: string) {
    try {
      const response = await fetch(`${this.baseUrl}/api/movement/counters?user_id=${userId}`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error('Failed to fetch move counters:', error);
      throw error;
    }
  }

  async updateMoveCounter(counterData: {
    user_id: string;
    move_name: string;
    is_forward: boolean;
    increment: number;
  }) {
    try {
      const response = await fetch(`${this.baseUrl}/api/movement/counters`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(counterData),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error('Failed to update move counter:', error);
      throw error;
    }
  }

  // Dashboard Analytics Methods
  async getDashboardAnalytics(userId: string) {
    try {
      const response = await this.makeAuthenticatedRequest(
        `${this.baseUrl}/api/users/${userId}/dashboard/analytics`,
        {
          method: 'GET',
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error('Failed to fetch dashboard analytics:', error);
      return null;
    }
  }

  async getRecentActivity(userId: string, limit: number = 10) {
    try {
      const response = await this.makeAuthenticatedRequest(
        `${this.baseUrl}/api/users/${userId}/recent-activity?limit=${limit}`,
        {
          method: 'GET',
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error('Failed to fetch recent activity:', error);
      return null;
    }
  }

  // Kata Progress Methods
  async getKataProgress(userId: string, kataId: string) {
    try {
      const response = await this.makeAuthenticatedRequest(
        `${this.baseUrl}/api/kata/progress?user_id=${userId}&kata_id=${kataId}`,
        {
          method: 'GET',
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error('Failed to fetch kata progress:', error);
      return null;
    }
  }

  async recordKataPractice(practiceData: {
    kataId: string;
    userId: string;
    repetitions: number;
    notes: string;
    durationMinutes: number;
    selfRating?: number;
    focusAreas?: string[];
    instructorFeedback?: string;
    instructorVerified?: boolean;
  }) {
    try {
      const response = await this.makeAuthenticatedRequest(
        `${this.baseUrl}/api/kata/practice`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            kata_id: practiceData.kataId,
            user_id: practiceData.userId,
            repetitions: practiceData.repetitions,
            notes: practiceData.notes,
            duration_minutes: practiceData.durationMinutes,
            date: new Date().toISOString(),
            self_rating: practiceData.selfRating || 7.5,
            focus_areas: practiceData.focusAreas || ['form', 'timing'],
            instructor_feedback: practiceData.instructorFeedback || '',
            instructor_verified: practiceData.instructorVerified || false,
          }),
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error('Failed to record kata practice:', error);
      throw error;
    }
  }
}

export const apiService = new ApiService();