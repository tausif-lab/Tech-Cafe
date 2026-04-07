"use client";//haa mere jaaaaaaaan
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
    items:[
  {
    id: 20,
    code: "PZ01",
    name: "Veg Delight Pizza",
    price: "₹110",
    tag: "veg",
    veg: true,
    spice: 1,
    img: "/veg-delight.png",
    description: "Loaded with fresh vegetables and cheese.",
    toppings: ["Veggies", "Cheese"],
  },
  {
    id: 21,
    code: "PZ02",
    name: "Cheese Corn Pizza",
    price: "₹110",
    tag: "creamy",
    veg: true,
    spice: 1,
    img: "/cheese-corn-pizza.png",
    description: "Sweet corn with cheesy topping.",
    toppings: ["Corn", "Cheese"],
  },
  {
    id: 22,
    code: "PZ03",
    name: "Farm House Pizza",
    price: "₹110",
    tag: "loaded",
    veg: true,
    spice: 1,
    img: "/farmhouse.png",
    description: "Rich veggie-loaded farmhouse style pizza.",
    toppings: ["Veggies", "Cheese"],
  },
  {
    id: 23,
    code: "PZ04",
    name: "Cheese Burst Pizza",
    price: "₹120",
    tag: "cheesy",
    veg: true,
    spice: 1,
    img: "/cheese-burst-pizza.png",
    description: "Pizza overloaded with molten cheese.",
    toppings: ["Extra Cheese"],
  },
  {
    id: 24,
    code: "PZ05",
    name: "Mexican Pizza",
    price: "₹130",
    tag: "spicy",
    veg: true,
    spice: 2,
    img: "/mexican-pizza.png",
    description: "Spicy Mexican style pizza with jalapeños.",
    toppings: ["Jalapeños", "Cheese"],
  },
  {
    id: 25,
    code: "PZ06",
    name: "Paneer Pizza",
    price: "₹130",
    tag: "protein",
    veg: true,
    spice: 2,
    img: "/paneer-pizza.png",
    description: "Paneer cubes with rich cheesy base.",
    toppings: ["Paneer", "Cheese"],
  }
],
  },

  // ── 2. Burger ────────────────────────────────────────────────────────────
  2: {
    name: "Burger",
    emoji: "🍔",
    subtitle:
      "Eight stacked, saucy, juicy patties. Every bite is a proper study-break moment — built to fill you up.",
    tagline: "Grilled Fresh",
    countLabel: "🍔 3 varieties",
    dietLabel: "Veg & Non-veg",
    footerTags: [
      "🍔 Grilled to Order",
      "🔥 Double Patty Options",
      "⚡ Ready in 10 min",
    ],
    items:[
  {
    id: 30,
    code: "BG01",
    name: "Aloo Tikki Burger",
    price: "₹50",
    tag: "classic",
    veg: true,
    spice: 2,
    img: "/aloo-tikki.png",
    description: "Crispy potato patty with sauces.",
    toppings: ["Aloo Patty", "Sauce"],
  },
  {
    id: 31,
    code: "BG02",
    name: "Cheese Corn Burger",
    price: "₹50",
    tag: "creamy",
    veg: true,
    spice: 1,
    img: "/cheese-corn-burger.png",
    description: "Corn and cheese filling burger.",
    toppings: ["Corn", "Cheese"],
  },
  {
    id: 32,
    code: "BG03",
    name: "Paneer Burger",
    price: "₹70",
    tag: "protein",
    veg: true,
    spice: 2,
    img: "/paneer-burger.png",
    description: "Paneer patty with veggies and sauces.",
    toppings: ["Paneer", "Veggies"],
  }
],
  },

  // ── 3. Sandwich ──────────────────────────────────────────────────────────
  3: {
    name: "Sandwich",
    emoji: "🥪",
    subtitle:
      "Ten fresh-stacked sandwiches on seeded bread, house sauces, and fillings that mean business.",
    tagline: "Fresh Every Hour",
    countLabel: "🥪 8 varieties",
    dietLabel: "Mix of veg & non-veg",
    footerTags: ["🥪 Made to Order", "🌿 Fresh Fillings", "⚡ Ready in 5 min"],
    items:[
  {
    id: 1,
    code: "SW01",
    name: "Veg Grilled Sandwich",
    price: "₹50",
    tag: "classic",
    veg: true,
    spice: 1,
    img: "/veg-grilled.png",
    description: "Toasted sandwich with fresh veggies and light butter grill.",
    toppings: ["Veggies", "Butter"],
  },
  {
    id: 2,
    code: "SW02",
    name: "Potato Masala Sandwich",
    price: "₹50",
    tag: "desi",
    veg: true,
    spice: 2,
    img: "/potato-masala.png",
    description: "Spiced mashed potato filling with Indian flavors.",
    toppings: ["Potato", "Masala"],
  },
  {
    id: 3,
    code: "SW03",
    name: "Cheese Chutney Sandwich",
    price: "₹50",
    tag: "tangy",
    veg: true,
    spice: 2,
    img: "/cheese-chutney.png",
    description: "Cheese with spicy green chutney spread.",
    toppings: ["Cheese", "Chutney"],
  },
  {
    id: 4,
    code: "SW04",
    name: "Cheese Corn Sandwich",
    price: "₹60",
    tag: "creamy",
    veg: true,
    spice: 1,
    img: "/cheese-corn.png",
    description: "Sweet corn mixed with melted cheese.",
    toppings: ["Corn", "Cheese"],
  },
  {
    id: 5,
    code: "SW05",
    name: "Cheese Garlic Sandwich",
    price: "₹50",
    tag: "garlic",
    veg: true,
    spice: 1,
    img: "/cheese-garlic.png",
    description: "Garlic butter with melted cheese.",
    toppings: ["Garlic", "Cheese"],
  },
  {
    id: 6,
    code: "SW06",
    name: "Cheese Burst Sandwich",
    price: "₹50",
    tag: "cheesy",
    veg: true,
    spice: 1,
    img: "/cheese-burst.png",
    description: "Extra loaded cheese sandwich.",
    toppings: ["Extra Cheese"],
  },
  {
    id: 7,
    code: "SW07",
    name: "Peri-Peri Paneer Sandwich",
    price: "₹75",
    tag: "spicy",
    veg: true,
    spice: 3,
    img: "/peri-paneer.png",
    description: "Paneer tossed in peri-peri spices.",
    toppings: ["Paneer", "Peri Peri"],
  },
  {
    id: 8,
    code: "SW08",
    name: "Chocolate Sandwich",
    price: "₹50",
    tag: "sweet",
    veg: true,
    spice: 0,
    img: "/chocolate.png",
    description: "Dessert sandwich filled with melted chocolate.",
    toppings: ["Chocolate"],
  }
],
  },

  // ── 4. Dosa ──────────────────────────────────────────────────────────────
  4: {
    name: "Dosa",
    emoji: "🫓",
    subtitle:
      "Crispy golden dosas straight off the tawa, with authentic sambar and chutneys that feel like home.",
    tagline: "Straight Off the Tawa",
    countLabel: "🫓 8 varieties",
    dietLabel: "All veg",
    footerTags: ["🫓 Fresh off Tawa", "🌱 100% Veg", "⚡ Ready in 8 min"],
    items:[
  {
    id: 60,
    code: "DS01",
    name: "Tech Cafe Special Dosa",
    price: "₹80",
    tag: "special",
    veg: true,
    spice: 2,
    img: "/tech-special-dosa.png",
    description: "Loaded dosa with peri-peri, cheese, and veggies.",
    toppings: ["Cheese", "Veggies", "Peri Peri"],
  },
  {
    id: 61,
    code: "DS02",
    name: "Plain Dosa",
    price: "₹40",
    tag: "classic",
    veg: true,
    spice: 1,
    img: "/plain-dosa.png",
    description: "Crispy dosa served with chutney and sambar.",
    toppings: ["Chutney"],
  },
  {
    id: 62,
    code: "DS03",
    name: "Masala Dosa",
    price: "₹50",
    tag: "popular",
    veg: true,
    spice: 2,
    img: "/masala-dosa.png",
    description: "Dosa stuffed with spiced potato filling.",
    toppings: ["Potato"],
  },
  {
    id: 63,
    code: "DS04",
    name: "Cutting Masala Dosa",
    price: "₹60",
    tag: "desi",
    veg: true,
    spice: 2,
    img: "/cutting-dosa.png",
    description: "Mini sliced dosa filled with masala for quick bites.",
    toppings: ["Potato"],
  },
  {
    id: 64,
    code: "DS05",
    name: "Butter Dosa",
    price: "₹60",
    tag: "buttery",
    veg: true,
    spice: 1,
    img: "/butter-dosa.png",
    description: "Dosa cooked with generous butter for rich flavor.",
    toppings: ["Butter"],
  },
  {
    id: 65,
    code: "DS06",
    name: "Cheese Corn Dosa",
    price: "₹80",
    tag: "creamy",
    veg: true,
    spice: 1,
    img: "/cheese-corn-dosa.png",
    description: "Dosa stuffed with cheese and sweet corn.",
    toppings: ["Cheese", "Corn"],
  },
  {
    id: 66,
    code: "DS07",
    name: "Paneer Dosa",
    price: "₹80",
    tag: "protein",
    veg: true,
    spice: 2,
    img: "/paneer-dosa.png",
    description: "Paneer stuffing dosa with mild spices.",
    toppings: ["Paneer"],
  },
  {
    id: 67,
    code: "DS08",
    name: "Schezwan Dosa",
    price: "₹60",
    tag: "spicy",
    veg: true,
    spice: 3,
    img: "/schezwan-dosa.png",
    description: "Dosa with schezwan sauce for a fiery taste.",
    toppings: ["Schezwan Sauce"],
  }
],
  },

  // ── 5. Pasta ─────────────────────────────────────────────────────────────
  5: {
    name: "Pasta",
    emoji: "🍝",
    subtitle:
      "Seven proper pasta dishes — sauced right, cooked al dente, and priced for real student budgets.",
    tagline: "Al Dente Always",
    countLabel: "🍝 2 varieties",
    dietLabel: "All veg",
    footerTags: ["🍝 Cooked Al Dente", "🌱 100% Veg", "⚡ Ready in 15 min"],
    items:[
  {
    id: 100,
    code: "PS01",
    name: "White Sauce Pasta",
    price: "₹70",
    tag: "creamy",
    veg: true,
    spice: 1,
    img: "/white-pasta.png",
    description: "Pasta in creamy white sauce.",
    toppings: ["Cream Sauce"],
  },
  {
    id: 101,
    code: "PS02",
    name: "Red Sauce Pasta",
    price: "₹70",
    tag: "tangy",
    veg: true,
    spice: 2,
    img: "/red-pasta.png",
    description: "Pasta in tangy tomato sauce.",
    toppings: ["Tomato Sauce"],
  }
],
  },

  // ── 6. Shakes ────────────────────────────────────────────────────────────
  6: {
    name: "Shakes",
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
    items:[
  {
    id: 40,
    code: "SH01",
    name: "Classic Cold Coffee",
    price: "₹50",
    tag: "coffee",
    veg: true,
    spice: 0,
    img: "/cold-coffee.png",
    description: "Chilled coffee blended with milk and ice.",
    toppings: ["Coffee", "Milk"],
  },
  {
    id: 41,
    code: "SH02",
    name: "Mango Shake",
    price: "₹60",
    tag: "fruit",
    veg: true,
    spice: 0,
    img: "/mango-shake.png",
    description: "Refreshing mango shake with natural sweetness.",
    toppings: ["Mango"],
  },
  {
    id: 42,
    code: "SH03",
    name: "Chocolate Shake",
    price: "₹70",
    tag: "sweet",
    veg: true,
    spice: 0,
    img: "/chocolate-shake.png",
    description: "Rich and creamy chocolate delight.",
    toppings: ["Chocolate"],
  },
  {
    id: 43,
    code: "SH04",
    name: "Strawberry Shake",
    price: "₹60",
    tag: "fruit",
    veg: true,
    spice: 0,
    img: "/strawberry-shake.png",
    description: "Sweet strawberry flavored milkshake.",
    toppings: ["Strawberry"],
  },
  {
    id: 44,
    code: "SH05",
    name: "Butterscotch Shake",
    price: "₹80",
    tag: "dessert",
    veg: true,
    spice: 0,
    img: "/butterscotch-shake.png",
    description: "Creamy butterscotch flavored shake.",
    toppings: ["Butterscotch"],
  },
  {
    id: 45,
    code: "SH06",
    name: "KitKat Shake",
    price: "₹80",
    tag: "chocolate",
    veg: true,
    spice: 0,
    img: "/kitkat-shake.png",
    description: "Crunchy KitKat blended into a rich shake.",
    toppings: ["KitKat"],
  },
  {
    id: 46,
    code: "SH07",
    name: "Oreo Shake",
    price: "₹80",
    tag: "popular",
    veg: true,
    spice: 0,
    img: "/oreo-shake.png",
    description: "Creamy shake with crushed Oreo cookies.",
    toppings: ["Oreo"],
  },
  {
    id: 47,
    code: "SH08",
    name: "Blueberry Shake",
    price: "₹80",
    tag: "fruit",
    veg: true,
    spice: 0,
    img: "/blueberry-shake.png",
    description: "Tangy blueberry blended milkshake.",
    toppings: ["Blueberry"],
  },
  {
    id: 48,
    code: "SH09",
    name: "Rasmalai Shake",
    price: "₹80",
    tag: "indian-dessert",
    veg: true,
    spice: 0,
    img: "/rasmalai-shake.png",
    description: "Rich rasmalai flavored creamy shake.",
    toppings: ["Rasmalai"],
  },
  {
    id: 49,
    code: "SH10",
    name: "Black Currant Shake",
    price: "₹80",
    tag: "fruit",
    veg: true,
    spice: 0,
    img: "/blackcurrant-shake.png",
    description: "Sweet and tangy black currant shake.",
    toppings: ["Black Currant"],
  },

  // 🔥 DRY FRUIT SHAKES
  {
    id: 50,
    code: "DFS01",
    name: "Kesar Badam Shake",
    price: "₹80",
    tag: "dry-fruit",
    veg: true,
    spice: 0,
    img: "/kesar-badam.png",
    description: "Rich saffron and almond flavored shake.",
    toppings: ["Badam", "Kesar"],
  },
  {
    id: 51,
    code: "DFS02",
    name: "Anjeer Shake",
    price: "₹80",
    tag: "dry-fruit",
    veg: true,
    spice: 0,
    img: "/anjeer-shake.png",
    description: "Healthy fig-based creamy shake.",
    toppings: ["Anjeer"],
  },
  {
    id: 52,
    code: "DFS03",
    name: "Pista Shake",
    price: "₹80",
    tag: "dry-fruit",
    veg: true,
    spice: 0,
    img: "/pista-shake.png",
    description: "Smooth pistachio flavored milkshake.",
    toppings: ["Pista"],
  }
  ]
  },

// ── 7. Chowmein ────────────────────────────────────────────────────────────
 7: {
  name: "Chowmein",
  emoji: "🍜",
  subtitle:
    "Hot wok-tossed noodles loaded with veggies and bold sauces. Street-style comfort that hits every time.",
  tagline: "Wok Fresh Flavor",
  countLabel: "🍜 4 varieties",
  dietLabel: "All veg",
  footerTags: [
    "🔥 Tossed on High Flame",
    "🥬 Fresh Veggies",
    "⚡ Ready in 8 min"
  ],
    items:[
  {
    id: 70,
    code: "CM01",
    name: "Veg Chowmein",
    price: "₹50",
    tag: "classic",
    veg: true,
    spice: 1,
    img: "/veg-chowmein.png",
    description: "Stir-fried noodles with vegetables.",
    toppings: ["Veggies"],
  },
  {
    id: 71,
    code: "CM02",
    name: "Schezwan Chowmein",
    price: "₹70",
    tag: "spicy",
    veg: true,
    spice: 3,
    img: "/schezwan-chowmein.png",
    description: "Noodles tossed in spicy schezwan sauce.",
    toppings: ["Schezwan Sauce"],
  },
  {
    id: 72,
    code: "CM03",
    name: "Paneer Chowmein",
    price: "₹90",
    tag: "protein",
    veg: true,
    spice: 2,
    img: "/paneer-chowmein.png",
    description: "Noodles mixed with paneer cubes.",
    toppings: ["Paneer"],
  },
  {
    id: 73,
    code: "CM04",
    name: "Corn Chowmein",
    price: "₹80",
    tag: "sweet",
    veg: true,
    spice: 1,
    img: "/corn-chowmein.png",
    description: "Noodles with sweet corn and mild seasoning.",
    toppings: ["Corn"],
  }
],
},
// - 8 Chinese ───────────────────────────────────────────────────────────
8: {
  name: "Chinese",
  emoji: "🥡",
  subtitle:
    "Bold Indo-Chinese flavors with crispy textures and spicy sauces — the ultimate fusion comfort food.",
  tagline: "Spicy & Saucy",
  countLabel: "🥡 8 varieties",
  dietLabel: "All veg",
  footerTags: [
    "🌶️ Spicy Options Available",
    "🔥 Freshly Cooked",
    "⚡ Ready in 10 min"
  ],
  items:[
  {
    id: 90,
    code: "CH01",
    name: "Potato Crispy",
    price: "₹80",
    tag: "crispy",
    veg: true,
    spice: 2,
    img: "/potato-crispy.png",
    description: "Crispy fried potatoes tossed in spices.",
    toppings: ["Potato"],
  },
  {
    id: 91,
    code: "CH02",
    name: "Honey Chilli Potato",
    price: "₹80",
    tag: "sweet-spicy",
    veg: true,
    spice: 2,
    img: "/honey-chilli.png",
    description: "Crispy potatoes coated in honey chilli sauce.",
    toppings: ["Honey Sauce"],
  },
  {
    id: 92,
    code: "CH03",
    name: "Manchurian",
    price: "₹80",
    tag: "popular",
    veg: true,
    spice: 2,
    img: "/manchurian.png",
    description: "Veg balls tossed in Indo-Chinese gravy.",
    toppings: ["Manchurian Balls"],
  },
  {
    id: 93,
    code: "CH04",
    name: "Corn Chaat",
    price: "₹50",
    tag: "snack",
    veg: true,
    spice: 1,
    img: "/corn-chaat.png",
    description: "Sweet corn mixed with spices and herbs.",
    toppings: ["Corn"],
  },
  {
    id: 94,
    code: "CH05",
    name: "Paneer Chilli (Dry)",
    price: "₹150",
    tag: "spicy",
    veg: true,
    spice: 3,
    img: "/paneer-chilli-dry.png",
    description: "Paneer tossed in spicy chilli sauce.",
    toppings: ["Paneer"],
  },
  {
    id: 95,
    code: "CH06",
    name: "Paneer Chilli Gravy",
    price: "₹160",
    tag: "gravy",
    veg: true,
    spice: 3,
    img: "/paneer-chilli-gravy.png",
    description: "Paneer cooked in thick chilli gravy.",
    toppings: ["Paneer"],
  },
  {
    id: 96,
    code: "CH07",
    name: "Soya Kabab",
    price: "₹90",
    tag: "protein",
    veg: true,
    spice: 2,
    img: "/soya-kabab.png",
    description: "Protein-rich soya kebabs with spices.",
    toppings: ["Soya"],
  },
  {
    id: 97,
    code: "CH08",
    name: "Chana Chilli",
    price: "₹100",
    tag: "protein",
    veg: true,
    spice: 2,
    img: "/chana-chilli.png",
    description: "Chickpeas tossed in spicy chilli sauce.",
    toppings: ["Chana"],
  }
],
},
// - 9 Maggie ───────────────────────────────────────────────────────────
9: {
  name: "Maggi",
  emoji: "🍜",
  subtitle:
    "Steaming hot Maggi tossed with classic masala, cheese, and veggies — the ultimate comfort bowl for quick cravings.",
  tagline: "2-Min Magic",
  countLabel: "🍜 3 varieties",
  dietLabel: "All veg",
  footerTags: [
    "🔥 Served Hot",
    "🧀 Cheesy Options Available",
    "⚡ Ready in 5 min"
  ],
  items:[
  {
    id: 50,
    code: "MG01",
    name: "Plain Maggi",
    price: "₹40",
    tag: "classic",
    veg: true,
    spice: 1,
    img: "/plain-maggi.png",
    description: "Simple Maggi noodles with signature masala flavor.",
    toppings: ["Masala"],
  },
  {
    id: 51,
    code: "MG02",
    name: "Butter Maggi",
    price: "₹50",
    tag: "buttery",
    veg: true,
    spice: 1,
    img: "/butter-maggi.png",
    description: "Maggi cooked with rich butter for enhanced taste.",
    toppings: ["Butter"],
  },
  {
    id: 52,
    code: "MG03",
    name: "Veg Maggi",
    price: "₹60",
    tag: "healthy",
    veg: true,
    spice: 2,
    img: "/veg-maggi.png",
    description: "Maggi loaded with fresh vegetables.",
    toppings: ["Veggies"],
  },
  {
    id: 53,
    code: "MG04",
    name: "Cheese Maggi",
    price: "₹50",
    tag: "cheesy",
    veg: true,
    spice: 1,
    img: "/cheese-maggi.png",
    description: "Maggi topped with melted cheese.",
    toppings: ["Cheese"],
  },
  {
    id: 54,
    code: "MG05",
    name: "Cheese Veg Maggi",
    price: "₹70",
    tag: "loaded",
    veg: true,
    spice: 2,
    img: "/cheese-veg-maggi.png",
    description: "Veg Maggi enhanced with melted cheese.",
    toppings: ["Veggies", "Cheese"],
  },
  {
    id: 55,
    code: "MG06",
    name: "Paneer Maggi",
    price: "₹80",
    tag: "protein",
    veg: true,
    spice: 2,
    img: "/paneer-maggi.png",
    description: "Maggi mixed with soft paneer cubes.",
    toppings: ["Paneer"],
  },
  {
    id: 56,
    code: "MG07",
    name: "Peri-Peri Maggi",
    price: "₹60",
    tag: "spicy",
    veg: true,
    spice: 3,
    img: "/peri-maggi.png",
    description: "Maggi tossed in peri-peri seasoning for a spicy kick.",
    toppings: ["Peri Peri"],
  }
],
},
// - 10 Frensch Fries ───────────────────────────────────────────────────────────
10: {
  name: "French Fries",
  emoji: "🍟",
  subtitle:
    "Golden crispy fries with classic salt, cheese, or peri-peri seasoning — the perfect side or snack anytime.",
  tagline: "Crispy Always",
  countLabel: "🍟 4 varieties",
  dietLabel: "All veg",
  footerTags: [
    "🧂 Perfectly Salted",
    "🧀 Cheesy Options",
    "⚡ Ready in 5 min"
  ],
  items:[
  {
    id: 110,
    code: "FF01",
    name: "Salted Fries",
    price: "₹40",
    tag: "classic",
    veg: true,
    spice: 1,
    img: "/salted-fries.png",
    description: "Crispy salted potato fries.",
    toppings: ["Salt"],
  },
  {
    id: 111,
    code: "FF02",
    name: "Peri-Peri Fries",
    price: "₹50",
    tag: "spicy",
    veg: true,
    spice: 3,
    img: "/peri-fries.png",
    description: "Fries tossed in peri-peri seasoning.",
    toppings: ["Peri Peri"],
  },
  {
    id: 112,
    code: "FF03",
    name: "Cheese Fries",
    price: "₹60",
    tag: "cheesy",
    veg: true,
    spice: 1,
    img: "/cheese-fries.png",
    description: "Fries topped with melted cheese.",
    toppings: ["Cheese"],
  },
  {
    id: 113,
    code: "FF04",
    name: "Peri-Cheese Fries",
    price: "₹60",
    tag: "loaded",
    veg: true,
    spice: 3,
    img: "/peri-cheese-fries.png",
    description: "Fries with cheese and peri-peri seasoning.",
    toppings: ["Cheese", "Peri Peri"],
  }
],
},

// - 11 Fried Rice───────────────────────────────────────────────────────────
11: {
  name: "Fried Rice",
  emoji: "🍚",
  subtitle:
    "Fluffy rice stir-fried with sauces and veggies — simple, satisfying, and packed with flavor.",
  tagline: "Comfort Bowl",
  countLabel: "🍚 2 varieties",
  dietLabel: "All veg",
  footerTags: [
    "🔥 Wok Tossed",
    "🥕 Loaded Veggies",
    "⚡ Ready in 7 min"
  ],
  items:[
  {
    id: 80,
    code: "FR01",
    name: "Veg Fried Rice",
    price: "₹70",
    tag: "classic",
    veg: true,
    spice: 1,
    img: "/veg-fried-rice.png",
    description: "Fried rice with vegetables and mild seasoning.",
    toppings: ["Veggies"],
  },
  {
    id: 81,
    code: "FR02",
    name: "Schezwan Fried Rice",
    price: "₹80",
    tag: "spicy",
    veg: true,
    spice: 3,
    img: "/schezwan-rice.png",
    description: "Rice tossed with spicy schezwan sauce.",
    toppings: ["Schezwan Sauce"],
  }
],
},

// - 13 Tech Cafe Special───────────────────────────────────────────────────────────
12: {
  name: "Tech Cafe Special",
  emoji: "🌯",
  subtitle:
    "Crispy rolls packed with flavorful fillings — perfect quick bites when you're craving something crunchy and satisfying.",
  tagline: "Cafe Signature",
  countLabel: "🌯 2 varieties",
  dietLabel: "All veg",
  footerTags: [
    "🥢 Street Style Taste",
    "🔥 Freshly Fried",
    "⚡ Ready in 6 min"
  ],
  items:[
  {
    id: 120,
    code: "TCS01",
    name: "Tech Cafe Special Roll",
    price: "₹70",
    tag: "signature",
    veg: true,
    spice: 2,
    img: "/tech-special-roll.png",
    description: "Crispy roll stuffed with spiced veggies and signature sauces.",
    toppings: ["Veggies", "Sauce"],
  },
  {
    id: 121,
    code: "TCS02",
    name: "Cheese Loaded Roll",
    price: "₹80",
    tag: "cheesy",
    veg: true,
    spice: 1,
    img: "/cheese-roll.png",
    description: "Soft roll filled with molten cheese and mild spices.",
    toppings: ["Cheese"],
  }
],
}
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
