"use client";
import React, { useRef, useState } from "react";
import { motion, useInView } from "framer-motion";
import { useCart } from "./Cartcontext";
// ── Fonts ────────────────────────────────────────────────────────────────────
const FontLoader = () => (
  <style>{`
    @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=Plus+Jakarta+Sans:wght@300;400;500;600&display=swap');
    .menu-scroll::-webkit-scrollbar { display: none; }
  `}</style>
);

// ── All category menu data ────────────────────────────────────────────────────
const MENU_DATA: Record<
  number,
  {
    name: string;
    emoji: string;
    subtitle: string;
    tagline: string;
    countLabel: string;
    dietLabel: string;
    footerTags: string[];
    items: {
      id: number;
      code: string;
      name: string;
      price: string;
      tag: string;
      veg: boolean;
      spice: number;
      img: string;
      description: string;
      toppings: string[];
    }[];
  }
> = {
  // ── 1. Pizza ─────────────────────────────────────────────────────────────
  1: {
    name: "Pizza",
    emoji: "🍕",
    subtitle:
      "Six hand-crafted pies, each one built for the campus life. Stone-baked fresh, every single day.",
    tagline: "Stone-baked Daily",
    countLabel: "🍕 6 varieties",
    dietLabel: "All veg",
    footerTags: ["🍕 Stone-baked Daily", "🌱 100% Veg", "⚡ Ready in 12 min"],
    items: [
      {
        id: 1,
        code: "PI.01",
        name: "Margherita Classic",
        price: "₹199",
        tag: "Best Seller",
        veg: true,
        spice: 1,
        img: "https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=500&q=80",
        description:
          "San Marzano tomato base, fresh mozzarella, hand-torn basil. The OG that never misses — simple but iconic.",
        toppings: ["Mozzarella", "Basil", "Tomato"],
      },
      {
        id: 2,
        code: "PI.02",
        name: "Spicy Paneer",
        price: "₹229",
        tag: "Campus Fav",
        veg: true,
        spice: 3,
        img: "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=500&q=80",
        description:
          "Chilli-marinated paneer cubes, capsicum, onion rings, and a sriracha drizzle. For when you need a kick.",
        toppings: ["Paneer", "Capsicum", "Sriracha"],
      },
      {
        id: 3,
        code: "PI.03",
        name: "Farmhouse Loaded",
        price: "₹249",
        tag: "Power Meal",
        veg: true,
        spice: 2,
        img: "https://images.unsplash.com/photo-1513104890138-7c749659a591?w=500&q=80",
        description:
          "Mushrooms, corn, bell peppers, black olives, onions — loaded like your semester schedule. Thick crust, big flavour.",
        toppings: ["Mushroom", "Corn", "Olives"],
      },
      {
        id: 4,
        code: "PI.04",
        name: "BBQ Chickpea",
        price: "₹219",
        tag: "Vegan",
        veg: true,
        spice: 2,
        img: "https://images.unsplash.com/photo-1528137871618-79d2761e3fd5?w=500&q=80",
        description:
          "Smoky BBQ base, spiced chickpeas, caramelised onions, jalapeños. Plant-based and still the most filling slice.",
        toppings: ["Chickpea", "BBQ Sauce", "Jalapeño"],
      },
      {
        id: 5,
        code: "PI.05",
        name: "Pesto Verde",
        price: "₹239",
        tag: "Chef's Pick",
        veg: true,
        spice: 1,
        img: "https://images.unsplash.com/photo-1571407970349-bc81e7e96d47?w=500&q=80",
        description:
          "House basil pesto, sun-dried tomatoes, baby spinach, crumbled feta. Light, fresh, and actually good for you.",
        toppings: ["Pesto", "Feta", "Spinach"],
      },
      {
        id: 6,
        code: "PI.06",
        name: "Double Cheese Bomb",
        price: "₹269",
        tag: "Indulgent",
        veg: true,
        spice: 1,
        img: "https://images.unsplash.com/photo-1593560708920-61dd98c46a4e?w=500&q=80",
        description:
          "Four-cheese blend: mozzarella, cheddar, gouda, parmesan. Stuffed crust. No regrets. Only cheese pulls.",
        toppings: ["Mozzarella", "Cheddar", "Gouda"],
      },
    ],
  },

  // ── 2. Burger ────────────────────────────────────────────────────────────
  2: {
    name: "Burger",
    emoji: "🍔",
    subtitle:
      "Eight stacked, saucy, juicy patties. Every bite is a proper study-break moment — built to fill you up.",
    tagline: "Grilled Fresh",
    countLabel: "🍔 8 varieties",
    dietLabel: "Veg & Non-veg",
    footerTags: [
      "🍔 Grilled to Order",
      "🔥 Double Patty Options",
      "⚡ Ready in 10 min",
    ],
    items: [
      {
        id: 1,
        code: "BU.01",
        name: "Smash Double",
        price: "₹189",
        tag: "Best Seller",
        veg: false,
        spice: 2,
        img: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=500&q=80",
        description:
          "Two smash patties, American cheese, pickles, onion, special sauce. The classic done right — crispy edges, juicy centre.",
        toppings: ["Cheese", "Pickles", "Special Sauce"],
      },
      {
        id: 2,
        code: "BU.02",
        name: "Crispy Paneer",
        price: "₹169",
        tag: "Campus Fav",
        veg: true,
        spice: 2,
        img: "https://images.unsplash.com/photo-1550547660-d9450f859349?w=500&q=80",
        description:
          "Golden-fried paneer patty, chipotle mayo, coleslaw, lettuce. Crunchy outside, soft inside — a true campus legend.",
        toppings: ["Paneer", "Chipotle Mayo", "Coleslaw"],
      },
      {
        id: 3,
        code: "BU.03",
        name: "Mushroom Swiss",
        price: "₹179",
        tag: "Chef's Pick",
        veg: true,
        spice: 1,
        img: "https://images.unsplash.com/photo-1520072959219-c595dc870360?w=500&q=80",
        description:
          "Sautéed mushrooms, melted Swiss cheese, caramelised onions, garlic aioli. Earthy, rich, and deeply satisfying.",
        toppings: ["Mushroom", "Swiss Cheese", "Aioli"],
      },
      {
        id: 4,
        code: "BU.04",
        name: "Spicy Ghost",
        price: "₹199",
        tag: "Fiery",
        veg: false,
        spice: 3,
        img: "https://images.unsplash.com/photo-1598935898639-81586f7d2129?w=500&q=80",
        description:
          "Ghost pepper sauce, jalapeños, pepper jack cheese, sriracha slaw. Not for the faint-hearted. Respect the heat.",
        toppings: ["Ghost Pepper", "Jalapeño", "Sriracha Slaw"],
      },
      {
        id: 5,
        code: "BU.05",
        name: "BBQ Tower",
        price: "₹209",
        tag: "Indulgent",
        veg: false,
        spice: 2,
        img: "https://images.unsplash.com/photo-1553979459-d2229ba7433b?w=500&q=80",
        description:
          "Smoky BBQ glaze, onion rings, cheddar, pickled cucumber. Tall, messy, outrageously good. Bring napkins.",
        toppings: ["BBQ Glaze", "Onion Rings", "Cheddar"],
      },
      {
        id: 6,
        code: "BU.06",
        name: "Garden Delight",
        price: "₹159",
        tag: "Vegan",
        veg: true,
        spice: 1,
        img: "https://images.unsplash.com/photo-1585238342024-78d387f4a707?w=500&q=80",
        description:
          "Black bean & oat patty, avocado spread, tomato, lettuce, mustard. Clean, green, and surprisingly filling.",
        toppings: ["Black Bean", "Avocado", "Mustard"],
      },
      {
        id: 7,
        code: "BU.07",
        name: "Truffle Shroom",
        price: "₹219",
        tag: "Premium",
        veg: true,
        spice: 1,
        img: "https://images.unsplash.com/photo-1561758033-d89a9ad46330?w=500&q=80",
        description:
          "Truffle oil–tossed portobello, brie, rocket, caramelised onions. Campus's most sophisticated burger. Period.",
        toppings: ["Truffle Oil", "Brie", "Rocket"],
      },
      {
        id: 8,
        code: "BU.08",
        name: "Classic Veg",
        price: "₹149",
        tag: "Student Deal",
        veg: true,
        spice: 1,
        img: "https://images.unsplash.com/photo-1571091718767-18b5b1457add?w=500&q=80",
        description:
          "Aloo-veggie patty, ketchup, mustard, fresh onion, tomato. Simple, honest, pocket-friendly. The everyday go-to.",
        toppings: ["Aloo Patty", "Ketchup", "Tomato"],
      },
    ],
  },

  // ── 3. Sandwich ──────────────────────────────────────────────────────────
  3: {
    name: "Sandwich",
    emoji: "🥪",
    subtitle:
      "Ten fresh-stacked sandwiches on seeded bread, house sauces, and fillings that mean business.",
    tagline: "Fresh Every Hour",
    countLabel: "🥪 10 varieties",
    dietLabel: "Mix of veg & non-veg",
    footerTags: ["🥪 Made to Order", "🌿 Fresh Fillings", "⚡ Ready in 5 min"],
    items: [
      {
        id: 1,
        code: "SA.01",
        name: "Club Crunch",
        price: "₹149",
        tag: "Best Seller",
        veg: false,
        spice: 1,
        img: "https://images.unsplash.com/photo-1528735602780-2552fd46c7af?w=500&q=80",
        description:
          "Triple-decker with lettuce, tomato, cheese, and house mayo. The triple threat of lunchtime sandwiches.",
        toppings: ["Cheese", "Lettuce", "House Mayo"],
      },
      {
        id: 2,
        code: "SA.02",
        name: "Bombay Masala",
        price: "₹129",
        tag: "Campus Fav",
        veg: true,
        spice: 2,
        img: "https://images.unsplash.com/photo-1509722747041-616f39b57ef3?w=500&q=80",
        description:
          "Spiced potato filling, green chutney, cheese, toasted on a griddle. Nostalgia in every bite — tastes like home.",
        toppings: ["Potato", "Green Chutney", "Cheese"],
      },
      {
        id: 3,
        code: "SA.03",
        name: "Pesto Caprese",
        price: "₹159",
        tag: "Chef's Pick",
        veg: true,
        spice: 1,
        img: "https://images.unsplash.com/photo-1553909489-cd47e0907980?w=500&q=80",
        description:
          "Basil pesto, fresh mozzarella, sun-dried tomatoes, baby spinach. Italian soul packed in a ciabatta.",
        toppings: ["Pesto", "Mozzarella", "Sun-dried Tomato"],
      },
      {
        id: 4,
        code: "SA.04",
        name: "Sriracha Corn",
        price: "₹139",
        tag: "Fiery",
        veg: true,
        spice: 3,
        img: "https://images.unsplash.com/photo-1539252554453-80ab65ce3586?w=500&q=80",
        description:
          "Sriracha-tossed sweet corn, pickled onions, cream cheese, crispy lettuce. Hot, creamy, and totally addictive.",
        toppings: ["Sweet Corn", "Cream Cheese", "Pickled Onion"],
      },
      {
        id: 5,
        code: "SA.05",
        name: "Avocado Crunch",
        price: "₹169",
        tag: "Trending",
        veg: true,
        spice: 1,
        img: "https://images.unsplash.com/photo-1565299507177-b0ac66763828?w=500&q=80",
        description:
          "Smashed avocado, cucumber ribbons, feta, lemon zest, micro-herbs. Light, clean, and worth every rupee.",
        toppings: ["Avocado", "Feta", "Cucumber"],
      },
      {
        id: 6,
        code: "SA.06",
        name: "Desi Paneer Grill",
        price: "₹149",
        tag: "Spicy",
        veg: true,
        spice: 3,
        img: "https://images.unsplash.com/photo-1485963631004-f2f00b1d6606?w=500&q=80",
        description:
          "Tandoori-spiced paneer, mint chutney, red onions, peppers on grilled whole wheat. Bold, desi, and deeply satisfying.",
        toppings: ["Tandoori Paneer", "Mint Chutney", "Red Onion"],
      },
    ],
  },

  // ── 4. Dosa ──────────────────────────────────────────────────────────────
  4: {
    name: "Dosa",
    emoji: "🫓",
    subtitle:
      "Crispy golden dosas straight off the tawa, with authentic sambar and chutneys that feel like home.",
    tagline: "Straight Off the Tawa",
    countLabel: "🫓 6 varieties",
    dietLabel: "All veg",
    footerTags: ["🫓 Fresh off Tawa", "🌱 100% Veg", "⚡ Ready in 8 min"],
    items: [
      {
        id: 1,
        code: "DO.01",
        name: "Masala Dosa",
        price: "₹99",
        tag: "Best Seller",
        veg: true,
        spice: 2,
        img: "https://images.unsplash.com/photo-1630383249896-424e482df921?w=500&q=80",
        description:
          "Classic crispy dosa stuffed with spiced potato masala. Served with tomato chutney, coconut chutney & sambar.",
        toppings: ["Potato Masala", "Coconut Chutney", "Sambar"],
      },
      {
        id: 2,
        code: "DO.02",
        name: "Plain Dosa",
        price: "₹79",
        tag: "Student Deal",
        veg: true,
        spice: 1,
        img: "https://images.unsplash.com/photo-1589301760014-d929f3979dbc?w=500&q=80",
        description:
          "Thin, golden, perfectly crispy plain dosa. Dip it in sambar, smear with butter — purist perfection.",
        toppings: ["Butter", "Sambar", "Coconut Chutney"],
      },
      {
        id: 3,
        code: "DO.03",
        name: "Paneer Dosa",
        price: "₹129",
        tag: "Campus Fav",
        veg: true,
        spice: 2,
        img: "https://images.unsplash.com/photo-1601050690597-df0568f70950?w=500&q=80",
        description:
          "Dosa stuffed with spiced paneer bhurji, onions, green chilli. Protein-packed and absolutely campus-approved.",
        toppings: ["Paneer Bhurji", "Green Chilli", "Onion"],
      },
      {
        id: 4,
        code: "DO.04",
        name: "Mysore Masala",
        price: "₹109",
        tag: "Spicy",
        veg: true,
        spice: 3,
        img: "https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=500&q=80",
        description:
          "Red chilli chutney spread inside, loaded with potato masala. Mysore-style heat that wakes you up better than coffee.",
        toppings: ["Red Chilli Chutney", "Potato Masala", "Ghee"],
      },
      {
        id: 5,
        code: "DO.05",
        name: "Onion Rava Dosa",
        price: "₹119",
        tag: "Crispy Special",
        veg: true,
        spice: 1,
        img: "https://images.unsplash.com/photo-1567188040759-fb8a883dc6d8?w=500&q=80",
        description:
          "Semolina dosa loaded with caramelised onions, curry leaves, and cumin. Thin, lacy, and satisfyingly crisp.",
        toppings: ["Semolina", "Onion", "Curry Leaves"],
      },
      {
        id: 6,
        code: "DO.06",
        name: "Cheese Dosa",
        price: "₹139",
        tag: "Indulgent",
        veg: true,
        spice: 1,
        img: "https://images.unsplash.com/photo-1606491956689-2ea866880c84?w=500&q=80",
        description:
          "Generous cheddar melt over masala-filled dosa, finished with a butter drizzle. Where South India meets cheese heaven.",
        toppings: ["Cheddar", "Potato Masala", "Butter"],
      },
    ],
  },

  // ── 5. Pasta ─────────────────────────────────────────────────────────────
  5: {
    name: "Pasta",
    emoji: "🍝",
    subtitle:
      "Seven proper pasta dishes — sauced right, cooked al dente, and priced for real student budgets.",
    tagline: "Al Dente Always",
    countLabel: "🍝 7 varieties",
    dietLabel: "All veg",
    footerTags: ["🍝 Cooked Al Dente", "🌱 100% Veg", "⚡ Ready in 15 min"],
    items: [
      {
        id: 1,
        code: "PA.01",
        name: "Penne Arrabbiata",
        price: "₹179",
        tag: "Best Seller",
        veg: true,
        spice: 3,
        img: "https://images.unsplash.com/photo-1563379926898-05f4575a45d8?w=500&q=80",
        description:
          "Spicy San Marzano tomato sauce, garlic, red chilli flakes, fresh parsley. Fiery Italian — no apologies.",
        toppings: ["Tomato Sauce", "Chilli Flakes", "Garlic"],
      },
      {
        id: 2,
        code: "PA.02",
        name: "Creamy Alfredo",
        price: "₹199",
        tag: "Crowd Pleaser",
        veg: true,
        spice: 1,
        img: "https://images.unsplash.com/photo-1621996346565-e3dbc646d9a9?w=500&q=80",
        description:
          "Fettuccine in rich parmesan cream sauce, black pepper, butter. Indulgent, comforting, and dangerously moreish.",
        toppings: ["Parmesan", "Cream", "Black Pepper"],
      },
      {
        id: 3,
        code: "PA.03",
        name: "Pink Sauce Pasta",
        price: "₹189",
        tag: "Campus Fav",
        veg: true,
        spice: 2,
        img: "https://images.unsplash.com/photo-1612874742237-6526221588e3?w=500&q=80",
        description:
          "Blush tomato cream sauce, garlic, herbs, mozzarella. The best of red and white — creamy without being heavy.",
        toppings: ["Tomato Cream", "Mozzarella", "Herbs"],
      },
      {
        id: 4,
        code: "PA.04",
        name: "Pesto Fusilli",
        price: "₹185",
        tag: "Chef's Pick",
        veg: true,
        spice: 1,
        img: "https://images.unsplash.com/photo-1473093226795-af9932fe5856?w=500&q=80",
        description:
          "House basil pesto, sun-dried tomatoes, toasted pine nuts, parmesan shavings. Bright, herbaceous, and utterly fresh.",
        toppings: ["Basil Pesto", "Pine Nuts", "Sun-dried Tomato"],
      },
      {
        id: 5,
        code: "PA.05",
        name: "Aglio e Olio",
        price: "₹159",
        tag: "Minimalist",
        veg: true,
        spice: 2,
        img: "https://images.unsplash.com/photo-1551183053-bf91798d792b?w=500&q=80",
        description:
          "Spaghetti, EVOO, garlic chips, chilli, fresh parsley. Proof that great pasta needs almost nothing at all.",
        toppings: ["EVOO", "Garlic", "Chilli"],
      },
      {
        id: 6,
        code: "PA.06",
        name: "Mushroom Truffle",
        price: "₹219",
        tag: "Premium",
        veg: true,
        spice: 1,
        img: "https://images.unsplash.com/photo-1559847844-5315695dadae?w=500&q=80",
        description:
          "Mixed wild mushrooms, truffle oil, thyme, parmesan cream. The most indulgent thing on the menu — it shows.",
        toppings: ["Wild Mushroom", "Truffle Oil", "Parmesan"],
      },
      {
        id: 7,
        code: "PA.07",
        name: "Spinach Ricotta",
        price: "₹195",
        tag: "Healthy Pick",
        veg: true,
        spice: 1,
        img: "https://images.unsplash.com/photo-1645112411341-6c4fd023714a?w=500&q=80",
        description:
          "Baby spinach, creamy ricotta, garlic, lemon zest, toasted walnuts. Light enough to eat before a lecture.",
        toppings: ["Ricotta", "Baby Spinach", "Walnuts"],
      },
    ],
  },

  // ── 6. Mojito ────────────────────────────────────────────────────────────
  6: {
    name: "Mojito",
    emoji: "🍹",
    subtitle:
      "Five ice-cold, fresh-mint virgin mojitos. Your post-class ritual — sip slow, decompress faster.",
    tagline: "Ice-Cold Always",
    countLabel: "🍹 5 varieties",
    dietLabel: "All virgin",
    footerTags: [
      "🍹 Fresh Mint Daily",
      "🧊 Extra Ice on Ask",
      "⚡ Ready in 3 min",
    ],
    items: [
      {
        id: 1,
        code: "MO.01",
        name: "Classic Mint",
        price: "₹89",
        tag: "Best Seller",
        veg: true,
        spice: 0,
        img: "https://images.unsplash.com/photo-1551538827-9c037cb4f32a?w=500&q=80",
        description:
          "Fresh mint, lime juice, sugar syrup, soda, crushed ice. The original that started it all — clean and perfect.",
        toppings: ["Fresh Mint", "Lime", "Soda"],
      },
      {
        id: 2,
        code: "MO.02",
        name: "Strawberry Bliss",
        price: "₹109",
        tag: "Campus Fav",
        veg: true,
        spice: 0,
        img: "https://images.unsplash.com/photo-1587888637140-849b25f29770?w=500&q=80",
        description:
          "Fresh strawberry purée, mint, lime, soda. Sweet-tart, blush-pink, and Instagram-worthy. Tastes like summer.",
        toppings: ["Strawberry", "Mint", "Lime"],
      },
      {
        id: 3,
        code: "MO.03",
        name: "Blueberry Burst",
        price: "₹109",
        tag: "Trending",
        veg: true,
        spice: 0,
        img: "https://images.unsplash.com/photo-1534353473418-4cfa787261e4?w=500&q=80",
        description:
          "Muddled blueberries, mint, lemon, soda. Deep purple, refreshingly tart, and loaded with antioxidants. Basically healthy.",
        toppings: ["Blueberry", "Mint", "Lemon"],
      },
      {
        id: 4,
        code: "MO.04",
        name: "Watermelon Chill",
        price: "₹99",
        tag: "Summer Special",
        veg: true,
        spice: 0,
        img: "https://images.unsplash.com/photo-1497534446932-c925b458314e?w=500&q=80",
        description:
          "Watermelon juice, mint, lime, hint of jeera salt, soda. Light, hydrating, and made for hot campus afternoons.",
        toppings: ["Watermelon", "Mint", "Jeera Salt"],
      },
      {
        id: 5,
        code: "MO.05",
        name: "Mango Tango",
        price: "₹119",
        tag: "Mango Season",
        veg: true,
        spice: 0,
        img: "https://images.unsplash.com/photo-1561758033-7e924f619b47?w=500&q=80",
        description:
          "Alphonso mango pulp, mint, lime, soda, pinch of chilli. Tropical, sweet, slightly spicy. Pure summer in a glass.",
        toppings: ["Mango Pulp", "Mint", "Chilli"],
      },
    ],
  },
};

// ── Spice indicator ───────────────────────────────────────────────────────────
function SpiceLevel({ level }: { level: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3].map((i) => (
        <div
          key={i}
          className="w-1.5 h-1.5 rounded-full"
          style={{
            backgroundColor: i <= level ? "#D94B4B" : "rgba(232,225,207,0.2)",
          }}
        />
      ))}
    </div>
  );
}

// ── Menu item card (unchanged UI) ─────────────────────────────────────────────
type MenuItem = (typeof MENU_DATA)[1]["items"][0];

/*function MenuCard({ item, index }: { item: MenuItem; index: number }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-40px 0px" });
  const [hovered, setHovered] = useState(false);*/
function MenuCard({
  item,
  index,
  categoryId,
  categoryName,
  onOpenCart,
}: {
  item: MenuItem;
  index: number;
  categoryId: number;
  categoryName: string;
  onOpenCart?: () => void;
}) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-40px 0px" });
  const [hovered, setHovered] = useState(false);
  const [added, setAdded] = useState(false);
  const { addItem, items } = useCart();

  // Derive the numeric price from the "₹199" string
  const numericPrice = parseInt(item.price.replace("₹", ""), 10);
  const cartId = `${categoryId}-${item.id}`;
  const cartQty = items.find((i) => i.id === cartId)?.quantity ?? 0;

  const handleAdd = (e: React.MouseEvent) => {
    e.stopPropagation();
    addItem({
      id: cartId,
      categoryId,
      itemId: item.id,
      code: item.code,
      name: item.name,
      price: numericPrice,
      img: item.img,
      veg: item.veg,
      categoryName,
    });
    setAdded(true);
    setTimeout(() => setAdded(false), 1200);
    onOpenCart?.();
  };

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 24 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{
        duration: 0.5,
        delay: index * 0.06,
        ease: [0.22, 1, 0.36, 1],
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className="relative flex flex-col overflow-hidden cursor-pointer"
      style={{
        borderBottom: "2px solid rgba(232,225,207,0.12)",
        borderRight: "2px solid rgba(232,225,207,0.12)",
        backgroundColor: hovered ? "#E8E1CF" : "transparent",
        transition: "background-color 0.3s ease",
        minHeight: "320px",
      }}
    >
      {/* Code label */}
      <div
        className="px-5 pt-5 pb-3"
        style={{ borderBottom: "1px solid rgba(232,225,207,0.1)" }}
      >
        <span
          className="text-[10px] tracking-[0.45em] uppercase"
          style={{
            fontFamily: "'Plus Jakarta Sans', sans-serif",
            color: hovered ? "#1F3A2E" : "rgba(232,225,207,0.35)",
          }}
        >
          {item.code}
        </span>
      </div>

      {/* Image — tilted, dropped in */}
      <div className="flex justify-center items-center py-5 px-5">
        <motion.div
          animate={{ rotate: hovered ? 4 : -2, scale: hovered ? 1.08 : 1 }}
          transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
          className="relative shadow-2xl"
          style={{ width: "140px", height: "140px", flexShrink: 0 }}
        >
          <img
            src={item.img}
            alt={item.name}
            className="w-full h-full object-cover"
            style={{ borderRadius: "4px" }}
          />
          {/* Tag badge */}
          <div
            className="absolute -top-2 -right-2 px-2 py-0.5 text-white text-[8px] font-bold tracking-wider uppercase"
            style={{
              backgroundColor: "#D94B4B",
              fontFamily: "'Plus Jakarta Sans', sans-serif",
              borderRadius: "2px",
            }}
          >
            {item.tag}
          </div>
        </motion.div>
      </div>

      {/* Text content */}
      <div className="px-5 pb-5 flex flex-col flex-1 justify-between">
        <div>
          <h3
            className="font-extrabold uppercase leading-tight mb-2"
            style={{
              fontFamily: "'Syne', sans-serif",
              fontSize: "clamp(1.1rem, 2vw, 1.4rem)",
              letterSpacing: "-0.01em",
              color: hovered ? "#1F3A2E" : "#E8E1CF",
              transition: "color 0.3s ease",
            }}
          >
            {item.name}
          </h3>
          <p
            className="text-xs leading-relaxed mb-3"
            style={{
              fontFamily: "'Plus Jakarta Sans', sans-serif",
              color: hovered ? "#1F3A2E99" : "rgba(232,225,207,0.5)",
              transition: "color 0.3s ease",
            }}
          >
            {item.description}
          </p>

          {/* Toppings / ingredient pills */}
          <div className="flex flex-wrap gap-1.5 mb-4">
            {item.toppings.map((t) => (
              <span
                key={t}
                className="text-[9px] tracking-wider uppercase px-2 py-0.5 rounded-full"
                style={{
                  fontFamily: "'Plus Jakarta Sans', sans-serif",
                  backgroundColor: hovered
                    ? "rgba(31,58,46,0.12)"
                    : "rgba(232,225,207,0.08)",
                  color: hovered ? "#1F3A2E" : "rgba(232,225,207,0.4)",
                  border: `1px solid ${hovered ? "rgba(31,58,46,0.2)" : "rgba(232,225,207,0.12)"}`,
                  transition: "all 0.3s ease",
                }}
              >
                {t}
              </span>
            ))}
          </div>
        </div>

        {/* Bottom row: price + spice + veg dot */}
        <div className="flex items-center justify-between">
          <span
            className="font-extrabold text-xl"
            style={{
              fontFamily: "'Syne', sans-serif",
              color: hovered ? "#1F3A2E" : "#E8E1CF",
              transition: "color 0.3s ease",
            }}
          >
            {item.price}
          </span>
          <div className="flex items-center gap-3">
            <SpiceLevel level={item.spice} />
            <div
              className="w-4 h-4 rounded-sm border-2 flex items-center justify-center"
              style={{ borderColor: item.veg ? "#2d9e2d" : "#D94B4B" }}
            >
              <div
                className="w-1.5 h-1.5 rounded-full"
                style={{ backgroundColor: item.veg ? "#2d9e2d" : "#D94B4B" }}
              />
            </div>
          </div>
        </div>

        {/* Add button + in-cart qty counter */}
        <div className="mt-3 flex items-center gap-2">
          <motion.button
            onClick={handleAdd}
            animate={{ opacity: hovered ? 1 : 0, y: hovered ? 0 : 6 }}
            transition={{ duration: 0.25 }}
            whileTap={{ scale: 0.96 }}
            className="flex-1 py-2 text-[10px] font-semibold tracking-widest uppercase text-[#E8E1CF] flex items-center justify-center gap-2 transition-colors duration-200"
            style={{
              fontFamily: "'Plus Jakarta Sans', sans-serif",
              backgroundColor: added ? "#2d9e2d" : "#1F3A2E",
              transition: "background-color 0.3s ease",
            }}
          >
            {added ? "✓ Added" : "Add to tray"}
            {!added && (
              <svg
                width="12"
                height="12"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
              >
                <path d="M5 12h14M12 5l7 7-7 7" />
              </svg>
            )}
          </motion.button>

          {/* Qty badge — always visible once item is in cart */}
          {cartQty > 0 && (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="flex items-center gap-0 flex-shrink-0"
              style={{
                border: "1px solid rgba(232,225,207,0.2)",
                borderRadius: "2px",
              }}
            >
              <button
                onClick={(e) => {
                  e.stopPropagation(); /* decrement handled in cart panel */
                }}
                className="w-6 h-7 flex items-center justify-center text-[#E8E1CF]/50 hover:text-[#D94B4B] text-sm transition-colors"
              >
                −
              </button>
              <span
                className="w-6 h-7 flex items-center justify-center text-xs font-bold text-[#E8E1CF]"
                style={{
                  fontFamily: "'Syne', sans-serif",
                  borderLeft: "1px solid rgba(232,225,207,0.12)",
                  borderRight: "1px solid rgba(232,225,207,0.12)",
                }}
              >
                {cartQty}
              </span>
              <button
                onClick={handleAdd}
                className="w-6 h-7 flex items-center justify-center text-[#E8E1CF]/50 hover:text-[#2d9e2d] text-sm transition-colors"
              >
                +
              </button>
            </motion.div>
          )}
        </div>
      </div>
    </motion.div>
  );
}

// ── Main export ───────────────────────────────────────────────────────────────
// Props:
//   categoryId     – which category to show (1–6)
//   onBackToCategories – callback to clear selection in parent (wired to "All Categories" button)
/*interface MenuSectionProps {
  categoryId: number;
  onBackToCategories: () => void;
}*/
interface MenuSectionProps {
  categoryId: number;
  onBackToCategories: () => void;
  onOpenCart?: () => void; // ← new optional prop
}

export default function MenuSection({
  categoryId,
  onBackToCategories,
  onOpenCart,
}: MenuSectionProps) {
  const headerRef = useRef(null);
  const headerInView = useInView(headerRef, {
    once: true,
    margin: "-40px 0px",
  });

  const data = MENU_DATA[categoryId] ?? MENU_DATA[1];

  // Column count mirrors original grid logic capped by item count
  const colCount = Math.min(3, data.items.length);

  return (
    <>
      <FontLoader />
      <section
        className="relative overflow-hidden"
        style={{ backgroundColor: "#1F3A2E" }}
      >
        {/* ── TOP HEADER — identical layout, dynamic text ── */}
        <div
          ref={headerRef}
          className="px-6 md:px-12 pt-16 pb-10"
          style={{ borderBottom: "2px solid rgba(232,225,207,0.15)" }}
        >
          <div className="max-w-screen-xl mx-auto flex items-end justify-between gap-8 flex-wrap">
            {/* Left: breadcrumb nav */}
            <motion.p
              initial={{ opacity: 0 }}
              animate={headerInView ? { opacity: 1 } : {}}
              transition={{ duration: 0.4 }}
              className="text-[10px] tracking-[0.5em] uppercase self-start mt-1"
              style={{
                fontFamily: "'Plus Jakarta Sans', sans-serif",
                color: "rgba(232,225,207,0.35)",
              }}
            >
              Snack Bistro &bull; Menu &bull;{" "}
              <span style={{ color: "#D94B4B" }}>{data.name}</span>
            </motion.p>

            {/* Centre: BIG title */}
            <motion.h2
              key={categoryId} // re-animate on category change
              initial={{ opacity: 0, y: 30 }}
              animate={headerInView ? { opacity: 1, y: 0 } : {}}
              transition={{
                duration: 0.6,
                delay: 0.05,
                ease: [0.22, 1, 0.36, 1],
              }}
              className="font-extrabold uppercase leading-none flex-1"
              style={{
                fontFamily: "'Syne', sans-serif",
                fontSize: "clamp(3.5rem, 10vw, 8.5rem)",
                letterSpacing: "-0.03em",
                lineHeight: 0.92,
                color: "#E8E1CF",
              }}
            >
              {data.name}
              <br />
              <span style={{ color: "#D94B4B" }}>Menu</span>
            </motion.h2>

            {/* Right: description */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={headerInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: 0.15 }}
              className="self-end max-w-[220px]"
            >
              <p
                className="text-sm leading-relaxed mb-4"
                style={{
                  fontFamily: "'Plus Jakarta Sans', sans-serif",
                  color: "rgba(232,225,207,0.5)",
                }}
              >
                {data.subtitle}
              </p>
              <div className="flex items-center gap-3">
                <span
                  className="text-[9px] tracking-[0.4em] uppercase px-3 py-1.5 rounded-full"
                  style={{
                    fontFamily: "'Plus Jakarta Sans', sans-serif",
                    color: "#D94B4B",
                    border: "1px solid rgba(217,75,75,0.4)",
                  }}
                >
                  {data.countLabel}
                </span>
                <span
                  className="text-[9px] tracking-[0.4em] uppercase"
                  style={{
                    fontFamily: "'Plus Jakarta Sans', sans-serif",
                    color: "rgba(232,225,207,0.25)",
                  }}
                >
                  {data.dietLabel}
                </span>
              </div>
            </motion.div>
          </div>
        </div>

        {/* ── ITEM CODE LABELS ROW — mirrors CAT label row ── */}
        <div style={{ borderBottom: "2px solid rgba(232,225,207,0.15)" }}>
          <div className="flex overflow-x-auto menu-scroll">
            {data.items.map((item, i) => (
              <div
                key={item.id}
                className="flex-shrink-0 px-5 py-3 text-[10px] tracking-[0.45em] uppercase"
                style={{
                  fontFamily: "'Plus Jakarta Sans', sans-serif",
                  color: "rgba(232,225,207,0.25)",
                  width: "clamp(160px, 16.66vw, 280px)",
                  borderRight:
                    i < data.items.length - 1
                      ? "2px solid rgba(232,225,207,0.1)"
                      : "none",
                }}
              >
                {item.code}
              </div>
            ))}
          </div>
        </div>

        {/* ── ITEMS GRID — 3 col desktop, 2 tablet, 1 mobile ── */}
        <div
          className="grid pizza-grid"
          style={{
            gridTemplateColumns: `repeat(${colCount}, 1fr)`,
            borderLeft: "2px solid rgba(232,225,207,0.12)",
          }}
        >
          <style>{`
            @media (max-width: 768px) {
              .pizza-grid { grid-template-columns: repeat(2, 1fr) !important; }
            }
            @media (max-width: 480px) {
              .pizza-grid { grid-template-columns: repeat(1, 1fr) !important; }
            }
          `}</style>
          {data.items.map((item, index) => (
            <MenuCard
              key={item.id}
              item={item}
              index={index}
              categoryId={categoryId}
              categoryName={data.name}
              onOpenCart={onOpenCart}
            />
          ))}
        </div>

        {/* ── BOTTOM STRIP — mirrors CategorySection bottom strip ── */}
        <div
          className="px-6 md:px-12 py-5 flex items-center justify-between flex-wrap gap-4"
          style={{ borderTop: "2px solid rgba(232,225,207,0.15)" }}
        >
          <div className="flex items-center gap-6 flex-wrap">
            {data.footerTags.map((t) => (
              <span
                key={t}
                className="text-[10px] tracking-[0.35em] uppercase"
                style={{
                  fontFamily: "'Plus Jakarta Sans', sans-serif",
                  color: "rgba(232,225,207,0.25)",
                }}
              >
                {t}
              </span>
            ))}
          </div>

          <div className="flex items-center gap-3">
            {/* Back to categories — wired to parent callback */}
            <button
              onClick={onBackToCategories}
              className="group flex items-center gap-2 text-[10px] font-semibold tracking-widest uppercase px-5 py-2.5 transition-all duration-200"
              style={{
                fontFamily: "'Plus Jakarta Sans', sans-serif",
                color: "rgba(232,225,207,0.4)",
                border: "1px solid rgba(232,225,207,0.15)",
              }}
            >
              <svg
                width="12"
                height="12"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                className="group-hover:-translate-x-1 transition-transform duration-200"
              >
                <path d="M19 12H5M12 19l-7-7 7-7" />
              </svg>
              All Categories
            </button>

            {/* View full menu */}
            <button
              className="group flex items-center gap-2 text-[#E8E1CF] text-[10px] font-semibold tracking-widest uppercase px-5 py-2.5 transition-all duration-200 hover:bg-[#D94B4B]"
              style={{
                fontFamily: "'Plus Jakarta Sans', sans-serif",
                backgroundColor: "#D94B4B",
              }}
            >
              Full Menu
              <svg
                width="12"
                height="12"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                className="group-hover:translate-x-1 transition-transform duration-200"
              >
                <path d="M5 12h14M12 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        </div>
      </section>
    </>
  );
}
