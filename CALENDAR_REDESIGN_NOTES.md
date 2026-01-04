// This file documents the calendar redesign requirements
// To be implemented in app/calendar/page.tsx

## Key Features to Implement

### 1. Layout Changes
- Week view: Dates as ROWS (vertical), Time slots as COLUMNS (horizontal scroll)
- Month view: Grid with slot counts shown as colored dots
- Add appointments sidebar in month view

### 2. Slot Management
- Click empty slot → Create available slot
- Click available slot → Block or delete
- Click blocked slot → Unblock or delete
- Bulk create slots with date range and day selection

### 3. Visual Updates
- Green = Available
- Purple/Blue = Booked (with domain color)
- Red = Blocked
- Legend at bottom

### 4. Stats Cards
- Total available slots
- Total booked events
- Total blocked slots
- Month total

### 5. Bulk Operations
- Create slots for date range
- Select specific days of week
- Set time range and duration
- Quick presets (next week, next month, weekdays only)
