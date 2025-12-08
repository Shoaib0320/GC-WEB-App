# Teams Feature - Quick Reference Guide

## 🚀 Quick Start Checklist

- [ ] Ensure Cloudinary credentials in `.env.local`
- [ ] Run `npm install` if needed
- [ ] Start dev server: `npm run dev`
- [ ] Navigate to: `/dashboard/teams`
- [ ] Add first team member

## 📁 File Locations

| File | Purpose |
|------|---------|
| `src/Models/Team.js` | MongoDB Team schema |
| `src/app/api/teams/route.js` | List & Create endpoints |
| `src/app/api/teams/[id]/route.js` | Get, Update, Delete |
| `src/app/api/teams/[id]/status/route.js` | Toggle status |
| `src/app/api/teams/upload/route.js` | Image upload |
| `src/components/TeamFormDialog.jsx` | Add/Edit form |
| `src/components/TeamCard.jsx` | Team display card |
| `src/app/(dashboard)/dashboard/teams/page.jsx` | Main page |
| `src/lib/teamService.js` | Helper functions |
| `src/lib/cloudinary.js` | Image service (enhanced) |

## 🔌 Using Team Service

```javascript
import {
  fetchTeams,
  createTeam,
  updateTeam,
  deleteTeam,
  toggleTeamStatus,
  uploadTeamImage,
  validateTeamData,
  searchTeams,
  downloadTeamsAsCSV,
} from '@/lib/teamService';

// Fetch teams
const { data: teams } = await fetchTeams({ isActive: true });

// Create team
const newTeam = await createTeam({
  name: 'John Doe',
  email: 'john@example.com',
  position: 'Developer',
  profileImage: 'url',
}, userId);

// Update team
const updated = await updateTeam(teamId, {
  position: 'Senior Developer'
}, userId);

// Toggle status
await toggleTeamStatus(teamId, false, userId);

// Delete team
await deleteTeam(teamId);

// Upload image
const { url, publicId } = await uploadTeamImage(file);

// Validate data
const { valid, errors } = validateTeamData(teamData);

// Search locally
const results = searchTeams(teams, 'john');

// Export to CSV
downloadTeamsAsCSV(teams);
```

## 🎨 Component Props

### TeamFormDialog

```jsx
<TeamFormDialog
  open={boolean}                    // Dialog open state
  onOpenChange={(open) => {}}      // State setter
  onSubmit={async (data) => {}}    // Form submission handler
  isLoading={boolean}               // Loading state
  initialData={teamObject}          // For edit mode (optional)
/>
```

### TeamCard

```jsx
<TeamCard
  team={teamObject}                 // Team data
  onEdit={(team) => {}}             // Edit handler
  onDelete={(id) => {}}             // Delete handler
  onToggleStatus={(id, status) => {}} // Status toggle
  isDeleting={boolean}              // Delete loading state
/>
```

## 📊 API Response Examples

### Get Teams
```json
{
  "success": true,
  "data": [
    {
      "_id": "123...",
      "name": "John Doe",
      "email": "john@example.com",
      "position": "Senior Developer",
      "profileImage": "https://...",
      "backgroundColour": "#3B82F6",
      "isActive": true,
      "createdAt": "2024-01-01T00:00:00Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 1,
    "pages": 1
  }
}
```

### Create Team
```json
{
  "success": true,
  "message": "Team member created successfully",
  "data": { /* team object */ }
}
```

## 🎯 Common Use Cases

### Display All Teams
```jsx
const [teams, setTeams] = useState([]);
const [loading, setLoading] = useState(true);

useEffect(() => {
  (async () => {
    try {
      const { data } = await fetchTeams();
      setTeams(data);
    } finally {
      setLoading(false);
    }
  })();
}, []);

return teams.map(team => (
  <TeamCard key={team._id} team={team} />
));
```

### With Search
```jsx
const [query, setQuery] = useState('');
const filtered = searchTeams(teams, query);

return (
  <>
    <Input 
      placeholder="Search..."
      onChange={(e) => setQuery(e.target.value)}
    />
    {filtered.map(team => <TeamCard key={team._id} team={team} />)}
  </>
);
```

### With Filtering
```jsx
import { filterTeamsByStatus } from '@/lib/teamService';

const active = filterTeamsByStatus(teams, true);
const inactive = filterTeamsByStatus(teams, false);
```

### With Sorting
```jsx
import { sortTeams } from '@/lib/teamService';

const sorted = sortTeams(teams, 'position', 'asc');
```

## ✅ Validation Examples

```javascript
const { valid, errors } = validateTeamData({
  name: 'John',
  email: 'john@example.com',
  position: 'Developer',
  profileImage: 'url',
  backgroundColour: '#3B82F6',
});

if (!valid) {
  console.log(errors); // ['Email format invalid', ...]
}
```

## 🖼️ Image Upload Example

```javascript
// Single image
const fileInput = ref.current;
const file = fileInput.files[0];

try {
  const { url, publicId } = await uploadTeamImage(file);
  console.log('Image uploaded:', url);
  console.log('Public ID for deletion:', publicId);
} catch (error) {
  console.error('Upload failed:', error);
}
```

## 🌈 Customization Examples

### Change Default Color
Edit `src/Models/Team.js`:
```javascript
backgroundColour: {
  type: String,
  default: '#FF6B6B', // Change color
}
```

### Change Upload Folder
Edit `src/app/api/teams/upload/route.js`:
```javascript
const folder = formData.get('folder') || 'my-teams'; // Change folder
```

### Change Max Image Size
Edit `src/app/api/teams/upload/route.js`:
```javascript
const maxSize = 10 * 1024 * 1024; // 10MB instead of 5MB
```

## 🔒 Security Notes

✅ Email uniqueness enforced
✅ File type validation
✅ File size limits
✅ User tracking (createdBy, updatedBy)
✅ Image cleanup on deletion
✅ Input validation on both sides

## 📱 Responsive Breakpoints

- **Mobile**: Full-width single column
- **Tablet**: 2 columns
- **Desktop**: 3 columns

## 🌙 Dark Mode

Fully supported with shadcn/ui's dark mode system:
- Dark background colors
- Proper contrast
- Smooth transitions

## 📈 Performance Tips

1. Use pagination for large teams
2. Client-side search for <1000 teams
3. Cloudinary optimizes images automatically
4. Database indexes on common queries

## 🐛 Debugging

**Check browser console for:**
- Form validation errors
- API response errors
- Image upload issues

**Check server console for:**
- API endpoint errors
- Database connection issues
- Cloudinary errors

## 📚 Full Documentation

See `TEAMS_DOCUMENTATION.md` for:
- Complete API reference
- Database schema details
- Advanced features
- Troubleshooting guide

---

**Need help?** Check the documentation or review the component code for examples.
