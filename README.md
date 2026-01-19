# Aircraft Maintenance

This proof-of-concept project provides the backend and frontend services for visualizing aircraft flights and maintenance work packages in a timeline component. The backend is built with NestJS, TypeORM, and TypeScript. The frontend is built with Vite, React, and TypeScript. Data is stored in a PostgreSQL database. The services are containerized using Docker and can be easily set up using Docker Compose.

This project was assigned to me by a company as a job seeker challenge, but it is no longer used as such (that's why I am publishing it now). This document describes how to install and use the web application and explains the various aspects of how I approached and solved this challenge.

## Content

1. [**Installation instructions**](docs/installation.md)
2. [**User instructions**](docs/usage.md)
3. [**Requirement analysis and assumptions**](docs/requirements.md)
4. [**Software design and implementation**](docs/design.md)
5. [**Software deployment and testing**](docs/deployment.md)

## Snapshots

1. The dashboard page:

![Website](docs/snapshots/website.png)

2. The Gantt-chart-like timeline:

![Timeline](docs/snapshots/page-dashboard-02.png)

3. The timeline tooltips:

![Time ruler](docs/snapshots/page-dashboard-05.png)

# License

This project is licensed under the MIT License.
