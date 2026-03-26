# Linting Setup and CSS Warnings Resolution

## Issue Description

The IDE may show CSS lint warnings related to Tailwind CSS directives:
- `@tailwind` directives (base, components, utilities)
- `@apply` directives for utility classes
- Custom Tailwind at-rules (`@layer`, `@variants`, etc.)

## Solution Implemented

### 1. Stylelint Configuration
Created `.stylelintrc.json` with Tailwind CSS support:

```json
{
  "extends": ["stylelint-config-standard"],
  "rules": {
    "at-rule-no-unknown": [
      true,
      {
        "ignoreAtRules": [
          "tailwind", "apply", "variants", "responsive", 
          "screen", "layer", "utilities", "components"
        ]
      }
    ]
  }
}
```

### 2. Package Scripts
Added CSS linting scripts to `package.json`:

```json
{
  "scripts": {
    "lint:css": "stylelint \"src/**/*.{css,scss}\"",
    "lint:fix": "eslint . --fix && stylelint \"src/**/*.{css,scss}\" --fix"
  }
}
```

### 3. Dependencies Added
- `stylelint`: CSS linter
- `stylelint-config-standard`: Standard CSS rules
- `stylelint-order`: Property ordering rules

## How to Resolve the Warnings

### Option 1: Install Dependencies (Recommended)
```bash
npm install --save-dev stylelint stylelint-config-standard stylelint-order
```

### Option 2: VS Code Settings
Add to `.vscode/settings.json` (if not gitignored):
```json
{
  "css.validate": false,
  "scss.validate": false,
  "less.validate": false
}
```

### Option 3: Ignore Warnings (Not Recommended)
The warnings don't affect functionality and can be safely ignored if you prefer not to install additional dependencies.

## Usage

After installing dependencies:
```bash
# Lint CSS files
npm run lint:css

# Fix all linting issues
npm run lint:fix
```

## Why These Warnings Occur

- Tailwind CSS uses custom at-rules that standard CSS linters don't recognize
- `@tailwind` directives are processed by PostCSS, not standard CSS parsers
- `@apply` directives are Tailwind-specific utility class applications

## Impact on Functionality

**Zero impact** - These are only linting warnings. The Tailwind CSS compilation works correctly through PostCSS, and all styles are applied as expected in the browser.
