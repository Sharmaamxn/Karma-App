from fastapi import FastAPI, APIRouter, HTTPException, Depends
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field
from typing import List, Optional
import uuid
from datetime import datetime
from enum import Enum


ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# Create the main app without a prefix
app = FastAPI()

# Create a router with the /api prefix
api_router = APIRouter(prefix="/api")

# Enums for ethical categories
class EthicalCategory(str, Enum):
    ORGANIC = "organic"
    FAIR_TRADE = "fair_trade"
    SUSTAINABLE = "sustainable"
    ECO_FRIENDLY = "eco_friendly"
    CARBON_NEUTRAL = "carbon_neutral"

# Define Models
class StatusCheck(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    client_name: str
    timestamp: datetime = Field(default_factory=datetime.utcnow)

class StatusCheckCreate(BaseModel):
    client_name: str

class EthicalBadge(BaseModel):
    category: EthicalCategory
    score: int = Field(ge=0, le=100)  # 0-100 ethical score
    description: str

class Product(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str
    price: float
    original_price: Optional[float] = None
    description: str
    image_url: str
    category: str
    ethical_badges: List[EthicalBadge] = []
    karma_points: int = 0  # Points earned for purchasing
    sustainability_score: int = Field(ge=0, le=100)
    carbon_footprint: str  # e.g., "Low", "Medium", "High"
    alternatives: List[str] = []  # IDs of alternative products
    created_at: datetime = Field(default_factory=datetime.utcnow)

class ProductCreate(BaseModel):
    name: str
    price: float
    original_price: Optional[float] = None
    description: str
    image_url: str
    category: str
    ethical_badges: List[EthicalBadge] = []
    karma_points: int = 0
    sustainability_score: int = Field(ge=0, le=100)
    carbon_footprint: str
    alternatives: List[str] = []

class User(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    email: str
    name: str
    karma_points: int = 0
    total_impact_score: int = 0
    purchases: List[str] = []  # Product IDs
    created_at: datetime = Field(default_factory=datetime.utcnow)

class UserCreate(BaseModel):
    email: str
    name: str

class KarmaAction(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    user_id: str
    action_type: str  # "purchase", "review", "referral"
    product_id: Optional[str] = None
    points_earned: int
    description: str
    timestamp: datetime = Field(default_factory=datetime.utcnow)

# Mock data for initial demo
MOCK_PRODUCTS = [
    {
        "name": "Organic Pineapple Juice",
        "price": 4.99,
        "original_price": 5.99,
        "description": "100% organic pineapple juice with no added sugars or preservatives",
        "image_url": "https://images.unsplash.com/photo-1525904097878-94fb15835963?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NDk1Nzh8MHwxfHNlYXJjaHwxfHxvcmdhbmljJTIwcHJvZHVjdHN8ZW58MHx8fHwxNzUyNDc2MDczfDA&ixlib=rb-4.1.0&q=85",
        "category": "Beverages",
        "ethical_badges": [
            {"category": "organic", "score": 95, "description": "USDA Organic certified"},
            {"category": "sustainable", "score": 85, "description": "Sustainable packaging"}
        ],
        "karma_points": 50,
        "sustainability_score": 90,
        "carbon_footprint": "Low",
        "alternatives": []
    },
    {
        "name": "Organic Fresh Fruit Mix",
        "price": 8.99,
        "original_price": 12.99,
        "description": "Fresh organic fruits including apples, oranges, and seasonal selections",
        "image_url": "https://images.unsplash.com/photo-1490818387583-1baba5e638af?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NDk1Nzh8MHwxfHNlYXJjaHwyfHxvcmdhbmljJTIwcHJvZHVjdHN8ZW58MHx8fHwxNzUyNDc2MDczfDA&ixlib=rb-4.1.0&q=85",
        "category": "Produce",
        "ethical_badges": [
            {"category": "organic", "score": 92, "description": "Organic certified produce"},
            {"category": "fair_trade", "score": 78, "description": "Fair trade sourcing"}
        ],
        "karma_points": 75,
        "sustainability_score": 88,
        "carbon_footprint": "Low",
        "alternatives": []
    },
    {
        "name": "Sustainable Glass Storage Jars",
        "price": 24.99,
        "original_price": 29.99,
        "description": "Eco-friendly glass storage jars for zero-waste kitchen organization",
        "image_url": "https://images.unsplash.com/photo-1592178036182-5400889dfc74?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NDQ2Mzl8MHwxfHNlYXJjaHwxfHxzdXN0YWluYWJsZSUyMGdvb2RzfGVufDB8fHx8MTc1MjQ3NjA4MHww&ixlib=rb-4.1.0&q=85",
        "category": "Home & Kitchen",
        "ethical_badges": [
            {"category": "sustainable", "score": 96, "description": "Recyclable glass material"},
            {"category": "eco_friendly", "score": 89, "description": "Reduces plastic waste"}
        ],
        "karma_points": 100,
        "sustainability_score": 95,
        "carbon_footprint": "Medium",
        "alternatives": []
    },
    {
        "name": "Fair Trade Coffee Beans",
        "price": 14.99,
        "original_price": 18.99,
        "description": "Premium fair trade coffee beans directly sourced from small farmers",
        "image_url": "https://images.unsplash.com/photo-1722962883780-8806c3ab546b?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NDQ2NDN8MHwxfHNlYXJjaHwyfHxmYWlyJTIwdHJhZGV8ZW58MHx8fHwxNzUyNDc2MDg4fDA&ixlib=rb-4.1.0&q=85",
        "category": "Beverages",
        "ethical_badges": [
            {"category": "fair_trade", "score": 98, "description": "Fair Trade certified"},
            {"category": "organic", "score": 87, "description": "Organic farming practices"}
        ],
        "karma_points": 85,
        "sustainability_score": 92,
        "carbon_footprint": "Medium",
        "alternatives": []
    },
    {
        "name": "Organic Superfood Ingredients",
        "price": 19.99,
        "original_price": 24.99,
        "description": "Organic superfoods including chia seeds, quinoa, and goji berries",
        "image_url": "https://images.pexels.com/photos/7796170/pexels-photo-7796170.jpeg",
        "category": "Health & Wellness",
        "ethical_badges": [
            {"category": "organic", "score": 94, "description": "Certified organic ingredients"},
            {"category": "sustainable", "score": 82, "description": "Sustainable sourcing"}
        ],
        "karma_points": 65,
        "sustainability_score": 87,
        "carbon_footprint": "Low",
        "alternatives": []
    },
    {
        "name": "Eco-Friendly Cleaning Products",
        "price": 16.99,
        "original_price": 21.99,
        "description": "Natural cleaning products with biodegradable ingredients",
        "image_url": "https://images.pexels.com/photos/3889827/pexels-photo-3889827.jpeg",
        "category": "Home & Garden",
        "ethical_badges": [
            {"category": "eco_friendly", "score": 91, "description": "Biodegradable formula"},
            {"category": "sustainable", "score": 86, "description": "Recyclable packaging"}
        ],
        "karma_points": 70,
        "sustainability_score": 89,
        "carbon_footprint": "Low",
        "alternatives": []
    },
    {
        "name": "Sustainable Bamboo Products",
        "price": 12.99,
        "original_price": 15.99,
        "description": "Bamboo kitchen utensils and accessories - plastic-free alternative",
        "image_url": "https://images.pexels.com/photos/8297200/pexels-photo-8297200.jpeg",
        "category": "Home & Kitchen",
        "ethical_badges": [
            {"category": "sustainable", "score": 97, "description": "Renewable bamboo material"},
            {"category": "carbon_neutral", "score": 88, "description": "Carbon-neutral production"}
        ],
        "karma_points": 80,
        "sustainability_score": 93,
        "carbon_footprint": "Very Low",
        "alternatives": []
    },
    {
        "name": "Fair Trade Organic Chocolate",
        "price": 6.99,
        "original_price": 8.99,
        "description": "Premium organic chocolate bar from fair trade certified cocoa farms",
        "image_url": "https://images.unsplash.com/photo-1722962814429-1a0fc7a50675?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NDQ2NDN8MHwxfHNlYXJjaHwzfHxmYWlyJTIwdHJhZGV8ZW58MHx8fHwxNzUyNDc2MDg4fDA&ixlib=rb-4.1.0&q=85",
        "category": "Food & Snacks",
        "ethical_badges": [
            {"category": "fair_trade", "score": 96, "description": "Fair trade certified cocoa"},
            {"category": "organic", "score": 90, "description": "Organic ingredients"}
        ],
        "karma_points": 60,
        "sustainability_score": 91,
        "carbon_footprint": "Medium",
        "alternatives": []
    }
]

# Initialize database with mock data
async def init_mock_data():
    """Initialize the database with mock products if empty"""
    try:
        # Check if products collection is empty
        product_count = await db.products.count_documents({})
        if product_count == 0:
            # Insert mock products
            for product_data in MOCK_PRODUCTS:
                product = Product(**product_data)
                await db.products.insert_one(product.dict())
            print("Mock data initialized successfully")
    except Exception as e:
        print(f"Error initializing mock data: {e}")

# Add your routes to the router instead of directly to app
@api_router.get("/")
async def root():
    return {"message": "Ethical Shopping Karma API"}

@api_router.post("/status", response_model=StatusCheck)
async def create_status_check(input: StatusCheckCreate):
    status_dict = input.dict()
    status_obj = StatusCheck(**status_dict)
    _ = await db.status_checks.insert_one(status_obj.dict())
    return status_obj

@api_router.get("/status", response_model=List[StatusCheck])
async def get_status_checks():
    status_checks = await db.status_checks.find().to_list(1000)
    return [StatusCheck(**status_check) for status_check in status_checks]

# Product endpoints
@api_router.get("/products", response_model=List[Product])
async def get_products():
    """Get all products"""
    await init_mock_data()  # Initialize mock data if needed
    products = await db.products.find().to_list(1000)
    return [Product(**product) for product in products]

@api_router.get("/products/{product_id}", response_model=Product)
async def get_product(product_id: str):
    """Get a specific product by ID"""
    product = await db.products.find_one({"id": product_id})
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    return Product(**product)

@api_router.post("/products", response_model=Product)
async def create_product(product_data: ProductCreate):
    """Create a new product"""
    product = Product(**product_data.dict())
    await db.products.insert_one(product.dict())
    return product

@api_router.get("/products/category/{category}")
async def get_products_by_category(category: str):
    """Get products by category"""
    products = await db.products.find({"category": category}).to_list(1000)
    return [Product(**product) for product in products]

# User endpoints
@api_router.post("/users", response_model=User)
async def create_user(user_data: UserCreate):
    """Create a new user"""
    # Check if user already exists
    existing_user = await db.users.find_one({"email": user_data.email})
    if existing_user:
        raise HTTPException(status_code=400, detail="User already exists")
    
    user = User(**user_data.dict())
    await db.users.insert_one(user.dict())
    return user

@api_router.get("/users/{user_id}", response_model=User)
async def get_user(user_id: str):
    """Get user by ID"""
    user = await db.users.find_one({"id": user_id})
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return User(**user)

@api_router.post("/users/{user_id}/karma")
async def add_karma_points(user_id: str, points: int, description: str):
    """Add karma points to a user"""
    # Update user's karma points
    result = await db.users.update_one(
        {"id": user_id},
        {"$inc": {"karma_points": points, "total_impact_score": points}}
    )
    
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="User not found")
    
    # Log the karma action
    karma_action = KarmaAction(
        user_id=user_id,
        action_type="manual",
        points_earned=points,
        description=description
    )
    await db.karma_actions.insert_one(karma_action.dict())
    
    return {"message": "Karma points added successfully"}

@api_router.get("/users/{user_id}/karma-history")
async def get_karma_history(user_id: str):
    """Get karma history for a user"""
    karma_actions = await db.karma_actions.find({"user_id": user_id}).to_list(1000)
    return [KarmaAction(**action) for action in karma_actions]

# Include the router in the main app
app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

@app.on_event("startup")
async def startup_event():
    """Initialize mock data on startup"""
    await init_mock_data()

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()