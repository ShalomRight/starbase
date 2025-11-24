## ✅ Verification Checklist

- [ ] Firebase project created
- [ ] Firestore enabled
- [ ] Client config added to `.env.local`
- [ ] Admin SDK credentials added to `.env.local`
- [ ] Security rules deployed
- [ ] App starts without errors
- [ ] Can upload photos
- [ ] Photos appear in PhotoFeed
- [ ] Likes work
- [ ] Real-time updates work
## 🔧 Troubleshooting

### Error: "Firebase credentials not configured"
- Check `.env.local` has all Firebase variables
- Restart dev server after changing `.env.local`

### Error: "Permission denied"
- Deploy Firestore security rules
- Check admin user is created (if needed)

### Photos not appearing
- Check Firestore console for documents
- Check browser console for errors
- Verify ImageKit upload is successful

### Real-time updates not working
- Check Firebase Client is initialized
- Check browser console for connection errors
- Test with two browser windows