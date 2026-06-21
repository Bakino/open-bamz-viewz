# Open BamZ ViewZ Plugin - Project Analysis

## Executive Summary

**open-bamz-viewz** is a plugin that integrates the ViewZ server-side rendering (SSR) framework into the Open BamZ platform. It enables developers to build dynamic, reactive user interfaces using ViewZ templates with two-way data binding (bindz), while leveraging Open BamZ's ecosystem of integrated plugins.

## Architecture Overview

```
open-bamz-viewz Plugin
├── Backend (Node.js/Express)
│   ├── index.mjs                    # Plugin initialization & routing
│   ├── viewz.config.json            # Dynamic routing configuration
│   └── public/views/                # View templates (HTML/CSS/JS)
│
├── Frontend (Browser)
│   ├── viewz-lib.mjs                # ViewZ framework loader
│   ├── viewz-bamz.mjs               # BamZ client integration
│   ├── ag-grid-viewz.mjs            # AG-Grid cell renderer/editor
│   └── Extensions & Formatters      # Dynamic imports
│
└── Integration Points
    ├── grapesjs-editor              # Page builder visual editing
    ├── code-editor                  # TypeScript definitions & IDE
    ├── open-bamz-ag-grid            # Grid cell rendering
    ├── open-bamz-packaging          # PWA bundling
    └── open-bamz-pwa                # Offline caching

```

## Core Components

### 1. Backend: index.mjs

**Responsibilities:**
- Plugin initialization and Express routing setup
- SSR content generation from ViewZ framework
- Caching of compiled request handlers per app
- Dynamic route generation for extensions/formatters
- Plugin slot management and lifecycle hooks

**Key Functions:**

| Function | Purpose |
|----------|---------|
| `prepareDatabase()` | Initialize default config and view files |
| `initPlugin()` | Register Express routes and plugin slots |
| `getHandlers()` | Get/create cached SSR handler, check for file changes |
| `prepareHandlers()` | Compile ViewZ SSR content with HTML processors |

**Routes Registered:**

| Route | Purpose |
|-------|---------|
| `/` (middleware) | Main SSR rendering handler |
| `/viewz-extensions` | Dynamically generated JS with all extensions |
| `/bindz-formatters` | Dynamically generated JS with all formatters |
| `/definitions/ext-lib.d.ts` | TypeScript definitions for extensions |

**File Monitoring:**
- Watches `index.html` and `viewz.config.json` for changes
- Automatically recompiles handlers on file modification
- Caches file stats to optimize polling

### 2. Frontend: viewz-lib.mjs

**Responsibilities:**
- Load ViewZ framework from CDN
- Initialize bindz binding system
- Load and register custom extensions
- Load and register custom formatters
- Start ViewZ routing if enabled

**Key Exports:**
```javascript
export { viewzLib }      // Empty lib object for future extension
export { startViewZ }    // Start client-side routing
```

**Initialization Flow:**
1. Wait for `bamzWaitLoaded()` promise (Open BamZ platform ready)
2. Import and register all bindz formatters from `/bindz-formatters`
3. Import and register all ViewZ extensions from `/viewz-extensions`
4. Start ViewZ client-side routing (if BAMZ_NO_ROUTERZ is not set)

### 3. Frontend: viewz-bamz.mjs

**Responsibilities:**
- Provide global `bamz` client instance in ViewZ context
- Enable access to Open BamZ APIs from templates

**Exports:**
```javascript
export default {
  globals: {
    bamz: new BamzClient()
  }
}
```

**Usage in Templates:**
```html
<button zz-click="bamz.navigate('/dashboard')">Go</button>
```

### 4. Frontend: ag-grid-viewz.mjs

**Responsibilities:**
- Render AG-Grid cells using ViewZ templates
- Edit cells with ViewZ-based editors
- React to data changes and refresh grid
- Provide context between grid and ViewZ views

**Classes:**

| Class | Purpose |
|-------|---------|
| `CellViewZRenderer` | AG-Grid cell renderer using ViewZ |
| `CellViewZEditor` | AG-Grid cell editor using ViewZ |

**Key Features:**
- Automatic focus on input/select in edit mode
- Bindz data binding within grid cells
- Auto-refresh on row data changes (observable pattern)
- Event listener wrapper providing `itemData` context

**Export:**
```javascript
export default {
  columnOptionsTransformer: function({ options, html })
  components: { CellViewZRenderer, CellViewZEditor }
  extends: (AgGridElement) => { /* prototype extensions */ }
}
```

## Plugin Slot System

Plugin slots are registration points for extending functionality:

### Slot: `htmlProcessors`
**Purpose:** Transform HTML before rendering  
**Type:** Array of processor objects  
**Used By:** SSR engine before serving HTML  
**Example:** Analytics injection, meta tags, security headers

### Slot: `viewzExtensions`
**Purpose:** Add custom directives, formatters, components to ViewZ  
**Type:** Array of extension objects  
**Used By:** ViewZ framework during initialization  
**Example:** Custom components, utility functions

### Slot: `bindzFormatters`
**Purpose:** Add custom data binding formatters  
**Type:** Array of formatter objects  
**Used By:** Bindz system for value transformation  
**Example:** Currency formatting, date parsing

### Slot: `agGridExtensions`
**Purpose:** Add custom AG-Grid cell renderers/editors  
**Type:** Array of extension objects  
**Used By:** AG-Grid when rendering cells  
**Example:** ViewZ cell renderer (provided by this plugin)

### Slot: `javascriptApiDef`
**Purpose:** Provide TypeScript definitions for code completion  
**Type:** Array of definition objects  
**URL-based:** Definitions auto-loaded by code-editor plugin  
**Example:** ViewZ library types, bamz client types

### Slot: `codeEditors`
**Purpose:** Custom editors for specific file types  
**Type:** Array of editor extension objects  
**Used By:** Code editor when opening matching files

### Slot: `urlsToDownload` (packaging)
**Purpose:** URLs to include in offline package  
**Type:** Array of URL/destination pairs  
**Used By:** open-bamz-packaging plugin

### Slot: `urlsToCache` (PWA)
**Purpose:** URLs to cache in service worker  
**Type:** Array of URL objects  
**Used By:** open-bamz-pwa plugin

## Data Flow Diagram

### Server-Side Rendering (SSR) Flow
```
Request
  ↓
[Express Middleware]
  ↓
Check: Is ViewZ plugin enabled for app?
  ↓ Yes
[Get/Cache SSR Handler]
  ↓
Check: Files changed since last compile?
  ↓ Yes: Recompile with HTML processors
  ↓ No: Use cached handler
  ↓
[Generate SSR Content]
  ↓
[Inject BamZ admin banner]
  ↓
Response HTML
```

### Client-Side Initialization Flow
```
HTML Loaded
  ↓
[viewz-lib.mjs runs]
  ↓
[Wait for bamzWaitLoaded()]
  ↓
[Import bindz-formatters]
  ↓
[Import viewz-extensions]
  ↓
[Register all formatters & extensions]
  ↓
[startViewZ() - Enable client-side routing]
  ↓
Page Interactive
```

### AG-Grid Cell Rendering Flow
```
Grid renders row
  ↓
[Column has cellRenderer: "CellViewZRenderer"]
  ↓
[CellViewZRenderer.init() called]
  ↓
[renderCell() - Set HTML content]
  ↓
[bind() - Apply bindz binding]
  ↓
[Dispatch viewz-cell-rendered event]
  ↓
Cell displays with reactive binding
```

## Integration Patterns

### With grapesjs-editor
- **What:** Register ViewZ component in GrapesJS page builder
- **How:** Add to `grapesJsEditor` plugin slot
- **File:** `/plugin/open-bamz-viewz/editor/grapesjs-viewz-extension.mjs`
- **Effect:** Designers can drag/drop ViewZ components in visual builder

### With code-editor
- **What:** Provide TypeScript definitions and syntax support
- **How:** Add to `javascriptApiDef` and `codeEditors` slots
- **Files:** 
  - `/plugin/open-bamz-viewz/lib/viewz.d.ts`
  - `/viewz/definitions/ext-lib.d.ts`
  - `/plugin/open-bamz-viewz/editor/route-editor-extension.mjs`
- **Effect:** IDE auto-complete for ViewZ APIs and bamz client

### With open-bamz-ag-grid
- **What:** Cell rendering and editing with ViewZ templates
- **How:** Register in `agGridExtensions` slot
- **File:** `/plugin/open-bamz-viewz/lib/ag-grid-viewz.mjs`
- **Effect:** Tables can render cells as ViewZ templates

### With open-bamz-packaging
- **What:** Include generated dynamic files in offline package
- **How:** Add to `urlsToDownload` slot
- **Files:** `/open-bamz-viewz/bindz-formatters`, `/open-bamz-viewz/viewz-extensions`
- **Effect:** PWA includes custom formatters and extensions offline

### With open-bamz-pwa
- **What:** Cache generated dynamic files in service worker
- **How:** Add to `urlsToCache` slot
- **Files:** `/open-bamz-viewz/bindz-formatters`, `/open-bamz-viewz/viewz-extensions`
- **Effect:** PWA updates cache when extensions change

## Configuration Files

### viewz.config.json
**Location:** `{app}/public/viewz.config.json`  
**Purpose:** Define routes and view locations  
**Auto-created:** Yes, with default route to `/`

```json
{
  "routing": "BROWSER",
  "viewsPath": "views",
  "routes": [
    {
      "url": "/",
      "path": "root"
    }
  ]
}
```

### View Structure
**Location:** `{app}/public/views/{viewName}/`  
**Files:**
- `{viewName}.html` - Template
- `{viewName}.css` - Styles (optional)
- `{viewName}.js` - Logic (optional)

## Security Considerations

### XSS Protection
- HTML content is processed through htmlProcessors
- BamZ injection sanitizes content before injecting banner
- Input validation should be done in view logic

### Data Binding Safety
- Bindz system escapes output by default
- Use `zz-html` carefully only with trusted content
- Validate data before rendering

### Extension Loading
- Extensions loaded from predictable paths
- No eval() or dynamic code execution
- Use TypeScript for type safety

## Performance Optimization

### Server-Side
1. **Handler Caching:** Compiled SSR handlers cached per app
2. **File Stat Watching:** Minimal polling overhead
3. **Lazy Extension Loading:** Extensions only included if registered

### Client-Side
1. **CDN Delivery:** ViewZ framework from CDN (cached by browser)
2. **Code Splitting:** Extensions/formatters loaded dynamically
3. **Binding Efficiency:** Bindz uses event delegation
4. **Grid Integration:** Auto-refresh optimized with grid transactions

### Deployment
1. **Packaging:** Formatters/extensions bundled for offline
2. **PWA Caching:** Dynamic files cached in service worker
3. **Asset Compression:** JavaScript modules minified

## Development Workflow

### 1. Create New View
```bash
# Create view directory
mkdir public/views/myview

# Create template files
echo "<h1>My View</h1>" > public/views/myview/myview.html
echo "/* styles */" > public/views/myview/myview.css
echo "export default { /* logic */ }" > public/views/myview/myview.js
```

### 2. Register Route
```json
// Add to viewz.config.json
{
  "url": "/myview",
  "path": "myview"
}
```

### 3. Use ViewZ Binding
```html
<input zz-bind="username" />
<button zz-click="submit">Submit</button>
```

### 4. Implement Logic
```javascript
export default {
  username: "John",
  submit() {
    bamz.api.post("/api/user", { username: this.username });
  }
}
```

### 5. Add Extension/Formatter (Optional)
- Create extension module
- Register in plugin slots
- Access via `bamz.callPlugin()`

## Testing Strategy

### Unit Tests
- Test individual formatters
- Test view logic independently
- Mock bamz client

### Integration Tests
- Test routes with real SSR
- Test grid cell rendering
- Test extension loading

### E2E Tests
- Test user flows through views
- Test navigation
- Test form submissions

## Deployment Checklist

- [ ] All views created and configured in viewz.config.json
- [ ] View HTML/CSS/JS files validated
- [ ] Extensions registered in plugin slots
- [ ] Formatters registered and tested
- [ ] TypeScript definitions provided
- [ ] bambz client API calls error-handled
- [ ] Security review of HTML processors
- [ ] Performance testing completed
- [ ] PWA caching configured
- [ ] Package bundling tested

## Related Documentation

- **ViewZ Framework:** https://github.com/Bakino/viewz
- **Open BamZ:** Main platform documentation
- **AG-Grid:** https://www.ag-grid.com/
- **Bindz (Zen Binding):** ViewZ binding syntax guide

## Example Applications

Refer to `/public/views/` for example view structures:
- Root view with basic binding
- Navigation patterns
- Form validation
- Data display with formatters
- Grid integration examples

## Future Enhancements

1. **View Caching Layer** - Cache compiled views
2. **Route Preloading** - Predictive loading
3. **Lazy Loading Components** - Load extensions on demand
4. **Real-time Updates** - WebSocket integration
5. **View Composition** - Component reuse patterns
6. **State Management** - Cross-view data sharing
7. **Performance Monitoring** - Built-in profiling

---

**Last Updated:** 2026-05-09  
**Plugin Version:** 1.0.0  
**Maintained By:** Bakino
