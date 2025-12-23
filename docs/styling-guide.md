# Styling Guide

## Design System

OmniDesk uses a modern glassmorphism design with consistent spacing, colors, and components.

## CSS Architecture

### Global Styles (`index.css`)

Contains:
- CSS Custom Properties (variables)
- Global resets
- Utility classes
- Typography
- Common button styles

### Component Styles

Each component has a co-located CSS file:
- `Sidebar.css` - Navigation styling
- `Dashboard.css` - Dashboard-specific styles
- `CreateTaskModal.css` - Modal styling
- etc.

## CSS Custom Properties

### Colors

```css
/* Background Colors */
--bg-primary: #0a0a0f;
--bg-secondary: rgba(255, 255, 255, 0.03);
--bg-tertiary: rgba(255, 255, 255, 0.05);

/* Glass Effect Colors */
--glass-bg: rgba(255, 255, 255, 0.05);
--glass-border: rgba(255, 255, 255, 0.1);
--glass-hover: rgba(255, 255, 255, 0.08);

/* Text Colors */
--text-primary: #ffffff;
--text-secondary: #b0b0b0;
--text-tertiary: #808080;

/* Accent Colors */
--accent-primary: #667eea;
--accent-secondary: #764ba2;
--accent-gradient: linear-gradient(135deg, #667eea 0%, #764ba2 100%);

/* Status Colors */
--success: #48bb78;
--warning: #ed8936;
--error: #f56565;
--info: #4299e1;

/* Gradients */
--gradient-purple: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
--gradient-blue: linear-gradient(135deg, #4299e1 0%, #667eea 100%);
--gradient-green: linear-gradient(135deg, #48bb78 0%, #38a169 100%);
--gradient-orange: linear-gradient(135deg, #ed8936 0%, #dd6b20 100%);
```

### Spacing

```css
--spacing-xs: 0.25rem;   /* 4px */
--spacing-sm: 0.5rem;    /* 8px */
--spacing-md: 1rem;      /* 16px */
--spacing-lg: 1.5rem;    /* 24px */
--spacing-xl: 2rem;      /* 32px */
--spacing-2xl: 3rem;     /* 48px */
```

### Border Radius

```css
--radius-sm: 6px;
--radius-md: 12px;
--radius-lg: 16px;
--radius-xl: 24px;
--radius-full: 9999px;
```

### Shadows

```css
--shadow-sm: 0 2px 8px rgba(0, 0, 0, 0.1);
--shadow-md: 0 4px 16px rgba(0, 0, 0, 0.15);
--shadow-lg: 0 8px 32px rgba(0, 0, 0, 0.2);
--shadow-glass: 0 8px 32px rgba(0, 0, 0, 0.1);
```

### Glass Effect

```css
--glass-blur: 10px;
--glass-backdrop: blur(10px) saturate(180%);
```

## Glassmorphism Effects

### Basic Glass Card

```css
.glass-card {
  background: var(--glass-bg);
  backdrop-filter: var(--glass-backdrop);
  border: 1px solid var(--glass-border);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-glass);
}
```

### Glass Card with Hover

```css
.glass-card-interactive {
  background: var(--glass-bg);
  backdrop-filter: var(--glass-backdrop);
  border: 1px solid var(--glass-border);
  border-radius: var(--radius-lg);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.glass-card-interactive:hover {
  background: var(--glass-hover);
  transform: translateY(-2px);
  box-shadow: 0 12px 40px rgba(0, 0, 0, 0.25);
}
```

### Frosted Glass Effect

```css
.frosted-glass {
  background: rgba(255, 255, 255, 0.02);
  backdrop-filter: blur(20px) saturate(200%);
  border: 1px solid rgba(255, 255, 255, 0.15);
  box-shadow: 
    0 8px 32px rgba(0, 0, 0, 0.1),
    inset 0 1px 0 rgba(255, 255, 255, 0.1);
}
```

## Button Styles

### Primary Button

```css
.btn-primary {
  background: var(--gradient-purple);
  color: white;
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: var(--radius-md);
  font-size: 0.9rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
}

.btn-primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(102, 126, 234, 0.4);
}

.btn-primary:active {
  transform: translateY(0);
}
```

### Glass Button

```css
.btn-glass {
  background: rgba(255, 255, 255, 0.05);
  backdrop-filter: blur(10px);
  color: var(--text-primary);
  border: 1px solid rgba(255, 255, 255, 0.1);
  padding: 0.75rem 1.5rem;
  border-radius: var(--radius-md);
  cursor: pointer;
  transition: all 0.3s ease;
}

.btn-glass:hover {
  background: rgba(255, 255, 255, 0.1);
  border-color: rgba(255, 255, 255, 0.2);
}
```

## Card Styles

### Standard Card

```css
.card {
  background: var(--glass-bg);
  backdrop-filter: var(--glass-backdrop);
  border: 1px solid var(--glass-border);
  border-radius: var(--radius-lg);
  padding: var(--spacing-lg);
  transition: all 0.3s ease;
}

.card:hover {
  background: var(--glass-hover);
  transform: translateY(-4px);
  box-shadow: var(--shadow-lg);
}
```

### Stat Card

```css
.stat-card {
  background: var(--glass-bg);
  backdrop-filter: var(--glass-backdrop);
  border: 1px solid var(--glass-border);
  border-radius: var(--radius-lg);
  padding: var(--spacing-xl);
  position: relative;
  overflow: hidden;
}

.stat-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 3px;
  background: var(--gradient-purple);
}

.stat-value {
  font-size: 2.5rem;
  font-weight: 700;
  background: var(--gradient-purple);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}
```

## Animations

### Fade In

```css
@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.fade-in {
  animation: fadeIn 0.3s ease-out;
}
```

### Slide In

```css
@keyframes slideIn {
  from {
    opacity: 0;
    transform: translateX(-20px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

.slide-in {
  animation: slideIn 0.4s ease-out;
}
```

### Pulse

```css
@keyframes pulse {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.5;
  }
}

.pulse {
  animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
}
```

### Shimmer

```css
@keyframes shimmer {
  0% {
    background-position: -1000px 0;
  }
  100% {
    background-position: 1000px 0;
  }
}

.shimmer {
  background: linear-gradient(
    90deg,
    rgba(255, 255, 255, 0) 0%,
    rgba(255, 255, 255, 0.1) 50%,
    rgba(255, 255, 255, 0) 100%
  );
  background-size: 1000px 100%;
  animation: shimmer 2s infinite;
}
```

## Gradients

### Text Gradients

```css
.gradient-text {
  background: var(--gradient-purple);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}
```

### Background Gradients

```css
.gradient-bg {
  background: radial-gradient(
    ellipse at top,
    rgba(102, 126, 234, 0.1) 0%,
    transparent 50%
  );
}

.gradient-mesh {
  background: 
    radial-gradient(at 0% 0%, rgba(102, 126, 234, 0.15) 0px, transparent 50%),
    radial-gradient(at 100% 0%, rgba(118, 75, 162, 0.15) 0px, transparent 50%),
    radial-gradient(at 100% 100%, rgba(72, 187, 120, 0.15) 0px, transparent 50%),
    radial-gradient(at 0% 100%, rgba(237, 137, 54, 0.15) 0px, transparent 50%);
}
```

## Responsive Design

### Breakpoints

```css
/* Mobile */
@media (max-width: 640px) {
  .sidebar {
    width: 100%;
    height: auto;
  }
}

/* Tablet */
@media (min-width: 641px) and (max-width: 1024px) {
  .main-content {
    margin-left: 200px;
  }
}

/* Desktop */
@media (min-width: 1025px) {
  .main-content {
    margin-left: 250px;
  }
}
```

## Utility Classes

### Spacing

```css
.p-sm { padding: var(--spacing-sm); }
.p-md { padding: var(--spacing-md); }
.p-lg { padding: var(--spacing-lg); }

.m-sm { margin: var(--spacing-sm); }
.m-md { margin: var(--spacing-md); }
.m-lg { margin: var(--spacing-lg); }
```

### Text

```css
.text-primary { color: var(--text-primary); }
.text-secondary { color: var(--text-secondary); }
.text-gradient { 
  background: var(--gradient-purple);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}
```

### Display

```css
.flex { display: flex; }
.flex-col { flex-direction: column; }
.items-center { align-items: center; }
.justify-between { justify-content: space-between; }
.gap-md { gap: var(--spacing-md); }
```

## Best Practices

1. **Use CSS Variables**: Always use custom properties for colors and spacing
2. **Mobile First**: Write mobile styles first, then add media queries for larger screens
3. **Performance**: Use `transform` and `opacity` for animations (GPU accelerated)
4. **Accessibility**: Maintain sufficient color contrast ratios
5. **Consistency**: Follow the design system for spacing and colors
6. **Modularity**: Keep component styles scoped and reusable
7. **Glassmorphism**: Use sparingly for emphasis, not everywhere
8. **Transitions**: Keep animations under 300ms for snappy feel

## Dark Mode

Current implementation uses dark theme by default. For light mode support:

```css
[data-theme="light"] {
  --bg-primary: #ffffff;
  --bg-secondary: rgba(0, 0, 0, 0.03);
  --text-primary: #1a1a1a;
  --glass-bg: rgba(0, 0, 0, 0.03);
  /* ... other overrides */
}
```
