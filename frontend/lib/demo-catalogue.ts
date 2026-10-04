import type { Product } from "@/types/api";

/**
 * The catalogue the storefront falls back to when the API is unreachable.
 *
 * Generated from backend/database/seeders/ProductSeeder.php, so the demo shows
 * the same eight products a freshly seeded backend would serve. It exists
 * because the Laravel API is not hosted: Vercel's PHP runtime would not start
 * (see backend/SERVERLESS-NOTES.md), and the storefront is worth reading on its
 * own. Shipping quotes already degrade this way — see quoteShipping.
 */
export const DEMO_CATALOGUE: Product[] = [
  {
    "id": 1,
    "name": "Everyday Sling Bag",
    "slug": "everyday-sling-bag",
    "description": "A lightweight sling bag with thoughtful compartments for daily commutes and short trips.",
    "price": 249000,
    "stock": 30,
    "weight_grams": 700,
    "is_active": true,
    "images": [
      {
        "id": 1,
        "url": "https://images.unsplash.com/photo-1594223274512-ad4803739b7c?auto=format&fit=crop&w=1000&q=80",
        "alt_text": "Everyday Sling Bag",
        "sort_order": 0
      }
    ]
  },
  {
    "id": 2,
    "name": "Desk Organizer Set",
    "slug": "desk-organizer-set",
    "description": "A minimalist desk organizer for pens, cables, and small accessories.",
    "price": 159000,
    "stock": 42,
    "weight_grams": 900,
    "is_active": true,
    "images": [
      {
        "id": 2,
        "url": "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=1000&q=80",
        "alt_text": "Desk Organizer Set",
        "sort_order": 0
      }
    ]
  },
  {
    "id": 3,
    "name": "Travel Tumbler",
    "slug": "travel-tumbler",
    "description": "600ml stainless steel tumbler with double-wall insulation for hot and cold drinks on the move.",
    "price": 189000,
    "stock": 55,
    "weight_grams": 500,
    "is_active": true,
    "images": [
      {
        "id": 3,
        "url": "https://images.unsplash.com/photo-1602143407151-7111542de6e8?auto=format&fit=crop&w=1000&q=80",
        "alt_text": "Travel Tumbler",
        "sort_order": 0
      }
    ]
  },
  {
    "id": 4,
    "name": "Linen Throw Blanket",
    "slug": "linen-throw-blanket",
    "description": "Stone-washed linen blanket woven on traditional looms. Lightweight in summer, layered in winter.",
    "price": 685000,
    "stock": 12,
    "weight_grams": 1200,
    "is_active": true,
    "images": [
      {
        "id": 4,
        "url": "https://images.unsplash.com/photo-1581539250439-c96689b516dd?auto=format&fit=crop&w=1000&q=80",
        "alt_text": "Linen Throw Blanket",
        "sort_order": 0
      }
    ]
  },
  {
    "id": 5,
    "name": "Ceramic Pour-Over",
    "slug": "ceramic-pour-over",
    "description": "A hand-thrown ceramic dripper for single-cup pour-over coffee. Holds standard size 02 filters.",
    "price": 145000,
    "stock": 24,
    "weight_grams": 540,
    "is_active": true,
    "images": [
      {
        "id": 5,
        "url": "https://images.unsplash.com/photo-1521017432531-fbd92d768814?auto=format&fit=crop&w=1000&q=80",
        "alt_text": "Ceramic Pour-Over",
        "sort_order": 0
      }
    ]
  },
  {
    "id": 6,
    "name": "Rattan Pendant Lamp",
    "slug": "rattan-pendant-lamp",
    "description": "Hand-bent rattan pendant lamp with warm diffused light. Pairs nicely with reading nooks.",
    "price": 580000,
    "stock": 7,
    "weight_grams": 1400,
    "is_active": true,
    "images": [
      {
        "id": 6,
        "url": "https://images.unsplash.com/photo-1513506003901-1e6a229e2d15?auto=format&fit=crop&w=1000&q=80",
        "alt_text": "Rattan Pendant Lamp",
        "sort_order": 0
      }
    ]
  },
  {
    "id": 7,
    "name": "Single Origin Coffee 200g",
    "slug": "single-origin-coffee-200g",
    "description": "Naturally processed single origin from highland farms. Notes of berries, brown sugar, and dried apricot.",
    "price": 95000,
    "stock": 38,
    "weight_grams": 220,
    "is_active": true,
    "images": [
      {
        "id": 7,
        "url": "https://images.unsplash.com/photo-1559056199-641a0ac8b55e?auto=format&fit=crop&w=1000&q=80",
        "alt_text": "Single Origin Coffee 200g",
        "sort_order": 0
      }
    ]
  },
  {
    "id": 8,
    "name": "Hand-Woven Tote",
    "slug": "hand-woven-tote",
    "description": "A roomy tote woven by hand from natural pandan leaves. Holds a 14-inch laptop comfortably.",
    "price": 320000,
    "stock": 9,
    "weight_grams": 350,
    "is_active": true,
    "images": [
      {
        "id": 8,
        "url": "https://images.unsplash.com/photo-1622560480654-d96214fdc887?auto=format&fit=crop&w=1000&q=80",
        "alt_text": "Hand-Woven Tote",
        "sort_order": 0
      }
    ]
  }
];
