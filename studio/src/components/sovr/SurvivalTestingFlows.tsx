'use client';

import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Activity,
  AlertTriangle,
  Award,
  BarChart3,
  CheckCircle,
  Flame,
  Heart,
  RefreshCw,
  Shield,
  ShieldCheck,
  Star,
  Target,
  Trophy,
  Users
} from 'lucide-react';
import { useEffect, useState } from 'react';

interface SurvivalChallenge {
  id: string;
  name: string;
  description: string;
  duration: number; // days
  targetCalories: number;
  startDate: string;
  endDate: string;
  status: 'upcoming' | 'active' | 'completed';
  participants: number;
  completionRate: number;
  difficulty: 'easy' | 'medium' | 'hard' | 'extreme';
  rewards: {
    type: 'recognition' | 'bonus_credit' | 'status_upgrade';
    amount?: number;
    description: string;
  }[];
}

interface UserSurvivalRecord {
  userId: string;
  username: string;
  currentStreak: number;
  longestStreak: number;
  totalDays: number;
  successRate: number;
  averageCalories: number;
  lastUpdate: string;
  currentChallenge?: string;
  achievements: Achievement[];
}

interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  earnedDate: string;
}

interface SurvivalTestingFlowsProps {
  currentUser: UserSurvivalRecord;
  activeChallenges: SurvivalChallenge[];
  communityData: UserSurvivalRecord[];
  onJoinChallenge: (challengeId: string) => Promise<void>;
  onLeaveChallenge: (challengeId: string) => Promise<void>;
  className?: string;
}

export default function SurvivalTestingFlows({
  currentUser,
  activeChallenges,
  communityData,
  onJoinChallenge,
  onLeaveChallenge,
  className = '',
}: SurvivalTestingFlowsProps) {
  const [selectedTab, setSelectedTab] = useState('challenges');
  const [isJoining, setIsJoining] = useState<string | null>(null);
  const [survivalHistory, setSurvivalHistory] = useState<number[]>([]);
  const [emergencyMode, setEmergencyMode] = useState(false);

  // Mock survival history (last 30 days)
  useEffect(() => {
    const mockHistory = Array.from({ length: 30 }, () => 
      Math.floor(Math.random() * 1200) + 800 // 800-2000 calories per day
    );
    setSurvivalHistory(mockHistory);
  }, []);

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return 'text-green-600';
      case 'medium': return 'text-yellow-600';
      case 'hard': return 'text-orange-600';
      case 'extreme': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  const getDifficultyBadge = (difficulty: string) => {
    switch (difficulty) {
      case 'easy':
        return <Badge className="bg-green-100 text-green-800 border-green-200">Easy</Badge>;
      case 'medium':
        return <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200">Medium</Badge>;
      case 'hard':
        return <Badge className="bg-orange-100 text-orange-800 border-orange-200">Hard</Badge>;
      case 'extreme':
        return <Badge className="bg-red-100 text-red-800 border-red-200">Extreme</Badge>;
      default:
        return <Badge variant="outline">Unknown</Badge>;
    }
  };

  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case 'common': return 'text-gray-600';
      case 'rare': return 'text-blue-600';
      case 'epic': return 'text-purple-600';
      case 'legendary': return 'text-yellow-600';
      default: return 'text-gray-600';
    }
  };

  const handleJoinChallenge = async (challengeId: string) => {
    setIsJoining(challengeId);
    try {
      await onJoinChallenge(challengeId);
    } catch (error) {
      console.error('Failed to join challenge:', error);
    } finally {
      setIsJoining(null);
    }
  };

  const calculateCommunityStats = () => {
    const totalParticipants = communityData.length;
    const avgSuccessRate = communityData.reduce((sum, user) => sum + user.successRate, 0) / totalParticipants;
    const avgStreak = communityData.reduce((sum, user) => sum + user.currentStreak, 0) / totalParticipants;
    const totalDays = communityData.reduce((sum, user) => sum + user.totalDays, 0);
    
    return {
      totalParticipants,
      avgSuccessRate,
      avgStreak,
      totalDays
    };
  };

  const communityStats = calculateCommunityStats();

  const getCurrentSurvivalStatus = () => {
    const todayCalories = survivalHistory[survivalHistory.length - 1] || 0;
    const targetCalories = 1200;
    const percentage = (todayCalories / targetCalories) * 100;
    
    if (percentage >= 100) return { level: 'excellent', color: 'text-green-600', icon: <ShieldCheck className="h-4 w-4" /> };
    if (percentage >= 80) return { level: 'good', color: 'text-blue-600', icon: <CheckCircle className="h-4 w-4" /> };
    if (percentage >= 60) return { level: 'caution', color: 'text-yellow-600', icon: <AlertTriangle className="h-4 w-4" /> };
    return { level: 'critical', color: 'text-red-600', icon: <Flame className="h-4 w-4" /> };
  };

  const survivalStatus = getCurrentSurvivalStatus();

  return (
    <div className={`max-w-4xl mx-auto space-y-6 ${className}`}>
      {/* SOVR Doctrine Header */}
      <Alert className="border-blue-200 bg-blue-50">
        <Heart className="h-4 w-4 text-blue-600" />
        <AlertDescription className="text-blue-800">
          <strong>SOVR Survival Testing:</strong> Essential goods survival challenges test mechanical truth and honoring agent reliability. 
          Community metrics show real-world sovereignty capabilities. <em>Truth is mechanical, testing validates reality.</em>
        </AlertDescription>
      </Alert>

      {/* Current Status Overview */}
      <Card className="border-2 border-slate-200">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Current Survival Status
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="space-y-2">
              <span className="text-sm font-medium text-gray-700">Today's Calories</span>
              <p className={`text-2xl font-bold ${survivalStatus.color}`}>
                {survivalHistory[survivalHistory.length - 1]?.toLocaleString() || 0}
              </p>
              <div className="flex items-center gap-2">
                {survivalStatus.icon}
                <span className={`text-sm font-medium ${survivalStatus.color}`}>
                  {survivalStatus.level.toUpperCase()}
                </span>
              </div>
            </div>
            
            <div className="space-y-2">
              <span className="text-sm font-medium text-gray-700">Current Streak</span>
              <p className="text-2xl font-bold text-blue-600">{currentUser.currentStreak}</p>
              <span className="text-sm text-gray-600">days</span>
            </div>
            
            <div className="space-y-2">
              <span className="text-sm font-medium text-gray-700">Success Rate</span>
              <p className="text-2xl font-bold text-green-600">{currentUser.successRate.toFixed(1)}%</p>
              <span className="text-sm text-gray-600">30-day average</span>
            </div>
            
            <div className="space-y-2">
              <span className="text-sm font-medium text-gray-700">Community Rank</span>
              <p className="text-2xl font-bold text-purple-600">
                #{communityData.findIndex(u => u.userId === currentUser.userId) + 1}
              </p>
              <span className="text-sm text-gray-600">of {communityStats.totalParticipants}</span>
            </div>
          </div>

          {/* Emergency Mode Toggle */}
          {survivalStatus.level === 'critical' && (
            <Alert className="border-red-200 bg-red-50">
              <AlertTriangle className="h-4 w-4 text-red-600" />
              <AlertDescription className="text-red-800">
                <div className="flex items-center justify-between">
                  <span className="font-medium">Critical Survival Status Detected</span>
                  <Button
                    onClick={() => setEmergencyMode(!emergencyMode)}
                    size="sm"
                    className="bg-red-600 hover:bg-red-700 text-white"
                  >
                    {emergencyMode ? 'Exit Emergency' : 'Emergency Mode'}
                  </Button>
                </div>
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* Main Content Tabs */}
      <Tabs value={selectedTab} onValueChange={setSelectedTab}>
        <TabsList className="grid grid-cols-4 w-full">
          <TabsTrigger value="challenges" className="flex items-center gap-2">
            <Trophy className="h-4 w-4" />
            Challenges
          </TabsTrigger>
          <TabsTrigger value="community" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            Community
          </TabsTrigger>
          <TabsTrigger value="history" className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            History
          </TabsTrigger>
          <TabsTrigger value="achievements" className="flex items-center gap-2">
            <Award className="h-4 w-4" />
            Achievements
          </TabsTrigger>
        </TabsList>

        {/* Active Challenges */}
        <TabsContent value="challenges" className="mt-6">
          <div className="space-y-4">
            {activeChallenges.map((challenge) => (
              <Card key={challenge.id} className="border-2 border-slate-200">
                <CardHeader className="pb-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="flex items-center gap-2">
                        <Target className="h-5 w-5" />
                        {challenge.name}
                      </CardTitle>
                      <p className="text-sm text-gray-600 mt-1">{challenge.description}</p>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      {getDifficultyBadge(challenge.difficulty)}
                      <Badge 
                        className={
                          challenge.status === 'active' ? 'bg-green-100 text-green-800 border-green-200' :
                          challenge.status === 'upcoming' ? 'bg-blue-100 text-blue-800 border-blue-200' :
                          'bg-gray-100 text-gray-800 border-gray-200'
                        }
                      >
                        {challenge.status}
                      </Badge>
                    </div>
                  </div>
                </CardHeader>
                
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <span className="text-gray-600">Duration:</span>
                      <p className="font-medium">{challenge.duration} days</p>
                    </div>
                    <div>
                      <span className="text-gray-600">Target Calories:</span>
                      <p className="font-medium">{challenge.targetCalories.toLocaleString()}/day</p>
                    </div>
                    <div>
                      <span className="text-gray-600">Participants:</span>
                      <p className="font-medium">{challenge.participants.toLocaleString()}</p>
                    </div>
                    <div>
                      <span className="text-gray-600">Completion Rate:</span>
                      <p className="font-medium">{challenge.completionRate}%</p>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <span className="text-sm font-medium text-gray-700">Rewards:</span>
                    <div className="flex flex-wrap gap-2">
                      {challenge.rewards.map((reward, index) => (
                        <Badge key={index} variant="outline" className="text-xs">
                          {reward.description}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <Button
                      onClick={() => handleJoinChallenge(challenge.id)}
                      disabled={isJoining === challenge.id || challenge.status === 'completed'}
                      className="flex-1"
                    >
                      {isJoining === challenge.id ? (
                        <>
                          <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                          Joining...
                        </>
                      ) : challenge.status === 'completed' ? (
                        'Challenge Completed'
                      ) : currentUser.currentChallenge === challenge.id ? (
                        'Leave Challenge'
                      ) : (
                        'Join Challenge'
                      )}
                    </Button>
                    <Button variant="outline">
                      View Details
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Community Stats */}
        <TabsContent value="community" className="mt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Community Overview */}
            <Card className="border-2 border-slate-200">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Community Overview
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Total Participants:</span>
                    <span className="font-medium">{communityStats.totalParticipants.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Average Success Rate:</span>
                    <span className="font-medium">{communityStats.avgSuccessRate.toFixed(1)}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Average Streak:</span>
                    <span className="font-medium">{communityStats.avgStreak.toFixed(1)} days</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Total Survival Days:</span>
                    <span className="font-medium">{communityStats.totalDays.toLocaleString()}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Top Performers */}
            <Card className="border-2 border-slate-200">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center gap-2">
                  <Star className="h-5 w-5" />
                  Top Performers
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {communityData
                  .sort((a, b) => b.successRate - a.successRate)
                  .slice(0, 5)
                  .map((user, index) => (
                    <div key={user.userId} className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                          index === 0 ? 'bg-yellow-100 text-yellow-800' :
                          index === 1 ? 'bg-gray-100 text-gray-800' :
                          index === 2 ? 'bg-orange-100 text-orange-800' :
                          'bg-blue-100 text-blue-800'
                        }`}>
                          {index + 1}
                        </div>
                        <span className="text-sm font-medium">{user.username}</span>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-medium">{user.successRate.toFixed(1)}%</div>
                        <div className="text-xs text-gray-600">{user.currentStreak} day streak</div>
                      </div>
                    </div>
                  ))}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Survival History */}
        <TabsContent value="history" className="mt-6">
          <Card className="border-2 border-slate-200">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                30-Day Survival History
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-7 gap-2 h-32">
                {survivalHistory.slice(-21).map((calories, index) => {
                  const percentage = Math.min((calories / 2000) * 100, 100);
                  const isGood = calories >= 1200;
                  
                  return (
                    <div
                      key={index}
                      className={`rounded-sm flex flex-col justify-end ${
                        isGood ? 'bg-green-200' : 'bg-red-200'
                      }`}
                      style={{ height: `${percentage}%` }}
                      title={`Day ${survivalHistory.length - 21 + index + 1}: ${calories} calories`}
                    >
                      <div className="text-xs text-center p-1">
                        {Math.round(percentage)}%
                      </div>
                    </div>
                  );
                })}
              </div>
              
              <div className="flex items-center justify-between text-sm text-gray-600">
                <span>21 days ago</span>
                <span>Today</span>
              </div>

              <Alert className="border-blue-200 bg-blue-50">
                <Activity className="h-4 w-4 text-blue-600" />
                <AlertDescription className="text-blue-800">
                  <strong>Mechanical Truth:</strong> All survival data comes from TigerBeetle cleared obligations. 
                  No manual entries or balance edits. <em>Truth is mathematical, not administrative.</em>
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Achievements */}
        <TabsContent value="achievements" className="mt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {currentUser.achievements.map((achievement) => (
              <Card key={achievement.id} className="border-2 border-slate-200">
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <div className={`p-2 rounded-lg ${getRarityColor(achievement.rarity)} bg-opacity-20`}>
                      {achievement.icon}
                    </div>
                    <div className="flex-1">
                      <h3 className="font-medium">{achievement.name}</h3>
                      <p className="text-sm text-gray-600 mt-1">{achievement.description}</p>
                      <div className="flex items-center gap-2 mt-2">
                        <Badge variant="outline" className={`text-xs ${getRarityColor(achievement.rarity)}`}>
                          {achievement.rarity}
                        </Badge>
                        <span className="text-xs text-gray-500">
                          Earned {new Date(achievement.earnedDate).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>

      {/* SOVR Doctrine Footer */}
      <Alert className="border-slate-200 bg-slate-50">
        <Shield className="h-4 w-4 text-slate-600" />
        <AlertDescription className="text-slate-700">
          <strong>SOVR Survival Testing Doctrine:</strong> Community challenges validate mechanical truth through real-world usage. 
          Honoring agent reliability tested in survival scenarios. No overrides, only mechanical verification. 
          <em>Truth survives testing, lies collapse under pressure.</em>
        </AlertDescription>
      </Alert>
    </div>
  );
}