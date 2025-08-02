# Welcome to your Lovable project

## Project info

**URL**: https://lovable.dev/projects/f6aaf55d-9294-4117-b80f-1822d6d5b17c

## How can I edit this code?

There are several ways of editing your application.

**Use Lovable**

Simply visit the [Lovable Project](https://lovable.dev/projects/f6aaf55d-9294-4117-b80f-1822d6d5b17c) and start prompting.

Changes made via Lovable will be committed automatically to this repo.

**Use your preferred IDE**

If you want to work locally using your own IDE, you can clone this repo and push changes. Pushed changes will also be reflected in Lovable.

The only requirement is having Node.js & npm installed - [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating)

Follow these steps:

```sh
# Step 1: Clone the repository using the project's Git URL.
git clone <YOUR_GIT_URL>

# Step 2: Navigate to the project directory.
cd <YOUR_PROJECT_NAME>

# Step 3: Install the necessary dependencies.
npm i

# Step 4: Start the development server with auto-reloading and an instant preview.
npm run dev
```

**Edit a file directly in GitHub**

- Navigate to the desired file(s).
- Click the "Edit" button (pencil icon) at the top right of the file view.
- Make your changes and commit the changes.

**Use GitHub Codespaces**

- Navigate to the main page of your repository.
- Click on the "Code" button (green button) near the top right.
- Select the "Codespaces" tab.
- Click on "New codespace" to launch a new Codespace environment.
- Edit files directly within the Codespace and commit and push your changes once you're done.

## What technologies are used for this project?

This project is built with:

- Vite
- TypeScript
- React
- shadcn-ui
- Tailwind CSS
- Capacitor (for iOS app)

## How can I deploy this project?

Simply open [Lovable](https://lovable.dev/projects/f6aaf55d-9294-4117-b80f-1822d6d5b17c) and click on Share -> Publish.

## How to build iOS app?

To build and run the iOS app:

1. **Build the web app:**
   ```sh
   npm run build
   ```

2. **Add iOS platform and sync:**
   ```sh
   npm run ios:build
   ```

3. **Open in Xcode:**
   ```sh
   npm run ios:open
   ```

4. **Or run directly:**
   ```sh
   npm run ios:run
   ```

### Requirements for iOS development:
- macOS with Xcode installed
- iOS Simulator or physical iOS device
- Apple Developer account (for device testing/App Store)

### App Features:
- **Native iOS integration** with Capacitor
- **Haptic feedback** for better user experience
- **Forced landscape orientation** for optimal field view
- **Native status bar** styling
- **Splash screen** with app branding
- **Hardware back button** support

## Can I connect a custom domain to my Lovable project?

Yes, you can!

To connect a domain, navigate to Project > Settings > Domains and click Connect Domain.

Read more here: [Setting up a custom domain](https://docs.lovable.dev/tips-tricks/custom-domain#step-by-step-guide)
