# Pre-Launch Quality Assurance (QA) Checklist

Before deploying TravelSense to production, perform these manual tests to ensure every function, button, and data point is working as intended.

---

## 1. Core Authentication & Profile
- [ ] **Login/Logout**: Can you sign in using Clerk? Does your profile picture appear in the top-right corner?
- [ ] **User Sync**: Check your backend database/logs to ensure your `clerkId` and coordinates are being synced during the first load.

## 2. Location & Detection (Critical)
- [ ] **GPS Auto-Detection**: Does the app find your real city (e.g., in Bihar) after a few seconds?
- [ ] **Search Bar**: Type "Paris" or "Tokyo" in the new manual search bar. Does the entire dashboard (Weather, Safety, Itinerary) update to the new city?
- [ ] **Nellore Fallback**: If you block location permissions in your browser, does the app correctly show the fallback state without crashing?

## 3. Data Integration (Backend APIs)
- [ ] **Weather Widget**: Are the temperature, wind, and humidity values realistic? Does the condition icon match the text?
- [ ] **Safety Status**: Is the "Emergency Number" correct for the city? Are the health and safety tips loading?
- [ ] **City Quests**: Does clicking "Generate Quests" create 3 unique riddles for your current city?

## 4. Feature Logic & Interactivity
- [ ] **AI Assistant Chat**: 
    - [ ] Send a message: "I'm hungry." Does it respond with food suggestions?
    - [ ] Send a message: "Skip my next stop." Does the itinerary card update visually?
- [ ] **Capture Discovery**: Click "Capture Discovery" on a Quest. Does it open your camera/file picker? (Test with a dummy photo to see the AI verification response).
- [ ] **Story Generation**: Complete 1 quest and click "Generate Story." Does a poetic travelogue appear in the "Memories" section?

## 5. UI/UX & Responsiveness
- [ ] **Laptop Check**: Does the dashboard use the 12-column grid correctly? Is the sidebar chat "sticky" when you scroll?
- [ ] **Mobile Check**: Are the cards full-width? Is the mobile search overlay easy to use?
- [ ] **Calling Button**: On mobile, click the emergency number. Does your phone's dialer open?

## 6. Error Handling & API Quotas
- [ ] **Quota Test**: Intentionally generate a trip multiple times. Do you see the "Rate Limit Reached" alert? Does the app handle it gracefully instead of showing a white screen?
- [ ] **Empty States**: If no stories exist, does the "Awaiting your first discovery" message appear?

---

## How to Debug Failures
If any of the above tests fail:
1. **Check Browser Console (F12)**: Look for red error messages.
2. **Check Backend Logs**: Look for "429 Too Many Requests" (API Limit) or "500 Internal Server Error" (Database issue).
3. **Check .env File**: Ensure your `GEMINI_API_KEY` and `NEXT_PUBLIC_BACKEND_URL` are correct.
