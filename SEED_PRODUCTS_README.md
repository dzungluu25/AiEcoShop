# How to Add More Products to Your Backend

Your backend comes with 20 sample products by default. Here are three ways to add more products:

## Method 1: Using REST Client (Easiest)

If you have the VS Code REST Client extension installed:

1. Open `scripts/seed-products.http`
2. Click "Send Request" on any of the POST requests to create individual products
3. Or send them all in sequence

The `.http` file contains requests for 12 additional products.

### How to install REST Client:
- VS Code: Search for "REST Client" by Huachao Gao in Extensions
- Insomnia: Use the `.http` file directly or import the requests
- Postman: Import the JSON or manually create POST requests

## Method 2: Using cURL Commands

Run these commands from your terminal (make sure backend is running on port 3000):

```bash
# Generate product ID
curl -X POST http://localhost:3000/api/products/generate-key \
  -H "Content-Type: application/json"

# Create a product (replace "21" with the generated ID)
curl -X POST http://localhost:3000/api/products/21 \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Your Product Name",
    "brand": "Brand Name",
    "description": "Product description",
    "price": 99.99,
    "maxQuantity": 50,
    "image": "https://via.placeholder.com/400x400?text=YourProduct",
    "slug": "your-product-name",
    "keywords": ["keyword1", "keyword2"],
    "sizes": [2, 4, 6, 8, 10, 12],
    "availableColors": ["#000000", "#FFFFFF"],
    "isFeatured": false,
    "isRecommended": false
  }'
```

## Method 3: Creating Products Programmatically

You can add products to your Java backend by modifying the sample data initialization in your backend code. See the backend repository: https://github.com/dzungluu25/ecommerce_backend

## Frontend Changes

Once you add products to your backend:

1. The frontend will automatically fetch and display them
2. Products appear on the homepage product grid
3. Search will find them automatically
4. Featured/Recommended flags control which products show in special sections

## Product Fields

Each product should include:

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `name` | string | Yes | Product name |
| `brand` | string | Yes | Brand/category |
| `description` | string | Yes | Product description |
| `price` | number | Yes | Price in USD |
| `maxQuantity` | number | Yes | Stock available |
| `image` | string | Yes | Image URL |
| `slug` | string | Yes | URL-friendly name |
| `keywords` | string[] | Yes | Search keywords |
| `sizes` | number[] | No | Available sizes |
| `availableColors` | string[] | Yes | Hex color codes |
| `isFeatured` | boolean | No | Shows in featured section |
| `isRecommended` | boolean | No | Shows in recommended section |

## Sample Colors

```
Black: #000000
White: #FFFFFF
Blue: #1E90FF
Red: #FF6347
Navy: #000080
Gray: #808080
Brown: #8B4513
Gold: #FFD700
Pink: #FF69B4
```

## Notes

- Image URLs can be placeholder URLs (like `https://via.placeholder.com`) or real image URLs
- Sizes are typically: [2, 4, 6, 8, 10, 12] for clothing
- For accessories, leave sizes as empty array: []
- Products are stored in-memory, so they reset when backend restarts
- For persistent storage, configure a database in your backend
