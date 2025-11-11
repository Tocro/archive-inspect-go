# UrbanRide Capacitor Setup Guide

## Prerequisites

- Node.js and npm installed
- For iOS: macOS with Xcode installed
- For Android: Android Studio installed
- Your Node.js backend running (see your existing backend code)

## Initial Setup

1. **Configure Environment Variables**
   ```bash
   # Create .env file from example
   cp .env.example .env
   
   # Update with your values:
   # - VITE_API_URL: Your Node.js backend URL
   # - VITE_GOOGLE_MAPS_KEY: Your Google Maps API key
   ```

2. **Install Dependencies**
   ```bash
   npm install
   ```

3. **Initialize Capacitor** (First time only)
   ```bash
   npx cap init
   ```
   - App ID: `app.lovable.7c725e17fd7c44d8b0da685df81c00b8` (already configured)
   - App Name: `UrbanRide` (already configured)

4. **Build the Web App**
   ```bash
   npm run build
   ```

## Platform Setup

### For iOS Development

1. **Add iOS Platform**
   ```bash
   npx cap add ios
   ```

2. **Update Native Dependencies**
   ```bash
   npx cap update ios
   ```

3. **Sync Project**
   ```bash
   npx cap sync ios
   ```

4. **Open in Xcode**
   ```bash
   npx cap open ios
   ```
   Or run directly:
   ```bash
   npx cap run ios
   ```

### For Android Development

1. **Add Android Platform**
   ```bash
   npx cap add android
   ```

2. **Update Native Dependencies**
   ```bash
   npx cap update android
   ```

3. **Sync Project**
   ```bash
   npx cap sync android
   ```

4. **Open in Android Studio**
   ```bash
   npx cap open android
   ```
   Or run directly:
   ```bash
   npx cap run android
   ```

## Development Workflow

### Live Reload (Recommended for Development)

The app is configured for hot-reload from the Lovable sandbox:
- URL: `https://7c725e17-fd7c-44d8-b0da-685df81c00b8.lovableproject.com`
- Make changes in Lovable, they'll appear instantly on your device
- No need to rebuild constantly

### Production Build

When ready for production:

1. Update `capacitor.config.ts` to remove the server URL
2. Build the app:
   ```bash
   npm run build
   npx cap sync
   ```
3. Open in Xcode/Android Studio and build for release

## Permissions

The app requires these permissions (already configured in Capacitor):

- **Location** (Geolocation): For pickup/dropoff locations
- **Push Notifications**: For trip updates and driver notifications

## Backend Connection

Update your Node.js backend URL in `.env`:
```
VITE_API_URL=https://your-backend-url.com/api
```

Your existing backend should have these endpoints:
- POST `/auth/login`
- POST `/auth/register`
- POST `/trips/create`
- Socket.IO server for real-time updates

## Testing on Physical Device

1. Connect your device via USB
2. Enable Developer Mode on the device
3. Run `npx cap run ios` or `npx cap run android`
4. The app will install and launch automatically

## Troubleshooting

**Build Errors:**
- Run `npm run build` first
- Ensure all dependencies are installed
- Check that ports aren't in use

**Location Not Working:**
- Ensure location permissions are granted
- Check that HTTPS is used (required for geolocation)

**Backend Connection Issues:**
- Verify API_URL is correct
- Check that backend is running
- Ensure CORS is configured properly

**Socket Connection Fails:**
- Verify WebSocket is supported on your backend
- Check firewall/network settings
- Ensure authentication token is valid

## Next Steps

1. Export project to GitHub (use Lovable's "Export to Github" button)
2. Git pull to your local machine
3. Follow setup steps above
4. Deploy your Node.js backend to a cloud provider
5. Update environment variables
6. Build and test on real devices

## Resources

- [Capacitor Documentation](https://capacitorjs.com/docs)
- [iOS Development Guide](https://capacitorjs.com/docs/ios)
- [Android Development Guide](https://capacitorjs.com/docs/android)
- [Lovable Documentation](https://docs.lovable.dev/)
