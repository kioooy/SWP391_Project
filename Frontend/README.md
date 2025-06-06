# Blood Donation System

A comprehensive web application for managing blood donation activities, connecting blood donors with recipients, and managing blood bank operations.

## Features

- User authentication (Login/Signup)
- Blood type search and matching
- Donor registration and management
- Blood bank inventory management
- Emergency blood requests
- Donation history tracking
- User role management (Guest, Member, Staff, Admin)

## Tech Stack

- React.js
- Material-UI
- Redux Toolkit
- Formik & Yup
- React Router
- Axios

## Project Structure

```
src/
├── assets/          # Static assets (images, icons)
├── components/      # Reusable components
├── config/         # Configuration files
├── features/       # Feature-based modules
├── hooks/          # Custom hooks
├── layouts/        # Layout components
├── pages/          # Page components
├── services/       # API services
├── store/          # Redux store
├── styles/         # Global styles
└── utils/          # Utility functions
```

## Getting Started

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the development server:
   ```bash
   npm start
   ```

## Environment Variables

Create a `.env` file in the root directory with the following variables:

```
REACT_APP_API_URL=your_api_url
```

## Contributing

Please read our contributing guidelines before submitting pull requests.

## License

This project is licensed under the MIT License. 