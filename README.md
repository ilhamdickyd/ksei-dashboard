# KSEI Financial Dashboard 📊

![Next JS](https://img.shields.io/badge/Next-black?style=for-the-badge&logo=next.js&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white)
![TailwindCSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)
![React Query](https://img.shields.io/badge/-React%20Query-FF4154?style=for-the-badge&logo=react%20query&logoColor=white)

![Dashboard Preview](https://i.imgur.com/NcDKBqF.png)

An interactive web dashboard designed to visualize and analyze financial data from the Indonesian Central Securities Depository (KSEI). This project provides comprehensive data visualizations to help users understand and analyze trends in the Indonesian financial market.

**[➡️ View Live Demo](https://ksei-dashboard.vercel.app/)**

---

## Table of Contents
- [About The Project](#about-the-project)
- [Key Features](#key-features)
- [Technology Stack](#technology-stack)
- [Dashboard Breakdown](#dashboard-breakdown)
- [Getting Started](#getting-started)
- [Future Roadmap](#future-roadmap)
- [License](#license)
- [Contact](#contact)

---

## About The Project

The KSEI Financial Dashboard was built to tackle the challenge of interpreting complex, raw financial data. By transforming tabular data into intuitive and interactive visualizations, this tool empowers stakeholders—from retail investors to analysts—to easily explore and understand the dynamics of Indonesia's capital market.

The dashboard focuses on three core perspectives: overall financial asset distribution, domestic investor demographics, and individual investor profiles.

## Key Features

- 📊 **Multi-Perspective Analysis:** Deep dive into three main financial categories: Asset Distribution, Domestic Investor Spread, and Individual Investor Demographics.
- 📈 **Interactive Visualizations:** Utilizes a variety of charts including line charts for monthly trends, bar charts for comparisons, and donut charts for proportional distribution.
- 🔍 **Dynamic Filtering:** Allows users to filter and compare data by year (2021-2024), month, category, region, and various demographic factors.
- 📑 **Three-Layered Tabs:** Each data category is organized into `Overview`, `Analysis`, and `Comparison` tabs, offering different depths of insight.

## Technology Stack

This dashboard was built using a modern, scalable, and type-safe tech stack.

| Category | Technologies Used |
| :--- | :--- |
| **Frontend** | `React`, `Next.js`, `TypeScript` |
| **Styling** | `Tailwind CSS`, `shadcn/ui` |
| **Data Visualization**| `Recharts` |
| **State Management**| React Hooks (`useState`, `useCallback`, `useMemo`) |

## Dashboard Breakdown

The application is structured into three main analytical components:

1.  **Financial Asset Distribution:** Analyzes key financial categories including Stocks (`Pasar Modal`), Mutual Funds (`Reksa Dana`), C-BEST, and Government Bonds (`SBN`).
2.  **Domestic Investor Spread:** Presents the geographical distribution of investors across major Indonesian regions (Java, Sumatera, Kalimantan, etc.).
3.  **Individual Investor Demographics:** Provides insights into investor profiles based on gender, age, occupation, education, and income level.

## Getting Started

To get a local copy up and running, follow these simple steps.

### Prerequisites

- [Node.js](https://nodejs.org/en/) (v18.x or higher)
- [npm](https://www.npmjs.com/) or [yarn](https://yarnpkg.com/)

### Installation

1.  **Clone the repository:**
    ```bash
    git clone [https://github.com/ilhamdickyd/ksei-dashboard.git](https://github.com/ilhamdickyd/ksei-dashboard.git)
    cd ksei-dashboard
    ```

2.  **Install dependencies:**
    ```bash
    npm install
    ```

3.  **Run the development server:**
    ```bash
    npm run dev
    ```

4.  Open [http://localhost:3000](http://localhost:3000) in your browser to see the result.

## Future Roadmap

- [ ] **Predictive Analytics**: Implement time-series forecasting models.
- [ ] **Data Export**: Add functionality to download chart data as CSV/Excel.
- [ ] **Custom Date Ranges**: Allow users to select custom date ranges for analysis.
- [ ] **API Integration**: Connect directly to the KSEI API for real-time data updates.

## License

Distributed under the MIT License. See `LICENSE` for more information.

---

## Contact

**Ilham Dicky Darmawan**

[ilham.dicky.darmawan@gmail.com](mailto:ilham.dicky.darmawan@gmail.com) | [LinkedIn](https://www.linkedin.com/in/ilham-dicky-darmawan) | [GitHub](https://github.com/ilhamdickyd)