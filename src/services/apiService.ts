// Simple API service to communicate with backend
export class ApiService {
  private baseUrl = window.location.hostname === 'localhost' ? 'http://localhost:8082' : `http://${window.location.hostname}:8082`;

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
      const response = await fetch(`${this.baseUrl}/api/auth/validate`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
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
}

export const apiService = new ApiService();