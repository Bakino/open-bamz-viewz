# Open BamZ ViewZ Plugin - Skill Files Overview

## Created Skill Files

This directory contains comprehensive skill documentation and resources for developers building applications with the open-bamz-viewz plugin.

### 1. viewz-developer.md
**Comprehensive Developer Guide**

The primary skill file covering all aspects of developing with ViewZ in Open BamZ:

**Sections:**
- Core concepts and when to use the skill
- Setup & configuration (viewz.config.json, view files)
- Working with ViewZ templates and bindz syntax
- Using the bamz client API
- AG-Grid integration patterns
- Creating custom extensions and formatters
- HTML processors for content transformation
- Available API routes
- Plugin integration points (grapesjs, code-editor, ag-grid, packaging, pwa)
- Best practices for performance, code quality, security, accessibility
- Common patterns (master-detail, forms, async data)
- Debugging techniques
- Troubleshooting guide
- Resources and examples

**Use When:** Building views, creating templates, implementing features with ViewZ

### 2. viewz-developer.yaml
**Skill Manifest and Metadata**

Configuration file for registering the skill in development environments:

**Contents:**
- Skill name, version, and categorization
- Trigger patterns for when Claude should suggest this skill
- List of key capabilities
- Common use cases
- Integration points with other plugins
- Related concepts
- File patterns the skill applies to
- Dependencies and related skills

**Use For:** Integration with development tools and skill discovery systems

### 3. PROJECT_ANALYSIS.md
**Architectural Deep Dive**

Detailed technical analysis of the plugin architecture:

**Sections:**
- Executive summary
- Complete architecture diagram
- Detailed component analysis:
  - Backend (index.mjs)
  - Frontend (viewz-lib, viewz-bamz, ag-grid-viewz)
  - Integration points
- Data flow diagrams (SSR, initialization, grid rendering)
- Plugin slot system documentation
- Configuration file specifications
- Security considerations
- Performance optimization strategies
- Development workflow
- Testing strategies
- Deployment checklist
- Future enhancement ideas

**Use For:** Understanding system design, making architectural decisions, debugging complex issues

### 4. QUICK_REFERENCE.md
**Hands-On Developer Cheatsheet**

Quick lookup guide with copy-paste examples:

**Sections:**
- Directory structure
- Step-by-step new view creation
- Bindz syntax quick reference table
- Bamz client API reference
- AG-Grid + ViewZ integration examples
- Extension creation template
- Formatter creation template
- Common patterns with code examples:
  - Form validation
  - Master-detail view
  - Async data loading
- Debugging tips with console commands
- CSS classes and styling reference
- Performance tips
- Common errors and solutions
- File checklist

**Use For:** Quick lookups while coding, copy-paste starting points, common tasks

## How These Files Work Together

```
QUICK_REFERENCE.md ──→ Hands-on cheatsheet for immediate tasks
       ↓
viewz-developer.md ──→ Dive deeper for full documentation
       ↓
PROJECT_ANALYSIS.md → Understand architecture and design decisions
       ↓
viewz-developer.yaml → Integration metadata
```

## Usage Scenarios

### Scenario 1: "I'm new to ViewZ, where do I start?"
1. Read the "Setup & Configuration" section in `viewz-developer.md`
2. Follow "Create a New View" in `QUICK_REFERENCE.md`
3. Reference "Bindz Syntax" for template writing
4. Check `PROJECT_ANALYSIS.md` if you want to understand how it works

### Scenario 2: "I need to create a complex grid with ViewZ"
1. Look up "AG-Grid Integration" in `viewz-developer.md`
2. Use the code examples in `QUICK_REFERENCE.md`
3. Refer to "AG-Grid + ViewZ Integration" section for advanced patterns

### Scenario 3: "Something is broken, help debug"
1. Check "Troubleshooting" in `viewz-developer.md`
2. Use debugging tips from `QUICK_REFERENCE.md`
3. Review "Common Errors" table for solutions
4. Read `PROJECT_ANALYSIS.md` data flow diagrams if needed

### Scenario 4: "I need to extend ViewZ with custom functionality"
1. Review "Creating Extensions" in `viewz-developer.md`
2. Use templates in `QUICK_REFERENCE.md` as starting points
3. Understand plugin slots in `PROJECT_ANALYSIS.md`

### Scenario 5: "I'm reviewing plugin integration"
1. Read "Plugin Integration Points" in `viewz-developer.md`
2. Study integration patterns in `PROJECT_ANALYSIS.md`
3. Check deployment checklist at end

## Key Concepts Covered

### Core Concepts
- ViewZ Server-Side Rendering (SSR)
- Bindz two-way data binding
- Plugin slots and extensibility
- bamz client integration

### Implementation Patterns
- View creation workflow
- Template syntax
- Event handling
- Data binding
- Extension creation
- Formatter development

### Integration Points
- grapesjs-editor (visual page builder)
- code-editor (IDE with type definitions)
- ag-grid (table grid integration)
- open-bamz-packaging (offline bundling)
- open-bamz-pwa (progressive web app)

### Best Practices
- Performance optimization
- Security considerations
- Code quality patterns
- Accessibility guidelines
- Testing strategies

## Integration with Claude Code

When using Claude Code with Open BamZ ViewZ projects:

1. **Reference these files** when asking Claude about ViewZ development
2. **Quote sections** from QUICK_REFERENCE.md for specific syntax
3. **Share PROJECT_ANALYSIS.md** with Claude when discussing architecture
4. **Use viewz-developer.md** for comprehensive problem-solving

## Updating These Files

### When to Update:
- Plugin architecture changes
- New features added to ViewZ
- New integration points discovered
- Common patterns identified from usage
- Security considerations updated

### What to Update:
- Keep `viewz-developer.md` current with all capabilities
- Add new triggers to `viewz-developer.yaml` as patterns emerge
- Update `PROJECT_ANALYSIS.md` if architecture changes
- Add new patterns to `QUICK_REFERENCE.md` as they become standard

## Related Documentation

- **Project Root:** CLAUDE.md (plugin instructions)
- **Framework:** ViewZ GitHub repository
- **Platform:** Open BamZ main documentation
- **Grid:** AG-Grid official documentation

## Version History

| Version | Date | Changes |
|---------|------|---------|
| 1.0.0 | 2026-05-09 | Initial comprehensive skill documentation |

---

**Created for:** open-bamz-viewz plugin v1.0.0  
**Maintained by:** Development team  
**Last Updated:** 2026-05-09
