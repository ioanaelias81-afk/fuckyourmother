# Dwell - Shopify Theme Development

## Overview
This is the **Dwell** Shopify theme (version 2.0.0) by Shopify, set up for development and preview in the Replit environment. This theme uses Liquid templating language and is designed to run on Shopify's platform.

## Recent Changes
- **2025-01-XX**: Initial setup of development server for theme file preview
- **2025-01-XX**: Configured Node.js express server to serve theme assets and provide directory browsing
- **2025-01-XX**: Set up workflow for development server on port 5000

## Project Architecture
This is a Shopify Liquid theme with the following structure:

### Key Directories
- **`/assets/`** - Static assets (CSS, JavaScript, images, SVG icons)
- **`/templates/`** - Page templates (JSON and Liquid files)
- **`/sections/`** - Theme sections for customizable content blocks
- **`/snippets/`** - Reusable Liquid code snippets
- **`/layout/`** - Theme layout files (main theme.liquid template)
- **`/config/`** - Theme configuration and settings schema
- **`/locales/`** - Translation files for internationalization
- **`/blocks/`** - Liquid blocks for section content

### Development Setup
- **Development Server**: Node.js/Express server serving theme files
- **Port**: 5000 (configured for Replit proxy compatibility)
- **JavaScript**: Uses ES6 modules intended for Shopify's platform
- **Styling**: Base CSS and component-specific styles in `/assets/`

### Theme Information
- **Theme Name**: Dwell
- **Version**: 2.0.0
- **Author**: Shopify
- **Purpose**: Modern, responsive e-commerce theme for Shopify stores

## Development Notes
- This theme is designed to run on Shopify's platform in production
- The development server provides file access and preview capabilities
- JavaScript modules are intended for Shopify's environment and may not run directly in browser
- Theme customization happens through Shopify's theme editor using the settings schema