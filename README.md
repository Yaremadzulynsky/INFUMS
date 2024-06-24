# Integrated Navigation and Flight UAV Monitoring System (INFUMS)

Welcome to the INFUMS repository. This project is a comprehensive data streaming initiative designed to enhance drone operations through robust data logging, real-time tracking, and global communication capabilities. This repository contains all the necessary code, CAD files, documentation, and operations manual.

## Table of Contents

- [Overview](#overview)
- [Repository Structure](#repository-structure)
- [Setup Instructions](#setup-instructions)
- [Components](#components)
  - [CAD](#cad)
  - [Embedded](#embedded)
  - [Microservices](#microservices)
  - [Website](#website)
- [Contributing](#contributing)
- [License](#license)

## Overview

The Integrated Navigation and Flight UAV Monitoring System (INFUMS) is a comprehensive data streaming initiative I undertook to enhance drone operations through robust data logging, real-time tracking, and global communication capabilities. This project began during my coop with AeroDrone, where I took full responsibility for the ideation, design, prototyping, and software development. By designing and integrating multiple hardware and software components, I created a modular and scalable solution that addresses the critical needs of drone telemetry, enhancing the operational efficiency and situational awareness of UAV fleets working in harsh environments.

## Repository Structure

The repository is organized as a monorepo, containing all the code, CAD files, and documentation related to the project.

\`\`\`
/INFUMS
├── Cad
│   ├── Arduino MKR 1010 Casing.step
│   ├── Bottom Enclosure.step
│   ├── GPS Case.step
│   ├── M4 Standoffs.step
│   ├── Pixhawk Casing Vibration Mount.step
│   ├── Pixhawk Casing.step
│   ├── Satellite Modem Casing.step
│   └── Top Enclosure.step
├── Embedded
│   ├── src
│   └── platformio.ini
├── Microservices
│   ├── CloudFunctions
│   ├── MockData
│   └── _Backend
└── Website
    ├── temp.md
    └── README.md
\`\`\`

## Setup Instructions

### Prerequisites

- [Node.js](https://nodejs.org/) (version X.X.X)
- [PlatformIO](https://platformio.org/)
- [Docker](https://www.docker.com/)
- [Firebase CLI](https://firebase.google.com/docs/cli)

### Installation

1. Clone the repository:

\`\`\`bash
git clone https://github.com/Yaremadzulynsky/INFUMS.git
cd INFUMS
\`\`\`

2. Install dependencies for each component:

#### Embedded

\`\`\`bash
cd Embedded
platformio init
\`\`\`

#### Microservices

\`\`\`bash
cd Microservices
npm install
\`\`\`

#### Website

\`\`\`bash
cd Website
npm install
\`\`\`

3. Start the services:

#### Microservices

\`\`\`bash
cd Microservices
npm start
\`\`\`

#### Website

\`\`\`bash
cd Website
npm start
\`\`\`

## Components

### CAD

This folder contains all the CAD files for the custom enclosures and mounts used in the project. These files are essential for 3D printing the necessary components.

### Embedded

This folder contains the embedded code for the Arduino MKR 1010 and other hardware components. The code is developed using PlatformIO.

### Microservices

This folder contains the microservices for handling data processing and storage. It includes:

- **CloudFunctions**: Serverless functions for data processing.
- **MockData**: Mock data for testing purposes.
- **_Backend**: Backend services for data management.

### Website

This folder contains the code for the web interface, which provides real-time visualization and management of drone telemetry data.

## Contributing

Contributions are welcome! Please read the [contributing guidelines](CONTRIBUTING.md) before starting work on a new feature or bugfix.

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for more details.

---

Complete code, CAD files, documentation, and operations manual are available at [GitHub](https://github.com/Yaremadzulynsky/INFUMS/wiki).