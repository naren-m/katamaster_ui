import { describe, it, expect, vi, beforeEach, Mock } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import PracticeCard from '../PracticeCard';
import { usePractice } from '../../../contexts/PracticeContext';
import { useRewards } from '../../../contexts/RewardsContext';

// Mock the contexts
vi.mock('../../../contexts/PracticeContext');
vi.mock('../../../contexts/RewardsContext');

// Mock child components that use router hooks
vi.mock('../PunchCounter', () => ({
  default: () => <div data-testid="punch-counter">Punch Counter</div>,
}));

vi.mock('../KickCounter', () => ({
  default: () => <div data-testid="kick-counter">Kick Counter</div>,
}));

vi.mock('../KataLogger', () => ({
  default: () => <div data-testid="kata-logger">Kata Logger</div>,
}));

vi.mock('../TechniqueLogger', () => ({
  default: () => <div data-testid="technique-logger">Technique Logger</div>,
}));

vi.mock('../SessionTimer', () => ({
  default: ({ seconds }: { seconds: number }) => (
    <div data-testid="session-timer">
      {Math.floor(seconds / 60)}m {seconds % 60}s
    </div>
  ),
}));

vi.mock('../MotivationalMessage', () => ({
  default: ({ message }: { message: string }) => (
    <div data-testid="motivational-message">{message}</div>
  ),
}));

vi.mock('../MovementCombinations', () => ({
  default: () => <div data-testid="movement-combinations">Movement Combinations</div>,
}));

// Mock framer-motion
vi.mock('framer-motion', () => ({
  motion: {
    button: ({ children, ...props }: any) => <button {...props}>{children}</button>,
    div: ({ children, ...props }: any) => <div {...props}>{children}</div>,
  },
}));

// Mock react-confetti
vi.mock('react-confetti', () => ({
  default: () => <div data-testid="confetti" />,
}));

// Mock window dimensions for confetti
Object.defineProperty(window, 'innerWidth', {
  writable: true,
  configurable: true,
  value: 1024,
});
Object.defineProperty(window, 'innerHeight', {
  writable: true,
  configurable: true,
  value: 768,
});

describe('PracticeCard', () => {
  const mockStartSession = vi.fn();
  const mockEndSession = vi.fn();
  const mockUpdateRewardProgress = vi.fn();

  const defaultPracticeContext = {
    currentPunches: 0,
    currentKicks: 0,
    currentKatas: [],
    sessionTimer: 0,
    isSessionActive: false,
    totalPoints: 0,
    currentStreak: 0,
    totalPunches: 0,
    totalKicks: 0,
    totalSessions: 0,
    favoriteKata: 'Heian Shodan',
    recentSessions: [],
    kataList: ['Heian Shodan', 'Heian Nidan'],
    kataObjects: [],
    incrementPunches: vi.fn(),
    incrementKicks: vi.fn(),
    addKata: vi.fn(),
    startSession: mockStartSession,
    endSession: mockEndSession,
    resetCurrentSession: vi.fn(),
    incrementTechnique: vi.fn(),
    getTechniqueCount: vi.fn(),
  };

  const defaultRewardsContext = {
    currentPoints: 0,
    availableRewards: [],
    earnedRewards: [],
    updateRewardProgress: mockUpdateRewardProgress,
    redeemReward: vi.fn(),
  };

  const renderWithRouter = (component: React.ReactElement) => {
    return render(
      <MemoryRouter>
        {component}
      </MemoryRouter>
    );
  };

  beforeEach(() => {
    vi.clearAllMocks();
    (usePractice as Mock).mockReturnValue(defaultPracticeContext);
    (useRewards as Mock).mockReturnValue(defaultRewardsContext);
  });

  describe('Initial State', () => {
    it('renders start practice button when session is not active', () => {
      renderWithRouter(<PracticeCard />);
      
      expect(screen.getByText('Today\'s Practice')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /start practice/i })).toBeInTheDocument();
    });

    it('does not show practice controls when session is not active', () => {
      renderWithRouter(<PracticeCard />);
      
      expect(screen.queryByRole('button', { name: /finish practice/i })).not.toBeInTheDocument();
      expect(screen.queryByText(/practice timer/i)).not.toBeInTheDocument();
    });
  });

  describe('Start Practice Functionality', () => {
    it('calls startSession when start practice button is clicked', async () => {
      const user = userEvent.setup();
      renderWithRouter(<PracticeCard />);
      
      const startButton = screen.getByRole('button', { name: /start practice/i });
      await user.click(startButton);
      
      expect(mockStartSession).toHaveBeenCalledTimes(1);
    });

    it('shows practice controls when session is active', () => {
      (usePractice as Mock).mockReturnValue({
        ...defaultPracticeContext,
        isSessionActive: true,
        sessionTimer: 120,
      });

      renderWithRouter(<PracticeCard />);
      
      expect(screen.getByRole('button', { name: /finish practice/i })).toBeInTheDocument();
      expect(screen.getByText(/practice timer/i)).toBeInTheDocument();
      expect(screen.queryByRole('button', { name: /start practice/i })).not.toBeInTheDocument();
    });

    it('displays practice mode tabs when session is active', () => {
      (usePractice as Mock).mockReturnValue({
        ...defaultPracticeContext,
        isSessionActive: true,
      });

      renderWithRouter(<PracticeCard />);
      
      expect(screen.getByRole('button', { name: /basic/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /advanced/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /movements/i })).toBeInTheDocument();
    });
  });

  describe('Finish Practice Functionality', () => {
    beforeEach(() => {
      (usePractice as Mock).mockReturnValue({
        ...defaultPracticeContext,
        isSessionActive: true,
        currentPunches: 50,
        currentKicks: 30,
        currentKatas: [{ name: 'Heian Shodan', repetitions: 3 }],
        sessionTimer: 600, // 10 minutes
      });
    });

    it('calls endSession when finish practice button is clicked', async () => {
      const user = userEvent.setup();
      mockEndSession.mockResolvedValue(25); // Mock 25 points earned

      renderWithRouter(<PracticeCard />);
      
      const finishButton = screen.getByRole('button', { name: /finish practice/i });
      await user.click(finishButton);
      
      expect(mockEndSession).toHaveBeenCalledTimes(1);
    });

    it('shows completion screen with points earned after finishing practice', async () => {
      const user = userEvent.setup();
      const pointsEarned = 25;
      mockEndSession.mockResolvedValue(pointsEarned);

      renderWithRouter(<PracticeCard />);
      
      const finishButton = screen.getByRole('button', { name: /finish practice/i });
      await user.click(finishButton);
      
      // Wait for async operations to complete
      await waitFor(() => {
        expect(screen.getByText('Practice Complete!')).toBeInTheDocument();
        expect(screen.getByText(`+${pointsEarned}`)).toBeInTheDocument();
        expect(screen.getByText('Points Earned')).toBeInTheDocument();
      });
    });

    it('displays practice statistics on completion screen', async () => {
      const user = userEvent.setup();
      mockEndSession.mockResolvedValue(25);

      renderWithRouter(<PracticeCard />);
      
      await user.click(screen.getByRole('button', { name: /finish practice/i }));
      
      await waitFor(() => {
        expect(screen.getByText('50')).toBeInTheDocument(); // Punches
        expect(screen.getByText('30')).toBeInTheDocument(); // Kicks
        expect(screen.getByText('1')).toBeInTheDocument(); // Katas count
        expect(screen.getByText('10m 0s')).toBeInTheDocument(); // Practice time
      });
    });

    it('calls updateRewardProgress with correct points after finishing practice', async () => {
      const user = userEvent.setup();
      const pointsEarned = 25;
      mockEndSession.mockResolvedValue(pointsEarned);

      renderWithRouter(<PracticeCard />);
      
      await user.click(screen.getByRole('button', { name: /finish practice/i }));
      
      await waitFor(() => {
        expect(mockUpdateRewardProgress).toHaveBeenCalledWith(pointsEarned);
      });
    });

    it('shows confetti animation after completing practice', async () => {
      const user = userEvent.setup();
      mockEndSession.mockResolvedValue(25);

      renderWithRouter(<PracticeCard />);
      
      await user.click(screen.getByRole('button', { name: /finish practice/i }));
      
      await waitFor(() => {
        expect(screen.getByTestId('confetti')).toBeInTheDocument();
      });
    });

    it('allows starting new practice after completion', async () => {
      const user = userEvent.setup();
      mockEndSession.mockResolvedValue(25);

      renderWithRouter(<PracticeCard />);
      
      // Finish current practice
      await user.click(screen.getByRole('button', { name: /finish practice/i }));
      
      // Wait for completion screen
      await waitFor(() => {
        expect(screen.getByText('Practice Complete!')).toBeInTheDocument();
      });

      // Click start new practice
      const newPracticeButton = screen.getByRole('button', { name: /start new practice/i });
      await user.click(newPracticeButton);
      
      // Should return to initial state
      expect(screen.queryByText('Practice Complete!')).not.toBeInTheDocument();
    });

    it('handles endSession error gracefully', async () => {
      const user = userEvent.setup();
      const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      mockEndSession.mockRejectedValue(new Error('Network error'));

      renderWithRouter(<PracticeCard />);
      
      await user.click(screen.getByRole('button', { name: /finish practice/i }));
      
      await waitFor(() => {
        expect(consoleErrorSpy).toHaveBeenCalledWith('Error finishing practice session:', expect.any(Error));
        expect(screen.getByText('Practice Complete!')).toBeInTheDocument();
        expect(screen.getByText('+0')).toBeInTheDocument(); // Fallback points
      });

      consoleErrorSpy.mockRestore();
    });
  });

  describe('Tab Navigation', () => {
    beforeEach(() => {
      (usePractice as Mock).mockReturnValue({
        ...defaultPracticeContext,
        isSessionActive: true,
      });
    });

    it('switches between practice mode tabs', async () => {
      const user = userEvent.setup();
      renderWithRouter(<PracticeCard />);
      
      // Start with Basic tab (default)
      expect(screen.getByTestId('punch-counter')).toBeInTheDocument();
      expect(screen.getByTestId('kata-logger')).toBeInTheDocument();
      
      // Switch to Advanced tab
      await user.click(screen.getByRole('button', { name: /advanced/i }));
      expect(screen.getByTestId('technique-logger')).toBeInTheDocument();
      
      // Switch to Movements tab
      await user.click(screen.getByRole('button', { name: /movements/i }));
      expect(screen.getByTestId('movement-combinations')).toBeInTheDocument();
      
      // Switch back to Basic tab
      await user.click(screen.getByRole('button', { name: /basic/i }));
      expect(screen.getByTestId('punch-counter')).toBeInTheDocument();
    });
  });
});