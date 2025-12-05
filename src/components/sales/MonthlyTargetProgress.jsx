// components/sales/MonthlyTargetProgress.jsx
import React, { useContext } from 'react';
import { Hash, DollarSign, TrendingUp, Target, CheckCircle2, BarChart3 } from 'lucide-react';
import { ThemeContext } from '@/context/ThemeContext';

const MonthlyTargetProgress = ({ 
  theme,
  currentMonth = '',
  // New props for data
  achievedDigits = 0,
  achievedAmount = 0,
  digitTarget = 0,
  amountTarget = 0,
  targetType = 'none',
  currency = 'PKR'
}) => {
  const { theme: themeContext } = useContext(ThemeContext);
  
  // Get theme from props or context
  const activeTheme = theme || themeContext;
  
  // Calculate progress based on target type
  const calculateProgress = () => {
    if (targetType === 'none') {
      return {
        percentage: 0,
        isAchieved: false,
        label: 'No target set',
        color: '#9CA3AF',
        type: 'none',
        message: 'No target set for this month'
      };
    }
    
    if (targetType === 'digit') {
      const progress = digitTarget > 0 ? achievedDigits / digitTarget : 0;
      const percentage = Math.min(progress * 100, 100);
      const isAchieved = achievedDigits >= digitTarget;
      
      return {
        percentage,
        isAchieved,
        completed: achievedDigits,
        target: digitTarget,
        remaining: Math.max(0, digitTarget - achievedDigits),
        label: 'units',
        color: isAchieved ? '#10B981' : percentage >= 70 ? '#F59E0B' : '#EF4444',
        type: 'digit',
        message: isAchieved ? '🎉 Digit target achieved!' : `${digitTarget - achievedDigits} units remaining`
      };
    }
    
    if (targetType === 'amount') {
      const progress = amountTarget > 0 ? achievedAmount / amountTarget : 0;
      const percentage = Math.min(progress * 100, 100);
      const isAchieved = achievedAmount >= amountTarget;
      
      return {
        percentage,
        isAchieved,
        completed: achievedAmount,
        target: amountTarget,
        remaining: Math.max(0, amountTarget - achievedAmount),
        label: currency,
        color: isAchieved ? '#10B981' : percentage >= 70 ? '#F59E0B' : '#EF4444',
        type: 'amount',
        message: isAchieved ? '🎉 Revenue target achieved!' : `${currency} ${(amountTarget - achievedAmount).toLocaleString()} remaining`
      };
    }
    
    if (targetType === 'both') {
      const digitProgress = digitTarget > 0 ? achievedDigits / digitTarget : 0;
      const amountProgress = amountTarget > 0 ? achievedAmount / amountTarget : 0;
      const combinedProgress = (digitProgress + amountProgress) / 2;
      const percentage = Math.min(combinedProgress * 100, 100);
      
      const digitAchieved = achievedDigits >= digitTarget;
      const amountAchieved = achievedAmount >= amountTarget;
      const isAchieved = digitAchieved && amountAchieved;
      
      return {
        percentage,
        isAchieved,
        digitCompleted: achievedDigits,
        digitTarget,
        digitRemaining: Math.max(0, digitTarget - achievedDigits),
        amountCompleted: achievedAmount,
        amountTarget,
        amountRemaining: Math.max(0, amountTarget - achievedAmount),
        currency,
        color: isAchieved ? '#10B981' : percentage >= 70 ? '#F59E0B' : '#EF4444',
        type: 'both',
        message: isAchieved ? '🎉 Both targets achieved!' : 
          `Digit: ${Math.max(0, digitTarget - achievedDigits)} units, Amount: ${currency} ${Math.max(0, amountTarget - achievedAmount).toLocaleString()} remaining`
      };
    }
    
    return {
      percentage: 0,
      isAchieved: false,
      label: 'Invalid target type',
      color: '#9CA3AF',
      type: 'none',
      message: 'Invalid target configuration'
    };
  };

  const progress = calculateProgress();
  
  // Get icon based on target type
  const getIcon = () => {
    switch (targetType) {
      case 'digit': return <Hash size={20} />;
      case 'amount': return <DollarSign size={20} />;
      case 'both': return <TrendingUp size={20} />;
      default: return <Target size={20} />;
    }
  };

  // Get label for target type
  const getTargetLabel = () => {
    switch (targetType) {
      case 'digit': return `Digit Target: ${digitTarget} units`;
      case 'amount': return `Amount Target: ${currency} ${amountTarget.toLocaleString()}`;
      case 'both': return `Both Targets: ${digitTarget} units & ${currency} ${amountTarget.toLocaleString()}`;
      default: return 'No Target Set';
    }
  };

  return (
    <div
      style={{
        padding: 16,
        borderRadius: 12,
        backgroundColor: activeTheme?.colors?.surface || '#fff',
        boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
        border: `1px solid ${activeTheme?.colors?.border || '#e5e7eb'}`,
        width: '100%',
        boxSizing: 'border-box',
      }}
    >
      {/* Header */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: 16,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div
            style={{
              padding: 8,
              borderRadius: 10,
              backgroundColor: targetType === 'none' ? '#F3F4F6' : 
                            targetType === 'digit' ? '#DBEAFE' :
                            targetType === 'amount' ? '#D1FAE5' : 
                            '#EDE9FE'
            }}
          >
            {getIcon()}
          </div>
          <div>
            <h3
              style={{
                fontSize: 16,
                fontWeight: 700,
                color: activeTheme?.colors?.text || '#000',
                margin: 0,
              }}
            >
              Monthly Target — {currentMonth || 'Current Month'}
            </h3>
            <p
              style={{
                fontSize: 12,
                color: activeTheme?.colors?.textSecondary || '#666',
                margin: '2px 0 0 0',
              }}
            >
              {getTargetLabel()}
            </p>
          </div>
        </div>
        
        <div
          style={{
            fontSize: 18,
            fontWeight: 700,
            color: progress.color,
            textAlign: 'right',
          }}
        >
          {progress.percentage.toFixed(1)}%
          <div
            style={{
              fontSize: 11,
              fontWeight: 500,
              color: activeTheme?.colors?.textSecondary || '#666',
              marginTop: 2,
            }}
          >
            Completion
          </div>
        </div>
      </div>

      {/* Progress Bar */}
      <div
        style={{
          width: '100%',
          height: 12,
          borderRadius: 6,
          backgroundColor: '#f3f4f6',
          marginBottom: 16,
          overflow: 'hidden',
          position: 'relative',
        }}
      >
        <div
          style={{
            width: `${progress.percentage}%`,
            height: '100%',
            backgroundColor: progress.color,
            transition: 'width 0.5s ease',
            position: 'relative',
          }}
        >
          {progress.percentage > 0 && progress.percentage < 100 && (
            <div
              style={{
                position: 'absolute',
                right: 0,
                top: 0,
                height: '100%',
                width: 2,
                backgroundColor: 'rgba(255,255,255,0.5)',
              }}
            />
          )}
        </div>
      </div>

      {/* Target Details */}
      {targetType === 'digit' && (
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            fontSize: 12,
            color: activeTheme?.colors?.textSecondary || '#666',
            backgroundColor: '#f8fafc',
            padding: 8,
            borderRadius: 6,
            marginBottom: 8,
          }}
        >
          <div>
            <div style={{ fontSize: 11, fontWeight: 500, marginBottom: 2 }}>Completed Units</div>
            <div style={{ fontSize: 14, fontWeight: 600, color: activeTheme?.colors?.text || '#000' }}>
              {progress.completed} / {progress.target}
            </div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: 11, fontWeight: 500, marginBottom: 2 }}>Remaining</div>
            <div style={{ fontSize: 14, fontWeight: 600, color: progress.color }}>
              {progress.remaining} units
            </div>
          </div>
        </div>
      )}

      {targetType === 'amount' && (
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            fontSize: 12,
            color: activeTheme?.colors?.textSecondary || '#666',
            backgroundColor: '#f8fafc',
            padding: 8,
            borderRadius: 6,
            marginBottom: 8,
          }}
        >
          <div>
            <div style={{ fontSize: 11, fontWeight: 500, marginBottom: 2 }}>Revenue Achieved</div>
            <div style={{ fontSize: 14, fontWeight: 600, color: activeTheme?.colors?.text || '#000' }}>
              {currency} {progress.completed.toLocaleString()} / {currency} {progress.target.toLocaleString()}
            </div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: 11, fontWeight: 500, marginBottom: 2 }}>Remaining</div>
            <div style={{ fontSize: 14, fontWeight: 600, color: progress.color }}>
              {currency} {progress.remaining.toLocaleString()}
            </div>
          </div>
        </div>
      )}

      {targetType === 'both' && (
        <div
          style={{
            fontSize: 12,
            color: activeTheme?.colors?.textSecondary || '#666',
            backgroundColor: '#f8fafc',
            padding: 8,
            borderRadius: 6,
            marginBottom: 8,
          }}
        >
          <div style={{ marginBottom: 6 }}>
            <div style={{ fontSize: 11, fontWeight: 500, marginBottom: 2 }}>Digit Target</div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: 14, fontWeight: 600, color: activeTheme?.colors?.text || '#000' }}>
                {progress.digitCompleted} / {progress.digitTarget} units
              </span>
              <span style={{ fontSize: 12, fontWeight: 600, color: '#3b82f6' }}>
                {progress.digitRemaining} units remaining
              </span>
            </div>
          </div>
          <div style={{ borderTop: '1px solid #e5e7eb', paddingTop: 6 }}>
            <div style={{ fontSize: 11, fontWeight: 500, marginBottom: 2 }}>Amount Target</div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: 14, fontWeight: 600, color: activeTheme?.colors?.text || '#000' }}>
                {currency} {progress.amountCompleted.toLocaleString()} / {currency} {progress.amountTarget.toLocaleString()}
              </span>
              <span style={{ fontSize: 12, fontWeight: 600, color: '#10b981' }}>
                {currency} {progress.amountRemaining.toLocaleString()} remaining
              </span>
            </div>
          </div>
        </div>
      )}

      {targetType === 'none' && (
        <div
          style={{
            fontSize: 12,
            color: activeTheme?.colors?.textSecondary || '#666',
            backgroundColor: '#f8fafc',
            padding: 12,
            borderRadius: 6,
            textAlign: 'center',
            marginBottom: 8,
          }}
        >
          <Target style={{ margin: '0 auto 6px', display: 'block' }} size={20} color="#9ca3af" />
          <div style={{ fontSize: 11, fontWeight: 500 }}>
            No monthly target has been set for you
          </div>
          <div style={{ fontSize: 10, color: '#9ca3af', marginTop: 2 }}>
            Contact your manager to set targets
          </div>
        </div>
      )}

      {/* Target Status Message */}
      <div
        style={{
          marginTop: 12,
          padding: '8px 0',
          fontSize: 12,
          fontWeight: 500,
          textAlign: 'center',
          color: progress.isAchieved ? '#10B981' : activeTheme?.colors?.textSecondary || '#666',
          backgroundColor: progress.isAchieved ? 'rgba(16,185,129,0.10)' : 'transparent',
          borderRadius: 6,
          border: progress.isAchieved ? '1px solid rgba(16,185,129,0.2)' : 'none',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 6,
        }}
      >
        {progress.isAchieved ? (
          <>
            <CheckCircle2 size={14} />
            🎉 Target Achieved!
          </>
        ) : (
          <>
            <BarChart3 size={14} />
            {progress.message}
          </>
        )}
      </div>
    </div>
  );
};

export default MonthlyTargetProgress;