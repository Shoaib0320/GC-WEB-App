// Utility functions for Pakistani time
export const formatToPakistaniTime = (dateString) => {
  if (!dateString) return "—";
  
  try {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-PK', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
      timeZone: 'Asia/Karachi'
    });
  } catch (error) {
    console.error("Error formatting time:", error);
    return "—";
  }
};

export const formatToPakistaniDate = (dateString) => {
  if (!dateString) return "—";
  
  try {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-PK', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      timeZone: 'Asia/Karachi'
    });
  } catch (error) {
    console.error("Error formatting date:", error);
    return "—";
  }
};

const formatToPakistaniDateTime = (dateString) => {
  if (!dateString) return "—";
  
  try {
    const date = new Date(dateString);
    return date.toLocaleString('en-PK', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
      timeZone: 'Asia/Karachi'
    });
  } catch (error) {
    console.error("Error formatting datetime:", error);
    return "—";
  }
};