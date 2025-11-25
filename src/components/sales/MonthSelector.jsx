import React from 'react';

const MonthSelector = ({ currentMonth = '', onMonthChange, theme }) => {
  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const currentDate = new Date();
  const currentYear = currentDate.getFullYear();

  // Split safely
  const [month = months[currentDate.getMonth()], year = currentYear] = currentMonth.split(' ');
  const currentMonthIndex = months.indexOf(month);
  const displayYear = year || currentYear;

  const navigateMonth = (direction) => {
    let newMonthIndex = currentMonthIndex + direction;
    let newYear = Number(displayYear);

    if (newMonthIndex < 0) {
      newMonthIndex = 11;
      newYear--;
    } else if (newMonthIndex > 11) {
      newMonthIndex = 0;
      newYear++;
    }

    onMonthChange(`${months[newMonthIndex]} ${newYear}`);
  };

  const getCurrentMonthData = () => {
    return `${months[currentDate.getMonth()]} ${currentDate.getFullYear()}`;
  };

  const isCurrentMonth = currentMonth === getCurrentMonthData();

  return (
    <div style={{ marginBottom: 16 }}>
      {/* Top Navigation */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: 14,
          gap: 10,
          flexWrap: "wrap",
        }}
      >
        {/* Previous Button */}
        <button
          onClick={() => navigateMonth(-1)}
          style={{
            width: 36,
            height: 36,
            borderRadius: "50%",
            backgroundColor: theme?.colors?.surface || "#fff",
            border: "1px solid rgba(0,0,0,0.08)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: "pointer",
            boxShadow: "0 2px 5px rgba(0,0,0,0.06)",
            flexShrink: 0,
            marginBottom: 8,
          }}
          aria-label="Previous Month"
        >
          <span style={{ color: theme?.colors?.primary || "#000", fontSize: 16 }}>
            {"<"}
          </span>
        </button>

        {/* Month Display */}
        <div style={{ textAlign: "center", flex: 1, minWidth: "140px" }}>
          <span
            style={{
              fontSize: 16,
              fontWeight: 700,
              color: theme?.colors?.text || "#000",
              letterSpacing: 0.3,
            }}
          >
            {month} {displayYear}
          </span>

          {isCurrentMonth && (
            <div
              style={{
                fontSize: 11,
                color: theme?.colors?.primary || "#000",
                marginTop: 4,
                fontWeight: 600,
              }}
            >
              Current
            </div>
          )}
        </div>

        {/* Next Button */}
        <button
          onClick={() => navigateMonth(1)}
          style={{
            width: 36,
            height: 36,
            borderRadius: "50%",
            backgroundColor: theme?.colors?.surface || "#fff",
            border: "1px solid rgba(0,0,0,0.08)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: "pointer",
            boxShadow: "0 2px 5px rgba(0,0,0,0.06)",
            flexShrink: 0,
            marginBottom: 8,
          }}
          aria-label="Next Month"
        >
          <span style={{ color: theme?.colors?.primary || "#000", fontSize: 16 }}>
            {">"}
          </span>
        </button>
      </div>

      {/* Button: Go To Current Month */}
      <button
        onClick={() => onMonthChange(getCurrentMonthData())}
        style={{
          padding: "8px 16px",
          borderRadius: 24,
          backgroundColor: theme?.colors?.primary || "#000",
          color: theme?.colors?.surface || "#fff",
          border: "none",
          cursor: "pointer",
          display: "block",
          margin: "0 auto",
          fontSize: 13,
          fontWeight: 600,
          boxShadow: "0 2px 5px rgba(0,0,0,0.1)",
        }}
      >
        Current Month
      </button>
    </div>
  );
};

export default MonthSelector;
