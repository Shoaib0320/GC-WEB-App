# Teams Feature - Setup & Installation Guide

## Quick Start

### Step 1: Environment Configuration

Add these variables to your `.env.local` file:

```env
# Cloudinary Configuration (if not already present)
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# MongoDB Connection (should already be configured)
MONGODB_URI=your_mongodb_connection_string
```

### Step 2: Files Created

The following files have been created for the Teams feature:

**Models:**
- `src/Models/Team.js` - Team data model

**API Routes:**
- `src/app/api/teams/route.js` - Create & list teams
- `src/app/api/teams/[id]/route.js` - Get, update, delete single team
- `src/app/api/teams/[id]/status/route.js` - Toggle team status
- `src/app/api/teams/upload/route.js` - Upload team images

**Frontend Components:**
- `src/components/TeamFormDialog.jsx` - Form dialog for add/edit
- `src/components/TeamCard.jsx` - Team member card display
- `src/app/(dashboard)/dashboard/teams/page.jsx` - Main teams page

**Enhanced Services:**
- `src/lib/cloudinary.js` - Enhanced with new upload functions

**Documentation:**
- `TEAMS_DOCUMENTATION.md` - Complete API & feature documentation

### Step 3: Testing the Feature

1. **Start your development server:**
   ```bash
   npm run dev
   ```

2. **Navigate to Teams Page:**
   - Go to: `http://localhost:3000/dashboard/teams`

3. **Test Features:**
   - Add a new team member
   - Upload profile image
   - Edit team member details
   - Toggle active/inactive status
   - Delete team members
   - Search and filter

### Step 4: Database Indexes

The Team model automatically creates indexes for:
- `isActive` - For filtering active/inactive members
- `email` - For unique email constraint
- `isActive + createdAt` - For efficient listing

These are created automatically by MongoDB on first use.

## Common Tasks

### Add to Navigation Menu

Update your navigation/sidebar component to include the Teams link:

```jsx
<Link href="/dashboard/teams" className="...">
  <Users size={20} />
  Team Members
</Link>
```

Don't forget to import the Users icon from lucide-react:
```jsx
import { Users } from 'lucide-react';
```

### Customize Colors

The default background color for team cards is blue (`#3B82F6`). You can change it per team member or globally:

**Global default:** Edit `src/Models/Team.js` line ~49
```javascript
backgroundColour: {
  type: String,
  default: '#3B82F6', // Change this
  ...
}
```

### Modify Image Upload Settings

Edit `src/lib/cloudinary.js` to change:

**Upload folder:**
```javascript
uploadImage(file, 'your-folder-name') // default: 'team-members'
```

**Image quality:**
```javascript
quality: 'auto', // Change to: 80, 60, etc.
```

**Max file size:** Edit `src/app/api/teams/upload/route.js` line ~40
```javascript
const maxSize = 5 * 1024 * 1024; // Change to your preferred size
```

## Troubleshooting

### Images not uploading?
1. Check Cloudinary credentials in `.env.local`
2. Ensure file is under 5MB
3. Check browser console for detailed errors
4. Verify Cloudinary API settings

### Database errors?
1. Ensure MongoDB is running
2. Check connection string in `.env.local`
3. Verify network access is allowed

### Form not submitting?
1. Check that all required fields are filled
2. Verify email is unique (not already in database)
3. Check browser console for specific error messages

## API Testing (Postman/curl)

### Create Team Member

```bash
curl -X POST http://localhost:3000/api/teams \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "email": "john@example.com",
    "position": "Senior Developer",
    "github": "https://github.com/johndoe",
    "linkedin": "https://linkedin.com/in/johndoe",
    "profileImage": "https://cloudinary-url.jpg",
    "createdBy": "USER_ID_HERE"
  }'
```

### Get All Teams

```bash
curl http://localhost:3000/api/teams?isActive=true
```

### Update Team Member

```bash
curl -X PUT http://localhost:3000/api/teams/TEAM_ID \
  -H "Content-Type: application/json" \
  -d '{
    "position": "Lead Developer",
    "updatedBy": "USER_ID_HERE"
  }'
```

### Toggle Status

```bash
curl -X PATCH http://localhost:3000/api/teams/TEAM_ID/status \
  -H "Content-Type: application/json" \
  -d '{
    "isActive": false,
    "updatedBy": "USER_ID_HERE"
  }'
```

### Delete Team Member

```bash
curl -X DELETE http://localhost:3000/api/teams/TEAM_ID
```

## UI Components Used

This feature uses these shadcn/ui components:

- `Button` - Action buttons
- `Input` - Form inputs
- `Label` - Form labels
- `Dialog` - Add/Edit form modal
- `Card` - Team card container
- `Badge` - Status indicator
- `Tabs` - Filter tabs
- `AlertDialog` - Delete confirmation
- `Skeleton` - Loading states

All components should already be installed in your project.

## Performance Tips

1. **Images**: Cloudinary automatically optimizes images, but you can further optimize URLs:
   ```javascript
   cloudinaryService.getOptimizedUrl(url, 300, 300, 'auto')
   ```

2. **Search**: Filtering is done on client-side for better UX
   - For large datasets (1000+ teams), consider server-side search

3. **Pagination**: Currently set to 10 items per page
   - Adjust in `src/app/api/teams/route.js`

## Security Considerations

✅ **Email Uniqueness**: Enforced at database level
✅ **File Validation**: Size and type validation
✅ **User Tracking**: All changes tracked via createdBy/updatedBy
✅ **Image Cleanup**: Automatic deletion from Cloudinary on team delete
✅ **Input Validation**: Both frontend and backend validation

## Next Steps

1. ✅ Add Teams link to your navigation menu
2. ✅ Test the feature thoroughly
3. ✅ Customize colors/styling as needed
4. ✅ Set up team member onboarding workflow
5. ✅ Consider adding team groups/departments

## Support

For issues or questions:
1. Check the error message in browser console
2. Review `TEAMS_DOCUMENTATION.md` for detailed API info
3. Check error logs in your server console

---

🎉 You're all set! The Teams management system is ready to use.
