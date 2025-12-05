# Global Loader Migration Tasks

## Files to Update
- [x] src/components/ShiftSchedule.jsx - Replace local loading state with global loader
- [x] src/components/AttendancePanel.jsx - Replace local loading state with global loader
- [x] src/components/LeaveRequestForm.jsx - Replace local loading state with global loader
- [ ] src/components/ResetPasswordDialog.jsx - Replace local loading state with global loader
- [ ] src/components/NotificationBell.jsx - Replace local loading state with global loader
- [ ] src/components/SearchBar.jsx - Replace local loading state with global loader
- [ ] src/components/LeaveRequestsList.jsx - Replace local loading state with global loader
- [ ] src/components/AttendanceFilter.jsx - Replace local loading state with global loader
- [ ] src/components/common/GlobalData.jsx - Replace local loading state with global loader
- [ ] src/app/(dashboard)/dashboard/agents/page.jsx - Replace local loading state with global loader
- [ ] src/app/(agent)/agent/settings/page.jsx - Replace local loading state with global loader
- [ ] src/app/(dashboard)/dashboard/users/page.jsx - Replace local loading state with global loader
- [ ] src/components/BookingDetailsDialog.jsx - Fix missing loading state declaration
- [ ] src/components/AttendanceSystem.jsx - Fix missing loading state declaration

## Migration Pattern
For each file:
1. Import useLoaderContext
2. Remove local `const [loading, setLoading] = useState(...)`
3. Replace `setLoading(true)` with `showLoader("unique-id", "message")`
4. Replace `setLoading(false)` with `hideLoader("unique-id")`
5. Replace `loading` references with `isLoading` from context (if needed for UI)
6. Use unique IDs for different operations in the same component
