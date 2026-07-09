# ASSETMATCH: User Manual

Welcome to the AssetMatch Vector Engine. This manual will guide you through the core features of the platform and how to use them effectively to find the visual assets you need.

## 1. Interface Overview
The AssetMatch application is divided into two primary tabs, accessible via the top navigation bar:
* **Engine:** The main workspace where you upload images and view results.
* **About:** The backstory of the platform.

Within the **Engine** tab, the screen is split into three main areas:
1. **The Upload Zone:** A large drag-and-drop area for providing your reference image.
2. **The Interactive Sidebar:** A collapsible panel on the right side of the Upload Zone containing your History and Advanced Filters.
3. **The Results Grid:** The lower section of the page where matched assets are displayed.

## 2. Searching for Assets
You can initiate a visual search using three different methods:
* **Drag and Drop:** Click and hold an image file from your computer and drop it directly into the dashed Upload Zone.
* **Click to Browse:** Click anywhere inside the Upload Zone to open your system's file browser and select an image (`.png`, `.jpg`, `.jpeg`).
* **Copy and Paste:** Take a screenshot or copy an image to your clipboard, click anywhere on the webpage, and press `Ctrl+V`.

Once an image is provided, the AI engine will immediately extract its visual features and display the closest matches in the **Match Results** grid below.

**Note** Kindly use images provided in `/search_image` folder for acurate results, as current model uses small dummy dataset.

## 3. Using Advanced Filters
If your initial search returns too many results or isn't specific enough, you can refine it using the **Filters Sidebar**. Click the "Slider" icon in the top right corner of the Upload Zone to open the panel.

* **File Type:** Select specific checkboxes to only return assets of a certain format (e.g., only PNGs for transparent sprites).
* **Orientation:** Restrict results to either strictly Horizontal or Vertical aspect ratios.
* **Result Variety:**
    * **Low:** Very strict matching. Only returns images that are nearly identical.
    * **Medium:** Standard similarity (Default).
    * **High:** Loose matching. Great for exploring conceptual inspiration or color palettes.

*Note: After adjusting your filters, you must click the **"Apply Search"** button at the bottom of the sidebar to refresh your results.*

## 4. Managing Results
Once the Results Grid populates, you have several tools to manage the output:
* **Keyword Search:** Use the search bar above the grid to instantly filter the matched filenames by a specific keyword.
* **Sorting:** Click the "Sort" toggle to arrange results by Highest Match Percentage or Lowest Match Percentage.
* **Downloading:** Click the "Download" button underneath any asset tile to securely save the file to your local machine.

## 5. Reviewing Search History
Click the "Clock" icon in the top right corner of the Upload Zone to open your History panel. This saves the reference images you have uploaded during your current session. 
* Click any thumbnail in your history to instantly re-run a search with that image.
* Click the "delete-icon" on a thumbnail to remove it, or click "Clear" to wipe your entire session history.