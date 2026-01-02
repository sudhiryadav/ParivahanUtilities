# Parivahan Utilities - Chrome Extension

A Chrome extension that enhances the Parivahan fancy number search experience with smart filtering and sorting capabilities.

## Features

- **Smart Filtering**: Instantly isolates HR26 (Gurugram) numbers, which is one of the highest-demand RTOs in India
- **Ascending Sort**: Organizes the "Base Price" or "Availability" column numerically so you can find the cheapest or most premium numbers without scrolling manually
- **UI Injection**: Adds a custom button directly into the government portal for a seamless experience

## Installation

1. Open Chrome and navigate to `chrome://extensions/`
2. Enable "Developer mode" (toggle in the top right)
3. Click "Load unpacked"
4. Select the `ParivahanUnilities` folder
5. The extension is now installed and will automatically work on Parivahan website pages

## Usage

1. Navigate to the Parivahan fancy number search page
2. After the search results load, you'll see a "Filter HR26 & Sort Ascending" button above the table
3. Click the button to:
   - Filter the results to show only HR26 (Gurugram) registration numbers
   - Sort the results by the 6th column (Base Price/Availability) in ascending order

## Technical Details

- **Manifest Version**: 3
- **Content Script**: Runs on all Parivahan.gov.in pages
- **Injection Method**: Button is injected every 2 seconds to handle AJAX-loaded content

## Development

The extension consists of:
- `manifest.json` - Extension configuration
- `content.js` - Main script that injects the filter button and handles filtering/sorting logic

## Notes

- The extension automatically detects when tables are loaded via AJAX
- The filter button appears automatically when the table is detected
- Only HR26 (Gurugram) numbers are shown after filtering

