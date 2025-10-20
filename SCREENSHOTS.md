# Athena DAO - Application Screenshots & UI Overview

## Home Page (Login/Registration)

**URL**: `/`

### When Not Logged In:
- **Header**: Purple gradient with "Athena DAO" title and navigation
- **Hero Section**: 
  - Large welcome message: "Welcome to Athena DAO"
  - Subtitle describing the DAO purpose
- **Authentication Section**:
  - Step 1: Connect Wallet
    - Radio buttons for MetaMask or Coinbase Wallet selection
    - "Connect Wallet" button (purple gradient)
  - Step 2: Connect Discord (appears after wallet connection)
    - "Connect Discord Account" button (Discord blue)
  - Error/success messages displayed in colored boxes

### When Logged In:
- Shows welcome back message
- Displays connected wallet address (truncated: 0x1234...5678)
- Displays Discord username
- "Go to Dashboard" button
- "Logout" button

**Key UI Elements**:
- Clean white card with shadow for auth section
- Purple gradient buttons (#667eea to #764ba2)
- Discord blue button (#5865f2)
- Responsive form layout

---

## Dashboard Page

**URL**: `/dashboard`

**Layout**:
1. **Header**: Same purple gradient header with navigation (Home, Dashboard, Tokens links)

2. **Account Card**:
   - White card with shadow
   - Title: "Your Account"
   - Displays:
     - Wallet Address (monospace font, truncated)
     - Discord Username

3. **Token Balances Section**:
   - Title: "Token Balances"
   - Two cards side by side (responsive grid):
   
   a. **SpaceTime Card**:
      - Top border: Purple (#667eea)
      - Large balance number with gradient color
      - Description: "Non-tradable governance tokens earned through participation"
   
   b. **SpaceMoney Card**:
      - Top border: Purple (#764ba2)
      - Large balance number with gradient color
      - Description: "Purchasable and transferable governance tokens"

4. **Action Buttons**:
   - "Purchase SpaceMoney" (gradient button)
   - "Transfer SpaceMoney" (outlined button)

**Colors**:
- Background: Light gray (#f5f5f5)
- Cards: White with shadow
- Text: Dark gray (#333, #555, #666)
- Accent: Purple gradient

---

## Purchase SpaceMoney Page

**URL**: `/tokens/purchase`

**Layout**:
1. **Title**: "Purchase SpaceMoney"

2. **Card Content**:
   - Description paragraph explaining SpaceMoney tokens
   - Form with:
     - "Amount to Purchase" input field
     - Number input with placeholder "0.0"
     - "Purchase" button (purple gradient)
     - "Cancel" button (outlined)
   
3. **Status Messages**:
   - Error messages: Red background (#fee), red text
   - Success messages: Green background (#efe), green text
   - Shows transaction hash on success

**Features**:
- Input validation (must be positive number)
- Loading state during transaction
- Auto-redirect to dashboard after successful purchase

---

## Transfer SpaceMoney Page

**URL**: `/tokens/transfer`

**Layout**:
1. **Title**: "Transfer SpaceMoney"

2. **Card Content**:
   - Description paragraph explaining token transfer
   - Form with:
     - "Recipient Address" input field (text, placeholder "0x...")
     - "Amount to Transfer" input field (number, placeholder "0.0")
     - "Transfer" button (purple gradient)
     - "Cancel" button (outlined)

3. **Status Messages**:
   - Same styling as Purchase page
   - Shows transaction hash on success

**Features**:
- Validates recipient address (must start with 0x)
- Validates amount (must be positive)
- Loading state during transaction
- Auto-redirect to dashboard after successful transfer

---

## Design System

### Colors
- **Primary Gradient**: `linear-gradient(135deg, #667eea 0%, #764ba2 100%)`
- **Discord Blue**: `#5865f2`
- **Background**: White (#ffffff) and Light Gray (#f5f5f5)
- **Text**: 
  - Primary: #333
  - Secondary: #555
  - Tertiary: #666
- **Borders**: #e0e0e0
- **Error**: #fee background, #c33 text
- **Success**: #efe background, #3c3 text
- **Warning**: #fff3cd background, #856404 text

### Typography
- **Font Family**: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif
- **Headings**: Bold, various sizes (2.5rem, 2rem, 1.2rem)
- **Body**: 1rem, normal weight
- **Monospace**: For wallet addresses

### Components

#### Buttons
- **Primary**: Purple gradient, white text, rounded corners, shadow on hover
- **Secondary**: White background, purple text, purple border
- **Discord**: Discord blue (#5865f2), white text

All buttons have:
- Padding: 0.75rem to 1rem
- Border radius: 8px
- Font weight: 600
- Hover effects: transform translateY(-2px), shadow
- Disabled state: 60% opacity

#### Cards
- Background: White
- Padding: 2rem
- Border radius: 12px
- Box shadow: 0 4px 6px rgba(0, 0, 0, 0.1)

#### Form Inputs
- Border: 2px solid #e0e0e0
- Border radius: 8px
- Padding: 0.75rem
- Focus: Border color changes to #667eea
- Disabled: Gray background

### Layout
- **Max Width**: 1200px (layout), 800px (home), 600px (forms), 1000px (dashboard)
- **Spacing**: Consistent use of 1rem, 1.5rem, 2rem
- **Responsive**: Flexbox and Grid for responsive layouts
- **Mobile-friendly**: Stacks vertically on small screens

### Header
- Fixed at top
- Purple gradient background
- White text
- Contains logo/title and navigation
- Box shadow for depth

### Footer
- Fixed at bottom
- Light gray background (#f5f5f5)
- Centered text
- Contains tagline

---

## User Experience Flow

### First-Time User:
1. **Landing** → Sees hero section and auth options
2. **Step 1** → Selects wallet type and connects (MetaMask/Coinbase)
3. **Network Switch** → Wallet prompts to switch to Polygon
4. **Step 2** → Prompted to connect Discord
5. **OAuth** → Redirected to Discord for authorization
6. **Callback** → Returned to site, fully authenticated
7. **Dashboard** → Can now access all features

### Returning User:
1. **Landing** → Sees welcome back message
2. **One-click** → Goes directly to dashboard (if both connections remembered)
3. **Or** → Connects missing authentication method if only one remembered

### Token Operations:
1. **Dashboard** → Views current balances
2. **Purchase** → Clicks purchase button → Form → Wallet confirmation → Success
3. **Transfer** → Clicks transfer button → Form → Wallet confirmation → Success
4. **Return** → Auto-redirected back to dashboard to see updated info

---

## Accessibility Features
- Semantic HTML elements
- Clear label associations with inputs
- Focus states on interactive elements
- Color contrast meets WCAG guidelines
- Keyboard navigable
- Loading states provide feedback
- Error messages are descriptive

---

## Mobile Responsiveness
- Cards stack vertically on small screens
- Navigation adapts to mobile
- Touch-friendly button sizes (44px minimum)
- Viewport meta tag for proper scaling
- Flexible grid layouts

---

## Animation & Transitions
- **Button hover**: translateY(-2px) + shadow
- **Input focus**: border color transition
- **All transitions**: 0.2s duration
- **Smooth scrolling**: For page navigation

---

## Browser Compatibility
- Modern browsers (Chrome, Firefox, Safari, Edge)
- Requires Web3 wallet extension (MetaMask or Coinbase Wallet)
- JavaScript enabled
- CSS Grid and Flexbox support

---

This application provides a clean, modern interface for DAO members to manage their blockchain identity and governance tokens.
