import React from 'react';
import './CaseTimeline.css';

const CaseTimeline = ({ currentStatus }) => {
  const stages = ['Filed', 'Under Investigation', 'Scheduled', 'Resolved'];
  
  // Clean up the status text to match our stages
  const statusStr = currentStatus ? currentStatus.trim().toLowerCase() : 'filed';
  const isDismissed = statusStr === 'dismissed';
  
  let currentIndex = stages.findIndex(s => s.toLowerCase() === statusStr);
  if (currentIndex === -1) currentIndex = 0; // Default to Filed if unknown

  return (
    <div className="case-timeline-container">
      <div className="case-timeline">
        {stages.map((stage, index) => {
          const isActive = index <= currentIndex && !isDismissed;
          const isCurrent = index === currentIndex && !isDismissed;

          return (
            <div key={stage} className="timeline-item">
              <div className={`timeline-step ${isActive ? 'active' : ''} ${isDismissed ? 'dismissed' : ''}`}>
                <div className="step-circle">
                  {isActive ? '✓' : isDismissed && isCurrent ? '✕' : (index + 1)}
                </div>
                {index < stages.length - 1 && (
                  <div className={`step-line ${index < currentIndex && !isDismissed ? 'active-line' : ''}`}></div>
                )}
              </div>
              <div className="step-label">
                <span style={{ 
                  fontWeight: isCurrent ? '700' : '500',
                  color: isCurrent ? '#1f2937' : '#9ca3af'
                }}>
                  {stage}
                </span>
              </div>
            </div>
          );
        })}
      </div>
      {isDismissed && (
        <div className="dismissed-warning">
          This case has been dismissed and closed.
        </div>
      )}
    </div>
  );
};

export default CaseTimeline;