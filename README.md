# ASSETMATCH

An AI-powered visual reserve image search engine engineered to solve workflow bottlenecks in digital studios. Find the exact background, character or texture you need—simply by uploading a reference image.

---

## 📑 Table of Contents
1. [About the Project](#-about-the-project)
2. [Features](#-features)
3. [Technologies Used](#%EF%B8%8F-technologies-used)
4. [Tools Used to Realize Project](#-tools-used-to-realize-project)
5. [Steps Made to Prepare Data Structure](#-steps-made-to-prepare-data-structure)
6. [Leveraging Algorithm for this System](#-leveraging-algorithm-for-this-system)
7. [Getting Started](#-getting-started)
    - [Prerequisites](#prerequisites)
    - [Installation (Docker)](#installation-docker)
8. [Working of the Application](#-working-of-the-application)
9. [License](#-license)
10. [Acknowledgements](#-acknowledgements)
11. [Source Declaration](#-source-declaration)

---

## 📖 About the Project

**The Digital Graveyard Problem**
During my time as a software developer in the animation department at an EdTech company, our team produced massive amounts of digital assets for interactive modules and games. When projects ended, these beautifully crafted assets were dumped into storage drives. Finding a specific background or sprite months later meant wasting hours clicking through folders and guessing file names like `bg_final_v3_real.png`. 

Relying on text and file names to find visual art is fundamentally broken.

**The Solution**
AssetMatch was built to let creatives search for visual assets *visually*. By dragging and dropping a rough sketch, texture, or UI layout, the system instantly scans the database and retrieves visually similar assets for inspiration or immediate download. No more folder digging—just pure creativity.

---

## ✨ Features

* **Visual Search Engine:** Upload an image and let AI find visually similar assets in milliseconds.
* **Advanced Dynamic Filtering:** Filter results by exact Aspect Ratio (Horizontal/Vertical) and File Types (PNG, JPG, SVG).
* **Result Variety Control:** Adjust the strictness of the ML match (Low, Medium, High similarity thresholds).
* **Interactive UI:** Glassmorphism design with drag-and-drop support, clipboard pasting, and local upload history.
* **Automated Data Seeding:** The system automatically extracts vectors and metadata from local folders to populate the database on startup.

---

## 🛠️ Technologies Used

* **Frontend:** React.js, TypeScript, Vite, CSS3
* **Backend:** Python, FastAPI, Uvicorn
* **Machine Learning:** PyTorch, Torchvision
* **Database:** PostgreSQL, `pgvector`
* **Containerization:** Docker, Docker Compose

---

## 🧰 Tools Used to Realize Project

* **VS Code:** Primary IDE for full-stack development.
* **Postman / Swagger UI:** For testing and documenting the FastAPI endpoints.
* **Docker Desktop:** For orchestrating the multi-container architecture.
* **Git/GitHub:** Version control and source code management.

---

## 🏗️ Steps Made to Prepare Data Structure

To make visual search possible, the raw image data needed to be transformed into a searchable schema:
1. **File Scanning:** A Python seeding script (`seed.py`) scans the local `/samples` directory for valid image formats.
2. **Feature Extraction:** Each image is loaded into memory, transformed into a tensor, and passed through the PyTorch ML engine to generate a 512-dimensional vector.
3. **Metadata Parsing:** The script extracts the file extension and calculates the aspect ratio (width/height) using the Python Pillow (PIL) library.
4. **Database Population:** The extracted vector and metadata are securely inserted into the PostgreSQL `studio_assets` table using the `pgvector` extension.

---

## 🧠 Leveraging Algorithm for this System

The core of AssetMatch relies on two primary algorithmic concepts:

1. **Convolutional Neural Networks (CNNs):** We utilize a pre-trained **ResNet18** model. By stripping the final classification layer, we repurpose the model as a feature extractor. When an image is passed through, the model outputs a 512-dimensional float array representing the image's colors, textures, and shapes.
2. **Cosine Similarity:** To find matching images, the system calculates the angle between the uploaded image's vector and the vectors stored in the database. This is executed blazingly fast at the database level using PostgreSQL's `pgvector` extension and the Cosine Distance operator (`<=>`).

---

## 🚀 Getting Started

### Prerequisites
You only need one thing installed on your machine to run this entire stack:
* [Docker Desktop](https://www.docker.com/products/docker-desktop/)

### Installation (Docker)

1. Clone the repository:
   ```bash
   git clone REPO_URL
   cd Asset-Match

2. Build and spin up the containers using Docker Compose:
   ```bash
   docker-compose up --build
   docker-compose up

4. Access the application:

Frontend UI: http://localhost:3000

Backend API / Swagger Docs: http://localhost:8000/docs

Database: localhost:5432

Note: On the very first startup, the backend will automatically extract vectors from the /samples folder and seed the database. This may take a moment depending on your CPU.

## API Endpoints
**GET / :** Health check for API and ML models.

**POST /api/search :** Accepts an image payload (multipart/form-data), extracts the 512-D vector, runs a Cosine Distance query (<=>), and returns the top 6 matches with similarity scores.

**GET /api/download/{filename} :** Serves matched files as an application/octet-stream download.

## ⚙️ Working of the Application

1. **User Input:** The user drags and drops an image into the React frontend.
2. **API Processing:** The image is sent via `multipart/form-data` to the FastAPI backend.
3. **Vectorization:** The backend ML engine converts the uploaded bytes into a normalized tensor and extracts the feature vector.
4. **Vector Search:** FastAPI constructs a dynamic SQL query, combining vector distance calculations with the user's UI filters (aspect ratio, file type).
5. **Result Delivery:** The database returns the closest matches, which the frontend maps into a responsive 4-column grid for the user to preview or download.

**Engine Landing Page**

<img width="550" height="439" alt="image" src="https://github.com/user-attachments/assets/191d46ce-277c-453f-8f16-f9e13403bd3f" />

**High similarity threshold**

<img width="556" height="492" alt="image" src="https://github.com/user-attachments/assets/32a3ae5a-3f21-4b08-b9c1-64829fb971e0" />

**Low similarity threshold**

<img width="558" height="420" alt="image" src="https://github.com/user-attachments/assets/eb1ff979-f9d7-4240-919d-cc579209bbb7" />

**History Tab**

<img width="554" height="410" alt="image" src="https://github.com/user-attachments/assets/c307f01a-b6a7-4c81-9d0e-09103d8834f6" />

📄 License
Distributed under the MIT License. See LICENSE for more information.

## Declarations & Acknowledgments
**ML Model:** Utilized open-source PyTorch ResNet18 (IMAGENET1K_V1 weights).

**Database Extension:** Utilized the open-source pgvector PostgreSQL extension.

**Dummy Dataset:** Used sample open-source visual assets (tagged Kaggle_Batch_01 in the database) loaded automatically via seed.py.


**Developed by Pratish Sharma.**

**Email:** pratishsharma19@gmail.com
