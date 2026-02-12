# Ezoic React Hooks

This directory contains custom React hooks for Ezoic ad integration.

## Available Hooks

### `useEzoic`
Main hook for Ezoic ad management in React components.

**Features:**
- Show/hide ads programmatically
- Auto-load ads on component mount
- Clean up ads on unmount
- SPA navigation support
- Dynamic content management

**Usage:**
```tsx
import { useEzoic } from './hooks/useEzoic';

function MyComponent() {
  const { showAd, destroyAd, refreshAds } = useEzoic({
    autoRefresh: false,
    autoLoadPlacements: [101, 102],
    onPageChange: () => console.log('Page changed')
  });

  return (
    <div>
      <button onClick={() => showAd(103)}>Show Ad</button>
      <button onClick={() => destroyAd(103)}>Hide Ad</button>
    </div>
  );
}
```

**API:**
```typescript
const {
  showAd,           // (...ids: number[]) => void
  destroyAd,        // (...ids: number[]) => void
  destroyAll,       // () => void
  refreshAds,       // () => void
  isReady,          // () => boolean
  waitForReady,     // (timeout?: number) => Promise<boolean>
  getPlacementStatus, // (id: number) => EzoicAdPlacement | undefined
  loadedPlacements  // number[]
} = useEzoic(options);
```

---

### `useEzoicPageChange`
Automatically refreshes ads when navigating in a Single Page Application.

**Usage:**
```tsx
import { useEzoicPageChange } from './hooks/useEzoic';
import { useLocation } from 'react-router-dom';

function App() {
  const location = useLocation();
  
  // Auto-refresh ads on route change
  useEzoicPageChange(location.pathname);
  
  return <Routes>...</Routes>;
}
```

**API:**
```typescript
useEzoicPageChange(dependency: any): void
```

---

## Examples

### Example 1: Basic Usage
```tsx
function ArticlePage() {
  const { showAd } = useEzoic();

  useEffect(() => {
    showAd(201, 202, 203);
  }, []);

  return <article>...</article>;
}
```

### Example 2: Dynamic Content
```tsx
function DynamicContent() {
  const [content, setContent] = useState('A');
  const { showAd, destroyAd } = useEzoic();

  const switchContent = (newContent) => {
    // Clean up old ads
    destroyAd(301);
    
    // Update content
    setContent(newContent);
    
    // Show new ads
    showAd(302);
  };

  return <div>...</div>;
}
```

### Example 3: SPA with React Router
```tsx
function App() {
  const location = useLocation();
  useEzoicPageChange(location.pathname);

  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/about" element={<About />} />
    </Routes>
  );
}
```

### Example 4: Conditional Loading
```tsx
function ConditionalAds({ user }) {
  const { showAd, destroyAll } = useEzoic();

  useEffect(() => {
    if (user.isPremium) {
      destroyAll();
    } else {
      showAd(401, 402);
    }
  }, [user.isPremium]);

  return <div>...</div>;
}
```

---

## TypeScript Support

All hooks are fully typed with TypeScript:

```typescript
interface UseEzoicOptions {
  autoRefresh?: boolean;
  autoLoadPlacements?: number[];
  onPageChange?: () => void;
}

interface EzoicAdPlacement {
  id: number;
  element?: HTMLElement;
  loaded: boolean;
}
```

---

## Best Practices

1. **Clean up ads**: Always destroy ads when components unmount or content changes
2. **Batch operations**: Use single `showAd()` call for multiple placements
3. **SPA navigation**: Use `useEzoicPageChange` for route changes
4. **Error handling**: Check `isReady()` before showing ads
5. **Unique IDs**: Use unique placement IDs for different content

---

## See Also

- [Main Implementation Guide](../EZOIC_IMPLEMENTATION_GUIDE.md)
- [Quick Reference](../EZOIC_QUICK_REFERENCE.md)
- [Examples](../examples/EzoicAdExamples.tsx)
