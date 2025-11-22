# Encounter Your Doom - Frontend Guide

## Overview

This is a modern, responsive D&D (Dungeons & Dragons) encounter management frontend application built with Angular 20. The application provides an intuitive interface for managing creatures, encounters, and running epic battles.

## Features

### 🎯 Core Functionality

1. **User Management**
   - Automatic user ID generation and storage in browser localStorage
   - Persistent user session across browser refreshes

2. **Creatures Library**
   - Browse all available creatures
   - Filter by region, rarity, and challenge rating (CR)
   - Get random creature suggestions
   - View detailed creature statistics (HP, AC, Speed, Abilities)

3. **Public Encounters**
   - Browse public encounter library
   - Filter by region, rarity, difficulty level, and party level
   - Get random encounter suggestions
   - Copy encounters to private collection

4. **Private Encounters (My Encounters)**
   - View your personal encounter collection
   - Start and play encounters
   - Detailed encounter view with all creature information

5. **Play Encounter**
   - Full encounter details with creature stats
   - D&D ability scores display (STR, DEX, CON, INT, WIS, CHA)
   - Battle-ready interface for running encounters

### 🎨 Design Features

- **Modern D&D-themed Design**: Dark fantasy color scheme with vibrant accents
- **Fully Responsive**: Works on desktop, tablet, and mobile devices
- **Intuitive Navigation**: Clear navigation bar with emoji icons
- **Visual Feedback**: Loading states, error messages, and success notifications
- **Glassmorphism Effects**: Modern UI with backdrop blur and transparency
- **Smooth Animations**: Hover effects and transitions throughout

## API Integration

The frontend integrates with all endpoints from the OpenAPI specification:

### Creature Endpoints
- `GET /creature` - Get all creatures with optional filters
- `GET /creature/{id}` - Get creature by ID
- `GET /creature/random` - Get random creature
- `POST /creature` - Create new creature
- `PUT /creature/{id}` - Update creature

### Encounter Endpoints
- `GET /encounter` - Get all public encounters with filters
- `GET /encounter/{id}` - Get encounter by ID
- `GET /encounter/random` - Get random encounter
- `POST /encounter` - Create encounter
- `PUT /encounter/{id}` - Update encounter
- `PUT /encounter/{id}/user/{userid}/move` - Copy encounter to user space

### Private Encounter Endpoints
- `GET /privateEncounter/{userid}` - Get all user encounters
- `GET /privateEncounter/{id}/user/{userid}` - Get specific user encounter
- `POST /privateEncounter/{userid}` - Create private encounter

## Project Structure

```
src/app/
├── components/
│   └── navbar/              # Navigation component
├── models/
│   ├── creature.model.ts    # Creature interface
│   ├── encounter.model.ts   # Encounter interface
│   └── enums.ts            # Region, Rarity, DifficultyLevel enums
├── pages/
│   ├── home/               # Landing page
│   ├── creatures/          # Creatures library
│   ├── encounters/         # Public encounters
│   ├── my-encounters/      # Private encounters
│   └── play-encounter/     # Encounter play view
├── services/
│   ├── creature.service.ts  # Creature API calls
│   ├── encounter.service.ts # Encounter API calls
│   └── user.service.ts     # User management
└── app.routes.ts           # Routing configuration
```

## Configuration

### Backend API URL

The backend API URL is configured in the service files:
- Default: `http://localhost:8080/datev/v1`

To change the API URL, update the `apiUrl` constant in:
- `src/app/services/creature.service.ts`
- `src/app/services/encounter.service.ts`

## Development

### Prerequisites
- Node.js (v18 or higher)
- npm (v9 or higher)

### Installation
```bash
npm install
```

### Development Server
```bash
npm start
```
Navigate to `http://localhost:4200/`

### Build
```bash
npm run build
```
Build artifacts will be stored in the `dist/` directory.

### Testing
```bash
npm test
```

## User Flow

1. **First Visit**
   - User lands on home page
   - User ID is automatically generated and stored in localStorage

2. **Browse Creatures**
   - Navigate to Creatures page
   - Apply filters (region, rarity, CR)
   - View creature details
   - Use "Random" button for suggestions

3. **Explore Encounters**
   - Navigate to Encounters page
   - Apply filters (region, rarity, difficulty, party level)
   - Click "Copy to My Encounters" to save interesting encounters

4. **Manage Private Collection**
   - Navigate to My Encounters
   - View saved encounters
   - Click "Start Encounter" to begin

5. **Play Encounter**
   - View full encounter details
   - See all creature statistics
   - Use information to run the battle

## Responsive Breakpoints

- **Desktop**: > 768px
- **Tablet**: 768px
- **Mobile**: < 768px

The UI adapts seamlessly:
- Navigation collapses on mobile
- Grid layouts adjust to single column
- Filter controls stack vertically
- Font sizes scale appropriately

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## Accessibility

- Semantic HTML structure
- ARIA labels on navigation
- Keyboard navigation support
- Color contrast compliance
- Responsive text sizing

## Future Enhancements

Potential features for future development:
- Creature and encounter creation forms
- Advanced search functionality
- Encounter sharing between users
- Combat tracker integration
- Dice rolling utilities
- Character sheet integration
- Dark/light theme toggle
