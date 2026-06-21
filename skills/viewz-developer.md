# ViewZ Developer Skill

Build server-side rendered (SSR) applications with ViewZ framework integrated into Open BamZ.

## When to Use This Skill

Use this skill when:
- Building SSR views using the ViewZ framework in an Open BamZ application
- Creating ViewZ extensions or bindz formatters
- Integrating ViewZ cells into AG-Grid tables
- Registering custom HTML processors or view extensions
- Setting up ViewZ routing and view configurations
- Working with the `bamz` global client in ViewZ templates

## Core Concepts

### ViewZ Framework
ViewZ is a server-side rendering framework that:
- Renders dynamic HTML on the server
- Supports data binding with `bindz` (Zen-inspired binding syntax)
- Provides extensibility through plugins and formatters
- Integrates seamlessly with Open BamZ ecosystem

### Plugin Architecture
The open-bamz-viewz plugin provides **plugin slots** for extending functionality:
- `htmlProcessors` - Transform HTML before SSR rendering
- `viewzExtensions` - Extend ViewZ with custom features
- `bindzFormatters` - Add custom data binding formatters
- `agGridExtensions` - Integrate with AG-Grid cell rendering
- `javascriptApiDef` - Provide TypeScript definitions for code editor
- `codeEditors` - Add custom editors for routes/views

## Setup & Configuration

### Initial Configuration
When an application with the open-bamz-viewz plugin starts, it automatically:
1. Creates `/public/viewz.config.json` with default routing configuration
2. Creates `/public/views/root/` directory with default view files:
   - `root.html` - Default entry point template
   - `root.css` - Root styles
   - `root.js` - Root scripts

### Modify viewz.config.json
```json
{
  "routing": "BROWSER",
  "viewsPath": "views",
  "routes": [
    {
      "url": "/",
      "path": "root"
    },
    {
      "url": "/about",
      "path": "about"
    },
    {
      "url": "/dashboard",
      "path": "dashboard"
    }
  ]
}
```

### Create View Files
For each route, create a directory under `public/views/`:
```
public/views/
├── root/
│   ├── root.html
│   ├── root.css
│   └── root.js
├── about/
│   ├── about.html
│   ├── about.css
│   └── about.js
└── dashboard/
    ├── dashboard.html
    ├── dashboard.css
    └── dashboard.js
```

## Working with ViewZ Templates

### Basic HTML Template (root.html)
```html
<div class="container">
  <h1 zz-bind="title">Welcome</h1>
  <p zz-bind="description"></p>
  <button zz-click="handleClick">Click Me</button>
</div>
```

### Data Binding with bindz
The `bindz` system provides data binding using `zz-*` attributes:
- `zz-bind="property"` - Two-way bind to data property
- `zz-click="handler"` - Click event handler
- `zz-show="condition"` - Show/hide based on condition
- `zz-repeat="item in array"` - Loop through arrays

### JavaScript Context (root.js)
```javascript
export default {
  // Initial data state
  title: "My Application",
  description: "Welcome to ViewZ",
  
  // Event handlers
  handleClick() {
    this.title = "Button clicked!";
    bamz.showNotification("Action triggered");
  },
  
  // Lifecycle hooks
  onViewCreated() {
    console.log("View initialized");
  },
  
  onViewDestroyed() {
    console.log("View cleaned up");
  }
};
```

### Styling (root.css)
```css
.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
}

h1 {
  color: #333;
  font-size: 24px;
}
```

## Using the bamz Client

The global `bamz` object provides access to Open BamZ functionality:

```javascript
// Navigation
bamz.navigate("/dashboard");

// Notifications
bamz.showNotification("Message", "success");
bamz.showError("Error occurred");

// API calls
const data = await bamz.api.get("/api/endpoint");
await bamz.api.post("/api/data", { payload });

// Data storage
bamz.storage.setItem("key", value);
const value = bamz.storage.getItem("key");

// Plugin communication
const result = await bamz.callPlugin("pluginName", "method", args);
```

## AG-Grid Integration

### ViewZ Cell Renderer
Use ViewZ templates to render AG-Grid cells:

```javascript
// In column definition
{
  field: "userName",
  cellRenderer: "CellViewZRenderer",
  cellRendererParams: {
    html: `<span zz-bind="value">{{value}}</span>`
  }
}
```

### ViewZ Cell Editor
Render custom editors using ViewZ:

```javascript
{
  field: "status",
  cellEditor: "CellViewZEditor",
  cellEditorParams: {
    html: `<select zz-bind="value">
      <option value="active">Active</option>
      <option value="inactive">Inactive</option>
    </select>`
  }
}
```

### Reactive Row Data
If row data is a bindz-observable object, grid updates automatically:

```javascript
// Grid listens to changes and auto-refreshes
rowData.addListener("*.*", (event) => {
  // Grid automatically updates
});
```

## Creating Extensions

### ViewZ Extension
Create a file at `/public/extensions/my-extension.mjs`:

```javascript
export default {
  name: "myExtension",
  version: "1.0.0",
  
  // Custom directives
  directives: {
    myDirective: {
      bind(el, binding) {
        el.textContent = `Custom: ${binding.value}`;
      }
    }
  },
  
  // Custom formatters
  formatters: {
    uppercase: (value) => value?.toUpperCase?.() || ""
  },
  
  // Custom components
  components: {
    MyComponent: {
      template: `<div>Custom Component</div>`
    }
  }
};
```

Register in plugin slots in your app configuration.

### Bindz Formatter
Create a file at `/public/formatters/my-formatter.mjs`:

```javascript
export default {
  name: "myFormatter",
  
  // Format data for display
  format(value, options) {
    if (typeof value === "number") {
      return `$${value.toFixed(2)}`;
    }
    return value;
  },
  
  // Parse from user input
  parse(value, options) {
    return parseFloat(value.replace("$", ""));
  }
};
```

## HTML Processors

Modify HTML before rendering with custom processors:

```javascript
// In plugin configuration
{
  plugin: "myPlugin",
  processorPath: "/plugin/my-plugin/html-processor.mjs"
}
```

```javascript
// html-processor.mjs
export default {
  process(html) {
    // Add analytics
    html += `<script>
      window.addEventListener('load', () => {
        trackPageView();
      });
    </script>`;
    return html;
  }
};
```

## API Routes

### Available Routes

**GET `/viewz-extensions`**
Dynamically generated JavaScript module with all registered ViewZ extensions:
```javascript
import extensions from '/viewz-extensions';
// extensions = [{ plugin: "name", ...extensionData }]
```

**GET `/bindz-formatters`**
Dynamically generated module with all registered formatters:
```javascript
import formatters from '/bindz-formatters';
// formatters = [{ plugin: "name", ...formatterData }]
```

**GET `/definitions/ext-lib.d.ts`**
TypeScript definitions for all registered extensions.

## Plugin Integration Points

### With grapesjs-editor
ViewZ components available in the page builder:
- Add ViewZ elements from inspector
- Edit ViewZ templates visually
- Preview with live data binding

### With code-editor
- TypeScript definitions for `bamz` client
- ViewZ library definitions
- Extension type definitions
- Auto-complete for ViewZ APIs

### With ag-grid Plugin
- `CellViewZRenderer` component for rendering cells
- `CellViewZEditor` component for inline editing
- Column transformer for automatic setup

### With open-bamz-packaging
- Automatically includes ViewZ extensions
- Bundles bindz formatters
- Optimizes for offline use

### With open-bamz-pwa
- Caches ViewZ extensions and formatters
- Updates cache on route changes
- Supports offline functionality

## Best Practices

### Performance
1. **Lazy load extensions** - Only load what's needed
2. **Use virtual lists** - With AG-Grid for large datasets
3. **Minimize HTML processors** - Keep them lightweight
4. **Cache templates** - Reuse compiled templates

### Code Quality
1. **Use TypeScript** - Leverage type definitions
2. **Validate data** - Sanitize user input
3. **Error handling** - Gracefully handle missing data
4. **Testing** - Test views with different data states

### Security
1. **Sanitize HTML** - Use ViewZ's built-in sanitization
2. **Validate inputs** - In formatters and processors
3. **Secure API calls** - Use bamz.api with proper auth
4. **Avoid eval** - Don't use dynamic code execution

### Accessibility
1. **Use semantic HTML** - Proper heading hierarchy
2. **Add aria labels** - For interactive elements
3. **Keyboard navigation** - Support tab/enter/escape
4. **Color contrast** - Meet WCAG standards

## Common Patterns

### Master-Detail Views
```javascript
// dashboard.html
<div class="layout">
  <div class="master" zz-repeat="item in items">
    <div zz-click="selectItem(item)">{{item.name}}</div>
  </div>
  <div class="detail">
    <h2 zz-bind="selectedItem.name"></h2>
    <p zz-bind="selectedItem.description"></p>
  </div>
</div>
```

### Form with Validation
```javascript
// form.html
<form zz-submit="handleSubmit">
  <input type="email" zz-bind="email" required />
  <input type="password" zz-bind="password" required />
  <button type="submit" zz-disable="!email || !password">Submit</button>
  <div zz-show="error" class="error">{{error}}</div>
</form>
```

### Async Data Loading
```javascript
// dashboard.js
export default {
  data: null,
  loading: true,
  error: null,
  
  async onViewCreated() {
    try {
      this.data = await bamz.api.get("/api/dashboard");
    } catch (err) {
      this.error = err.message;
    } finally {
      this.loading = false;
    }
  }
};
```

## Debugging

### Enable ViewZ Logging
```javascript
window.DEBUG_VIEWZ = true;
window.DEBUG_BINDZ = true;
```

### Inspect Bound Elements
```javascript
// In browser console
document.querySelectorAll("[zz-bind]").forEach(el => {
  console.log(el.contextz);
});
```

### Check Extension Loading
```javascript
// In browser console
import ext from '/viewz-extensions';
console.log(ext);
```

### Access View Instance
```javascript
// In component
const view = document.body.contextz?.view;
console.log(view); // View instance with all data
```

## Troubleshooting

| Issue | Solution |
|-------|----------|
| Bindings not updating | Ensure data is observable (use bamz mutations) |
| Extensions not loading | Check routes are correct, verify plugin slots |
| AG-Grid not refreshing | Use grid.applyTransaction({update: [row]}) |
| CSS not applying | Verify view structure matches selector |
| bamz undefined | Ensure BAMZ_IN_PLUGIN flag is not set |
| TypeScript errors | Run code-editor plugin to sync definitions |

## Resources

- **ViewZ Docs**: https://github.com/Bakino/viewz
- **Bindz Syntax**: ViewZ binding guide in framework docs
- **AG-Grid Docs**: https://www.ag-grid.com/
- **Open BamZ**: Main platform documentation

## Examples

See `/public/views/` directory for example view structures and patterns.
