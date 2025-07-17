import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface SecurityEvent {
  id: string;
  type: 'rate_limit' | 'bot_detection' | 'suspicious_activity' | 'blacklist' | 'validation_failed';
  severity: 'low' | 'medium' | 'high' | 'critical';
  message: string;
  timestamp: Date;
  userAgent?: string;
  ip?: string;
  userId?: string;
  details?: any;
}

interface RateLimitConfig {
  windowMs: number;
  maxRequests: number;
  blockDurationMs: number;
}

interface AntiCheatConfig {
  enableRateLimit: boolean;
  enableBotDetection: boolean;
  enableSuspiciousActivityDetection: boolean;
  enableBlacklist: boolean;
  enableValidation: boolean;
  rateLimitConfig: RateLimitConfig;
  maxPointsPerAction: number;
  maxActionsPerMinute: number;
  suspiciousThreshold: number;
}

interface UserActivity {
  userId: string;
  actions: Array<{
    type: string;
    timestamp: Date;
    points: number;
    metadata?: any;
  }>;
  totalPoints: number;
  lastActivity: Date;
  riskScore: number;
  isBlacklisted: boolean;
}

interface AntiCheatSystemProps {
  config?: Partial<AntiCheatConfig>;
  onSecurityEvent?: (event: SecurityEvent) => void;
  onUserBlocked?: (userId: string, reason: string) => void;
  onPointsValidated?: (userId: string, points: number, isValid: boolean) => void;
  className?: string;
}

const AntiCheatSystem: React.FC<AntiCheatSystemProps> = ({
  config = {},
  onSecurityEvent,
  onUserBlocked,
  onPointsValidated,
  className = ''
}) => {
  const [securityEvents, setSecurityEvents] = useState<SecurityEvent[]>([]);
  const [userActivities, setUserActivities] = useState<Map<string, UserActivity>>(new Map());
  const [rateLimitMap, setRateLimitMap] = useState<Map<string, number[]>>(new Map());
  const [blacklist, setBlacklist] = useState<Set<string>>(new Set());
  const [isActive, setIsActive] = useState(true);
  const [stats, setStats] = useState({
    totalEvents: 0,
    blockedUsers: 0,
    suspiciousActivities: 0,
    validatedPoints: 0,
    invalidatedPoints: 0
  });

  const eventIdCounter = useRef(0);
  const mouseMovements = useRef<Array<{ x: number; y: number; timestamp: number }>>([]);
  const keystrokes = useRef<Array<{ key: string; timestamp: number }>>([]);
  const clickPatterns = useRef<Array<{ x: number; y: number; timestamp: number }>>([]);

  // Default configuration
  const defaultConfig: AntiCheatConfig = {
    enableRateLimit: true,
    enableBotDetection: true,
    enableSuspiciousActivityDetection: true,
    enableBlacklist: true,
    enableValidation: true,
    rateLimitConfig: {
      windowMs: 60000, // 1 minute
      maxRequests: 30,
      blockDurationMs: 300000 // 5 minutes
    },
    maxPointsPerAction: 1000,
    maxActionsPerMinute: 20,
    suspiciousThreshold: 0.7
  };

  const finalConfig = { ...defaultConfig, ...config };

  // Generate unique event ID
  const generateEventId = () => {
    return `event_${Date.now()}_${++eventIdCounter.current}`;
  };

  // Create security event
  const createSecurityEvent = useCallback((
    type: SecurityEvent['type'],
    severity: SecurityEvent['severity'],
    message: string,
    details?: any
  ) => {
    const event: SecurityEvent = {
      id: generateEventId(),
      type,
      severity,
      message,
      timestamp: new Date(),
      userAgent: navigator.userAgent,
      details
    };

    setSecurityEvents(prev => [event, ...prev.slice(0, 99)]); // Keep last 100 events
    setStats(prev => ({ ...prev, totalEvents: prev.totalEvents + 1 }));
    
    onSecurityEvent?.(event);
    
    return event;
  }, [onSecurityEvent]);

  // Rate limiting
  const checkRateLimit = useCallback((userId: string): boolean => {
    if (!finalConfig.enableRateLimit) return true;

    const now = Date.now();
    const windowStart = now - finalConfig.rateLimitConfig.windowMs;
    
    const userRequests = rateLimitMap.get(userId) || [];
    const recentRequests = userRequests.filter(timestamp => timestamp > windowStart);
    
    if (recentRequests.length >= finalConfig.rateLimitConfig.maxRequests) {
      createSecurityEvent(
        'rate_limit',
        'medium',
        `Rate limit exceeded for user ${userId}`,
        { requestCount: recentRequests.length, limit: finalConfig.rateLimitConfig.maxRequests }
      );
      return false;
    }

    // Update rate limit map
    recentRequests.push(now);
    setRateLimitMap(prev => new Map(prev.set(userId, recentRequests)));
    
    return true;
  }, [finalConfig, rateLimitMap, createSecurityEvent]);

  // Bot detection based on behavioral patterns
  const detectBot = useCallback((userId: string): number => {
    if (!finalConfig.enableBotDetection) return 0;

    let botScore = 0;
    const userActivity = userActivities.get(userId);
    
    if (!userActivity) return 0;

    // Check for inhuman speed
    const recentActions = userActivity.actions.filter(
      action => Date.now() - action.timestamp.getTime() < 60000
    );
    
    if (recentActions.length > finalConfig.maxActionsPerMinute) {
      botScore += 0.3;
    }

    // Check for perfect timing patterns
    const timings = recentActions.map((action, index) => {
      if (index === 0) return 0;
      return action.timestamp.getTime() - recentActions[index - 1].timestamp.getTime();
    }).filter(timing => timing > 0);

    const avgTiming = timings.reduce((sum, timing) => sum + timing, 0) / timings.length;
    const timingVariance = timings.reduce((sum, timing) => sum + Math.pow(timing - avgTiming, 2), 0) / timings.length;
    
    if (timingVariance < 100 && timings.length > 5) { // Very consistent timing
      botScore += 0.4;
    }

    // Check mouse movement patterns
    if (mouseMovements.current.length < 10 && recentActions.length > 10) {
      botScore += 0.3; // No mouse movement but many actions
    }

    // Check for suspicious point accumulation
    const pointsPerMinute = userActivity.actions
      .filter(action => Date.now() - action.timestamp.getTime() < 60000)
      .reduce((sum, action) => sum + action.points, 0);
    
    if (pointsPerMinute > finalConfig.maxPointsPerAction * 10) {
      botScore += 0.2;
    }

    return Math.min(botScore, 1);
  }, [finalConfig, userActivities, mouseMovements]);

  // Validate user action
  const validateAction = useCallback((
    userId: string,
    actionType: string,
    points: number,
    metadata?: any
  ): boolean => {
    if (!finalConfig.enableValidation) return true;

    // Check if user is blacklisted
    if (blacklist.has(userId)) {
      createSecurityEvent(
        'blacklist',
        'high',
        `Blocked action from blacklisted user ${userId}`,
        { actionType, points }
      );
      return false;
    }

    // Check rate limit
    if (!checkRateLimit(userId)) {
      return false;
    }

    // Check for suspicious activity
    const botScore = detectBot(userId);
    
    if (botScore > finalConfig.suspiciousThreshold) {
      createSecurityEvent(
        'bot_detection',
        'high',
        `Bot-like behavior detected for user ${userId}`,
        { botScore, actionType, points }
      );
      
      // Add to blacklist if score is very high
      if (botScore > 0.8) {
        setBlacklist(prev => new Set(prev.add(userId)));
        setStats(prev => ({ ...prev, blockedUsers: prev.blockedUsers + 1 }));
        onUserBlocked?.(userId, 'Bot-like behavior detected');
      }
      
      return false;
    }

    // Validate points amount
    if (points > finalConfig.maxPointsPerAction) {
      createSecurityEvent(
        'validation_failed',
        'medium',
        `Invalid points amount for user ${userId}`,
        { actionType, points, maxAllowed: finalConfig.maxPointsPerAction }
      );
      return false;
    }

    // Update user activity
    const userActivity = userActivities.get(userId) || {
      userId,
      actions: [],
      totalPoints: 0,
      lastActivity: new Date(),
      riskScore: 0,
      isBlacklisted: false
    };

    userActivity.actions.push({
      type: actionType,
      timestamp: new Date(),
      points,
      metadata
    });
    userActivity.totalPoints += points;
    userActivity.lastActivity = new Date();
    userActivity.riskScore = botScore;

    // Keep only recent actions (last hour)
    userActivity.actions = userActivity.actions.filter(
      action => Date.now() - action.timestamp.getTime() < 3600000
    );

    setUserActivities(prev => new Map(prev.set(userId, userActivity)));
    setStats(prev => ({ ...prev, validatedPoints: prev.validatedPoints + points }));
    
    onPointsValidated?.(userId, points, true);
    
    return true;
  }, [
    finalConfig,
    blacklist,
    checkRateLimit,
    detectBot,
    createSecurityEvent,
    userActivities,
    onUserBlocked,
    onPointsValidated
  ]);

  // Track mouse movements for bot detection
  useEffect(() => {
    if (!finalConfig.enableBotDetection) return;

    const handleMouseMove = (e: MouseEvent) => {
      mouseMovements.current.push({
        x: e.clientX,
        y: e.clientY,
        timestamp: Date.now()
      });

      // Keep only recent movements (last 30 seconds)
      mouseMovements.current = mouseMovements.current.filter(
        movement => Date.now() - movement.timestamp < 30000
      );
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      keystrokes.current.push({
        key: e.key,
        timestamp: Date.now()
      });

      // Keep only recent keystrokes (last 30 seconds)
      keystrokes.current = keystrokes.current.filter(
        keystroke => Date.now() - keystroke.timestamp < 30000
      );
    };

    const handleClick = (e: MouseEvent) => {
      clickPatterns.current.push({
        x: e.clientX,
        y: e.clientY,
        timestamp: Date.now()
      });

      // Keep only recent clicks (last 30 seconds)
      clickPatterns.current = clickPatterns.current.filter(
        click => Date.now() - click.timestamp < 30000
      );
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('click', handleClick);

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('click', handleClick);
    };
  }, [finalConfig.enableBotDetection]);

  // Clean up old data periodically
  useEffect(() => {
    const cleanup = setInterval(() => {
      const now = Date.now();
      const oneHourAgo = now - 3600000;

      // Clean up rate limit map
      setRateLimitMap(prev => {
        const cleaned = new Map();
        prev.forEach((timestamps, userId) => {
          const recentTimestamps = timestamps.filter(ts => ts > oneHourAgo);
          if (recentTimestamps.length > 0) {
            cleaned.set(userId, recentTimestamps);
          }
        });
        return cleaned;
      });

      // Clean up user activities
      setUserActivities(prev => {
        const cleaned = new Map();
        prev.forEach((activity, userId) => {
          if (activity.lastActivity.getTime() > oneHourAgo) {
            cleaned.set(userId, activity);
          }
        });
        return cleaned;
      });
    }, 300000); // Clean up every 5 minutes

    return () => clearInterval(cleanup);
  }, []);

  // Get severity color
  const getSeverityColor = (severity: SecurityEvent['severity']) => {
    switch (severity) {
      case 'low': return 'text-blue-400';
      case 'medium': return 'text-yellow-400';
      case 'high': return 'text-orange-400';
      case 'critical': return 'text-red-400';
      default: return 'text-gray-400';
    }
  };

  // Get severity icon
  const getSeverityIcon = (severity: SecurityEvent['severity']) => {
    switch (severity) {
      case 'low': return 'ℹ️';
      case 'medium': return '⚠️';
      case 'high': return '🚨';
      case 'critical': return '🔥';
      default: return '📋';
    }
  };

  // Format timestamp
  const formatTimestamp = (date: Date) => {
    return date.toLocaleTimeString();
  };

  // Expose validation function
  React.useImperativeHandle(React.createRef(), () => ({
    validateAction,
    addToBlacklist: (userId: string) => {
      setBlacklist(prev => new Set(prev.add(userId)));
      setStats(prev => ({ ...prev, blockedUsers: prev.blockedUsers + 1 }));
    },
    removeFromBlacklist: (userId: string) => {
      setBlacklist(prev => {
        const newSet = new Set(prev);
        newSet.delete(userId);
        return newSet;
      });
    },
    getUserRiskScore: (userId: string) => {
      return userActivities.get(userId)?.riskScore || 0;
    },
    getStats: () => stats
  }));

  if (!isActive) {
    return (
      <div className={`p-4 ${className}`}>
        <motion.div
          className="bg-gray-800/30 border border-gray-600/30 rounded-xl p-4 text-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <div className="text-gray-400">🛡️ Anti-Cheat System Disabled</div>
          <motion.button
            className="mt-2 bg-green-500/20 border border-green-400/30 text-green-400 px-4 py-2 rounded-lg hover:bg-green-500/30 transition-all"
            onClick={() => setIsActive(true)}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            Enable Protection
          </motion.button>
        </div>
      </div>
    );
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Security Dashboard */}
      <motion.div
        className="bg-black/40 backdrop-blur-lg border border-red-400/30 rounded-3xl p-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-white mb-2">🛡️ Security Dashboard</h2>
            <div className="text-gray-400 text-sm">Real-time protection active</div>
          </div>
          
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
            <span className="text-green-400 text-sm">Protected</span>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
          <div className="bg-blue-500/10 border border-blue-400/20 rounded-xl p-3 text-center">
            <div className="text-blue-400 text-2xl font-bold">{stats.totalEvents}</div>
            <div className="text-gray-400 text-xs">Total Events</div>
          </div>
          
          <div className="bg-red-500/10 border border-red-400/20 rounded-xl p-3 text-center">
            <div className="text-red-400 text-2xl font-bold">{stats.blockedUsers}</div>
            <div className="text-gray-400 text-xs">Blocked Users</div>
          </div>
          
          <div className="bg-yellow-500/10 border border-yellow-400/20 rounded-xl p-3 text-center">
            <div className="text-yellow-400 text-2xl font-bold">{stats.suspiciousActivities}</div>
            <div className="text-gray-400 text-xs">Suspicious</div>
          </div>
          
          <div className="bg-green-500/10 border border-green-400/20 rounded-xl p-3 text-center">
            <div className="text-green-400 text-2xl font-bold">{stats.validatedPoints}</div>
            <div className="text-gray-400 text-xs">Valid Points</div>
          </div>
          
          <div className="bg-purple-500/10 border border-purple-400/20 rounded-xl p-3 text-center">
            <div className="text-purple-400 text-2xl font-bold">{userActivities.size}</div>
            <div className="text-gray-400 text-xs">Active Users</div>
          </div>
        </div>

        {/* Protection Features */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-gray-800/30 border border-gray-600/30 rounded-xl p-4">
            <div className="flex items-center space-x-2 mb-2">
              <div className={`w-2 h-2 rounded-full ${finalConfig.enableRateLimit ? 'bg-green-400' : 'bg-red-400'}`}></div>
              <div className="text-white font-bold">Rate Limiting</div>
            </div>
            <div className="text-gray-400 text-sm">
              Max {finalConfig.rateLimitConfig.maxRequests} requests per minute
            </div>
          </div>

          <div className="bg-gray-800/30 border border-gray-600/30 rounded-xl p-4">
            <div className="flex items-center space-x-2 mb-2">
              <div className={`w-2 h-2 rounded-full ${finalConfig.enableBotDetection ? 'bg-green-400' : 'bg-red-400'}`}></div>
              <div className="text-white font-bold">Bot Detection</div>
            </div>
            <div className="text-gray-400 text-sm">
              AI-powered behavior analysis
            </div>
          </div>

          <div className="bg-gray-800/30 border border-gray-600/30 rounded-xl p-4">
            <div className="flex items-center space-x-2 mb-2">
              <div className={`w-2 h-2 rounded-full ${finalConfig.enableBlacklist ? 'bg-green-400' : 'bg-red-400'}`}></div>
              <div className="text-white font-bold">Blacklist</div>
            </div>
            <div className="text-gray-400 text-sm">
              {blacklist.size} blocked users
            </div>
          </div>
        </div>
      </motion.div>

      {/* Recent Security Events */}
      {securityEvents.length > 0 && (
        <motion.div
          className="bg-black/40 backdrop-blur-lg border border-orange-400/30 rounded-3xl p-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-bold text-white">🚨 Recent Security Events</h3>
            <motion.button
              className="bg-orange-500/20 border border-orange-400/30 text-orange-400 px-3 py-1 rounded-lg hover:bg-orange-500/30 transition-all"
              onClick={() => setSecurityEvents([])}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Clear
            </motion.button>
          </div>

          <div className="space-y-2 max-h-64 overflow-y-auto">
            <AnimatePresence>
              {securityEvents.slice(0, 10).map((event, index) => (
                <motion.div
                  key={event.id}
                  className="bg-gray-800/30 border border-gray-600/30 rounded-xl p-3"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="text-lg">{getSeverityIcon(event.severity)}</div>
                      <div>
                        <div className={`font-bold ${getSeverityColor(event.severity)}`}>
                          {event.type.replace('_', ' ').toUpperCase()}
                        </div>
                        <div className="text-gray-400 text-sm">{event.message}</div>
                      </div>
                    </div>
                    <div className="text-gray-400 text-xs">
                      {formatTimestamp(event.timestamp)}
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </motion.div>
      )}

      {/* System Controls */}
      <motion.div
        className="bg-black/40 backdrop-blur-lg border border-gray-400/30 rounded-3xl p-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        <h3 className="text-xl font-bold text-white mb-4">⚙️ System Controls</h3>
        
        <div className="flex items-center justify-between">
          <div className="text-gray-400">
            Anti-cheat protection is currently active and monitoring all user activities.
          </div>
          
          <motion.button
            className="bg-red-500/20 border border-red-400/30 text-red-400 px-4 py-2 rounded-lg hover:bg-red-500/30 transition-all"
            onClick={() => setIsActive(false)}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            Disable Protection
          </motion.button>
        </div>
      </motion.div>
    </div>
  );
};

export default AntiCheatSystem;

