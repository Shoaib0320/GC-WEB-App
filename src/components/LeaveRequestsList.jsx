// import React, { useState, useEffect, useContext } from 'react';
// import { ThemeContext } from '../context/ThemeContext';

// const LeaveRequestsList = () => {
//   const { theme, isDarkMode } = useContext(ThemeContext);
//   const [leaveRequests, setLeaveRequests] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [refreshing, setRefreshing] = useState(false);

//   const [currentPage, setCurrentPage] = useState(1);
//   const [requestsPerPage, setRequestsPerPage] = useState(5);

//   useEffect(() => {
//     loadLeaveRequests();
//     //eslint-disable-next-line react-hooks/exhaustive-deps
//   }, []);

//   const loadLeaveRequests = async () => {
//     try {
//       setLoading(true);
//       // Import or reference leaveService accordingly in your real app
//       const requests = await window.leaveService?.getMyLeaves?.('agent');
//       setLeaveRequests(Array.isArray(requests) ? requests : []);
//     } catch (error) {
//       console.error('Error loading leave requests:', error);
//     } finally {
//       setLoading(false);
//       setRefreshing(false);
//     }
//   };

//   const onRefresh = () => {
//     setRefreshing(true);
//     loadLeaveRequests();
//   };

//   const getPaginatedRequests = () => {
//     const startIndex = (currentPage - 1) * requestsPerPage;
//     const endIndex = startIndex + requestsPerPage;
//     return leaveRequests.slice(startIndex, endIndex);
//   };

//   const totalPages = Math.ceil(leaveRequests.length / requestsPerPage) || 1;
//   const paginatedRequests = getPaginatedRequests();

//   const goToPage = (page) => {
//     setCurrentPage(page);
//   };

//   const goToNextPage = () => {
//     if (currentPage < totalPages) setCurrentPage(currentPage + 1);
//   };

//   const goToPrevPage = () => {
//     if (currentPage > 1) setCurrentPage(currentPage - 1);
//   };

//   const getPageNumbers = () => {
//     const pages = [];
//     const maxVisiblePages = 5;

//     if (totalPages <= maxVisiblePages) {
//       for (let i = 1; i <= totalPages; i++) pages.push(i);
//     } else {
//       const startPage = Math.max(1, currentPage - 2);
//       const endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);
//       for (let i = startPage; i <= endPage; i++) pages.push(i);
//     }

//     return pages;
//   };

//   const getStatusColor = (status) => {
//     switch (status) {
//       case 'approved': return theme.colors.success;
//       case 'rejected': return theme.colors.error;
//       case 'pending': return '#F59E0B';
//       default: return theme.colors.textSecondary;
//     }
//   };

//   const getStatusIcon = (status) => {
//     switch (status) {
//       case 'approved': return '✅';
//       case 'rejected': return '❌';
//       case 'pending': return '⏳';
//       default: return '📝';
//     }
//   };

//   const formatDate = (dateString) => {
//     if (!dateString) return '-';
//     return new Date(dateString).toLocaleDateString('en-PK', {
//       day: '2-digit',
//       month: 'short',
//       year: 'numeric',
//     });
//   };

//   const getDaysCount = (startDate, endDate) => {
//     const start = new Date(startDate);
//     const end = new Date(endDate);
//     const diffTime = Math.abs(end - start);
//     const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
//     return diffDays;
//   };

//   if (loading && !refreshing) {
//     return (
//       <div style={{
//         padding: 16,
//         borderRadius: 16,
//         margin: 16,
//         backgroundColor: theme.colors.card || theme.colors.surface,
//         border: `1px solid ${theme.colors.border}`,
//         color: theme.colors.text,
//         textAlign: 'center',
//         fontSize: 16,
//       }}>
//         Loading leave requests...
//       </div>
//     );
//   }

//   return (
//     <div style={{
//       margin: 16,
//       borderRadius: 16,
//       border: `1px solid ${theme.colors.border}`,
//       backgroundColor: theme.colors.card || theme.colors.surface,
//       overflow: 'hidden',
//     }}>
//       <header style={{
//         padding: 12,
//         borderBottom: `1px solid ${theme.colors.border}`,
//         textAlign: 'center',
//       }}>
//         <h2 style={{ fontSize: 18, fontWeight: 'bold', color: theme.colors.text }}>
//           📋 My Leave Requests
//         </h2>
//         <p style={{ fontSize: 14, color: theme.colors.textSecondary }}>
//           {leaveRequests.length} request{leaveRequests.length !== 1 ? 's' : ''} found
//         </p>
//       </header>

//       {leaveRequests.length === 0 ? (
//         <div style={{
//           padding: 40,
//           textAlign: 'center',
//           color: theme.colors.textSecondary,
//         }}>
//           <div style={{ fontSize: 48, marginBottom: 16 }}>📭</div>
//           <p style={{ fontSize: 16, fontWeight: 600, marginBottom: 8 }}>
//             No leave requests found
//           </p>
//           <p style={{ fontSize: 14, opacity: 0.7 }}>
//             Submit your first leave request using the button above
//           </p>
//         </div>
//       ) : (
//         <>
//           <div style={{
//             maxHeight: 520,
//             overflowY: 'auto',
//             padding: '16px 12px',
//           }}>
//             <div style={{
//               display: 'flex',
//               gap: 12,
//               overflowX: 'auto',
//               paddingBottom: 16,
//             }}>
//               {paginatedRequests.map((request, index) => {
//                 const globalIndex = (currentPage - 1) * requestsPerPage + index;
//                 return (
//                   <div
//                     key={request._id || globalIndex}
//                     style={{
//                       flexShrink: 0,
//                       width: Math.min(360, window.innerWidth * 0.88),
//                       padding: 12,
//                       borderRadius: 12,
//                       marginRight: 12,
//                       borderLeft: `4px solid ${getStatusColor(request.status)}`,
//                       backgroundColor: theme.colors.background,
//                       boxShadow: isDarkMode ? '0 2px 4px #00000033' : `0 2px 4px ${theme.colors.border}`,
//                       display: 'flex',
//                       flexDirection: 'column',
//                       overflow: 'hidden',
//                     }}
//                   >
//                     <div style={{
//                       display: 'flex',
//                       justifyContent: 'space-between',
//                       marginBottom: 12,
//                     }}>
//                       <div>
//                         <div style={{
//                           fontSize: 16,
//                           fontWeight: 'bold',
//                           color: theme.colors.primary,
//                           marginBottom: 6,
//                         }}>
//                           {request.leaveType?.charAt(0).toUpperCase() + request.leaveType?.slice(1) || 'Leave'}
//                         </div>
//                         <div style={{
//                           backgroundColor: theme.colors.border + '20',
//                           padding: '4px 8px',
//                           borderRadius: 6,
//                           display: 'inline-block',
//                           color: theme.colors.text,
//                           fontWeight: '600',
//                           fontSize: 12,
//                         }}>
//                           {getDaysCount(request.startDate, request.endDate)} day{getDaysCount(request.startDate, request.endDate) !== 1 ? 's' : ''}
//                         </div>
//                       </div>
//                       <div style={{
//                         backgroundColor: getStatusColor(request.status),
//                         borderRadius: 16,
//                         padding: '6px 10px',
//                         marginLeft: 8,
//                         display: 'flex',
//                         alignItems: 'center',
//                       }}>
//                         <span style={{ fontSize: 12, marginRight: 6 }}>{getStatusIcon(request.status)}</span>
//                         <span style={{ fontSize: 12, fontWeight: 'bold', color: '#fff' }}>
//                           {request.status?.charAt(0).toUpperCase() + request.status?.slice(1)}
//                         </span>
//                       </div>
//                     </div>

//                     <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
//                       <div style={{ flex: 1 }}>
//                         <div style={{ fontSize: 12, fontWeight: '500', marginBottom: 2, color: theme.colors.textSecondary }}>
//                           Start:
//                         </div>
//                         <div style={{ fontSize: 14, fontWeight: '600', color: theme.colors.text }}>
//                           {formatDate(request.startDate)}
//                         </div>
//                       </div>
//                       <div style={{ flex: 1 }}>
//                         <div style={{ fontSize: 12, fontWeight: '500', marginBottom: 2, color: theme.colors.textSecondary }}>
//                           End:
//                         </div>
//                         <div style={{ fontSize: 14, fontWeight: '600', color: theme.colors.text }}>
//                           {formatDate(request.endDate)}
//                         </div>
//                       </div>
//                     </div>

//                     {request.reason && (
//                       <div style={{ marginBottom: 12 }}>
//                         <div style={{ fontSize: 12, fontWeight: '500', marginBottom: 4, color: theme.colors.textSecondary }}>
//                           Reason:
//                         </div>
//                         <div style={{ fontSize: 14, lineHeight: '18px', color: theme.colors.text }}>
//                           {request.reason}
//                         </div>
//                       </div>
//                     )}

//                     <footer style={{
//                       borderTop: `1px solid ${theme.colors.border}`,
//                       paddingTop: 8,
//                     }}>
//                       <small style={{ fontSize: 11, fontStyle: 'italic', color: theme.colors.textSecondary }}>
//                         Submitted: {formatDate(request.createdAt)}
//                       </small>
//                     </footer>
//                   </div>
//                 );
//               })}
//             </div>
//           </div>

//           {totalPages > 1 && (
//             <div style={{ padding: 12, borderTop: `1px solid ${theme.colors.border}` }}>
//               <div style={{ textAlign: 'center', marginBottom: 8 }}>
//                 <small style={{ fontSize: 12, fontWeight: '500', color: theme.colors.textSecondary }}>
//                   Showing {((currentPage - 1) * requestsPerPage) + 1} to {Math.min(currentPage * requestsPerPage, leaveRequests.length)} of {leaveRequests.length} requests
//                 </small>
//               </div>

//               <div style={{
//                 display: 'flex',
//                 justifyContent: 'space-between',
//                 alignItems: 'center',
//               }}>
//                 <button
//                   type="button"
//                   onClick={goToPrevPage}
//                   disabled={currentPage === 1}
//                   style={{
//                     padding: '8px 12px',
//                     borderRadius: 8,
//                     border: `1px solid ${theme.colors.border}`,
//                     minWidth: 80,
//                     opacity: currentPage === 1 ? 0.5 : 1,
//                     cursor: currentPage === 1 ? 'not-allowed' : 'pointer',
//                     color: currentPage === 1 ? theme.colors.textSecondary : theme.colors.primary,
//                     fontWeight: '600',
//                     fontSize: 12,
//                   }}
//                 >
//                   ◀️ Prev
//                 </button>

//                 <div style={{ display: 'flex', alignItems: 'center' }}>
//                   {getPageNumbers().map(page => (
//                     <button
//                       key={page}
//                       type="button"
//                       onClick={() => goToPage(page)}
//                       style={{
//                         width: 32,
//                         height: 32,
//                         borderRadius: 6,
//                         margin: '0 2px',
//                         borderWidth: 1,
//                         borderStyle: 'solid',
//                         borderColor: page === currentPage ? 'transparent' : theme.colors.border,
//                         backgroundColor: page === currentPage ? theme.colors.primary : 'transparent',
//                         color: page === currentPage ? '#FFFFFF' : theme.colors.text,
//                         fontSize: 12,
//                         fontWeight: '600',
//                         cursor: 'pointer',
//                       }}
//                     >
//                       {page}
//                     </button>
//                   ))}
//                 </div>

//                 <button
//                   type="button"
//                   onClick={goToNextPage}
//                   disabled={currentPage === totalPages}
//                   style={{
//                     padding: '8px 12px',
//                     borderRadius: 8,
//                     border: `1px solid ${theme.colors.border}`,
//                     minWidth: 80,
//                     opacity: currentPage === totalPages ? 0.5 : 1,
//                     cursor: currentPage === totalPages ? 'not-allowed' : 'pointer',
//                     color: currentPage === totalPages ? theme.colors.textSecondary : theme.colors.primary,
//                     fontWeight: '600',
//                     fontSize: 12,
//                   }}
//                 >
//                   Next ▶️
//                 </button>
//               </div>
//             </div>
//           )}

//           <button
//             type="button"
//             onClick={loadLeaveRequests}
//             style={{
//               padding: 14,
//               borderTop: `1px solid ${theme.colors.border}`,
//               width: '100%',
//               fontWeight: 'bold',
//               fontSize: 16,
//               backgroundColor: theme.colors.primary,
//               color: '#FFFFFF',
//               cursor: 'pointer',
//             }}
//           >
//             🔄 Refresh List
//           </button>
//         </>
//       )}
//     </div>
//   );
// };

// export default LeaveRequestsList;


"use client";
import React, { useState, useEffect, useContext } from 'react';
import { ThemeContext } from '../context/ThemeContext';
import { agentLeaveService } from '../services/agentLeaveService';

const LeaveRequestsList = () => {
  const { theme, isDarkMode } = useContext(ThemeContext);
  const [leaveRequests, setLeaveRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const [currentPage, setCurrentPage] = useState(1);
  const [requestsPerPage, setRequestsPerPage] = useState(5);

  useEffect(() => {
    loadLeaveRequests();
  }, []);

  const loadLeaveRequests = async () => {
    try {
      setLoading(true);
      const requests = await agentLeaveService.getMyLeaves('agent');
      setLeaveRequests(Array.isArray(requests) ? requests : []);
    } catch (error) {
      console.error('Error loading leave requests:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadLeaveRequests();
  };

  const getPaginatedRequests = () => {
    const startIndex = (currentPage - 1) * requestsPerPage;
    const endIndex = startIndex + requestsPerPage;
    return leaveRequests.slice(startIndex, endIndex);
  };

  const totalPages = Math.ceil(leaveRequests.length / requestsPerPage) || 1;
  const paginatedRequests = getPaginatedRequests();

  const goToPage = (page) => {
    setCurrentPage(page);
  };

  const goToNextPage = () => {
    if (currentPage < totalPages) setCurrentPage(currentPage + 1);
  };

  const goToPrevPage = () => {
    if (currentPage > 1) setCurrentPage(currentPage - 1);
  };

  const getPageNumbers = () => {
    const pages = [];
    const maxVisiblePages = 5;

    if (totalPages <= maxVisiblePages) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      const startPage = Math.max(1, currentPage - 2);
      const endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);
      for (let i = startPage; i <= endPage; i++) pages.push(i);
    }

    return pages;
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'approved': return theme.colors.success;
      case 'rejected': return theme.colors.error;
      case 'pending': return '#F59E0B';
      default: return theme.colors.textSecondary;
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'approved': return '✅';
      case 'rejected': return '❌';
      case 'pending': return '⏳';
      default: return '📝';
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('en-PK', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  };

  const getDaysCount = (startDate, endDate) => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const diffTime = Math.abs(end - start);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
    return diffDays;
  };

  if (loading && !refreshing) {
    return (
      <div style={{
        padding: 16,
        borderRadius: 16,
        margin: 16,
        backgroundColor: theme.colors.card || theme.colors.surface,
        border: `1px solid ${theme.colors.border}`,
        color: theme.colors.text,
        textAlign: 'center',
        fontSize: 16,
      }}>
        Loading leave requests...
      </div>
    );
  }

  return (
    <div style={{
      margin: 16,
      borderRadius: 16,
      border: `1px solid ${theme.colors.border}`,
      backgroundColor: theme.colors.card || theme.colors.surface,
      overflow: 'hidden',
    }}>
      <header style={{
        padding: 12,
        borderBottom: `1px solid ${theme.colors.border}`,
        textAlign: 'center',
      }}>
        <h2 style={{ fontSize: 18, fontWeight: 'bold', color: theme.colors.text }}>
          📋 My Leave Requests
        </h2>
        <p style={{ fontSize: 14, color: theme.colors.textSecondary }}>
          {leaveRequests.length} request{leaveRequests.length !== 1 ? 's' : ''} found
        </p>
      </header>

      {leaveRequests.length === 0 ? (
        <div style={{
          padding: 40,
          textAlign: 'center',
          color: theme.colors.textSecondary,
        }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>📭</div>
          <p style={{ fontSize: 16, fontWeight: 600, marginBottom: 8 }}>
            No leave requests found
          </p>
          <p style={{ fontSize: 14, opacity: 0.7 }}>
            Submit your first leave request using the button above
          </p>
        </div>
      ) : (
        <>
          <div style={{
            maxHeight: 520,
            overflowY: 'auto',
            padding: '16px 12px',
          }}>
            <div style={{
              display: 'flex',
              gap: 12,
              overflowX: 'auto',
              paddingBottom: 16,
            }}>
              {paginatedRequests.map((request, index) => {
                const globalIndex = (currentPage - 1) * requestsPerPage + index;
                
                // REDUCE PADDING FOR PENDING AND APPROVED
                const isPendingOrApproved = request.status === 'pending' || request.status === 'approved';
                const cardPadding = isPendingOrApproved ? 8 : 12;
                const statusButtonPadding = isPendingOrApproved ? '4px 8px' : '6px 10px';
                
                return (
                  <div
                    key={request._id || globalIndex}
                    style={{
                      flexShrink: 0,
                      width: Math.min(360, window.innerWidth * 0.88),
                      // REDUCED PADDING FOR PENDING/APPROVED:
                      padding: cardPadding,
                      borderRadius: 12,
                      marginRight: 12,
                      borderLeft: `4px solid ${getStatusColor(request.status)}`,
                      backgroundColor: theme.colors.background,
                      boxShadow: isDarkMode ? '0 2px 4px #00000033' : `0 2px 4px ${theme.colors.border}`,
                      display: 'flex',
                      flexDirection: 'column',
                      overflow: 'hidden',
                    }}
                  >
                    <div style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      marginBottom: 12,
                    }}>
                      <div>
                        <div style={{
                          fontSize: 16,
                          fontWeight: 'bold',
                          color: theme.colors.primary,
                          marginBottom: 6,
                        }}>
                          {request.leaveType?.charAt(0).toUpperCase() + request.leaveType?.slice(1) || 'Leave'}
                        </div>
                        <div style={{
                          backgroundColor: theme.colors.border + '20',
                          padding: '4px 8px',
                          borderRadius: 6,
                          display: 'inline-block',
                          color: theme.colors.text,
                          fontWeight: '600',
                          fontSize: 12,
                        }}>
                          {getDaysCount(request.startDate, request.endDate)} day{getDaysCount(request.startDate, request.endDate) !== 1 ? 's' : ''}
                        </div>
                      </div>
                      <div style={{
                        backgroundColor: getStatusColor(request.status),
                        borderRadius: 16,
                        // REDUCED PADDING FOR STATUS BUTTON:
                        padding: statusButtonPadding,
                        marginLeft: 8,
                        display: 'flex',
                        alignItems: 'center',
                      }}>
                        <span style={{ fontSize: 12, marginRight: 6 }}>{getStatusIcon(request.status)}</span>
                        <span style={{ fontSize: 12, fontWeight: 'bold', color: '#fff' }}>
                          {request.status?.charAt(0).toUpperCase() + request.status?.slice(1)}
                        </span>
                      </div>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: 12, fontWeight: '500', marginBottom: 2, color: theme.colors.textSecondary }}>
                          Start:
                        </div>
                        <div style={{ fontSize: 14, fontWeight: '600', color: theme.colors.text }}>
                          {formatDate(request.startDate)}
                        </div>
                      </div>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: 12, fontWeight: '500', marginBottom: 2, color: theme.colors.textSecondary }}>
                          End:
                        </div>
                        <div style={{ fontSize: 14, fontWeight: '600', color: theme.colors.text }}>
                          {formatDate(request.endDate)}
                        </div>
                      </div>
                    </div>

                    {request.reason && (
                      <div style={{ marginBottom: 12 }}>
                        <div style={{ fontSize: 12, fontWeight: '500', marginBottom: 4, color: theme.colors.textSecondary }}>
                          Reason:
                        </div>
                        <div style={{ fontSize: 14, lineHeight: '18px', color: theme.colors.text }}>
                          {request.reason}
                        </div>
                      </div>
                    )}

                    <footer style={{
                      borderTop: `1px solid ${theme.colors.border}`,
                      paddingTop: 8,
                    }}>
                      <small style={{ fontSize: 11, fontStyle: 'italic', color: theme.colors.textSecondary }}>
                        Submitted: {formatDate(request.createdAt)}
                      </small>
                    </footer>
                  </div>
                );
              })}
            </div>
          </div>

          {totalPages > 1 && (
            <div style={{ padding: 12, borderTop: `1px solid ${theme.colors.border}` }}>
              <div style={{ textAlign: 'center', marginBottom: 8 }}>
                <small style={{ fontSize: 12, fontWeight: '500', color: theme.colors.textSecondary }}>
                  Showing {((currentPage - 1) * requestsPerPage) + 1} to {Math.min(currentPage * requestsPerPage, leaveRequests.length)} of {leaveRequests.length} requests
                </small>
              </div>

              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}>
                <button
                  type="button"
                  onClick={goToPrevPage}
                  disabled={currentPage === 1}
                  style={{
                    padding: '8px 12px',
                    borderRadius: 8,
                    border: `1px solid ${theme.colors.border}`,
                    minWidth: 80,
                    opacity: currentPage === 1 ? 0.5 : 1,
                    cursor: currentPage === 1 ? 'not-allowed' : 'pointer',
                    color: currentPage === 1 ? theme.colors.textSecondary : theme.colors.primary,
                    fontWeight: '600',
                    fontSize: 12,
                    backgroundColor: 'transparent',
                  }}
                >
                  ◀️ Prev
                </button>

                <div style={{ display: 'flex', alignItems: 'center' }}>
                  {getPageNumbers().map(page => (
                    <button
                      key={page}
                      type="button"
                      onClick={() => goToPage(page)}
                      style={{
                        width: 32,
                        height: 32,
                        borderRadius: 6,
                        margin: '0 2px',
                        borderWidth: 1,
                        borderStyle: 'solid',
                        borderColor: page === currentPage ? 'transparent' : theme.colors.border,
                        backgroundColor: page === currentPage ? theme.colors.primary : 'transparent',
                        color: page === currentPage ? '#FFFFFF' : theme.colors.text,
                        fontSize: 12,
                        fontWeight: '600',
                        cursor: 'pointer',
                      }}
                    >
                      {page}
                    </button>
                  ))}
                </div>

                <button
                  type="button"
                  onClick={goToNextPage}
                  disabled={currentPage === totalPages}
                  style={{
                    padding: '8px 12px',
                    borderRadius: 8,
                    border: `1px solid ${theme.colors.border}`,
                    minWidth: 80,
                    opacity: currentPage === totalPages ? 0.5 : 1,
                    cursor: currentPage === totalPages ? 'not-allowed' : 'pointer',
                    color: currentPage === totalPages ? theme.colors.textSecondary : theme.colors.primary,
                    fontWeight: '600',
                    fontSize: 12,
                    backgroundColor: 'transparent',
                  }}
                >
                  Next ▶️
                </button>
              </div>
            </div>
          )}

          <button
            type="button"
            onClick={loadLeaveRequests}
            style={{
              padding: 14,
              borderTop: `1px solid ${theme.colors.border}`,
              width: '100%',
              fontWeight: 'bold',
              fontSize: 16,
              backgroundColor: theme.colors.primary,
              color: '#FFFFFF',
              cursor: 'pointer',
              border: 'none',
            }}
          >
            🔄 Refresh List
          </button>
        </>
      )}
    </div>
  );
};

export default LeaveRequestsList;