# 🌱 Karma App - Ethical Shopping Platform

A full-stack web application that promotes ethical and sustainable shopping by providing users with detailed information about products' environmental impact, ethical sourcing, and sustainability scores. Users earn karma points for making conscious purchasing decisions.

---

## 🌟 Features

* **Ethical Product Discovery**: Browse products with detailed sustainability information
* **Karma Points System**: Earn points for purchasing ethical and sustainable products
* **Sustainability Scoring**: Products rated on environmental impact (0–100 scale)
* **Ethical Badges**: Categorization like Organic, Fair Trade, Sustainable, Eco-Friendly, and Carbon Neutral
* **Carbon Footprint Tracking**: Visual indicators for each product's carbon impact
* **User Management**: Track personal karma points and purchase history
* **Product Alternatives**: Discover sustainable substitutes to conventional products

---

## 🏧 Architecture Overview

### Frontend

* **Framework**: React.js
* **Language**: JavaScript (ES6+)
* **Key Components**: Product UI, User Profiles, Karma Points
* **Testing**: React Testing Library, Jest

### Backend

* **Framework**: FastAPI (Python)
* **Database**: MongoDB (via Motor – async driver)
* **Authentication**: JWT-based
* **API**: RESTful API with full CRUD support

---

## 🚀 Getting Started

### Prerequisites

* Node.js
* Python 3.8+
* MongoDB instance (local or cloud)
* npm or yarn

### 🔧 Frontend Setup

```bash
cd frontend
npm install
npm start
```

Frontend available at: `http://localhost:3000`

### 🔧 Backend Setup

```bash
cd backend
pip install -r requirements.txt
```

Create a `.env` file in `/backend`:

```env
MONGO_URL=your_mongodb_connection_string
DB_NAME=karma_app
```

Run the backend server:

```bash
uvicorn server:app --reload
```

Backend API available at: `http://localhost:8000`

---

## 📚 API Documentation

### 🔹 Core Endpoints

#### Products

* `GET /api/products` – Get all products
* `GET /api/products/{product_id}` – Get a specific product
* `POST /api/products` – Create new product
* `GET /api/products/category/{category}` – Get products by category

#### Users

* `POST /api/users` – Create new user
* `GET /api/users/{user_id}` – Get user details
* `POST /api/users/{user_id}/karma` – Add karma points
* `GET /api/users/{user_id}/karma-history` – View karma history

#### System

* `GET /api/` – API health check
* `POST /api/status` – Create system status
* `GET /api/status` – View status

---

## 🧬 Data Models

### 🛙 Product Model

```json
{
  "id": "string",
  "name": "string",
  "price": "float",
  "original_price": "float (optional)",
  "description": "string",
  "image_url": "string",
  "category": "string",
  "ethical_badges": [
    {
      "category": "organic|fair_trade|sustainable|eco_friendly|carbon_neutral",
      "score": "integer (0-100)",
      "description": "string"
    }
  ],
  "karma_points": "integer",
  "sustainability_score": "integer (0-100)",
  "carbon_footprint": "string",
  "alternatives": ["string"],
  "created_at": "datetime"
}
```

### 👤 User Model

```json
{
  "id": "string",
  "email": "string",
  "name": "string",
  "karma_points": "integer",
  "total_impact_score": "integer",
  "purchases": ["string"],
  "created_at": "datetime"
}
```

---

## 🛠️ Technology Stack

### Frontend

* React 18.x
* React Testing Library
* Web Vitals
* Modern JavaScript (ES6+)

### Backend

* FastAPI (0.110.1)
* Motor (3.3.1)
* PyMongo (4.5.0)
* Pydantic (2.6.4+)
* python-dotenv (1.0.1+)
* Uvicorn (0.25.0)

### Dev Tools

* `pytest` – Testing
* `black` – Code formatting
* `isort` – Import sorting
* `flake8` – Linting
* `mypy` – Type checking

---

## 🌍 Ethical Product Categories

* **Organic** – USDA Organic certified
* **Fair Trade** – Fair wages and working conditions
* **Sustainable** – Eco-responsible production and packaging
* **Eco-Friendly** – Low environmental impact
* **Carbon Neutral** – Net-zero carbon emissions

---

## 📊 Karma Points System

Users can earn karma points through:

* **Product Purchases**: Based on sustainability score
* **Product Reviews**: Encourages community contribution
* **Referrals**: Inviting others to the platform

---

## 📁 Project Structure

```
karma-app/
├── frontend/
│   ├── src/
│   │   ├── App.js
│   │   └── components/
│   ├── package.json
│   └── public/
├── backend/
│   ├── server.py
│   ├── requirements.txt
│   └── .env (create this)
└── README.md
```

---

## 🤪 Testing

### Frontend

```bash
cd frontend
npm test
```

### Backend

```bash
cd backend
pytest
```

---

## 🚀 Deployment Options

### Frontend

* [Vercel](https://vercel.com)
* [Netlify](https://netlify.com)
* AWS S3 + CloudFront

### Backend

* Heroku
* AWS EC2 / ECS
* Google Cloud Platform
* DigitalOcean

---

## 🔮 Future Enhancements

* Mobile app (React Native / Flutter)
* AI-powered product recommendations
* Blockchain for supply chain transparency
* Social features & community challenges
* Integration with e-commerce platforms
* Advanced analytics dashboard

---

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit changes: `git commit -m 'Add amazing feature'`
4. Push to GitHub: `git push origin feature/amazing-feature`
5. Open a Pull Request

---

## 📄 License

This project is [MIT licensed](LICENSE). Free to use and modify.

---

## 📞 Support

For issues or feature requests, please open a GitHub issue or reach out to the development team.

---

**Made with 💚 for a more sustainable future**
