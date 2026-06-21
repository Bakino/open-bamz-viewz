# ViewZ Quick Reference Guide

## Directory Structure
```
app-public/
├── viewz.config.json          # Routing config
├── index.html                 # Default entry point
└── views/                     # View templates
    └── {viewName}/
        ├── {viewName}.html    # Template
        ├── {viewName}.css     # Styles
        └── {viewName}.js      # Logic
```

## Create a New View

**Step 1: Create directory**
```bash
mkdir public/views/dashboard
```

**Step 2: Create template**
```html
<!-- public/views/dashboard/dashboard.html -->
<div class="dashboard">
  <h1 zz-bind="title">Dashboard</h1>
  <div class="cards">
    <div class="card" zz-repeat="item in items">
      <h3 zz-bind="item.name"></h3>
      <p zz-bind="item.value"></p>
    </div>
  </div>
</div>
```

**Step 3: Create styles**
```css
/* public/views/dashboard/dashboard.css */
.dashboard { padding: 20px; }
.cards { display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px; }
.card { border: 1px solid #ddd; padding: 15px; border-radius: 8px; }
```

**Step 4: Create logic**
```javascript
// public/views/dashboard/dashboard.js
export default {
  title: "Dashboard",
  items: [
    { name: "Sales", value: "$10,000" },
    { name: "Users", value: "150" },
    { name: "Revenue", value: "$45,000" }
  ],
  
  onViewCreated() {
    console.log("Dashboard loaded");
  }
};
```

**Step 5: Add route**
```json
{
  "url": "/dashboard",
  "path": "dashboard"
}
```

## Bindz Syntax Quick Reference

| Syntax | Purpose | Example |
|--------|---------|---------|
| `zz-bind="prop"` | Two-way bind | `<input zz-bind="email" />` |
| `zz-click="method"` | Click handler | `<button zz-click="save">Save</button>` |
| `zz-show="condition"` | Conditional display | `<div zz-show="isAdmin">Admin</div>` |
| `zz-hide="condition"` | Conditional hide | `<div zz-hide="!isLoggedIn">Login</div>` |
| `zz-repeat="item in array"` | Loop | `<li zz-repeat="item in items">{{item}}</li>` |
| `zz-class="obj"` | Dynamic classes | `<div zz-class="{active: isActive}">` |
| `zz-style="obj"` | Inline styles | `<div zz-style="{color: status}">` |
| `zz-attr:href="url"` | Attributes | `<a zz-attr:href="link">Link</a>` |
| `zz-submit="method"` | Form submit | `<form zz-submit="handleSubmit">` |
| `zz-disable="condition"` | Disable | `<button zz-disable="!isValid">` |
| `zz-value="prop"` | Select/textarea value | `<select zz-value="status">` |
| `{{expression}}` | Interpolation | `<p>Hello {{name}}!</p>` |

## AG-Grid + ViewZ Integration

```javascript
// Column definition with ViewZ renderer
{
  field: "status",
  headerName: "Status",
  cellRenderer: "CellViewZRenderer",
  cellRendererParams: {
    html: `<span zz-bind="value" class="badge">{{value}}</span>`
  }
}

// Column with ViewZ editor
{
  field: "comment",
  headerName: "Comments",
  cellEditor: "CellViewZEditor",
  cellEditorParams: {
    html: `<textarea zz-bind="value" style="width:100%; height:100%"></textarea>`
  },
  cellEditorPopupPosition: "under"
}

```

## Creating Extensions

**File: `public/extensions/my-ext.mjs`**
```javascript
export default {
  directives: {
    myDirective: {
      bind(el, binding) {
        el.innerHTML = `Custom: ${binding.value}`;
      }
    }
  },
  
  filters: {
    shout: (val) => val?.toUpperCase?.() || ""
  }
};
```

## Creating Formatters

**File: `public/formatters/currency.mjs`**
```javascript
export default {
  format: (value) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD"
    }).format(value);
  },
  
  parse: (value) => parseFloat(value.replace(/[$,]/g, ""))
};
```

## Common Patterns

### Form with Validation
```html
<form zz-submit="submitForm">
  <div>
    <label>Email</label>
    <input type="email" zz-bind="form.email" required />
    <span zz-show="errors.email" class="error">{{errors.email}}</span>
  </div>
  <button type="submit" zz-disable="!isFormValid">Submit</button>
</form>
```

```javascript
export default {
  form: { email: "", password: "" },
  errors: {},
  
  get isFormValid() {
    return this.form.email && this.form.password;
  },
  
  async submitForm() {
    try {
      await bamz.api.post("/api/auth", this.form);
      bamz.showNotification("Success!");
    } catch (err) {
      this.errors = err.validation || {};
    }
  }
};
```

### Master-Detail
```html
<div class="layout">
  <div class="master">
    <div zz-repeat="item in items" 
         zz-class="{active: item.id === selected.id}"
         zz-click="selectItem(item)">
      {{item.name}}
    </div>
  </div>
  <div class="detail" zz-show="selected">
    <h2 zz-bind="selected.name"></h2>
    <p zz-bind="selected.description"></p>
  </div>
</div>
```

### Async Data Loading
```javascript
export default {
  data: null,
  loading: true,
  error: null,
  
  async onViewCreated() {
    try {
      this.data = await bamz.api.get("/api/data");
    } catch (err) {
      this.error = err.message;
    } finally {
      this.loading = false;
    }
  }
};
```

## Debugging Tips

```javascript
// Enable ViewZ logging
window.DEBUG_VIEWZ = true;
window.DEBUG_BINDZ = true;

// Check element binding context
const el = document.querySelector("[zz-bind='property']");
console.log(el.contextz); // View instance

// Inspect extensions
import ext from '/viewz-extensions';
console.log(ext);

// Check formatters
import fmt from '/bindz-formatters';
console.log(fmt);
```

## CSS Classes for Conditional Styling

```html
<!-- Active state -->
<div zz-class="{active: isActive, disabled: !isEnabled}">

<!-- Visibility -->
<div zz-show="isVisible"></div>
<div zz-hide="!isVisible"></div>

<!-- Style object -->
<div zz-style="{
  color: status === 'error' ? 'red' : 'green',
  opacity: isLoading ? 0.5 : 1
}">
```

## Performance Tips

1. **Use virtual lists** for large datasets
2. **Lazy load** extensions
3. **Cache templates** via service worker
4. **Minimize HTML processors**
5. **Batch grid updates** with `applyTransaction()`
6. **Debounce** event handlers
7. **Use formatters** for display logic (not bindings)

## Common Errors

| Error | Cause | Fix |
|-------|-------|-----|
| `bamz is undefined` | Plugin not loaded | Check BAMZ_IN_PLUGIN flag |
| Binding not updating | Data not observable | Use `bamz.createObservable()` |
| Extensions not found | Route incorrect | Check `/viewz-extensions` returns data |
| Grid not refreshing | Not using grid API | Use `grid.applyTransaction()` |
| CSS not applying | Selector doesn't match | Check element structure |

## File Checklist

- [ ] `viewz.config.json` - Routes defined
- [ ] View HTML created
- [ ] View CSS created (optional)
- [ ] View JS created with logic
- [ ] Extensions registered (if any)
- [ ] Formatters registered (if any)
- [ ] AG-Grid columns configured (if used)
- [ ] Error handling added
- [ ] bamz API calls error-handled
- [ ] TypeScript definitions provided

---

**Quick Links:**
- ViewZ Docs: https://github.com/Bakino/viewz
- AG-Grid: https://www.ag-grid.com/
- Open BamZ: Platform documentation
