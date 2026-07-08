import React, { useState, useMemo, useEffect } from "react";
import "./index.css";
import StoreMap from "./StoreMap";
import staticProducts from "./products.json";
import staticLocation from "./location.json";

const PRODUCTS = staticProducts;
export const products = staticProducts;

const getApiUrl = (path) => {
  const host = window.location.hostname;
  return `http://${host}:5001/api/${path}`;
};

let globalCategories = [];

const getCategoryEmoji = (category) => {
  const c = String(category).toLowerCase();
  const found = globalCategories.find(cat => cat.name.toLowerCase() === c || cat.id === c);
  if (found) return found.emoji;
  if (c === "pulses") return "🥣";
  if (c === "rice") return "🌾";
  if (c === "fruits") return "🍎";
  if (c === "vegetables") return "🥕";
  if (c === "oil") return "🍾";
  if (c === "soap") return "🧼";
  if (c === "shampoo") return "🧴";
  if (c === "dairy") return "🥛";
  if (c === "snacks") return "🍪";
  if (c === "beverages") return "🥤";
  return "📦";
};

// ─── SESSION DATA PERSISTENCE ON EVERY PAGE LOAD ───
// Session data is preserved through reloads.
// Only clear temporary state if necessary, but keep authentication and routing hashes.

function App() {
  // Authentication states - load from localStorage to persist on reload
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    return localStorage.getItem("nishi_isAuthenticated") === "true";
  });
  const [currentUser, setCurrentUser] = useState(() => {
    return localStorage.getItem("nishi_currentUser") || "";
  });
  const [isLogin, setIsLogin] = useState(true);
  const [loginType, setLoginType] = useState("user"); // "user" or "admin"
  const [showMapPage, setShowMapPage] = useState(() => {
    return window.location.hash === "#map";
  });
  const [showAdminPage, setShowAdminPage] = useState(() => {
    return window.location.hash === "#admin";
  });
  const [showProductCatalog, setShowProductCatalog] = useState(() => {
    return window.location.hash === "#catalog";
  });

  // Form input states
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  
  // Login input states — always start empty, no pre-fill
  const [loginIdentifier, setLoginIdentifier] = useState("");
  const [loginPassword, setLoginPassword] = useState("");

  // UI status states
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Store States
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [cart, setCart] = useState(() => {
    const saved = localStorage.getItem("nishi_cart");
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {}
    }
    return {};
  }); // Stores { productId: quantity }
  const [isCategoryMenuOpen, setIsCategoryMenuOpen] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isCartAnimating, setIsCartAnimating] = useState(false);
  const [checkoutSuccess, setCheckoutSuccess] = useState(false);
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const [showCheckoutForm, setShowCheckoutForm] = useState(false);
  const [checkoutDetails, setCheckoutDetails] = useState({
    houseNo: "",
    pincode: "",
    mobileNo: "",
  });
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const [profileDetails, setProfileDetails] = useState(() => {
    const saved = localStorage.getItem("nishi_profileDetails");
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {}
    }
    return {
      username: "nishi",
      email: "nishi@superstore.com",
      phone: "+91 98765 43210",
      password: "123456"
    };
  });
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [showProfilePassword, setShowProfilePassword] = useState(false);
  const [activeProfileTab, setActiveProfileTab] = useState("details"); // "details" or "card"

  // Visiting Card State Variables
  const [visitingCardDetails, setVisitingCardDetails] = useState(() => {
    const saved = localStorage.getItem("nishi_visitingCardDetails");
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {}
    }
    return {
      shopName: "Nishi Super Store",
      name: "Anish Jain",
      phone: "8200913658",
      address: "Nava Bazar, Karjan, Gujarat 391240",
      email: "anishjain@nishisuperstore.com",
      website: "https://nishi-store.vercel.app/",
      designation: "Founder & Proprietor"
    };
  });
  const [selectedCardTheme, setSelectedCardTheme] = useState("emerald");
  const [isCardFlipped, setIsCardFlipped] = useState(false);

  useEffect(() => {
    localStorage.setItem("nishi_visitingCardDetails", JSON.stringify(visitingCardDetails));
  }, [visitingCardDetails]);

  // Handler to download Visiting Card side as PNG
  const handleDownloadCard = (side) => {
    const canvas = document.createElement("canvas");
    canvas.width = 1050; // High-res width
    canvas.height = 600; // High-res height
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Smooth font rendering
    ctx.textBaseline = "middle";

    let bgGrad;
    let accentColor;
    let textColor = "#ffffff";
    let subTextColor;
    
    if (selectedCardTheme === "emerald") {
      bgGrad = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
      bgGrad.addColorStop(0, "#03170d");
      bgGrad.addColorStop(0.5, "#062c17");
      bgGrad.addColorStop(1, "#0a381f");
      accentColor = "#d4af37"; // Metallic gold
      subTextColor = "#34d399"; // Emerald light
    } else if (selectedCardTheme === "dark") {
      bgGrad = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
      bgGrad.addColorStop(0, "#09090b");
      bgGrad.addColorStop(0.5, "#18181b");
      bgGrad.addColorStop(1, "#27272a");
      accentColor = "#06b6d4"; // Cyan
      subTextColor = "#a1a1aa"; // Gray
    } else {
      // Gold Theme
      bgGrad = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
      bgGrad.addColorStop(0, "#050b14");
      bgGrad.addColorStop(0.5, "#0b182b");
      bgGrad.addColorStop(1, "#112643");
      accentColor = "#fbbf24"; // Amber gold
      subTextColor = "#f59e0b";
    }

    // Fill background
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw borders
    ctx.strokeStyle = accentColor;
    ctx.lineWidth = 6;
    ctx.strokeRect(25, 25, canvas.width - 50, canvas.height - 50);

    // Subtle geometric overlay lines
    ctx.strokeStyle = accentColor + "15"; // Very low opacity
    ctx.lineWidth = 3;
    for (let i = -canvas.height; i < canvas.width; i += 60) {
      ctx.beginPath();
      ctx.moveTo(i, 0);
      ctx.lineTo(i + canvas.height, canvas.height);
      ctx.stroke();
    }

    if (side === "front") {
      // ─── DRAW FRONT SIDE ───
      // Draw Brand Logo (Stylized 'N' matching the website)
      const logoX = 150;
      const logoY = 300;
      
      // Draw background shield/card
      ctx.fillStyle = "rgba(255, 255, 255, 0.03)";
      ctx.beginPath();
      ctx.arc(logoX + 40, logoY, 90, 0, Math.PI * 2);
      ctx.fill();
      
      ctx.strokeStyle = "rgba(255, 255, 255, 0.05)";
      ctx.lineWidth = 1;
      ctx.stroke();

      // Draw stylized N
      ctx.strokeStyle = "#ffffff";
      ctx.lineWidth = 10;
      ctx.lineCap = "round";
      ctx.lineJoin = "round";
      ctx.beginPath();
      ctx.moveTo(logoX, logoY - 50);
      ctx.lineTo(logoX, logoY + 50);
      ctx.moveTo(logoX, logoY - 50);
      ctx.lineTo(logoX + 80, logoY + 50);
      ctx.moveTo(logoX + 80, logoY + 50);
      ctx.lineTo(logoX + 80, logoY - 50);
      ctx.stroke();

      // Draw decorative dots (yellow and emerald)
      ctx.fillStyle = "#fbbf24";
      ctx.beginPath();
      ctx.arc(logoX + 96, logoY - 60, 6, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = "#34d399";
      ctx.beginPath();
      ctx.arc(logoX - 16, logoY + 60, 6, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = "#fbbf24";
      ctx.beginPath();
      ctx.arc(logoX + 88, logoY + 54, 5, 0, Math.PI * 2);
      ctx.fill();

      // Brand Text (Shop Name)
      ctx.fillStyle = "#ffffff";
      ctx.font = "bold 64px sans-serif";
      ctx.textAlign = "left";
      ctx.fillText(visitingCardDetails.shopName, 320, logoY - 30);

      // Tagline
      ctx.fillStyle = subTextColor;
      ctx.font = "bold 26px sans-serif";
      ctx.fillText("✓ Fresh  •  Quality  •  Trusted", 320, logoY + 30);

      // Footer
      ctx.fillStyle = "#a1a1aa";
      ctx.font = "20px sans-serif";
      ctx.fillText("Premium Quality Grocery & Super Store", 320, logoY + 80);

    } else {
      // ─── DRAW BACK SIDE ───
      // Draw header
      ctx.fillStyle = "#ffffff";
      ctx.font = "bold 42px sans-serif";
      ctx.textAlign = "left";
      ctx.fillText(visitingCardDetails.shopName, 60, 80);

      ctx.fillStyle = subTextColor;
      ctx.font = "bold 18px sans-serif";
      ctx.fillText("✓ Fresh  •  Quality  •  Trusted", 60, 125);

      // Horizontal separator line
      ctx.strokeStyle = accentColor + "50";
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(60, 155);
      ctx.lineTo(canvas.width - 60, 155);
      ctx.stroke();

      // Owner Name
      ctx.fillStyle = "#ffffff";
      ctx.font = "bold 48px sans-serif";
      ctx.fillText(visitingCardDetails.name, 60, 230);

      // Designation
      ctx.fillStyle = subTextColor;
      ctx.font = "bold 20px sans-serif";
      ctx.fillText(visitingCardDetails.designation, 60, 280);

      // Phone
      ctx.fillStyle = "#f4f4f5";
      ctx.font = "24px sans-serif";
      ctx.fillText("📞   +91 " + visitingCardDetails.phone, 60, 340);

      // Email
      ctx.fillText("✉️   " + visitingCardDetails.email, 60, 390);

      // Website
      ctx.fillText("🌐   " + visitingCardDetails.website, 60, 440);

      // Address
      ctx.fillText("📍   " + visitingCardDetails.address, 60, 490);

      // Draw stylized QR Code
      const qrX = canvas.width - 230;
      const qrY = canvas.height - 230;
      const qrSize = 170;

      // QR container box
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(qrX - 10, qrY - 10, qrSize + 20, qrSize + 20);

      // QR patterns (black)
      ctx.fillStyle = "#000000";
      
      // Top-Left Anchor
      ctx.fillRect(qrX, qrY, 45, 45);
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(qrX + 10, qrY + 10, 25, 25);
      ctx.fillStyle = "#000000";
      ctx.fillRect(qrX + 15, qrY + 15, 15, 15);

      // Top-Right Anchor
      ctx.fillRect(qrX + qrSize - 45, qrY, 45, 45);
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(qrX + qrSize - 35, qrY + 10, 25, 25);
      ctx.fillStyle = "#000000";
      ctx.fillRect(qrX + qrSize - 30, qrY + 15, 15, 15);

      // Bottom-Left Anchor
      ctx.fillRect(qrX, qrY + qrSize - 45, 45, 45);
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(qrX + 10, qrY + qrSize - 35, 25, 25);
      ctx.fillStyle = "#000000";
      ctx.fillRect(qrX + 15, qrY + qrSize - 30, 15, 15);

      // Simulate random QR blocks
      for (let x = 10; x < qrSize - 10; x += 12) {
        for (let y = 10; y < qrSize - 10; y += 12) {
          // Skip anchors
          if (
            (x < 55 && y < 55) || 
            (x > qrSize - 55 && y < 55) || 
            (x < 55 && y > qrSize - 55)
          ) {
            continue;
          }
          if (Math.random() > 0.45) {
            ctx.fillStyle = "#000000";
            ctx.fillRect(qrX + x, qrY + y, 12, 12);
          }
        }
      }
    }

    // Trigger local download
    const dataUrl = canvas.toDataURL("image/png");
    const link = document.createElement("a");
    const cleanShopName = visitingCardDetails.shopName.toLowerCase().replace(/[^a-z0-9]/g, "-");
    link.download = `${cleanShopName}-visiting-card-${side}.png`;
    link.href = dataUrl;
    link.click();
  };

  // Handler to trigger standard print dialogue
  const handlePrintCard = () => {
    window.print();
  };


  // Dynamic products & location states
  const [products, setProducts] = useState(() => {
    const saved = localStorage.getItem("nishi_products");
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {}
    }
    return staticProducts;
  });
  const [storeLocation, setStoreLocation] = useState(() => {
    const saved = localStorage.getItem("nishi_location");
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {}
    }
    return staticLocation;
  });
  const [backendOnline, setBackendOnline] = useState(false);

  // Categories dynamic state
  const [categories, setCategories] = useState(() => {
    const saved = localStorage.getItem("nishi_categories");
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {}
    }
    return [
      { id: "pulses", name: "Pulses", emoji: "🥣" },
      { id: "rice", name: "Rice", emoji: "🌾" },
      { id: "fruits", name: "Fruits", emoji: "🍎" },
      { id: "vegetables", name: "Vegetables", emoji: "🥕" },
      { id: "oil", name: "Oil", emoji: "🍾" },
      { id: "soap", name: "Soap", emoji: "🧼" },
      { id: "shampoo", name: "Shampoo", emoji: "🧴" },
      { id: "dairy", name: "Dairy", emoji: "🥛" },
      { id: "snacks", name: "Snacks", emoji: "🍪" },
      { id: "beverages", name: "Beverages", emoji: "🥤" }
    ];
  });

  const [showCategoriesModal, setShowCategoriesModal] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState("");
  const [newCategoryEmoji, setNewCategoryEmoji] = useState("📦");
  const [editingCategoryId, setEditingCategoryId] = useState(null);
  const [editingCategoryName, setEditingCategoryName] = useState("");
  const [editingCategoryEmoji, setEditingCategoryEmoji] = useState("");

  useEffect(() => {
    localStorage.setItem("nishi_categories", JSON.stringify(categories));
    globalCategories = categories;
  }, [categories]);

  const handleAddCategory = () => {
    const name = newCategoryName.trim();
    if (!name) {
      alert("Category name is required");
      return;
    }
    const emoji = newCategoryEmoji.trim() || "📦";
    const id = name.toLowerCase().replace(/[^a-z0-9]/g, "-");

    if (categories.some(c => c.name.toLowerCase() === name.toLowerCase())) {
      alert("Category already exists!");
      return;
    }

    const newCat = { id, name, emoji };
    setCategories([...categories, newCat]);
    setNewCategoryName("");
    setNewCategoryEmoji("📦");
    triggerToast(`Category "${name}" added!`, "add");
  };

  const handleEditCategorySave = (id) => {
    const name = editingCategoryName.trim();
    if (!name) {
      alert("Category name is required");
      return;
    }
    const emoji = editingCategoryEmoji.trim() || "📦";

    const oldCategory = categories.find(c => c.id === id);
    if (!oldCategory) return;

    const oldName = oldCategory.name;

    if (categories.some(c => c.id !== id && c.name.toLowerCase() === name.toLowerCase())) {
      alert("Another category with this name already exists!");
      return;
    }

    const updatedCategories = categories.map(c => 
      c.id === id ? { ...c, name, emoji } : c
    );
    setCategories(updatedCategories);

    // Update products under the old category name
    const updatedProducts = products.map(p => {
      if (p.category.toLowerCase() === oldName.toLowerCase()) {
        return { ...p, category: name };
      }
      return p;
    });
    setProducts(updatedProducts);
    localStorage.setItem("nishi_products", JSON.stringify(updatedProducts));

    setEditingCategoryId(null);
    setEditingCategoryName("");
    setEditingCategoryEmoji("");
    triggerToast(`Category renamed to "${name}"!`, "add");
  };

  const handleDeleteCategory = (id) => {
    const cat = categories.find(c => c.id === id);
    if (!cat) return;

    if (!window.confirm(`Are you sure you want to delete category "${cat.name}"? Products under this category will remain, but they won't belong to any active category filter.`)) {
      return;
    }

    const updated = categories.filter(c => c.id !== id);
    setCategories(updated);
    triggerToast(`Category "${cat.name}" deleted`, "remove");
  };

  // Store Location Edit Form state
  const [tempAddress, setTempAddress] = useState("");
  const [tempLat, setTempLat] = useState("");
  const [tempLng, setTempLng] = useState("");

  // Update temp fields when storeLocation loads
  useEffect(() => {
    if (storeLocation) {
      setTempAddress(storeLocation.address || "");
      setTempLat(storeLocation.lat || "");
      setTempLng(storeLocation.lng || "");
    }
  }, [storeLocation]);

  // Product Directory Directory Search & Category Filters
  const [adminQuery, setAdminQuery] = useState("");
  const [adminCategory, setAdminCategory] = useState("all");

  const filteredAdminProducts = useMemo(() => {
    return products.filter((p) => {
      const matchesCategory =
        adminCategory === "all" || p.category.toLowerCase() === adminCategory.toLowerCase();
      const matchesSearch = p.name.toLowerCase().includes(adminQuery.toLowerCase());
      return matchesCategory && matchesSearch;
    });
  }, [products, adminQuery, adminCategory, categories]);

  // Modal display toggles
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editTargetProduct, setEditTargetProduct] = useState(null);

  // Form data state
  const [addForm, setAddForm] = useState({
    name: "",
    category: "",
    price: "",
    stock: "",
    image: "",
  });

  useEffect(() => {
    if (!addForm.category && categories.length > 0) {
      setAddForm(prev => ({ ...prev, category: categories[0].name }));
    }
  }, [categories, addForm.category]);

  // API Call: Save store metadata changes
  const handleLocationUpdate = async (e) => {
    e.preventDefault();
    const updated = {
      address: tempAddress,
      lat: parseFloat(tempLat) || 0,
      lng: parseFloat(tempLng) || 0,
    };
    
    // Update local state and persist to localStorage
    setStoreLocation(updated);
    localStorage.setItem("nishi_location", JSON.stringify(updated));
    triggerToast("Store location updated successfully!", "add");

    try {
      await fetch(getApiUrl("location"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updated),
      });
    } catch (err) {
      console.warn("Backend server offline, saved location updates locally in browser:", err);
    }
  };

  // API Call: Add new product to directory database
  const handleProductAdd = async (e) => {
    e.preventDefault();
    const newProduct = {
      id: String(products.length > 0 ? Math.max(...products.map(p => parseInt(p.id) || 0)) + 1 : 1),
      name: addForm.name,
      category: addForm.category,
      price: parseFloat(addForm.price) || 0,
      stock: parseInt(addForm.stock) || 0,
      image: addForm.image || "/25_product_images/toor dal.png",
    };

    const updatedProducts = [...products, newProduct];
    
    // Update local state and persist to localStorage
    setProducts(updatedProducts);
    localStorage.setItem("nishi_products", JSON.stringify(updatedProducts));
    triggerToast(`Added ${newProduct.name} to catalog!`, "add");
    setAddForm({ name: "", category: "Pulses", price: "", stock: "", image: "" });
    setShowAddModal(false);

    try {
      await fetch(getApiUrl("products"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updatedProducts),
      });
    } catch (err) {
      console.warn("Backend server offline, saved new product locally in browser:", err);
    }
  };

  // API Call: Save modifications to existing product
  const handleProductEditSubmit = async (e) => {
    e.preventDefault();
    if (!editTargetProduct) return;

    const updatedProducts = products.map((p) =>
      p.id === editTargetProduct.id ? editTargetProduct : p
    );

    // Update local state and persist to localStorage
    setProducts(updatedProducts);
    localStorage.setItem("nishi_products", JSON.stringify(updatedProducts));
    triggerToast(`Updated ${editTargetProduct.name} successfully!`, "add");
    setEditTargetProduct(null);
    setShowEditModal(false);

    try {
      await fetch(getApiUrl("products"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updatedProducts),
      });
    } catch (err) {
      console.warn("Backend server offline, saved product updates locally in browser:", err);
    }
  };

  // API Call: Delete product record from catalog
  const handleProductDelete = async (id) => {
    const productToDelete = products.find((p) => p.id === id);
    if (!productToDelete) return;
    
    if (!window.confirm(`Are you sure you want to delete ${productToDelete.name}?`)) {
      return;
    }

    const updatedProducts = products.filter((p) => p.id !== id);

    // Update local state and persist to localStorage
    setProducts(updatedProducts);
    localStorage.setItem("nishi_products", JSON.stringify(updatedProducts));
    triggerToast(`Deleted ${productToDelete.name} from catalog`, "remove");

    try {
      await fetch(getApiUrl("products"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updatedProducts),
      });
    } catch (err) {
      console.warn("Backend server offline, deleted product locally in browser:", err);
    }
  };

  // API Call: Handle uploading images via Express server multipart upload
  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // FileReader to load image to base64 if network is offline
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64String = reader.result;
      if (showEditModal) {
        setEditTargetProduct({ ...editTargetProduct, image: base64String });
      } else {
        setAddForm({ ...addForm, image: base64String });
      }
      triggerToast("Image loaded successfully!", "add");
    };

    const formData = new FormData();
    formData.append("image", file);

    try {
      const res = await fetch(getApiUrl("upload"), {
        method: "POST",
        body: formData,
      });
      if (res.ok) {
        const data = await res.json();
        if (showEditModal) {
          setEditTargetProduct({ ...editTargetProduct, image: data.url });
        } else {
          setAddForm({ ...addForm, image: data.url });
        }
        triggerToast("Image uploaded successfully!", "add");
      } else {
        // Fallback to base64 reader
        reader.readAsDataURL(file);
      }
    } catch (err) {
      console.warn("Backend offline, converting image to local base64 format:", err);
      reader.readAsDataURL(file);
    }
  };

  // Fetch products and location from Express backend, fallback to static JSON if offline
  useEffect(() => {
    const fetchConfig = async () => {
      try {
        const resProducts = await fetch(getApiUrl("products"));
        if (resProducts.ok) {
          const data = await resProducts.json();
          setProducts(data);
          localStorage.setItem("nishi_products", JSON.stringify(data));
          setBackendOnline(true);
        }
      } catch (err) {
        console.warn("Backend server offline, using browser storage fallback:", err);
        setBackendOnline(false);
      }

      try {
        const resLocation = await fetch(getApiUrl("location"));
        if (resLocation.ok) {
          const data = await resLocation.json();
          setStoreLocation(data);
          localStorage.setItem("nishi_location", JSON.stringify(data));
        }
      } catch (err) {
        console.warn("Backend server offline, using browser storage fallback:", err);
      }
    };
    fetchConfig();

    // Log dummy products to console for debug/logging as before
    fetch("https://dummyjson.com/products")
      .then(res => res.json())
      .then(data => console.log(data))
      .catch(err => console.error("Error fetching dummy products:", err));
  }, []);

  // Sync authentication states to localStorage whenever they change
  useEffect(() => {
    if (isAuthenticated) {
      localStorage.setItem("nishi_isAuthenticated", "true");
      localStorage.setItem("nishi_currentUser", currentUser);
    } else {
      localStorage.removeItem("nishi_isAuthenticated");
      localStorage.removeItem("nishi_currentUser");
    }
  }, [isAuthenticated, currentUser]);

  useEffect(() => {
    localStorage.setItem("nishi_profileDetails", JSON.stringify(profileDetails));
  }, [profileDetails]);

  useEffect(() => {
    localStorage.setItem("nishi_cart", JSON.stringify(cart));
  }, [cart]);

  // Sync map page routing state to URL hash and localStorage
  useEffect(() => {
    localStorage.setItem("nishi_showMapPage", showMapPage);
    if (showMapPage) {
      if (window.location.hash !== "#map") {
        window.location.hash = "map";
      }
    } else {
      if (window.location.hash === "#map") {
        window.history.pushState("", document.title, window.location.pathname + window.location.search);
      }
    }
  }, [showMapPage]);

  // Sync admin page routing state to URL hash
  useEffect(() => {
    if (showAdminPage) {
      if (window.location.hash !== "#admin") {
        window.location.hash = "admin";
      }
    } else {
      if (window.location.hash === "#admin") {
        window.history.pushState("", document.title, window.location.pathname + window.location.search);
      }
    }
  }, [showAdminPage]);

  // Sync product catalog page routing state to URL hash
  useEffect(() => {
    if (showProductCatalog) {
      if (window.location.hash !== "#catalog") {
        window.location.hash = "catalog";
      }
    } else {
      if (window.location.hash === "#catalog") {
        window.history.pushState("", document.title, window.location.pathname + window.location.search);
      }
    }
  }, [showProductCatalog]);

  // Listen to browser hashchange events to toggle showMapPage, showAdminPage, and showProductCatalog
  useEffect(() => {
    const handleHashChange = () => {
      setShowMapPage(window.location.hash === "#map");
      setShowAdminPage(window.location.hash === "#admin");
      setShowProductCatalog(window.location.hash === "#catalog");
    };
    window.addEventListener("hashchange", handleHashChange);
    return () => window.removeEventListener("hashchange", handleHashChange);
  }, []);

  // State for free OpenStreetMap-based address suggestions
  const [addressSuggestions, setAddressSuggestions] = useState([]);
  const [showAddressSuggestions, setShowAddressSuggestions] = useState(false);
  const [selectedFromSuggestions, setSelectedFromSuggestions] = useState(false);

  // Free Autocomplete query and debounce logic using Photon API
  useEffect(() => {
    if (selectedFromSuggestions) {
      setSelectedFromSuggestions(false);
      return;
    }

    const query = checkoutDetails.houseNo;
    if (!query || query.trim().length < 3) {
      setAddressSuggestions([]);
      setShowAddressSuggestions(false);
      return;
    }

    const delayDebounceFn = setTimeout(() => {
      // bbox format: minLon, minLat, maxLon, maxLat (expanded Karjan Taluka bounds: 72.98,21.82,73.26,22.12)
      const urlWithBounds = `https://photon.komoot.io/api?q=${encodeURIComponent(query)}&bbox=72.98,21.82,73.26,22.12&limit=5`;

      const processFeatures = (features) => {
        return features.map((feature) => {
          const props = feature.properties;
          const parts = [
            props.name,
            props.street,
            props.city || props.town,
            props.state,
            props.country
          ].filter(Boolean);
          
          const uniqueParts = [];
          parts.forEach(p => {
            if (!uniqueParts.some(existing => existing.toLowerCase() === p.toLowerCase())) {
              uniqueParts.push(p);
            }
          });

          return {
            name: props.name || props.street || "Unknown Place",
            formattedAddress: uniqueParts.join(", "),
            pincode: props.postcode || "",
          };
        });
      };

      fetch(urlWithBounds)
        .then((res) => res.json())
        .then((data) => {
          if (data && data.features && data.features.length > 0) {
            setAddressSuggestions(processFeatures(data.features));
            setShowAddressSuggestions(true);
          } else {
            // Fallback: search wider (Gujarat/India)
            const fallbackUrl = `https://photon.komoot.io/api?q=${encodeURIComponent(query)}&limit=5`;
            fetch(fallbackUrl)
              .then((res) => res.json())
              .then((fallbackData) => {
                if (fallbackData && fallbackData.features) {
                  // Filter to India results or prioritize them
                  const filtered = fallbackData.features.filter(
                    f => f.properties.countrycode === "IN"
                  );
                  const finalFeatures = filtered.length > 0 ? filtered : fallbackData.features;
                  setAddressSuggestions(processFeatures(finalFeatures));
                  setShowAddressSuggestions(true);
                }
              })
              .catch((err) => console.error("Photon fallback error:", err));
          }
        })
        .catch((err) => {
          console.error("Photon autocomplete error:", err);
        });
    }, 350); // 350ms debounce

    return () => clearTimeout(delayDebounceFn);
  }, [checkoutDetails.houseNo]);

  // Quick view & toast states
  const [selectedProductDetails, setSelectedProductDetails] = useState(null);
  const [toast, setToast] = useState(null); // Stores { message: "...", type: "add" | "remove" }
  const [toastTimeoutId, setToastTimeoutId] = useState(null);

  const triggerToast = (message, type = "add") => {
    if (toastTimeoutId) clearTimeout(toastTimeoutId);
    setToast({ message, type });
    const id = setTimeout(() => {
      setToast(null);
    }, 2200);
    setToastTimeoutId(id);
  };

  // Cart operations
  const addToCart = (productId) => {
    setCart((prevCart) => ({
      ...prevCart,
      [productId]: (prevCart[productId] || 0) + 1,
    }));
    const product = products.find((p) => p.id === productId);
    if (product) {
      triggerToast(`Added ${product.emoji || getCategoryEmoji(product.category)} ${product.name} to cart!`, "add");
    }
    setIsCartAnimating(true);
    setTimeout(() => setIsCartAnimating(false), 400);
  };

  const removeFromCart = (productId) => {
    setCart((prevCart) => {
      const updated = { ...prevCart };
      if (updated[productId] > 1) {
        updated[productId] -= 1;
      } else {
        delete updated[productId];
      }
      return updated;
    });
    const product = products.find((p) => p.id === productId);
    if (product) {
      triggerToast(`Removed 1 ${product.emoji || getCategoryEmoji(product.category)} ${product.name} from cart`, "remove");
    }
  };

  const clearItemFromCart = (productId) => {
    setCart((prevCart) => {
      const updated = { ...prevCart };
      delete updated[productId];
      return updated;
    });
    const product = products.find((p) => p.id === productId);
    if (product) {
      triggerToast(`Deleted all ${product.emoji || getCategoryEmoji(product.category)} ${product.name} from cart`, "remove");
    }
  };

  const totalCartCount = useMemo(() => {
    return Object.values(cart).reduce((sum, qty) => sum + qty, 0);
  }, [cart]);

  const totalCartPrice = useMemo(() => {
    return Object.entries(cart).reduce((total, [id, qty]) => {
      const product = products.find((p) => p.id === id);
      return total + (product ? product.price * qty : 0);
    }, 0);
  }, [cart]);

  // Filtered Products
  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      const matchesCategory =
        selectedCategory === "all" || 
        product.category.toLowerCase() === selectedCategory.toLowerCase() ||
        categories.some(cat => cat.id === selectedCategory && cat.name.toLowerCase() === product.category.toLowerCase());
      const matchesSearch = product.name
        .toLowerCase()
        .includes(searchQuery.toLowerCase());
      return matchesCategory && matchesSearch;
    });
  }, [selectedCategory, searchQuery, products, categories]);

  const handleCheckout = () => {
    setShowCheckoutForm(true);
  };

  const handleCheckoutFormSubmit = (e) => {
    e.preventDefault();
    
    // Validate form
    if (!checkoutDetails.houseNo.trim()) {
      alert("Please enter your house number/address");
      return;
    }
    if (!checkoutDetails.pincode.trim()) {
      alert("Please enter your pincode");
      return;
    }
    if (!/^\d{5,6}$/.test(checkoutDetails.pincode)) {
      alert("Please enter a valid pincode (5-6 digits)");
      return;
    }
    if (!checkoutDetails.mobileNo.trim()) {
      alert("Please enter your mobile number");
      return;
    }
    if (!/^\d{10}$/.test(checkoutDetails.mobileNo.replace(/\D/g, ""))) {
      alert("Please enter a valid 10-digit mobile number");
      return;
    }

    // Proceed with checkout
    setCheckoutLoading(true);
    setTimeout(() => {
      setCheckoutLoading(false);
      setCheckoutSuccess(true);
      setShowCheckoutForm(false);
    }, 1200);
  };

  const handleCloseSuccessModal = () => {
    setCart({});
    setCheckoutSuccess(false);
    setIsCartOpen(false);
    setCheckoutDetails({ houseNo: "", pincode: "", mobileNo: "" });
  };

  // Auth form submissions
  const handleAuthSubmit = (e) => {
    e.preventDefault();
    setError("");

    if (isLogin) {
      if (!loginIdentifier.trim()) {
        setError("Username or Email is required");
        return;
      }
      if (!loginPassword) {
        setError("Password is required");
        return;
      }
      if (loginPassword.length < 6) {
        setError("Password must be at least 6 characters");
        return;
      }

      setLoading(true);
      setTimeout(() => {
        setLoading(false);
        if (loginType === "admin") {
          if (loginIdentifier.trim() === "admin@gmail.com" && loginPassword === "nishi@12345") {
            setIsAuthenticated(true);
            setCurrentUser("Admin");
            setShowAdminPage(true);
            setProfileDetails({
              username: "Admin",
              email: "admin@gmail.com",
              phone: "+91 99999 99999",
              password: "nishi@12345"
            });
            triggerToast("Admin authenticated successfully!", "add");
          } else {
            setError("Invalid username and password");
            triggerToast("Invalid username and password", "error");
            alert("Invalid username and password");
          }
          return;
        }

        setIsAuthenticated(true);
        setCurrentUser(loginIdentifier);
        setProfileDetails({
          username: loginIdentifier,
          email: loginIdentifier.includes("@") ? loginIdentifier : `${loginIdentifier}@superstore.com`,
          phone: "+91 98765 43210",
          password: loginPassword
        });
      }, 950);
    } else {
      if (!username.trim()) {
        setError("Username is required");
        return;
      }
      if (username.trim().length < 3) {
        setError("Username must be at least 3 characters");
        return;
      }
      if (!email.trim()) {
        setError("Email address is required");
        return;
      }
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email.trim())) {
        setError("Please enter a valid email address");
        return;
      }
      if (!phone.trim()) {
        setError("Phone number is required");
        return;
      }
      const digitsOnly = phone.replace(/\D/g, "");
      if (digitsOnly.length < 8) {
        setError("Please enter a valid phone number (min 8 digits)");
        return;
      }
      if (!password) {
        setError("Password is required");
        return;
      }
      if (password.length < 6) {
        setError("Password must be at least 6 characters");
        return;
      }

      setLoading(true);
      setTimeout(() => {
        setLoading(false);
        setIsAuthenticated(true);
        setCurrentUser(username);
        setProfileDetails({
          username: username,
          email: email,
          phone: phone,
          password: password
        });
      }, 950);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("nishi_isAuthenticated");
    localStorage.removeItem("nishi_currentUser");
    localStorage.removeItem("nishi_profileDetails");
    localStorage.removeItem("nishi_cart");
    setIsAuthenticated(false);
    setCurrentUser("");
    setCart({});
    setSearchQuery("");
    setSelectedCategory("all");
    setIsCartOpen(false);
    setCheckoutSuccess(false);
    setShowCheckoutForm(false);
    setCheckoutDetails({ houseNo: "", pincode: "", mobileNo: "" });
    setIsProfileMenuOpen(false);
    setShowProfileModal(false);
    setShowSettingsModal(false);
    setShowProfilePassword(false);
    
    // Reset inputs
    setLoginPassword("");
    setPassword("");
  };

  const toggleAuthMode = (mode) => {
    setIsLogin(mode);
    setError("");
    setShowPassword(false);
  };

  // Dedicated Map Page View (Visible to logged-in & guest users)
  if (showMapPage) {
    return (
      <div className="min-h-screen bg-colorful-mesh text-zinc-100 flex flex-col font-sans select-none relative overflow-x-hidden">
        {/* Floating Colorful Blur Orbs */}
        <div className="absolute top-[10%] left-[20%] w-[200px] h-[200px] sm:w-[350px] sm:h-[350px] bg-purple-500/20 rounded-full blur-[80px] sm:blur-[100px] pointer-events-none animate-float-1" />
        <div className="absolute top-[45%] right-[10%] w-[220px] h-[220px] sm:w-[400px] sm:h-[400px] bg-emerald-500/15 rounded-full blur-[90px] sm:blur-[110px] pointer-events-none animate-float-2" />
        <div className="absolute bottom-[10%] left-[30%] w-[200px] h-[200px] sm:w-[380px] sm:h-[380px] bg-pink-500/15 rounded-full blur-[80px] sm:blur-[100px] pointer-events-none animate-float-3" />

        {/* Dynamic header grid overlay */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff02_1px,transparent_1px),linear-gradient(to_bottom,#ffffff02_1px,transparent_1px)] bg-[size:3.5rem_3.5rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] pointer-events-none" />

        {/* Store Top Navigation Header for Map Page */}
        <header className="sticky top-0 z-30 bg-[#09090b]/80 backdrop-blur-xl border-b border-zinc-850 px-4 md:px-6 py-3.5 flex items-center justify-between">
          <div className="flex items-center gap-2 md:gap-3">
            <div className="relative w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 via-teal-500 to-cyan-600 flex items-center justify-center shadow-lg">
              <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-6 h-6">
                <path d="M25 70V30M25 30L75 70M75 70V30" stroke="white" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
              </svg>
            </div>
            <span className="text-lg font-extrabold text-white">Nishi Super Store</span>
          </div>
          <button
            onClick={() => setShowMapPage(false)}
            className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 text-white text-xs font-bold flex items-center gap-2 cursor-pointer transition-all active:scale-95 shadow-md shadow-emerald-900/35 border border-emerald-500/30"
          >
            <span>⬅️</span>
            <span>Back to Shop</span>
          </button>
        </header>

        {/* Main locator map body */}
        <main className="flex-1 max-w-7xl w-full mx-auto px-6 py-8 relative z-10 flex flex-col justify-center">
          <div className="relative rounded-3xl bg-zinc-950/70 border border-zinc-850 p-6 sm:p-8 overflow-hidden shadow-2xl backdrop-blur-md">
            <div className="absolute -inset-1 bg-gradient-to-r from-emerald-500/5 to-teal-500/5 opacity-50 blur-xl pointer-events-none" />
            
            {/* Title banner */}
            <div className="relative flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-zinc-850 pb-6 mb-8">
              <div>
                <h2 className="text-xl md:text-2xl font-extrabold tracking-tight text-white text-left">
                  Visit Our Store
                </h2>
                <p className="text-zinc-400 text-xs font-light mt-1 max-w-xl text-left">
                  Drop by our store in Nava Bazar, Karjan. Check our operating timings or get instant directions below.
                </p>
              </div>
              <div className="flex items-center gap-2 px-4 py-2 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-emerald-400 text-xs font-semibold">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                Physical Store Open Today
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 relative z-10">
              {/* Left Column: Contact and Information cards */}
              <div className="lg:col-span-5 space-y-6 flex flex-col justify-between">
                
                {/* Store Address info Card */}
                <div className="bg-zinc-900/40 border border-zinc-800/80 rounded-2xl p-5 text-left space-y-3">
                  <div className="flex items-center gap-2.5">
                    <span className="text-emerald-400 text-lg">📍</span>
                    <h4 className="font-extrabold text-sm text-white uppercase tracking-wider">Store Location</h4>
                  </div>
                  <p className="text-xs text-zinc-300 font-medium leading-relaxed">
                    Nishi Super Store<br />
                    Nava Bazar, Karjan, Gujarat 391240
                  </p>
                  <p className="text-[11px] text-zinc-500 font-medium italic">
                    Located near Sadi bazar area, Karjan Taluka.
                  </p>
                </div>

                {/* Operating Timings info Card */}
                <div className="bg-zinc-900/40 border border-zinc-800/80 rounded-2xl p-5 text-left space-y-3">
                  <div className="flex items-center gap-2.5">
                    <span className="text-emerald-400 text-lg">⏰</span>
                    <h4 className="font-extrabold text-sm text-white uppercase tracking-wider">Store Hours</h4>
                  </div>
                  <div className="space-y-1.5 text-xs text-zinc-350">
                    <div className="flex justify-between">
                      <span className="text-zinc-400">Monday - Saturday</span>
                      <span className="font-semibold">08:00 AM - 10:00 PM</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-zinc-400">Sunday</span>
                      <span className="font-semibold">09:00 AM - 08:00 PM</span>
                    </div>
                  </div>
                </div>

                {/* Quick support info Card */}
                <div className="bg-zinc-900/40 border border-zinc-800/80 rounded-2xl p-5 text-left space-y-3">
                  <div className="flex items-center gap-2.5">
                    <span className="text-emerald-400 text-lg">☎️</span>
                    <h4 className="font-extrabold text-sm text-white uppercase tracking-wider">Contact & Support</h4>
                  </div>
                  <div className="space-y-1.5 text-xs text-zinc-300">
                    <div className="flex items-center gap-2">
                      <span className="text-zinc-500">Phone:</span>
                      <a href="tel:+919876543210" className="text-emerald-400 hover:underline font-semibold">+91 98765 43210</a>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-zinc-500">Email:</span>
                      <a href="mailto:nishi@superstore.com" className="text-emerald-400 hover:underline font-semibold">nishi@superstore.com</a>
                    </div>
                  </div>
                </div>

                {/* Store Features badges */}
                <div className="flex flex-wrap gap-2 pt-2">
                  {["🛒 In-store Shopping", "🚚 Home Delivery", "💳 Secure Payments", "🅿️ Free Parking"].map((feature, i) => (
                    <span key={i} className="px-3 py-1.5 rounded-lg bg-zinc-900/80 border border-zinc-800 text-[10px] font-bold text-zinc-400 uppercase tracking-wide">
                      {feature}
                    </span>
                  ))}
                </div>
              </div>

              {/* Right Column: Interactive Map */}
              <div className="lg:col-span-7 overflow-hidden rounded-2xl border border-zinc-800/80">
                <StoreMap storeLocation={storeLocation} />
              </div>
            </div>
          </div>
        </main>
      </div>
    );
  }

  // ── PRODUCT CATALOG PAGE ──
  if (showProductCatalog) {
    return (
      <div className="min-h-screen bg-colorful-mesh text-zinc-100 flex flex-col font-sans select-none relative overflow-x-hidden">
        {/* Floating Blur Orbs */}
        <div className="absolute top-[5%] left-[10%] w-[300px] h-[300px] bg-teal-500/10 rounded-full blur-[100px] pointer-events-none animate-float-1" />
        <div className="absolute bottom-[10%] right-[5%] w-[350px] h-[350px] bg-emerald-500/10 rounded-full blur-[110px] pointer-events-none animate-float-2" />
        <div className="absolute top-[50%] left-[50%] w-[250px] h-[250px] bg-cyan-500/8 rounded-full blur-[90px] pointer-events-none animate-float-3" />

        {/* Header */}
        <header className="sticky top-0 z-30 bg-[#09090b]/85 backdrop-blur-xl border-b border-zinc-850 px-4 md:px-6 py-3.5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="relative w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 via-teal-500 to-cyan-600 flex items-center justify-center shadow-lg">
              <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-6 h-6">
                <path d="M25 70V30M25 30L75 70M75 70V30" stroke="white" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
              </svg>
            </div>
            <div className="text-left">
              <span className="text-base font-extrabold text-white block leading-none">Product Catalog</span>
              <span className="text-[9px] text-emerald-450 font-bold uppercase tracking-wider block mt-0.5">Admin Portal · Nishi Super Store</span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className={`hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-xl border text-[10px] font-bold tracking-wide uppercase ${
              backendOnline
                ? "bg-emerald-550/10 border-emerald-500/30 text-emerald-400"
                : "bg-red-550/10 border-red-500/30 text-red-400 animate-pulse"
            }`}>
              <span className={`w-1.5 h-1.5 rounded-full ${backendOnline ? "bg-emerald-400" : "bg-red-400"}`} />
              {backendOnline ? "Live" : "Offline"}
            </div>
            <button
              onClick={() => setShowProductCatalog(false)}
              className="px-3.5 py-1.5 rounded-xl bg-zinc-900 border border-zinc-800 hover:bg-zinc-800 hover:border-zinc-700 text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer transition-all active:scale-95 shadow-md"
            >
              <span>⬅️</span>
              <span>Back to Dashboard</span>
            </button>
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 max-w-7xl w-full mx-auto px-4 md:px-6 py-8 space-y-6 relative z-10">

          {/* Page Title + Stats Row */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h2 className="text-2xl md:text-3xl font-black text-white tracking-tight">Product Catalog</h2>
              <p className="text-zinc-500 text-xs mt-1">Manage all items in the store inventory — add, edit, or remove products.</p>
            </div>
            <div className="flex flex-wrap gap-3">
              <div className="px-4 py-2.5 rounded-xl bg-zinc-950/70 border border-zinc-850 text-left">
                <span className="text-[9px] text-zinc-500 uppercase tracking-wider font-bold block">Total</span>
                <span className="text-lg font-black text-white">{products.length}</span>
              </div>
              <div className="px-4 py-2.5 rounded-xl bg-zinc-950/70 border border-zinc-850 text-left">
                <span className="text-[9px] text-zinc-500 uppercase tracking-wider font-bold block">Low Stock</span>
                <span className={`text-lg font-black ${products.filter(p => (p.stock || 0) < 10).length > 0 ? "text-amber-400" : "text-white"}`}>{products.filter(p => (p.stock || 0) < 10).length}</span>
              </div>
              <div className="px-4 py-2.5 rounded-xl bg-zinc-950/70 border border-zinc-850 text-left">
                <span className="text-[9px] text-zinc-500 uppercase tracking-wider font-bold block">Categories</span>
                <span className="text-lg font-black text-white">{[...new Set(products.map(p => p.category))].length}</span>
              </div>
            </div>
          </div>

          {/* Category Quick-Filter Pills */}
          <div className="flex items-center gap-2 overflow-x-auto scrollbar-none py-1.5 w-full">
            {[{ id: "all", name: "all", emoji: "🛒" }, ...categories].map((catObj) => {
              const catName = catObj.name;
              const catEmoji = catObj.emoji;
              const isActive = adminCategory === catName;
              return (
                <button
                  key={catObj.id}
                  onClick={() => setAdminCategory(catName)}
                  className={`px-3 py-1.5 rounded-xl text-[11px] font-bold flex items-center gap-1.5 border transition-all duration-200 cursor-pointer active:scale-95 whitespace-nowrap ${
                    isActive
                      ? "bg-emerald-500/20 border-emerald-500/40 text-emerald-350 shadow-[0_0_12px_rgba(16,185,129,0.15)]"
                      : "bg-zinc-950/70 border-zinc-800 text-zinc-400 hover:text-white hover:border-zinc-700"
                  }`}
                >
                  <span>{catEmoji}</span>
                  <span>{catName === "all" ? "All" : catName}</span>
                </button>
              );
            })}
          </div>

          {/* Catalog Panel */}
          <div className="bg-zinc-950/70 border border-zinc-850 rounded-3xl backdrop-blur-md shadow-2xl overflow-hidden">
            {/* Toolbar */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 border-b border-zinc-850">
              <div className="relative flex-1 max-w-sm">
                <svg className="w-4 h-4 text-zinc-500 absolute left-3.5 top-1/2 -translate-y-1/2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
                </svg>
                <input
                  type="text"
                  value={adminQuery}
                  onChange={(e) => setAdminQuery(e.target.value)}
                  placeholder="Search products by name..."
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-xl pl-9 pr-4 py-2.5 text-xs text-white placeholder-zinc-550 focus:outline-none focus:border-emerald-500 transition-all"
                />
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setShowCategoriesModal(true)}
                  className="px-4 py-2.5 bg-zinc-900 border border-zinc-800 hover:bg-zinc-800 text-zinc-350 hover:text-white text-xs font-bold rounded-xl transition-all flex items-center gap-2 cursor-pointer active:scale-95 shadow-md self-start sm:self-auto"
                >
                  <span className="text-base">🏷️</span>
                  <span>Manage Categories</span>
                </button>
                <button
                  onClick={() => setShowAddModal(true)}
                  className="px-5 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-bold rounded-xl transition-all flex items-center gap-2 cursor-pointer shadow-lg shadow-emerald-950/30 active:scale-95 border border-emerald-500/20 self-start sm:self-auto"
                >
                  <span className="text-base">➕</span>
                  <span>Add New Product</span>
                </button>
              </div>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse min-w-[600px]">
                <thead>
                  <tr className="border-b border-zinc-850 text-zinc-500 text-[10px] font-bold uppercase tracking-wider bg-zinc-950/50">
                    <th className="py-4 px-5">Product</th>
                    <th className="py-4 px-5">Category</th>
                    <th className="py-4 px-5">Price</th>
                    <th className="py-4 px-5">Stock</th>
                    <th className="py-4 px-5 text-center">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-850/60 text-xs text-zinc-200">
                  {filteredAdminProducts.map((p, idx) => (
                    <tr key={p.id} className="hover:bg-zinc-900/40 transition-all duration-200 group">
                      <td className="py-3.5 px-5">
                        <div className="flex items-center gap-3">
                          <div className="w-11 h-11 rounded-xl bg-zinc-900 border border-zinc-800 flex items-center justify-center overflow-hidden flex-shrink-0 group-hover:border-emerald-500/30 transition-all">
                            {p.image
                              ? <img src={p.image} className="w-full h-full object-contain" alt={p.name} />
                              : <span className="text-xl">{getCategoryEmoji(p.category)}</span>
                            }
                          </div>
                          <div>
                            <span className="font-bold text-white text-[13px] block">{p.name}</span>
                            <span className="text-zinc-600 text-[10px]">ID #{p.id}</span>
                          </div>
                        </div>
                      </td>
                      <td className="py-3.5 px-5">
                        <span className="px-2.5 py-1 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/15 text-[10px] font-extrabold uppercase tracking-wide">
                          {p.category}
                        </span>
                      </td>
                      <td className="py-3.5 px-5">
                        <span className="font-black text-white text-[14px]">₹{p.price.toFixed(2)}</span>
                      </td>
                      <td className="py-3.5 px-5">
                        <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[10px] font-bold ${
                          p.stock === 0
                            ? "bg-red-500/10 text-red-400 border border-red-500/20"
                            : p.stock < 10
                              ? "bg-amber-500/10 text-amber-400 border border-amber-500/20"
                              : "bg-zinc-800 text-zinc-300 border border-zinc-700/40"
                        }`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${
                            p.stock === 0 ? "bg-red-400" : p.stock < 10 ? "bg-amber-400" : "bg-emerald-400"
                          }`} />
                          {p.stock === 0 ? "Out of Stock" : `${p.stock} units`}
                        </span>
                      </td>
                      <td className="py-3.5 px-5">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() => { setEditTargetProduct({ ...p }); setShowEditModal(true); }}
                            className="px-3 py-1.5 rounded-xl bg-zinc-900 border border-zinc-800 hover:border-emerald-500/50 hover:bg-emerald-500/10 text-zinc-400 hover:text-emerald-400 transition-all duration-200 cursor-pointer active:scale-90 text-xs font-bold flex items-center gap-1.5"
                          >
                            <span>✏️</span>
                            <span className="hidden sm:inline">Edit</span>
                          </button>
                          <button
                            onClick={() => handleProductDelete(p.id)}
                            className="px-3 py-1.5 rounded-xl bg-zinc-900 border border-zinc-800 hover:border-red-500/50 hover:bg-red-500/10 text-zinc-400 hover:text-red-400 transition-all duration-200 cursor-pointer active:scale-90 text-xs font-bold flex items-center gap-1.5"
                          >
                            <span>🗑️</span>
                            <span className="hidden sm:inline">Delete</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {filteredAdminProducts.length === 0 && (
                    <tr>
                      <td colSpan="5" className="py-20 text-center">
                        <div className="flex flex-col items-center gap-3">
                          <span className="text-4xl">📦</span>
                          <p className="text-zinc-500 font-medium text-sm">No products match your search.</p>
                          <p className="text-zinc-600 text-xs">Try adjusting your filters or add a new product.</p>
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Footer count */}
            {filteredAdminProducts.length > 0 && (
              <div className="px-5 py-3 border-t border-zinc-850 flex items-center justify-between">
                <span className="text-[11px] text-zinc-600">Showing {filteredAdminProducts.length} of {products.length} products</span>
                {adminQuery || adminCategory !== "all" ? (
                  <button
                    onClick={() => { setAdminQuery(""); setAdminCategory("all"); }}
                    className="text-[11px] text-emerald-500 hover:text-emerald-400 font-semibold cursor-pointer transition-colors"
                  >
                    Clear Filters
                  </button>
                ) : null}
              </div>
            )}
          </div>
        </main>

        {/* Add Modal */}
        {showAddModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
            <div className="relative bg-[#09090b] border border-zinc-800 rounded-3xl p-6 sm:p-8 max-w-md w-full text-left space-y-5 shadow-2xl overflow-hidden animate-fadeIn">
              <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 to-teal-500/5 pointer-events-none rounded-3xl" />
              <div className="relative flex items-center justify-between border-b border-zinc-850 pb-4">
                <div>
                  <h3 className="text-base font-extrabold text-white">Add New Product</h3>
                  <p className="text-zinc-600 text-[11px] mt-0.5">Fill in the product details below</p>
                </div>
                <button onClick={() => setShowAddModal(false)} className="p-2 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white cursor-pointer transition-all hover:border-zinc-700">✕</button>
              </div>
              <form onSubmit={handleProductAdd} className="relative space-y-4 text-xs">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider block">Product Name</label>
                  <input type="text" required value={addForm.name} onChange={(e) => setAddForm({...addForm, name: e.target.value})} className="w-full px-3.5 py-2.5 bg-zinc-900 border border-zinc-800 rounded-xl text-white focus:outline-none focus:border-emerald-500 transition-all" placeholder="e.g. Toor Dal Premium 1kg" />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider block">Category</label>
                  <select value={addForm.category} onChange={(e) => setAddForm({...addForm, category: e.target.value})} className="w-full px-3.5 py-2.5 bg-zinc-900 border border-zinc-800 rounded-xl text-zinc-300 focus:outline-none focus:border-emerald-500 cursor-pointer">
                    {categories.map(c => (
                      <option key={c.id} value={c.name}>{c.emoji} {c.name}</option>
                    ))}
                  </select>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider block">Price (₹)</label>
                    <input type="number" required min="0.01" step="0.01" value={addForm.price} onChange={(e) => setAddForm({...addForm, price: e.target.value})} className="w-full px-3.5 py-2.5 bg-zinc-900 border border-zinc-800 rounded-xl text-white focus:outline-none focus:border-emerald-500 transition-all" />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider block">Stock Level</label>
                    <input type="number" required min="0" value={addForm.stock} onChange={(e) => setAddForm({...addForm, stock: e.target.value})} className="w-full px-3.5 py-2.5 bg-zinc-900 border border-zinc-800 rounded-xl text-white focus:outline-none focus:border-emerald-500 transition-all" />
                  </div>
                </div>
                <div className="space-y-2 border-t border-zinc-850 pt-3">
                  <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider block">Product Image</label>
                  <div className="flex gap-3 items-center">
                    <input type="file" accept="image/*" onChange={handleImageUpload} className="text-[11px] text-zinc-400 flex-1 file:mr-3 file:py-1.5 file:px-3 file:rounded-xl file:border-0 file:text-[10px] file:font-semibold file:bg-emerald-500/10 file:text-emerald-450 file:hover:bg-emerald-500/20 cursor-pointer" />
                    {addForm.image && (
                      <div className="w-12 h-12 rounded-xl bg-zinc-900 border border-zinc-800 overflow-hidden flex-shrink-0">
                        <img src={addForm.image} className="w-full h-full object-contain" alt="Preview" />
                      </div>
                    )}
                  </div>
                  <input type="text" value={addForm.image} onChange={(e) => setAddForm({...addForm, image: e.target.value})} className="w-full px-3 py-2 bg-zinc-900 border border-zinc-800 rounded-xl text-white focus:outline-none focus:border-emerald-500 transition-all" placeholder="/25_product_images/apple.png or paste URL" />
                </div>
                <button type="submit" className="w-full py-3.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold rounded-xl transition-all cursor-pointer text-xs mt-2 shadow-lg active:scale-95">
                  Add Product to Catalog
                </button>
              </form>
            </div>
          </div>
        )}

        {/* Edit Modal */}
        {showEditModal && editTargetProduct && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
            <div className="relative bg-[#09090b] border border-zinc-800 rounded-3xl p-6 sm:p-8 max-w-md w-full text-left space-y-5 shadow-2xl overflow-hidden animate-fadeIn">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-purple-500/5 pointer-events-none rounded-3xl" />
              <div className="relative flex items-center justify-between border-b border-zinc-850 pb-4">
                <div>
                  <h3 className="text-base font-extrabold text-white">Edit Product</h3>
                  <p className="text-zinc-600 text-[11px] mt-0.5">Update the details for this product</p>
                </div>
                <button onClick={() => { setShowEditModal(false); setEditTargetProduct(null); }} className="p-2 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white cursor-pointer transition-all hover:border-zinc-700">✕</button>
              </div>
              <form onSubmit={handleProductEditSubmit} className="relative space-y-4 text-xs">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider block">Product Name</label>
                  <input type="text" required value={editTargetProduct.name} onChange={(e) => setEditTargetProduct({...editTargetProduct, name: e.target.value})} className="w-full px-3.5 py-2.5 bg-zinc-900 border border-zinc-800 rounded-xl text-white focus:outline-none focus:border-emerald-500 transition-all" />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider block">Category</label>
                  <select value={editTargetProduct.category} onChange={(e) => setEditTargetProduct({...editTargetProduct, category: e.target.value})} className="w-full px-3.5 py-2.5 bg-zinc-900 border border-zinc-800 rounded-xl text-zinc-300 focus:outline-none focus:border-emerald-500 cursor-pointer">
                    {categories.map(c => (
                      <option key={c.id} value={c.name}>{c.emoji} {c.name}</option>
                    ))}
                  </select>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider block">Price (₹)</label>
                    <input type="number" required min="0.01" step="0.01" value={editTargetProduct.price} onChange={(e) => setEditTargetProduct({...editTargetProduct, price: parseFloat(e.target.value) || 0})} className="w-full px-3.5 py-2.5 bg-zinc-900 border border-zinc-800 rounded-xl text-white focus:outline-none focus:border-emerald-500 transition-all" />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider block">Stock Level</label>
                    <input type="number" required min="0" value={editTargetProduct.stock} onChange={(e) => setEditTargetProduct({...editTargetProduct, stock: parseInt(e.target.value) || 0})} className="w-full px-3.5 py-2.5 bg-zinc-900 border border-zinc-800 rounded-xl text-white focus:outline-none focus:border-emerald-500 transition-all" />
                  </div>
                </div>
                <div className="space-y-2 border-t border-zinc-850 pt-3">
                  <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider block">Product Image</label>
                  <div className="flex gap-3 items-center">
                    <input type="file" accept="image/*" onChange={handleImageUpload} className="text-[11px] text-zinc-400 flex-1 file:mr-3 file:py-1.5 file:px-3 file:rounded-xl file:border-0 file:text-[10px] file:font-semibold file:bg-emerald-500/10 file:text-emerald-450 file:hover:bg-emerald-500/20 cursor-pointer" />
                    {editTargetProduct.image && (
                      <div className="w-12 h-12 rounded-xl bg-zinc-900 border border-zinc-800 overflow-hidden flex-shrink-0">
                        <img src={editTargetProduct.image} className="w-full h-full object-contain" alt="Preview" />
                      </div>
                    )}
                  </div>
                  <input type="text" value={editTargetProduct.image} onChange={(e) => setEditTargetProduct({...editTargetProduct, image: e.target.value})} className="w-full px-3 py-2 bg-zinc-900 border border-zinc-800 rounded-xl text-white focus:outline-none focus:border-emerald-500 transition-all" />
                </div>
                <button type="submit" className="w-full py-3.5 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white font-bold rounded-xl transition-all cursor-pointer text-xs mt-2 shadow-lg active:scale-95">
                  Save Changes
                </button>
              </form>
            </div>
          </div>
        )}

        {/* Categories Modal */}
        {showCategoriesModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
            <div className="relative bg-[#09090b] border border-zinc-800 rounded-3xl p-6 sm:p-8 max-w-lg w-full text-left space-y-5 shadow-2xl overflow-hidden animate-fadeIn">
              <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 to-teal-500/5 pointer-events-none rounded-3xl" />
              <div className="relative flex items-center justify-between border-b border-zinc-850 pb-4">
                <div>
                  <h3 className="text-base font-extrabold text-white">Manage Categories</h3>
                  <p className="text-zinc-500 text-[11px] mt-0.5">Add, rename, or remove product categories</p>
                </div>
                <button
                  onClick={() => {
                    setShowCategoriesModal(false);
                    setEditingCategoryId(null);
                  }}
                  className="p-2 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white cursor-pointer transition-all hover:border-zinc-700"
                >
                  ✕
                </button>
              </div>

              {/* Add New Category Section */}
              <div className="bg-zinc-950/40 border border-zinc-850/80 rounded-2xl p-4 space-y-3 relative z-10">
                <h4 className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block">Add New Category</h4>
                <div className="flex gap-2 text-xs">
                  <div className="w-14">
                    <input
                      type="text"
                      maxLength="2"
                      value={newCategoryEmoji}
                      onChange={(e) => setNewCategoryEmoji(e.target.value)}
                      placeholder="Emoji"
                      className="w-full text-center px-2 py-2.5 bg-zinc-900 border border-zinc-800 rounded-xl text-white focus:outline-none focus:border-emerald-500 text-base"
                    />
                  </div>
                  <div className="flex-1">
                    <input
                      type="text"
                      value={newCategoryName}
                      onChange={(e) => setNewCategoryName(e.target.value)}
                      placeholder="e.g. Organic Grains"
                      className="w-full px-3.5 py-2.5 bg-zinc-900 border border-zinc-800 rounded-xl text-white focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                  <button
                    onClick={handleAddCategory}
                    className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl transition-all cursor-pointer shadow-md active:scale-95"
                  >
                    Add
                  </button>
                </div>
              </div>

              {/* Categories list */}
              <div className="space-y-2 relative z-10">
                <h4 className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block">All Categories ({categories.length})</h4>
                <div className="max-h-[220px] overflow-y-auto pr-1 space-y-2 scrollbar-thin">
                  {categories.map((c) => {
                    const isEditing = editingCategoryId === c.id;
                    return (
                      <div key={c.id} className="flex items-center justify-between p-3 rounded-xl bg-zinc-900/60 border border-zinc-850 hover:border-zinc-800 transition-all gap-3 text-xs">
                        {isEditing ? (
                          <div className="flex gap-2 flex-1 items-center">
                            <input
                              type="text"
                              maxLength="2"
                              value={editingCategoryEmoji}
                              onChange={(e) => setEditingCategoryEmoji(e.target.value)}
                              className="w-12 text-center px-1 py-1.5 bg-zinc-950 border border-zinc-800 rounded-lg text-white text-base focus:outline-none focus:border-emerald-500"
                            />
                            <input
                              type="text"
                              value={editingCategoryName}
                              onChange={(e) => setEditingCategoryName(e.target.value)}
                              className="flex-1 px-2.5 py-1.5 bg-zinc-950 border border-zinc-800 rounded-lg text-white focus:outline-none focus:border-emerald-500"
                            />
                          </div>
                        ) : (
                          <div className="flex items-center gap-2.5 text-white font-semibold">
                            <span className="text-lg bg-zinc-950/60 w-9 h-9 rounded-lg border border-zinc-850 flex items-center justify-center">{c.emoji}</span>
                            <span>{c.name}</span>
                          </div>
                        )}

                        <div className="flex items-center gap-1.5">
                          {isEditing ? (
                            <>
                              <button
                                onClick={() => handleEditCategorySave(c.id)}
                                className="px-2.5 py-1.5 rounded-lg bg-emerald-600/20 border border-emerald-500/30 text-emerald-450 hover:bg-emerald-600 hover:text-white font-bold transition-all text-[11px] cursor-pointer"
                              >
                                Save
                              </button>
                              <button
                                onClick={() => setEditingCategoryId(null)}
                                className="px-2.5 py-1.5 rounded-lg bg-zinc-800 border border-zinc-700 text-zinc-300 hover:bg-zinc-700 font-bold transition-all text-[11px] cursor-pointer"
                              >
                                Cancel
                              </button>
                            </>
                          ) : (
                            <>
                              <button
                                onClick={() => {
                                  setEditingCategoryId(c.id);
                                  setEditingCategoryName(c.name);
                                  setEditingCategoryEmoji(c.emoji);
                                }}
                                className="p-2 rounded-lg bg-zinc-950 border border-zinc-850 hover:border-emerald-500/40 text-emerald-450 hover:text-white hover:bg-emerald-650/10 transition-all cursor-pointer"
                                title="Edit Category Name"
                              >
                                ✏️
                              </button>
                              <button
                                onClick={() => handleDeleteCategory(c.id)}
                                className="p-2 rounded-lg bg-zinc-950 border border-zinc-850 hover:border-red-500/40 text-red-400 hover:text-white hover:bg-red-650/10 transition-all cursor-pointer"
                                title="Delete Category"
                              >
                                🗑️
                              </button>
                            </>
                          )}
                        </div>
                      </div>
                    );
                  })}
                  {categories.length === 0 && (
                    <div className="py-8 text-center text-zinc-650 italic">No categories created yet.</div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Toast */}
        {toast && (
          <div className={`fixed bottom-6 right-6 z-55 animate-fadeIn bg-zinc-950/95 backdrop-blur-md border px-5 py-3.5 rounded-2xl shadow-2xl flex items-center gap-3 ${
            toast.type === "add" ? "border-emerald-500/30 shadow-[0_10px_30px_rgba(16,185,129,0.15)]" : "border-red-500/30 shadow-[0_10px_30px_rgba(239,68,68,0.15)]"
          }`}>
            <span className="text-xs font-semibold tracking-wide text-zinc-200">{toast.message}</span>
          </div>
        )}
      </div>
    );
  }

  // ── ADMIN DASHBOARD HOME ──
  if (showAdminPage) {
    return (
      <div className="min-h-screen bg-colorful-mesh text-zinc-100 flex flex-col font-sans select-none relative overflow-x-hidden">
        {/* Floating Blur Orbs */}
        <div className="absolute top-[10%] left-[20%] w-[350px] h-[350px] bg-purple-500/10 rounded-full blur-[100px] pointer-events-none animate-float-1" />
        <div className="absolute bottom-[10%] right-[10%] w-[380px] h-[380px] bg-emerald-500/10 rounded-full blur-[110px] pointer-events-none animate-float-2" />
        <div className="absolute top-[50%] left-[5%] w-[300px] h-[300px] bg-teal-500/8 rounded-full blur-[90px] pointer-events-none animate-float-3" />

        {/* Header */}
        <header className="sticky top-0 z-30 bg-[#09090b]/80 backdrop-blur-xl border-b border-zinc-850 px-4 md:px-6 py-3.5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="relative w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 via-teal-500 to-cyan-600 flex items-center justify-center shadow-lg">
              <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-6 h-6">
                <path d="M25 70V30M25 30L75 70M75 70V30" stroke="white" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
              </svg>
            </div>
            <div className="text-left">
              <span className="text-base font-extrabold text-white block leading-none">Nishi Super Store</span>
              <span className="text-[9px] text-emerald-450 font-bold uppercase tracking-wider block mt-1">Admin Portal</span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border text-[10px] font-bold tracking-wide uppercase transition-all ${
              backendOnline
                ? "bg-emerald-550/10 border-emerald-500/30 text-emerald-400"
                : "bg-red-550/10 border-red-500/30 text-red-400 animate-pulse"
            }`}>
              <span className={`w-1.5 h-1.5 rounded-full ${backendOnline ? "bg-emerald-400" : "bg-red-400"}`} />
              {backendOnline ? "Live Connected" : "Read-Only Fallback"}
            </div>
            <button
              onClick={() => setShowAdminPage(false)}
              className="px-3.5 py-1.5 rounded-xl bg-zinc-900 border border-zinc-800 hover:bg-zinc-800 hover:border-zinc-700 text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer transition-all active:scale-95 shadow-md"
            >
              <span>⬅️</span>
              <span>Back to Shop</span>
            </button>
          </div>
        </header>

        {/* Main body */}
        <main className="flex-1 max-w-7xl w-full mx-auto px-4 md:px-6 py-8 space-y-8 relative z-10">

          {/* Welcome Banner */}
          <div className="relative rounded-3xl overflow-hidden bg-gradient-to-br from-zinc-950/90 via-zinc-900/70 to-zinc-950/90 border border-zinc-850 p-7 shadow-2xl backdrop-blur-md">
            <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/8 via-teal-500/5 to-cyan-500/8 pointer-events-none" />
            <div className="absolute -top-6 -right-6 w-40 h-40 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
            <div className="relative flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-2xl">🛠️</span>
                  <span className="px-2.5 py-0.5 bg-emerald-500/15 border border-emerald-500/25 text-emerald-400 text-[10px] font-extrabold uppercase tracking-wider rounded-full">Admin Dashboard</span>
                </div>
                <h2 className="text-2xl md:text-3xl font-black text-white tracking-tight">Welcome, Admin!</h2>
                <p className="text-zinc-500 text-sm mt-1.5 max-w-md">Manage your store, update inventory, configure settings, and oversee your product catalog from here.</p>
              </div>
              <div className="flex flex-col items-start md:items-end gap-2">
                <span className="text-[11px] text-zinc-600">Today</span>
                <span className="text-zinc-300 font-semibold text-sm">{new Date().toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
              </div>
            </div>
          </div>

          {/* Analytics Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-zinc-950/70 border border-zinc-850 p-5 rounded-2xl backdrop-blur-md text-left shadow-lg hover:border-zinc-750 transition-all group">
              <div className="flex items-center justify-between mb-3">
                <span className="text-zinc-500 text-[10px] uppercase tracking-wider font-bold">Total Products</span>
                <span className="text-xl group-hover:scale-110 transition-transform">📦</span>
              </div>
              <p className="text-3xl font-black text-white">{products.length}</p>
              <p className="text-[10px] text-zinc-600 mt-1">items in database</p>
            </div>
            <div className="bg-zinc-950/70 border border-zinc-850 p-5 rounded-2xl backdrop-blur-md text-left shadow-lg hover:border-zinc-750 transition-all group">
              <div className="flex items-center justify-between mb-3">
                <span className="text-zinc-500 text-[10px] uppercase tracking-wider font-bold">Inventory Value</span>
                <span className="text-xl group-hover:scale-110 transition-transform">💰</span>
              </div>
              <p className="text-3xl font-black text-white">₹{products.reduce((acc, p) => acc + (p.price * (p.stock || 0)), 0).toLocaleString()}</p>
              <p className="text-[10px] text-zinc-600 mt-1">total stock value</p>
            </div>
            <div className="bg-zinc-950/70 border border-zinc-850 p-5 rounded-2xl backdrop-blur-md text-left shadow-lg hover:border-zinc-750 transition-all group">
              <div className="flex items-center justify-between mb-3">
                <span className="text-zinc-500 text-[10px] uppercase tracking-wider font-bold">Low / Out of Stock</span>
                <span className="text-xl group-hover:scale-110 transition-transform">⚠️</span>
              </div>
              <p className={`text-3xl font-black ${products.filter(p => (p.stock || 0) < 10).length > 0 ? "text-amber-400" : "text-white"}`}>
                {products.filter(p => (p.stock || 0) < 10).length}
              </p>
              <p className="text-[10px] text-zinc-600 mt-1">items need restocking</p>
            </div>
            <div className="bg-zinc-950/70 border border-zinc-850 p-5 rounded-2xl backdrop-blur-md text-left shadow-lg hover:border-zinc-750 transition-all group">
              <div className="flex items-center justify-between mb-3">
                <span className="text-zinc-500 text-[10px] uppercase tracking-wider font-bold">Server Status</span>
                <span className="text-xl group-hover:scale-110 transition-transform">🖥️</span>
              </div>
              <p className={`text-xl font-black ${backendOnline ? "text-emerald-400" : "text-red-400"}`}>
                {backendOnline ? "🟢 ONLINE" : "🔴 OFFLINE"}
              </p>
              <p className="text-[10px] text-zinc-600 mt-1">{backendOnline ? "all systems running" : "fallback mode active"}</p>
            </div>
          </div>

          {/* Main Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">

            {/* Left: Store Settings */}
            <div className="lg:col-span-5 space-y-6">
              <div className="bg-zinc-950/70 border border-zinc-850 p-6 rounded-3xl backdrop-blur-md text-left space-y-5 shadow-xl">
                <div className="flex items-center gap-3 border-b border-zinc-850 pb-4">
                  <div className="w-9 h-9 rounded-xl bg-zinc-900 border border-zinc-800 flex items-center justify-center text-lg">🗺️</div>
                  <div>
                    <h3 className="text-sm font-extrabold text-white">Store Settings</h3>
                    <p className="text-zinc-500 text-[11px] mt-0.5">Update store location & address</p>
                  </div>
                </div>
                <form onSubmit={handleLocationUpdate} className="space-y-4 text-xs">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider block">Physical Address</label>
                    <input
                      type="text" required value={tempAddress}
                      onChange={(e) => setTempAddress(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-zinc-900 border border-zinc-800 rounded-xl text-white placeholder-zinc-600 focus:outline-none focus:border-emerald-500 transition-all"
                      placeholder="Nava Bazar, Karjan, Gujarat..."
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider block">Latitude</label>
                      <input type="number" step="0.000001" required value={tempLat} onChange={(e) => setTempLat(e.target.value)} className="w-full px-3.5 py-2.5 bg-zinc-900 border border-zinc-800 rounded-xl text-white focus:outline-none focus:border-emerald-500 transition-all" />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider block">Longitude</label>
                      <input type="number" step="0.000001" required value={tempLng} onChange={(e) => setTempLng(e.target.value)} className="w-full px-3.5 py-2.5 bg-zinc-900 border border-zinc-800 rounded-xl text-white focus:outline-none focus:border-emerald-500 transition-all" />
                    </div>
                  </div>
                  <button type="submit" className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl transition-all cursor-pointer shadow-md active:scale-[0.98]">
                    Update Location Config
                  </button>
                </form>
              </div>
            </div>

            {/* Right: Quick Actions */}
            <div className="lg:col-span-7 space-y-4">
              <div className="flex items-center gap-2 mb-1">
                <h3 className="text-sm font-extrabold text-white">Quick Actions</h3>
                <span className="text-zinc-600 text-xs">— manage store operations</span>
              </div>

              {/* PRODUCT CATALOG CARD — Main CTA */}
              <button
                onClick={() => setShowProductCatalog(true)}
                className="w-full group relative overflow-hidden rounded-3xl border border-emerald-500/20 bg-gradient-to-br from-emerald-950/60 via-teal-950/40 to-zinc-950/80 p-6 text-left cursor-pointer transition-all duration-300 hover:border-emerald-500/40 hover:shadow-[0_0_40px_rgba(16,185,129,0.15)] active:scale-[0.99] shadow-xl"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/8 to-teal-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
                <div className="absolute -top-4 -right-4 w-28 h-28 bg-emerald-500/10 rounded-full blur-2xl group-hover:bg-emerald-500/20 transition-all duration-300 pointer-events-none" />
                <div className="relative flex items-start justify-between gap-4">
                  <div className="flex items-start gap-4">
                    <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-lg shadow-emerald-900/40 flex-shrink-0 group-hover:shadow-emerald-700/50 transition-all">
                      <span className="text-2xl">📋</span>
                    </div>
                    <div>
                      <span className="px-2 py-0.5 bg-emerald-500/15 border border-emerald-500/20 text-emerald-400 text-[9px] font-extrabold uppercase tracking-wider rounded-full block mb-1.5 w-fit">Management</span>
                      <h4 className="text-lg font-black text-white group-hover:text-emerald-100 transition-colors">Product Catalog</h4>
                      <p className="text-zinc-500 text-[12px] mt-1 leading-relaxed">View, add, edit and delete all products in the store inventory. Manage stock levels and categories.</p>
                      <div className="flex items-center gap-4 mt-3">
                        <span className="text-emerald-400 text-[11px] font-bold">{products.length} Products</span>
                        <span className="text-zinc-700">·</span>
                        <span className="text-zinc-500 text-[11px]">{[...new Set(products.map(p => p.category))].length} Categories</span>
                        {products.filter(p => (p.stock || 0) < 10).length > 0 && (
                          <>
                            <span className="text-zinc-700">·</span>
                            <span className="text-amber-400 text-[11px] font-bold animate-pulse">{products.filter(p => (p.stock || 0) < 10).length} Low Stock</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex-shrink-0 w-9 h-9 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 group-hover:bg-emerald-500/20 group-hover:scale-110 transition-all mt-1">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </div>
              </button>

              {/* Secondary Info Cards Row */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="rounded-2xl border border-zinc-850 bg-zinc-950/60 p-5 text-left backdrop-blur-md shadow-lg">
                  <div className="flex items-center gap-2.5 mb-3">
                    <span className="text-lg">🏪</span>
                    <h4 className="text-xs font-extrabold text-white uppercase tracking-wide">Store Info</h4>
                  </div>
                  <p className="text-[11px] text-zinc-400 leading-relaxed">Nishi Super Store<br />Nava Bazar, Karjan, Gujarat 391240</p>
                  <p className="text-[10px] text-zinc-600 mt-2 italic">Mon–Sat: 8AM–10PM · Sun: 9AM–8PM</p>
                </div>
                <div className="rounded-2xl border border-zinc-850 bg-zinc-950/60 p-5 text-left backdrop-blur-md shadow-lg">
                  <div className="flex items-center gap-2.5 mb-3">
                    <span className="text-lg">📊</span>
                    <h4 className="text-xs font-extrabold text-white uppercase tracking-wide">Category Split</h4>
                  </div>
                  <div className="space-y-1.5">
                    {[...new Set(products.map(p => p.category))].slice(0, 4).map(cat => (
                      <div key={cat} className="flex items-center justify-between">
                        <span className="text-[11px] text-zinc-400">{getCategoryEmoji(cat)} {cat}</span>
                        <span className="text-[11px] font-bold text-white">{products.filter(p => p.category === cat).length}</span>
                      </div>
                    ))}
                    {[...new Set(products.map(p => p.category))].length > 4 && (
                      <p className="text-[10px] text-zinc-600 mt-1">+ {[...new Set(products.map(p => p.category))].length - 4} more categories</p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>

        {/* Toast */}
        {toast && (
          <div className={`fixed bottom-6 right-6 z-55 animate-fadeIn bg-zinc-950/95 backdrop-blur-md border px-5 py-3.5 rounded-2xl shadow-2xl flex items-center gap-3 ${
            toast.type === "add" ? "border-emerald-500/30 shadow-[0_10px_30px_rgba(16,185,129,0.15)]" : "border-red-500/30 shadow-[0_10px_30px_rgba(239,68,68,0.15)]"
          }`}>
            <span className="text-xs font-semibold tracking-wide text-zinc-200">{toast.message}</span>
          </div>
        )}
      </div>
    );
  }

    // Render Store Page
    if (isAuthenticated) {
      return (
      <div className="min-h-screen bg-colorful-mesh text-zinc-100 flex flex-col font-sans select-none relative overflow-x-hidden">
        {/* Floating Colorful Blur Orbs */}
        <div className="absolute top-[10%] left-[20%] w-[200px] h-[200px] sm:w-[350px] sm:h-[350px] bg-purple-500/20 rounded-full blur-[80px] sm:blur-[100px] pointer-events-none animate-float-1" />
        <div className="absolute top-[45%] right-[10%] w-[220px] h-[220px] sm:w-[400px] sm:h-[400px] bg-emerald-500/15 rounded-full blur-[90px] sm:blur-[110px] pointer-events-none animate-float-2" />
        <div className="absolute bottom-[10%] left-[30%] w-[200px] h-[200px] sm:w-[380px] sm:h-[380px] bg-pink-500/15 rounded-full blur-[80px] sm:blur-[100px] pointer-events-none animate-float-3" />

        {/* Dynamic header grid overlay */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff02_1px,transparent_1px),linear-gradient(to_bottom,#ffffff02_1px,transparent_1px)] bg-[size:3.5rem_3.5rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] pointer-events-none" />

        {/* Store Top Navigation Header */}
        <header className="sticky top-0 z-30 bg-[#09090b]/80 backdrop-blur-xl border-b border-zinc-850 px-4 md:px-6 py-3 md:py-4 grid grid-cols-2 md:flex items-center justify-between gap-y-3 md:gap-0">
          {/* Left side: Logo + Store Name */}
          <div className="flex items-center gap-2 md:gap-3">
            {/* Unique Logo Design */}
            <div className="flex-shrink-0 relative group">
              <div className="relative w-12 h-12 md:w-14 md:h-14 rounded-xl bg-gradient-to-br from-emerald-500 via-teal-500 to-cyan-600 p-0 flex items-center justify-center shadow-lg shadow-emerald-500/30 hover:shadow-emerald-500/50 transition-all duration-300 overflow-hidden">
                {/* Animated background gradient */}
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-0 group-hover:opacity-20 animate-pulse" />
                
                {/* Unique N logo with retail elements */}
                <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-8 h-8 md:w-10 md:h-10 relative z-10">
                  {/* Letter N for Nishi */}
                  <path d="M25 70V30M25 30L75 70M75 70V30" stroke="white" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
                  
                  {/* Shopping cart elements in corners */}
                  <circle cx="85" cy="20" r="3" fill="#fbbf24"/>
                  <circle cx="15" cy="80" r="3" fill="#34d399"/>
                  <circle cx="80" cy="75" r="2.5" fill="#fbbf24"/>
                </svg>
              </div>
              
              {/* Decorative shine effect */}
              <div className="absolute -inset-1 rounded-xl bg-gradient-to-r from-emerald-400/20 to-cyan-400/20 -z-10 blur opacity-0 group-hover:opacity-100 transition-all duration-300" />
            </div>

            {/* Store Name - Matched Size with Logo */}
            {/* Store Name - Matched Size with Logo */}
            <div className="relative flex flex-col gap-0 justify-center">
              <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight bg-gradient-to-r from-white via-emerald-100 to-emerald-400 bg-clip-text text-transparent whitespace-nowrap leading-none">
                <span className="inline md:block">Nishi</span>
                <span className="inline md:hidden font-bold bg-gradient-to-r from-cyan-400 via-teal-400 to-emerald-400 bg-clip-text text-transparent ml-1.5">Super Store</span>
              </h1>
              <h2 className="hidden md:block -mt-5 text-lg sm:text-xl md:text-2xl font-bold bg-gradient-to-r from-cyan-400 via-teal-400 to-emerald-400 bg-clip-text text-transparent whitespace-nowrap leading-none">
                Super Store
              </h2>
              <p className="hidden md:block text-[7px] sm:text-[8px] text-emerald-400 font-bold tracking-wider uppercase mt-1">
                ✓ Fresh • Quality • Trusted
              </p>
            </div>
          </div>

          {/* Search bar inside header */}
          <div className="flex relative w-full col-span-2 order-last md:order-none md:max-w-sm md:mx-4">
            <svg className="w-4 h-4 text-zinc-500 absolute left-3.5 top-1/2 -translate-y-1/2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
            </svg>
            <input
              type="text"
              placeholder="Search premium items..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-zinc-900/90 border border-zinc-800 rounded-xl pl-10 pr-4 py-2 text-sm text-white focus:outline-none focus:border-emerald-500 transition duration-300"
            />
          </div>

          {/* User profile & cart trigger */}
          <div className="flex items-center gap-3 md:gap-4 justify-self-end">
            {/* Shopping Cart button trigger */}
            <button
              onClick={() => setIsCartOpen(true)}
              className={`relative p-2.5 rounded-xl bg-zinc-900 border border-zinc-855 hover:border-emerald-500/50 hover:bg-zinc-900/60 transition-all duration-300 flex items-center gap-2 cursor-pointer active:scale-95 ${
                isCartAnimating ? "animate-cartPulse border-emerald-500/80 text-emerald-400" : ""
              }`}
            >
              <svg className="w-5 h-5 text-zinc-400 hover:text-emerald-400 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.2" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"></path>
              </svg>
              {totalCartCount > 0 && (
                <span className="absolute -top-1.5 -right-1.5 bg-gradient-to-r from-emerald-500 to-green-600 text-white font-bold text-[10px] w-5 h-5 flex items-center justify-center rounded-full border border-zinc-955 shadow-lg animate-pulse">
                  {totalCartCount}
                </span>
              )}
              <span className="hidden sm:inline text-xs font-semibold text-zinc-300">
                ₹{totalCartPrice.toFixed(2)}
              </span>
            </button>

            {/* Profile button with dropdown list-wise options */}
            <div className="relative inline-block text-left">
              <button
                onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
                className="p-2.5 rounded-xl bg-[#062c17] border border-[#0f512d] hover:border-[#198754] hover:bg-[#0b3c21] text-emerald-400 hover:text-emerald-300 transition-all duration-300 cursor-pointer flex items-center justify-center active:scale-95 shadow-[0_0_15px_rgba(16,185,129,0.1)]"
                title="User Profile & Settings"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.2" d="M16 7a4 4 0 11-8 0 4 4 0 118 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
                </svg>
              </button>

              {isProfileMenuOpen && (
                <>
                  {/* Click outside overlay to close */}
                  <div 
                    className="fixed inset-0 z-10" 
                    onClick={() => setIsProfileMenuOpen(false)} 
                  />
                  
                  {/* Profile Dropdown Menu */}
                  <div className="absolute right-0 mt-2.5 w-48 bg-[#041d10]/95 backdrop-blur-2xl border border-[#0b3c21] rounded-2xl shadow-[0_25px_50px_-12px_rgba(0,0,0,0.95)] p-2 z-20 space-y-1 animate-fadeIn">
                    <div className="px-3 py-2 border-b border-[#0b3c21]/50 text-left">
                      <p className="text-[9px] text-emerald-500/80 font-bold uppercase tracking-wider">Signed In As</p>
                      <p className="text-xs font-bold text-white truncate mt-0.5">{currentUser}</p>
                    </div>
                    <button
                      onClick={() => {
                        setIsProfileMenuOpen(false);
                        setActiveProfileTab("details");
                        setShowProfileModal(true);
                      }}
                      className="w-full px-3 py-2.5 rounded-xl text-xs font-semibold text-emerald-100/90 hover:text-white hover:bg-[#062c17]/60 transition-all text-left flex items-center gap-2 cursor-pointer"
                    >
                      <span>👤</span>
                      <span>Profile</span>
                    </button>
                    <button
                      onClick={() => {
                        setIsProfileMenuOpen(false);
                        setShowSettingsModal(true);
                      }}
                      className="w-full px-3 py-2.5 rounded-xl text-xs font-semibold text-emerald-100/90 hover:text-white hover:bg-[#062c17]/60 transition-all text-left flex items-center gap-2 cursor-pointer"
                    >
                      <span>⚙️</span>
                      <span>Setting</span>
                    </button>
                    <button
                      onClick={() => {
                        setIsProfileMenuOpen(false);
                        setActiveProfileTab("card");
                        setShowProfileModal(true);
                      }}
                      className="w-full px-3 py-2.5 rounded-xl text-xs font-semibold text-emerald-100/90 hover:text-white hover:bg-[#062c17]/60 transition-all text-left flex items-center gap-2 cursor-pointer"
                    >
                      <span>📇</span>
                      <span>Visiting Card</span>
                    </button>
                    <button
                      onClick={() => {
                        setIsProfileMenuOpen(false);
                        setShowAdminPage(true);
                      }}
                      className="w-full px-3 py-2.5 rounded-xl text-xs font-semibold text-emerald-100/90 hover:text-white hover:bg-[#062c17]/60 transition-all text-left flex items-center gap-2 cursor-pointer border-t border-[#0b3c21]/30 mt-1 pt-1.5"
                    >
                      <span>🛠️</span>
                      <span>Admin Panel</span>
                    </button>
                    <button
                      onClick={() => {
                        setIsProfileMenuOpen(false);
                        triggerToast("Opening help center...", "add");
                      }}
                      className="w-full px-3 py-2.5 rounded-xl text-xs font-semibold text-emerald-100/90 hover:text-white hover:bg-[#062c17]/60 transition-all text-left flex items-center gap-2 cursor-pointer"
                    >
                      <span>❓</span>
                      <span>Help & Support</span>
                    </button>
                    
                    {/* Logout Option (Last item) */}
                    <button
                      onClick={() => {
                        setIsProfileMenuOpen(false);
                        handleLogout();
                      }}
                      className="w-full px-3 py-2.5 rounded-xl text-xs font-semibold text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-all text-left flex items-center gap-2 cursor-pointer border border-transparent hover:border-red-500/20"
                    >
                      <span>🚪</span>
                      <span>Log Out</span>
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </header>

        {/* Categories Horizontal Slide Bar (Outside header, matching body background) */}
        <div className="max-w-7xl w-full mx-auto px-6 pt-6 relative z-20 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
          <div className="flex items-center gap-2 overflow-x-auto scrollbar-none py-1.5 flex-1 w-full">
            {[{ id: "all", name: "All Items", emoji: "🛒" }, ...categories].map((category) => (
              <button
                key={category.id}
                onClick={() => setSelectedCategory(category.id)}
                className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all duration-200 cursor-pointer flex items-center gap-2 border whitespace-nowrap active:scale-95 ${
                  selectedCategory === category.id
                    ? "bg-emerald-500/20 text-emerald-350 border-emerald-500/40 shadow-[0_0_12px_rgba(16,185,129,0.15)]"
                    : "bg-zinc-950/85 backdrop-blur-md border-zinc-800/80 text-zinc-100 hover:text-white hover:bg-zinc-900"
                }`}
              >
                <span className="text-[14px]">{category.emoji}</span>
                <span>{category.name}</span>
              </button>
            ))}
          </div>
          <div className="flex gap-2 self-start md:self-auto">
            <button
              onClick={() => setShowMapPage(true)}
              className="flex-shrink-0 px-4 py-2.5 rounded-xl text-xs font-bold transition-all duration-200 cursor-pointer flex items-center justify-center gap-2 border bg-emerald-500/10 border-emerald-500/30 text-emerald-450 hover:text-white hover:bg-emerald-600 active:scale-95 shadow-md"
              title="View Store Location Map"
            >
              <span>📍</span>
              <span>Visit Our Store</span>
            </button>
          </div>
        </div>


        {/* Main Content Area */}
        <main className="flex-1 max-w-7xl w-full mx-auto px-6 py-8 space-y-8 relative z-10">
          
          {/* Welcome Dashboard Banner */}
          <div className="relative rounded-3xl bg-zinc-950/70 border border-zinc-850 p-6 overflow-hidden shadow-2xl backdrop-blur-md">
            <div className="absolute -inset-1 bg-gradient-to-r from-emerald-500/5 to-teal-500/5 opacity-50 blur-xl pointer-events-none" />
            <div className="relative flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <div>
                <h2 className="text-2xl font-extrabold tracking-tight text-white text-left">
                  Welcome to <span className="bg-gradient-to-r from-emerald-400 via-teal-300 to-green-400 bg-clip-text text-transparent">Nishi Super Store</span>, {currentUser}!
                </h2>
                <p className="text-zinc-400 text-xs font-light mt-1 max-w-xl text-left">
                  Shop our premium selection of organic groceries, fresh local pulses, farm fruits, and daily food items handpicked for your kitchen.
                </p>
              </div>
              <div className="flex items-center gap-2 px-4 py-2 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-emerald-400 text-xs font-semibold">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                Live Store Connection Active
              </div>
            </div>
          </div>



          {/* Product Grid Section */}
          <div className="space-y-4">
            <div className="flex items-center justify-between pl-1">
              <h3 className="text-sm font-bold tracking-wider text-zinc-400">
                Products ({filteredProducts.length})
              </h3>
              {searchQuery && (
                <span className="text-xs text-zinc-500">
                  Search results for "{searchQuery}"
                </span>
              )}
            </div>

            {filteredProducts.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {filteredProducts.map((product) => (
                  <div
                    key={product.id}
                    onClick={() => setSelectedProductDetails(product)}
                    className="group relative bg-zinc-950/70 hover:bg-zinc-900/50 border border-zinc-855 hover:border-zinc-700/80 rounded-2xl p-5 shadow-lg transition-all duration-300 flex flex-col justify-between overflow-hidden backdrop-blur-md cursor-pointer hover:scale-[1.02] active:scale-[0.97]"
                  >
                    {/* Hover Glow decoration inside card */}
                    <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/5 rounded-full blur-2xl pointer-events-none group-hover:bg-emerald-500/10 transition-colors" />

                    <div>
                      {/* Product Header details */}
                      <div className="flex items-center justify-between mb-4">
                        {product.image ? (
                          <div className="w-14 h-14 rounded-xl bg-zinc-900/40 p-1 flex items-center justify-center overflow-hidden flex-shrink-0">
                            <img src={product.image} className="w-full h-full object-contain" alt={product.name} />
                          </div>
                        ) : (
                          <span className="text-3xl select-none">{product.emoji || getCategoryEmoji(product.category)}</span>
                        )}
                        <span className="text-[10px] font-bold tracking-widest text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 rounded-full px-2.5 py-0.5 uppercase">
                          {product.category}
                        </span>
                      </div>

                      {/* Product Info */}
                      <div className="space-y-1 text-left">
                        <h4 className="text-sm font-semibold text-white group-hover:text-emerald-400 transition-colors line-clamp-1">
                          {product.name}
                        </h4>
                        <p className="text-zinc-500 text-xs">
                          {product.stock !== undefined ? `Stock: ${product.stock} units` : `Unit: ${product.unit}`}
                        </p>
                      </div>

                      {/* Product Ratings */}
                      <div className="flex items-center gap-1.5 mt-2">
                        <span className="text-amber-400 text-xs">★</span>
                        <span className="text-zinc-300 text-xs font-semibold">
                          {product.rating || (4.0 + (Number(product.id) % 10) * 0.1).toFixed(1)}
                        </span>
                      </div>
                    </div>

                    {/* Price and Action Button footer */}
                    <div className="flex items-center justify-between mt-5 pt-3 border-t border-zinc-900">
                      <div className="text-left">
                        <p className="text-[10px] text-zinc-500 font-semibold tracking-wider">PRICE</p>
                        <p className="text-base font-extrabold text-white">
                          ₹{product.price.toFixed(2)}
                        </p>
                      </div>

                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          addToCart(product.id);
                        }}
                        className="p-2.5 rounded-xl bg-zinc-900 group-hover:bg-emerald-600 border border-zinc-805 group-hover:border-emerald-500 text-zinc-300 group-hover:text-white transition-all duration-300 hover:scale-110 active:scale-95 cursor-pointer"
                        title="Add to Cart"
                      >
                        <svg className="w-4.5 h-4.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.2" d="M12 4v16m8-8H4"></path>
                        </svg>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 rounded-3xl bg-zinc-950/20 border border-zinc-850 border-dashed">
                <span className="text-4xl">🔍</span>
                <h4 className="text-base font-bold text-white mt-3">No products found</h4>
                <p className="text-zinc-500 text-xs max-w-xs mx-auto mt-1">
                  We couldn't find anything matching your filters or search keywords. Please adjust your criteria.
                </p>
              </div>
            )}
          </div>
        </main>

        {/* Shopping Cart Sidebar Flyout Drawer */}
        {isCartOpen && (
          <div className="fixed inset-0 z-50 overflow-hidden">
            {/* Backdrop overlay */}
            <div
              className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity duration-300"
              onClick={() => setIsCartOpen(false)}
            />

            {/* Slide drawer container */}
            <div className="absolute inset-y-0 right-0 max-w-md w-full bg-gradient-to-b from-sky-950 via-slate-950 to-zinc-950 border-l border-sky-900/40 shadow-2xl flex flex-col z-10 animate-fadeIn text-sky-100">
              
              {/* Drawer header */}
              <div className="p-6 border-b border-sky-900/30 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <svg className="w-5 h-5 text-sky-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"></path>
                  </svg>
                  <h3 className="text-lg font-bold text-white">Your Cart</h3>
                  <span className="text-xs font-semibold bg-sky-900/40 border border-sky-850 rounded-full px-2 py-0.5 text-sky-300">
                    {totalCartCount} items
                  </span>
                </div>
                <button
                  onClick={() => setIsCartOpen(false)}
                  className="p-1.5 rounded-lg bg-sky-900/20 text-sky-400 hover:text-sky-200 transition-colors cursor-pointer"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.2" d="M6 18L18 6M6 6l12 12"></path>
                  </svg>
                </button>
              </div>

              {/* Drawer list items */}
              <div className="flex-1 overflow-y-auto p-6 space-y-4">
                {Object.keys(cart).length > 0 ? (
                  Object.entries(cart).map(([id, qty]) => {
                    const product = products.find((p) => p.id === id);
                    if (!product) return null;

                    return (
                      <div
                        key={id}
                        className="flex items-center gap-4 bg-sky-900/20 border border-sky-900/35 rounded-2xl p-4 transition-all hover:bg-sky-900/30"
                      >
                        {product.image ? (
                          <div className="w-12 h-12 rounded-xl bg-sky-900/20 p-1 flex items-center justify-center overflow-hidden flex-shrink-0">
                            <img src={product.image} className="w-full h-full object-contain" alt={product.name} />
                          </div>
                        ) : (
                          <span className="text-3xl select-none">{product.emoji || getCategoryEmoji(product.category)}</span>
                        )}
                        <div className="flex-1 text-left">
                          <h4 className="text-xs font-bold text-white line-clamp-1">{product.name}</h4>
                          <p className="text-[10px] text-sky-300 mt-0.5">
                            {product.stock !== undefined ? `Stock: ${product.stock}` : `Unit: ${product.unit}`} | ₹{product.price.toFixed(2)}
                          </p>
                          
                          {/* Quantity manipulation selector */}
                          <div className="flex items-center gap-3 mt-2">
                            <button
                              onClick={() => removeFromCart(id)}
                              className="w-6 h-6 rounded-md bg-sky-900/40 border border-sky-805/30 flex items-center justify-center text-xs text-sky-300 hover:text-white hover:border-sky-700/50 transition-all active:scale-75 cursor-pointer"
                            >
                              -
                            </button>
                            <span className="text-xs font-bold text-sky-200">{qty}</span>
                            <button
                              onClick={() => addToCart(id)}
                              className="w-6 h-6 rounded-md bg-sky-900/40 border border-sky-805/30 flex items-center justify-center text-xs text-sky-300 hover:text-white hover:border-sky-700/50 transition-all active:scale-75 cursor-pointer"
                            >
                              +
                            </button>
                          </div>
                        </div>

                        {/* Price and delete button */}
                        <div className="text-right flex flex-col justify-between items-end h-full min-h-[60px]">
                          <button
                            onClick={() => clearItemFromCart(id)}
                            className="text-sky-600 hover:text-red-400 transition-all active:scale-75 cursor-pointer"
                            title="Remove item"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
                            </svg>
                          </button>
                          <span className="text-xs font-bold text-white mt-auto">
                            ₹{(product.price * qty).toFixed(2)}
                          </span>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div className="text-center py-16 text-sky-400/60">
                    <span className="text-4xl block mb-3">🛒</span>
                    <p className="text-sm">Your shopping cart is empty.</p>
                    <p className="text-xs text-sky-500/50 mt-1">Add items from the store to get started.</p>
                  </div>
                )}
              </div>

              {/* Drawer footer details */}
              {Object.keys(cart).length > 0 && (
                <div className="p-6 border-t border-sky-900/30 bg-sky-950/40 backdrop-blur-md space-y-4">
                  <div className="space-y-2.5">
                    <div className="flex justify-between items-center text-xs text-sky-300/80">
                      <span>Subtotal</span>
                      <span className="font-semibold text-sky-100">₹{totalCartPrice.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between items-center text-xs text-sky-300/80">
                      <span>Estimated Tax (5%)</span>
                      <span className="font-semibold text-sky-100">₹{(totalCartPrice * 0.05).toFixed(2)}</span>
                    </div>
                    <div className="h-[1px] bg-sky-900/30 w-full" />
                    <div className="flex justify-between items-center text-sm font-bold text-white">
                      <span>Total</span>
                      <span className="text-sky-400">₹{(totalCartPrice * 1.05).toFixed(2)}</span>
                    </div>
                  </div>

                  <button
                    onClick={handleCheckout}
                    disabled={checkoutLoading}
                    className="w-full py-3.5 bg-gradient-to-r from-sky-600 via-sky-500 to-blue-600 hover:from-sky-500 hover:to-blue-500 text-white font-bold rounded-xl shadow-[0_4px_20px_rgba(14,165,233,0.25)] hover:shadow-[0_4px_30px_rgba(14,165,233,0.45)] transition-all duration-300 flex items-center justify-center cursor-pointer disabled:opacity-50"
                  >
                    {checkoutLoading ? (
                      <svg className="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                    ) : (
                      <span>Place Order (₹{(totalCartPrice * 1.05).toFixed(2)})</span>
                    )}
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Checkout Details Form Modal */}
        {showCheckoutForm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-black/70 backdrop-blur-sm">
            <div className="relative bg-[#1a0c12] border border-[#4c1d38] rounded-3xl p-8 max-w-md w-full text-center space-y-6 animate-fadeIn shadow-2xl overflow-hidden">
              <div className="absolute -top-12 -left-12 w-24 h-24 bg-pink-500/10 rounded-full blur-2xl pointer-events-none" />
              <div className="absolute -bottom-12 -right-12 w-24 h-24 bg-rose-500/10 rounded-full blur-2xl pointer-events-none" />

              <button
                onClick={() => setShowCheckoutForm(false)}
                className="absolute right-4 top-4 p-1.5 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white hover:border-zinc-700 transition-colors cursor-pointer"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12"></path>
                </svg>
              </button>

              <div className="space-y-2">
                <h3 className="text-xl font-bold text-white">Delivery Details</h3>
                <p className="text-zinc-400 text-xs font-light">
                  Please provide your delivery address to complete the order
                </p>
              </div>

              {/* Profile Display */}
              <div className="bg-[#2d1222]/50 border border-[#4c1d38] rounded-2xl p-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-pink-500 to-rose-600 flex items-center justify-center text-white font-bold text-lg">
                    {profileDetails.username?.charAt(0).toUpperCase()}
                  </div>
                  <div className="text-left">
                    <p className="text-sm font-semibold text-white">{profileDetails.username}</p>
                    <p className="text-xs text-zinc-400">{profileDetails.phone}</p>
                  </div>
                </div>
              </div>

              {/* Checkout Form */}
              <form onSubmit={handleCheckoutFormSubmit} className="space-y-4 text-left">
                {/* House Number / Address */}
                <div className="space-y-2 relative">
                  <label className="text-xs font-semibold text-zinc-300 block">House No. / Address</label>
                  <input
                    type="text"
                    id="address"
                    value={checkoutDetails.houseNo}
                    onChange={(e) => setCheckoutDetails({ ...checkoutDetails, houseNo: e.target.value })}
                    placeholder="Enter house number and street"
                    className="w-full px-4 py-2.5 bg-[#12070c] border border-[#3d162d] rounded-xl text-white placeholder-zinc-500 focus:outline-none focus:border-pink-500 focus:ring-1 focus:ring-pink-500/50 transition-all text-sm"
                    autoComplete="off"
                  />
                  {showAddressSuggestions && addressSuggestions.length > 0 && (
                    <>
                      {/* Click outside overlay to close the suggestions list */}
                      <div 
                        className="fixed inset-0 z-40" 
                        onClick={() => setShowAddressSuggestions(false)} 
                      />
                      <div className="absolute left-0 right-0 z-50 mt-1 max-h-60 overflow-y-auto bg-[#1a0c12]/95 border border-[#4c1d38] rounded-xl shadow-2xl backdrop-blur-xl">
                        {addressSuggestions.map((suggestion, index) => (
                          <div
                            key={index}
                            onClick={() => {
                              setSelectedFromSuggestions(true);
                              setCheckoutDetails((prev) => ({
                                ...prev,
                                houseNo: suggestion.formattedAddress,
                                pincode: suggestion.pincode || prev.pincode,
                              }));
                              setShowAddressSuggestions(false);
                            }}
                            className="px-4 py-3 text-xs text-zinc-350 hover:text-white hover:bg-pink-950/40 border-b border-[#3d162d]/50 last:border-b-0 cursor-pointer transition-all duration-200"
                          >
                            <div className="font-semibold text-white">{suggestion.name}</div>
                            <div className="text-zinc-500 mt-0.5 text-[10px] truncate">{suggestion.formattedAddress}</div>
                          </div>
                        ))}
                      </div>
                    </>
                  )}
                </div>

                {/* Pincode */}
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-zinc-300 block">Pincode</label>
                  <input
                    type="text"
                    value={checkoutDetails.pincode}
                    onChange={(e) => setCheckoutDetails({ ...checkoutDetails, pincode: e.target.value.replace(/\\D/g, "").slice(0, 6) })}
                    placeholder="Enter 5-6 digit pincode"
                    className="w-full px-4 py-2.5 bg-[#12070c] border border-[#3d162d] rounded-xl text-white placeholder-zinc-500 focus:outline-none focus:border-pink-500 focus:ring-1 focus:ring-pink-500/50 transition-all text-sm"
                  />
                </div>

                {/* Mobile Number */}
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-zinc-300 block">Mobile Number</label>
                  <input
                    type="tel"
                    value={checkoutDetails.mobileNo}
                    onChange={(e) => setCheckoutDetails({ ...checkoutDetails, mobileNo: e.target.value.replace(/\\D/g, "").slice(0, 10) })}
                    placeholder="Enter 10-digit mobile number"
                    className="w-full px-4 py-2.5 bg-[#12070c] border border-[#3d162d] rounded-xl text-white placeholder-zinc-500 focus:outline-none focus:border-pink-500 focus:ring-1 focus:ring-pink-500/50 transition-all text-sm"
                  />
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={checkoutLoading}
                  className="w-full py-3 mt-6 bg-gradient-to-r from-pink-600 via-rose-500 to-fuchsia-600 hover:from-pink-500 hover:to-fuchsia-500 text-white font-bold rounded-xl shadow-[0_4px_20px_rgba(236,72,153,0.25)] hover:shadow-[0_4px_30px_rgba(236,72,153,0.45)] transition-all duration-300 flex items-center justify-center cursor-pointer disabled:opacity-50 text-sm"
                >
                  {checkoutLoading ? (
                    <svg className="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                  ) : (
                    <span>Confirm & Place Order</span>
                  )}
                </button>
              </form>
            </div>
          </div>
        )}

        {/* Checkout Success Modal Dialog */}
        {checkoutSuccess && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-black/70 backdrop-blur-sm">
            <div className="relative bg-[#1a0c12] border border-[#4c1d38] rounded-3xl p-8 max-w-sm w-full text-center space-y-6 animate-fadeIn shadow-2xl overflow-hidden">
              <div className="absolute -top-12 -left-12 w-24 h-24 bg-pink-500/10 rounded-full blur-2xl pointer-events-none" />
              <div className="absolute -bottom-12 -right-12 w-24 h-24 bg-rose-500/10 rounded-full blur-2xl pointer-events-none" />

              <div className="inline-flex p-4 rounded-full bg-pink-500/10 border border-pink-500/20 relative">
                <div className="absolute -inset-1 bg-pink-500/20 rounded-full blur-sm animate-pulse" />
                <svg className="w-8 h-8 text-pink-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7"></path>
                </svg>
              </div>

              <div className="space-y-2">
                <h3 className="text-xl font-bold text-white">Order Placed!</h3>
                <p className="text-zinc-400 text-xs font-light leading-relaxed">
                  Thank you for shopping at Nishi Super Store. Your premium delivery will be prepared shortly.
                </p>
              </div>

              {/* Checkout details receipt */}
              <div className="bg-[#2d1222]/50 border border-[#4c1d38] rounded-2xl p-4 text-left text-xs space-y-3 text-zinc-200">
                <div className="space-y-2">
                  <p className="text-[10px] font-bold text-zinc-400 uppercase">Customer Details</p>
                  <div className="flex justify-between">
                    <span className="text-zinc-500">Name</span>
                    <span className="font-semibold text-zinc-200">{currentUser}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-zinc-500">Mobile</span>
                    <span className="font-semibold text-zinc-200">{checkoutDetails.mobileNo}</span>
                  </div>
                </div>

                <div className="h-[1px] bg-zinc-800/80 w-full" />

                <div className="space-y-2">
                  <p className="text-[10px] font-bold text-zinc-400 uppercase">Delivery Address</p>
                  <div className="flex justify-between items-center gap-4 overflow-hidden">
                    <span className="text-zinc-500 flex-shrink-0">Address</span>
                    <span className="font-semibold text-zinc-200 text-right overflow-x-auto whitespace-nowrap scrollbar-none max-w-[200px]">
                      {checkoutDetails.houseNo}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-zinc-500">Pincode</span>
                    <span className="font-semibold text-zinc-200">{checkoutDetails.pincode}</span>
                  </div>
                </div>

                <div className="h-[1px] bg-zinc-800/80 w-full" />

                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-zinc-500">Payment Mode</span>
                    <span className="font-semibold text-zinc-200">Localhost Wallet</span>
                  </div>
                  <div className="flex justify-between font-bold text-pink-400">
                    <span>Grand Total</span>
                    <span>₹{(totalCartPrice * 1.05).toFixed(2)}</span>
                  </div>
                </div>
              </div>

              <button
                onClick={handleCloseSuccessModal}
                className="w-full py-3 bg-zinc-900 hover:bg-zinc-800 text-zinc-300 font-semibold border border-zinc-800 rounded-xl transition-all duration-200 cursor-pointer text-xs"
              >
                Close & Continue
              </button>
            </div>
          </div>
        )}

        {/* Product Details Quick View Modal Pop-up */}
        {selectedProductDetails && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-black/75 backdrop-blur-sm animate-fadeIn">
            <div 
              className="absolute inset-0" 
              onClick={() => setSelectedProductDetails(null)} 
            />
            <div className="relative bg-zinc-950 border border-zinc-850 rounded-3xl p-6 sm:p-8 max-w-md w-full text-center space-y-6 shadow-2xl animate-fadeIn overflow-hidden">
              <div className="absolute -top-12 -left-12 w-24 h-24 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none" />
              <div className="absolute -bottom-12 -right-12 w-24 h-24 bg-teal-500/10 rounded-full blur-2xl pointer-events-none" />

              <button
                onClick={() => setSelectedProductDetails(null)}
                className="absolute right-4 top-4 p-1.5 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white hover:border-zinc-700 transition-colors cursor-pointer"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12"></path>
                </svg>
              </button>

              <div className="space-y-4">
                {selectedProductDetails.image ? (
                  <div className="w-24 h-24 mx-auto rounded-2xl bg-zinc-900/40 p-2 flex items-center justify-center overflow-hidden">
                    <img src={selectedProductDetails.image} className="w-full h-full object-contain animate-pulse" alt={selectedProductDetails.name} />
                  </div>
                ) : (
                  <span className="text-6xl block select-none animate-bounce">{selectedProductDetails.emoji || getCategoryEmoji(selectedProductDetails.category)}</span>
                )}
                <div>
                  <span className="text-[10px] font-bold tracking-widest text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 rounded-full px-3 py-1 uppercase">
                    {selectedProductDetails.category}
                  </span>
                  <h3 className="text-xl font-extrabold text-white mt-3">{selectedProductDetails.name}</h3>
                  <p className="text-zinc-400 text-xs mt-1">
                    {selectedProductDetails.stock !== undefined ? `Stock: ${selectedProductDetails.stock} units` : `Pack Size / Unit: ${selectedProductDetails.unit}`}
                  </p>
                </div>
              </div>

              <p className="text-zinc-400 text-xs font-light leading-relaxed bg-zinc-900/40 border border-zinc-900 rounded-2xl p-4 text-left">
                {["pulses", "dal"].includes(selectedProductDetails.category.toLowerCase()) && "High-protein, locally farmed pulses and split lentils. Cleaned under strict hygienic conditions for the finest culinary creations."}
                {["rice", "groceries"].includes(selectedProductDetails.category.toLowerCase()) && "Premium quality grains and kitchen essentials, carefully selected and packaged to preserve freshness and nutrition."}
                {["fruits", "vegetables"].includes(selectedProductDetails.category.toLowerCase()) && "Freshly picked seasonal farm products. Organic, sweet, rich in vitamins, and completely pesticide-free."}
                {["oil"].includes(selectedProductDetails.category.toLowerCase()) && "Premium cooking oil to prepare delicious and healthy meals for your family."}
                {["soap", "shampoo"].includes(selectedProductDetails.category.toLowerCase()) && "Premium personal hygiene and care products featuring gentle formulas to refresh your body."}
                {["dairy"].includes(selectedProductDetails.category.toLowerCase()) && "Fresh and pure dairy products sourced from local farms for your daily nutrition."}
                {["snacks", "beverages"].includes(selectedProductDetails.category.toLowerCase()) && "Delicious snacks and refreshing drinks to enjoy during your leisure time."}
              </p>

              <div className="flex items-center justify-between px-2">
                <div className="text-left">
                  <span className="text-[10px] text-zinc-500 font-bold uppercase block">Rating</span>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <span className="text-amber-400 text-sm">★</span>
                    <span className="text-zinc-200 text-xs font-bold">
                      {selectedProductDetails.rating || (4.0 + (Number(selectedProductDetails.id) % 10) * 0.1).toFixed(1)} / 5.0
                    </span>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-[10px] text-zinc-500 font-bold uppercase block">Price</span>
                  <span className="text-xl font-black text-emerald-400">₹{selectedProductDetails.price.toFixed(2)}</span>
                </div>
              </div>

              <button
                onClick={() => {
                  addToCart(selectedProductDetails.id);
                  setSelectedProductDetails(null);
                }}
                className="w-full py-3.5 bg-gradient-to-r from-emerald-600 via-teal-655 to-green-600 hover:from-emerald-500 hover:to-green-500 text-white font-bold rounded-xl shadow-[0_4px_20px_rgba(16,185,129,0.2)] transition-all duration-300 flex items-center justify-center gap-2 cursor-pointer active:scale-95"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.2" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"></path>
                </svg>
                <span>Add to Cart</span>
              </button>
            </div>
          </div>
        )}

        {/* Toast Notification Component inside Authenticated View */}
        {toast && (
          <div className={`fixed bottom-6 right-6 z-50 animate-fadeIn bg-zinc-950/95 backdrop-blur-md border px-5 py-3.5 rounded-2xl shadow-2xl flex items-center gap-3 transition-all duration-300 ${
            toast.type === "add" 
              ? "border-emerald-500/30 shadow-[0_10px_30px_rgba(16,185,129,0.15)]" 
              : "border-red-500/30 shadow-[0_10px_30px_rgba(239,68,68,0.15)]"
          }`}>
            <div className={`p-1.5 rounded-lg border ${
              toast.type === "add"
                ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400"
                : "bg-red-500/10 border-red-500/20 text-red-400"
            }`}>
              {toast.type === "add" ? (
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7"></path>
                </svg>
              ) : (
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
                </svg>
              )}
            </div>
            <span className="text-xs font-semibold tracking-wide text-zinc-200">{toast.message}</span>
          </div>
        )}

        {/* Profile Settings Modal Dialog */}
        {showProfileModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fadeIn overflow-y-auto">
            <div 
              className="absolute inset-0" 
              onClick={() => setShowProfileModal(false)} 
            />
            <div className={`relative bg-[#041d10] border border-[#0a381f] rounded-3xl p-6 sm:p-8 w-full shadow-2xl animate-fadeIn overflow-hidden transition-all duration-300 z-10 ${
              activeProfileTab === "card" ? "max-w-5xl" : "max-w-md"
            }`}>
              <div className="absolute -top-12 -left-12 w-24 h-24 bg-emerald-500/20 rounded-full blur-2xl pointer-events-none" />
              <div className="absolute -bottom-12 -right-12 w-24 h-24 bg-teal-500/20 rounded-full blur-2xl pointer-events-none" />

              <button
                onClick={() => setShowProfileModal(false)}
                className="absolute right-4 top-4 p-1.5 rounded-xl bg-[#062c17] border border-[#0a381f] text-emerald-400 hover:text-white hover:border-emerald-350 transition-colors cursor-pointer z-20"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12"></path>
                </svg>
              </button>

              {/* Tab Navigation */}
              <div className="flex border-b border-[#0a381f]/50 pb-3 justify-center gap-6 mb-4 mt-2">
                <button
                  onClick={() => setActiveProfileTab("details")}
                  className={`text-xs font-bold pb-2 transition-all border-b-2 cursor-pointer flex items-center gap-1.5 ${
                    activeProfileTab === "details"
                      ? "text-emerald-400 border-emerald-400"
                      : "text-zinc-400 border-transparent hover:text-zinc-300"
                  }`}
                >
                  <span>👤</span> Profile Details
                </button>
                <button
                  onClick={() => setActiveProfileTab("card")}
                  className={`text-xs font-bold pb-2 transition-all border-b-2 cursor-pointer flex items-center gap-1.5 ${
                    activeProfileTab === "card"
                      ? "text-emerald-400 border-emerald-400"
                      : "text-zinc-400 border-transparent hover:text-zinc-300"
                  }`}
                >
                  <span>📇</span> Store Visiting Card
                </button>
              </div>

              {activeProfileTab === "details" ? (
                <div className="space-y-6">
                  <div className="space-y-4">
                    <span className="text-5xl block select-none">👤</span>
                    <div>
                      <h3 className="text-xl font-extrabold text-white">Your Profile</h3>
                      <p className="text-emerald-400/80 text-xs mt-1">Registration & Account Details</p>
                    </div>
                  </div>

                  <div className="bg-[#062c17]/40 border border-[#0a381f] rounded-2xl p-5 text-left text-xs space-y-4 text-zinc-300">
                    <div className="flex flex-col gap-1">
                      <span className="text-[10px] text-emerald-500 font-bold uppercase tracking-wider">Profile Name</span>
                      <span className="font-semibold text-zinc-100 text-sm">{profileDetails.username}</span>
                    </div>
                    <div className="flex flex-col gap-1 border-t border-[#0a381f]/70 pt-3">
                      <span className="text-[10px] text-emerald-500 font-bold uppercase tracking-wider">Email</span>
                      <span className="font-semibold text-zinc-100 text-sm">{profileDetails.email}</span>
                    </div>
                    <div className="flex flex-col gap-1 border-t border-[#0a381f]/70 pt-3">
                      <span className="text-[10px] text-emerald-500 font-bold uppercase tracking-wider">Contact</span>
                      <span className="font-semibold text-zinc-100 text-sm">{profileDetails.phone}</span>
                    </div>
                    <div className="flex flex-col gap-1 border-t border-[#0a381f]/70 pt-3">
                      <span className="text-[10px] text-emerald-500 font-bold uppercase tracking-wider">Password</span>
                      <div className="flex items-center justify-between mt-0.5">
                        <span className="font-mono text-zinc-100 text-sm font-semibold tracking-wider">
                          {showProfilePassword ? profileDetails.password : "••••••••"}
                        </span>
                        <button
                          onClick={() => setShowProfilePassword(!showProfilePassword)}
                          className="text-[10px] font-bold text-emerald-400 hover:text-emerald-300 transition-colors uppercase tracking-wider cursor-pointer"
                        >
                          {showProfilePassword ? "Hide" : "Show"}
                        </button>
                      </div>
                    </div>
                    <div className="flex flex-col gap-1 border-t border-[#0a381f]/70 pt-3">
                      <span className="text-[10px] text-emerald-500 font-bold uppercase tracking-wider">Store Location</span>
                      <div className="flex items-start justify-between gap-4 mt-0.5 group">
                        <div 
                          onClick={() => {
                            setShowProfileModal(false);
                            setTimeout(() => {
                              const mapSec = document.getElementById("shop-location-section");
                              if (mapSec) mapSec.scrollIntoView({ behavior: "smooth" });
                            }, 200);
                          }}
                          className="font-semibold text-zinc-150 text-xs hover:text-emerald-400 transition-colors cursor-pointer leading-relaxed flex-1 text-left"
                          title="Click to scroll to map on website"
                        >
                          Nava Bazar, Karjan, Gujarat 391240
                        </div>
                        <a
                          href="https://maps.app.goo.gl/jo3b9JLMkTWck3sN9"
                          target="_blank"
                          rel="noreferrer"
                          className="text-[10px] font-bold text-emerald-400 hover:text-emerald-300 transition-colors uppercase tracking-wider whitespace-nowrap pt-0.5 cursor-pointer"
                          title="Open in Google Maps"
                        >
                          Open Map
                        </a>
                      </div>
                    </div>

                    <div className="flex flex-col gap-1 border-t border-[#0a381f]/70 pt-3">
                      <span className="text-[10px] text-emerald-500 font-bold uppercase tracking-wider">Visiting Card</span>
                      <div className="flex items-center justify-between mt-0.5">
                        <span className="font-semibold text-zinc-150 text-xs">Generate & View Store Card</span>
                        <button
                          onClick={() => {
                            setActiveProfileTab("card");
                          }}
                          className="text-[10px] font-bold text-emerald-450 hover:text-emerald-350 transition-colors uppercase tracking-wider cursor-pointer bg-transparent border-none flex items-center gap-1"
                        >
                          <span>📇</span> View Card
                        </button>
                      </div>
                    </div>

                    <div className="flex flex-col gap-1 border-t border-[#0a381f]/70 pt-3">
                      <span className="text-[10px] text-emerald-500 font-bold uppercase tracking-wider">Administration</span>
                      <div className="flex items-center justify-between mt-0.5">
                        <span className="font-semibold text-zinc-150 text-xs">Access Store Management Portal</span>
                        <button
                          onClick={() => {
                            setShowProfileModal(false);
                            setShowAdminPage(true);
                          }}
                          className="text-[10px] font-bold text-purple-400 hover:text-purple-350 transition-colors uppercase tracking-wider cursor-pointer bg-transparent border-none"
                        >
                          Open Admin
                        </button>
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => setShowProfileModal(false)}
                    className="w-full py-3 bg-[#062c17] hover:bg-[#0b3c21] text-emerald-400 hover:text-emerald-300 font-semibold border border-[#0a381f] rounded-xl transition-all duration-200 cursor-pointer text-xs"
                  >
                    Close Profile
                  </button>
                </div>
              ) : (
                <div className="flex flex-col lg:flex-row gap-8 z-10 text-left pt-2 animate-fadeIn">
                  {/* Left Column: Visual Card Viewer */}
                  <div className="flex-1 flex flex-col items-center justify-center space-y-6">
                    <div>
                      <h3 className="text-xl font-extrabold text-white text-center">Visiting Card Preview</h3>
                      <p className="text-emerald-400/80 text-xs mt-1 text-center font-semibold">Click the card to flip it in 3D</p>
                    </div>

                    {/* 3D Card Flip Container */}
                    <div 
                      onClick={() => setIsCardFlipped(!isCardFlipped)}
                      className="w-full max-w-[400px] aspect-[7/4] perspective-1000 cursor-pointer group"
                    >
                      <div className={`relative w-full h-full preserve-3d transition-transform duration-700 ease-out select-none ${isCardFlipped ? "rotate-y-180" : ""}`}>
                        
                        {/* FRONT SIDE */}
                        <div className={`absolute inset-0 w-full h-full rounded-2xl p-6 flex flex-col justify-between border-2 backface-hidden shadow-2xl card-metallic-glow ${
                          selectedCardTheme === "emerald" 
                            ? "bg-gradient-to-br from-[#03170d] via-[#062c17] to-[#0a381f] border-[#d4af37]" 
                            : selectedCardTheme === "dark"
                            ? "bg-gradient-to-br from-[#09090b] via-[#18181b] to-[#27272a] border-cyan-500/50 shadow-cyan-500/10"
                            : "bg-gradient-to-br from-[#050b14] via-[#0b182b] to-[#112643] border-amber-500"
                        }`}>
                          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-white/5 via-transparent to-transparent pointer-events-none rounded-2xl" />
                          
                          {/* Top Bar */}
                          <div className="flex justify-between items-start z-10">
                            <span className={`text-[8px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full ${
                              selectedCardTheme === "emerald"
                                ? "bg-[#d4af37]/15 text-[#d4af37]"
                                : selectedCardTheme === "dark"
                                ? "bg-cyan-500/15 text-cyan-400"
                                : "bg-amber-500/15 text-amber-400"
                            }`}>
                              Premium Retailer
                            </span>
                            <div className="flex gap-0.5">
                              <span className="text-emerald-400 text-xs">★</span>
                              <span className="text-emerald-400 text-xs">★</span>
                              <span className="text-emerald-400 text-xs">★</span>
                            </div>
                          </div>

                          {/* Main Logo & Branding */}
                          <div className="flex items-center gap-4 z-10">
                            <div className={`w-14 h-14 rounded-xl flex items-center justify-center p-0 shadow-lg ${
                              selectedCardTheme === "emerald"
                                ? "bg-gradient-to-br from-emerald-500 to-teal-600 border border-[#d4af37]/35"
                                : selectedCardTheme === "dark"
                                ? "bg-gradient-to-br from-cyan-500 to-blue-600 border border-cyan-400/35"
                                : "bg-gradient-to-br from-amber-500 to-yellow-600 border border-amber-400/35"
                            }`}>
                              <svg viewBox="0 0 100 100" fill="none" className="w-9 h-9 text-white">
                                <path d="M25 70V30M25 30L75 70M75 70V30" stroke="white" strokeWidth="8" strokeLinecap="round" strokeLinejoin="round"/>
                              </svg>
                            </div>
                            <div className="text-left">
                              <h4 className="text-xl sm:text-2xl font-black tracking-tight text-white leading-tight">
                                {visitingCardDetails.shopName}
                              </h4>
                              <p className={`text-[10px] font-bold tracking-wider uppercase mt-0.5 ${
                                selectedCardTheme === "emerald" ? "text-emerald-400" : selectedCardTheme === "dark" ? "text-cyan-400" : "text-amber-400"
                              }`}>
                                ✓ Fresh  •  Quality  •  Trusted
                              </p>
                            </div>
                          </div>

                          {/* Footer text */}
                          <div className="text-left border-t border-white/10 pt-2 flex justify-between items-center z-10">
                            <span className="text-[8px] text-zinc-400 uppercase tracking-widest font-semibold">Online & Retail Super Store</span>
                            <span className={`text-[8px] font-bold ${
                              selectedCardTheme === "emerald" ? "text-[#d4af37]" : selectedCardTheme === "dark" ? "text-cyan-400" : "text-amber-400"
                            }`}>ESTD. 2024</span>
                          </div>
                        </div>

                        {/* BACK SIDE */}
                        <div className={`absolute inset-0 w-full h-full rounded-2xl p-5 flex flex-col justify-between border-2 backface-hidden rotate-y-180 shadow-2xl ${
                          selectedCardTheme === "emerald" 
                            ? "bg-gradient-to-br from-[#03170d] via-[#062c17] to-[#0a381f] border-[#d4af37]" 
                            : selectedCardTheme === "dark"
                            ? "bg-gradient-to-br from-[#09090b] via-[#18181b] to-[#27272a] border-cyan-500/50"
                            : "bg-gradient-to-br from-[#050b14] via-[#0b182b] to-[#112643] border-amber-500"
                        }`}>
                          {/* Top branding text */}
                          <div className="flex justify-between items-start border-b border-white/10 pb-1.5 text-left z-10">
                            <div>
                              <h5 className="text-xs font-bold text-white tracking-wide">{visitingCardDetails.shopName}</h5>
                              <p className="text-[7px] text-zinc-400">Your Premium Neighborhood Store</p>
                            </div>
                            <span className={`text-[8px] font-bold ${
                              selectedCardTheme === "emerald" ? "text-[#d4af37]" : selectedCardTheme === "dark" ? "text-cyan-400" : "text-amber-400"
                            }`}>VISITING CARD</span>
                          </div>

                          {/* Contact layout */}
                          <div className="flex justify-between items-center gap-4 py-2 z-10">
                            <div className="text-left space-y-1">
                              <h4 className="text-base font-extrabold text-white leading-tight">{visitingCardDetails.name}</h4>
                              <span className={`inline-block text-[9px] px-2 py-0.5 rounded font-bold uppercase tracking-wider ${
                                selectedCardTheme === "emerald"
                                  ? "bg-emerald-500/10 text-emerald-400"
                                  : selectedCardTheme === "dark"
                                  ? "bg-cyan-500/10 text-cyan-400"
                                  : "bg-amber-500/10 text-amber-400"
                              }`}>
                                {visitingCardDetails.designation}
                              </span>
                            </div>

                            {/* Simulated mini QR code */}
                            <div className="bg-white p-1 rounded shadow-md flex-shrink-0 flex items-center justify-center">
                              <div className="w-12 h-12 flex flex-wrap bg-white">
                                <div className="w-4 h-4 bg-black border border-white flex items-center justify-center">
                                  <div className="w-2 h-2 bg-white flex items-center justify-center">
                                    <div className="w-1 h-1 bg-black"></div>
                                  </div>
                                </div>
                                <div className="w-4 h-4 bg-white"></div>
                                <div className="w-4 h-4 bg-black border border-white flex items-center justify-center">
                                  <div className="w-2 h-2 bg-white flex items-center justify-center">
                                    <div className="w-1 h-1 bg-black"></div>
                                  </div>
                                </div>
                                <div className="w-4 h-4 bg-white flex flex-wrap">
                                  <div className="w-2 h-2 bg-black"></div>
                                  <div className="w-2 h-2 bg-white"></div>
                                </div>
                                <div className="w-4 h-4 bg-black"></div>
                                <div className="w-4 h-4 bg-white"></div>
                                <div className="w-4 h-4 bg-black border border-white flex items-center justify-center">
                                  <div className="w-2 h-2 bg-white flex items-center justify-center">
                                    <div className="w-1 h-1 bg-black"></div>
                                  </div>
                                </div>
                                <div className="w-4 h-4 bg-white"></div>
                                <div className="w-4 h-4 bg-black flex flex-wrap">
                                  <div className="w-2 h-2 bg-white"></div>
                                  <div className="w-2 h-2 bg-black"></div>
                                </div>
                              </div>
                            </div>
                          </div>

                          {/* Detail lines */}
                          <div className="text-left text-[9px] space-y-1 text-zinc-300 border-t border-white/10 pt-1.5 z-10">
                            <div className="flex items-center gap-1.5">
                              <span className={selectedCardTheme === "emerald" ? "text-[#d4af37]" : selectedCardTheme === "dark" ? "text-cyan-400" : "text-amber-400"}>📞</span>
                              <span>+91 {visitingCardDetails.phone}</span>
                            </div>
                            <div className="flex items-center gap-1.5">
                              <span className={selectedCardTheme === "emerald" ? "text-[#d4af37]" : selectedCardTheme === "dark" ? "text-cyan-400" : "text-amber-400"}>✉️</span>
                              <span className="truncate">{visitingCardDetails.email}</span>
                            </div>
                            <div className="flex items-center gap-1.5">
                              <span className={selectedCardTheme === "emerald" ? "text-[#d4af37]" : selectedCardTheme === "dark" ? "text-cyan-400" : "text-amber-400"}>🌐</span>
                              <span className="truncate">{visitingCardDetails.website}</span>
                            </div>
                            <div className="flex items-center gap-1.5">
                              <span className={selectedCardTheme === "emerald" ? "text-[#d4af37]" : selectedCardTheme === "dark" ? "text-cyan-400" : "text-amber-400"}>📍</span>
                              <span className="truncate">{visitingCardDetails.address}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Flip control */}
                    <button
                      onClick={() => setIsCardFlipped(!isCardFlipped)}
                      className="px-4 py-2 bg-[#062c17] hover:bg-[#0b3c21] text-emerald-400 border border-[#0a381f] rounded-xl text-xs font-semibold flex items-center gap-2 cursor-pointer transition-colors active:scale-95 shadow-md"
                    >
                      🔄 Flip Card (Front/Back)
                    </button>
                  </div>

                  {/* Right Column: Customization Controls */}
                  <div className="flex-1 flex flex-col justify-between space-y-6">
                    <div className="space-y-4">
                      <div>
                        <h3 className="text-xl font-extrabold text-white text-left">Customize Visiting Card</h3>
                        <p className="text-emerald-400/80 text-xs mt-1 text-left">Edit details in real-time to personalize your card</p>
                      </div>

                      {/* Theme Selector */}
                      <div className="space-y-1 text-left">
                        <span className="text-[10px] text-emerald-500 font-bold uppercase tracking-wider block mb-1">Select Premium Theme</span>
                        <div className="grid grid-cols-3 gap-2">
                          <button
                            onClick={() => setSelectedCardTheme("emerald")}
                            className={`py-2 px-1 text-[10px] sm:text-xs font-semibold rounded-xl border transition-all cursor-pointer ${
                              selectedCardTheme === "emerald"
                                ? "bg-[#062c17] text-emerald-400 border-[#0f512d] shadow-md shadow-emerald-500/10"
                                : "bg-[#041d10]/40 text-zinc-400 border-[#0a381f] hover:text-zinc-250"
                            }`}
                          >
                            🌲 Emerald Luxury
                          </button>
                          <button
                            onClick={() => setSelectedCardTheme("dark")}
                            className={`py-2 px-1 text-[10px] sm:text-xs font-semibold rounded-xl border transition-all cursor-pointer ${
                              selectedCardTheme === "dark"
                                ? "bg-zinc-900 text-cyan-400 border-cyan-500/50 shadow-md shadow-cyan-500/10"
                                : "bg-[#041d10]/40 text-zinc-400 border-[#0a381f] hover:text-zinc-250"
                            }`}
                          >
                            🌌 Carbon Tech
                          </button>
                          <button
                            onClick={() => setSelectedCardTheme("gold")}
                            className={`py-2 px-1 text-[10px] sm:text-xs font-semibold rounded-xl border transition-all cursor-pointer ${
                              selectedCardTheme === "gold"
                                ? "bg-[#112643]/60 text-amber-400 border-amber-500 shadow-md shadow-amber-500/10"
                                : "bg-[#041d10]/40 text-zinc-400 border-[#0a381f] hover:text-zinc-250"
                            }`}
                          >
                            👑 Velvet Gold
                          </button>
                        </div>
                      </div>

                      {/* Form inputs */}
                      <div className="bg-[#062c17]/40 border border-[#0a381f] rounded-2xl p-4 space-y-3 text-left">
                        <div>
                          <label className="text-[9px] text-emerald-500 font-bold uppercase tracking-wider block mb-1">Shop Name</label>
                          <input
                            type="text"
                            value={visitingCardDetails.shopName}
                            onChange={(e) => setVisitingCardDetails({ ...visitingCardDetails, shopName: e.target.value })}
                            className="w-full bg-zinc-950/80 border border-[#0a381f] rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-emerald-500"
                            placeholder="Nishi Super Store"
                          />
                        </div>
                        
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <label className="text-[9px] text-emerald-500 font-bold uppercase tracking-wider block mb-1">Owner Name</label>
                            <input
                              type="text"
                              value={visitingCardDetails.name}
                              onChange={(e) => setVisitingCardDetails({ ...visitingCardDetails, name: e.target.value })}
                              className="w-full bg-zinc-950/80 border border-[#0a381f] rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-emerald-500"
                              placeholder="Anish Jain"
                            />
                          </div>
                          <div>
                            <label className="text-[9px] text-emerald-500 font-bold uppercase tracking-wider block mb-1">Designation</label>
                            <input
                              type="text"
                              value={visitingCardDetails.designation}
                              onChange={(e) => setVisitingCardDetails({ ...visitingCardDetails, designation: e.target.value })}
                              className="w-full bg-zinc-950/80 border border-[#0a381f] rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-emerald-500"
                              placeholder="Founder & Proprietor"
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <label className="text-[9px] text-emerald-500 font-bold uppercase tracking-wider block mb-1">Phone Number</label>
                            <input
                              type="text"
                              value={visitingCardDetails.phone}
                              onChange={(e) => setVisitingCardDetails({ ...visitingCardDetails, phone: e.target.value })}
                              className="w-full bg-zinc-950/80 border border-[#0a381f] rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-emerald-500"
                              placeholder="8200913658"
                            />
                          </div>
                          <div>
                            <label className="text-[9px] text-emerald-500 font-bold uppercase tracking-wider block mb-1">Email Address</label>
                            <input
                              type="email"
                              value={visitingCardDetails.email}
                              onChange={(e) => setVisitingCardDetails({ ...visitingCardDetails, email: e.target.value })}
                              className="w-full bg-zinc-950/80 border border-[#0a381f] rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-emerald-500"
                              placeholder="anishjain@nishisuperstore.com"
                            />
                          </div>
                        </div>

                        <div>
                          <label className="text-[9px] text-emerald-500 font-bold uppercase tracking-wider block mb-1">Website URL</label>
                          <input
                            type="text"
                            value={visitingCardDetails.website}
                            onChange={(e) => setVisitingCardDetails({ ...visitingCardDetails, website: e.target.value })}
                            className="w-full bg-zinc-950/80 border border-[#0a381f] rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-emerald-500"
                            placeholder="https://nishi-store.vercel.app/"
                          />
                        </div>

                        <div>
                          <label className="text-[9px] text-emerald-500 font-bold uppercase tracking-wider block mb-1">Store Address</label>
                          <input
                            type="text"
                            value={visitingCardDetails.address}
                            onChange={(e) => setVisitingCardDetails({ ...visitingCardDetails, address: e.target.value })}
                            className="w-full bg-zinc-950/80 border border-[#0a381f] rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-emerald-500"
                            placeholder="Nava Bazar, Karjan, Gujarat 391240"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Print/Download and Reset controls */}
                    <div className="space-y-3">
                      <div className="grid grid-cols-2 gap-3">
                        <button
                          onClick={() => handleDownloadCard("front")}
                          className="py-2.5 bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 cursor-pointer shadow-md active:scale-95 transition-all"
                        >
                          📥 Download Front
                        </button>
                        <button
                          onClick={() => handleDownloadCard("back")}
                          className="py-2.5 bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 cursor-pointer shadow-md active:scale-95 transition-all"
                        >
                          📥 Download Back
                        </button>
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <button
                          onClick={handlePrintCard}
                          className="py-2 px-3 border border-[#0a381f] hover:border-emerald-450 hover:bg-[#062c17] text-zinc-300 hover:text-emerald-450 font-semibold rounded-xl text-xs flex items-center justify-center gap-1.5 cursor-pointer transition-all"
                        >
                          🖨️ Print Card
                        </button>
                        <button
                          onClick={() => {
                            if (window.confirm("Reset details to Anish Jain defaults?")) {
                              setVisitingCardDetails({
                                shopName: "Nishi Super Store",
                                name: "Anish Jain",
                                phone: "8200913658",
                                address: "Nava Bazar, Karjan, Gujarat 391240",
                                email: "anishjain@nishisuperstore.com",
                                website: "https://nishi-store.vercel.app/",
                                designation: "Founder & Proprietor"
                              });
                              setSelectedCardTheme("emerald");
                            }
                          }}
                          className="py-2 px-3 border border-red-900/40 hover:border-red-650 hover:bg-red-950/20 text-zinc-400 hover:text-red-400 font-semibold rounded-xl text-xs flex items-center justify-center gap-1.5 cursor-pointer transition-all"
                        >
                          ♻️ Reset Defaults
                        </button>
                      </div>

                      <button
                        onClick={() => setShowProfileModal(false)}
                        className="w-full py-3 bg-[#062c17] hover:bg-[#0b3c21] text-emerald-400 hover:text-emerald-350 font-bold border border-[#0a381f] rounded-xl transition-all cursor-pointer text-xs"
                      >
                        Close Profile
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Account Preferences Modal Dialog */}
        {showSettingsModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-black/75 backdrop-blur-sm animate-fadeIn">
            <div 
              className="absolute inset-0" 
              onClick={() => setShowSettingsModal(false)} 
            />
            <div className="relative bg-[#041d10] border border-[#0a381f] rounded-3xl p-6 sm:p-8 max-w-md w-full text-center space-y-6 shadow-2xl animate-fadeIn overflow-hidden">
              <div className="absolute -top-12 -left-12 w-24 h-24 bg-emerald-500/20 rounded-full blur-2xl pointer-events-none" />
              <div className="absolute -bottom-12 -right-12 w-24 h-24 bg-teal-500/20 rounded-full blur-2xl pointer-events-none" />

              <button
                onClick={() => setShowSettingsModal(false)}
                className="absolute right-4 top-4 p-1.5 rounded-xl bg-[#062c17] border border-[#0a381f] text-emerald-400 hover:text-white hover:border-emerald-350 transition-colors cursor-pointer"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12"></path>
                </svg>
              </button>

              <div className="space-y-4">
                <span className="text-5xl block select-none">⚙️</span>
                <div>
                  <h3 className="text-xl font-extrabold text-white">Setting</h3>
                  <p className="text-emerald-400/80 text-xs mt-1">List of Settings Preferences</p>
                </div>
              </div>

              <div className="bg-[#062c17]/40 border border-[#0a381f] rounded-2xl p-5 text-left text-xs space-y-4 text-zinc-300">
                <div className="flex items-center justify-between">
                  <div className="flex flex-col gap-0.5">
                    <span className="font-semibold text-zinc-100">Email Notifications</span>
                    <span className="text-[10px] text-emerald-500/70">Receive order receipt and updates</span>
                  </div>
                  <input type="checkbox" defaultChecked className="w-4 h-4 accent-emerald-500 rounded border-[#0a381f] bg-zinc-900 cursor-pointer" />
                </div>
                <div className="flex items-center justify-between border-t border-[#0a381f]/70 pt-4">
                  <div className="flex flex-col gap-0.5">
                    <span className="font-semibold text-zinc-100">SMS Notifications</span>
                    <span className="text-[10px] text-emerald-500/70">Receive delivery alerts on your phone</span>
                  </div>
                  <input type="checkbox" defaultChecked className="w-4 h-4 accent-emerald-500 rounded border-[#0a381f] bg-zinc-900 cursor-pointer" />
                </div>
                <div className="flex items-center justify-between border-t border-[#0a381f]/70 pt-4">
                  <div className="flex flex-col gap-0.5">
                    <span className="font-semibold text-zinc-100">Dark Theme Mode</span>
                    <span className="text-[10px] text-emerald-500/70">Enable high-contrast dark space styling</span>
                  </div>
                  <input type="checkbox" defaultChecked disabled className="w-4 h-4 accent-emerald-500 rounded border-[#0a381f] bg-zinc-900 cursor-not-allowed opacity-50" />
                </div>
              </div>

              <button
                onClick={() => setShowSettingsModal(false)}
                className="w-full py-3 bg-[#062c17] hover:bg-[#0b3c21] text-emerald-400 hover:text-emerald-300 font-semibold border border-[#0a381f] rounded-xl transition-all duration-200 cursor-pointer text-xs"
              >
                Save & Close
              </button>
            </div>
          </div>
        )}

        {/* ─── PRINT-ONLY VISITING CARD CONTAINER ─── */}
        <div id="print-visiting-card-area" className="hidden flex-col items-center justify-center gap-12 bg-white text-zinc-900 p-16">
          <div style={{ width: "3.5in", height: "2in", border: "1px solid #000", padding: "0.2in", display: "flex", flexDirection: "column", justifyContent: "space-between", boxSizing: "border-box", background: "white", color: "black", position: "relative" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
              <span style={{ fontSize: "10px", fontWeight: "bold", textTransform: "uppercase", letterSpacing: "0.05em" }}>Nishi Super Store</span>
              <span style={{ fontSize: "10px" }}>ESTD. 2024</span>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <div style={{ width: "35px", height: "35px", border: "2px solid black", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <span style={{ fontSize: "16px", fontWeight: "bold" }}>N</span>
              </div>
              <div style={{ textAlign: "left" }}>
                <h2 style={{ fontSize: "18px", margin: "0", fontWeight: "900", color: "black" }}>{visitingCardDetails.shopName}</h2>
                <p style={{ fontSize: "8px", margin: "0", color: "#333", fontWeight: "bold" }}>Fresh • Quality • Trusted</p>
              </div>
            </div>
            <div style={{ fontSize: "8px", textAlign: "left", borderTop: "1px solid #ccc", paddingTop: "5px" }}>
              Premium Quality Grocery & Super Store
            </div>
          </div>

          <div style={{ width: "3.5in", height: "2in", border: "1px solid #000", padding: "0.2in", display: "flex", flexDirection: "column", justifyContent: "space-between", boxSizing: "border-box", background: "white", color: "black", position: "relative" }}>
            <div style={{ display: "flex", justifyContent: "space-between", borderBottom: "1px solid #ccc", paddingBottom: "5px" }}>
              <div style={{ textAlign: "left" }}>
                <span style={{ fontSize: "10px", fontWeight: "bold" }}>{visitingCardDetails.shopName}</span>
                <p style={{ fontSize: "6px", margin: "0", color: "#666" }}>Your Premium Neighborhood Store</p>
              </div>
            </div>
            
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div style={{ textAlign: "left" }}>
                <h3 style={{ fontSize: "14px", margin: "0", fontWeight: "bold", color: "black" }}>{visitingCardDetails.name}</h3>
                <span style={{ fontSize: "8px", color: "#555", fontWeight: "bold" }}>{visitingCardDetails.designation}</span>
              </div>
            </div>

            <div style={{ textAlign: "left", fontSize: "8px", display: "flex", flexDirection: "column", gap: "2px" }}>
              <div>📞 +91 {visitingCardDetails.phone}</div>
              <div>✉️ {visitingCardDetails.email}</div>
              <div>🌐 {visitingCardDetails.website}</div>
              <div>📍 {visitingCardDetails.address}</div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Render Login & Registration Form
  return (
    <div className="min-h-screen bg-login-space text-slate-100 flex flex-col relative overflow-x-hidden overflow-y-auto font-sans select-none">
      {/* Top Left Header with Brand Logo & Brand Text */}
      <header className="w-full px-6 pt-6 pb-2 flex justify-start relative z-20">
        <div className="flex items-center gap-3">
          {/* Unique Logo Design */}
          <div className="flex-shrink-0 relative group">
            <div className="relative w-12 h-12 md:w-14 md:h-14 rounded-xl bg-gradient-to-br from-emerald-500 via-teal-500 to-cyan-600 p-0 flex items-center justify-center shadow-lg shadow-emerald-500/30 hover:shadow-emerald-500/50 transition-all duration-300 overflow-hidden">
              {/* Animated background gradient */}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-0 group-hover:opacity-20 animate-pulse" />
              
              {/* Unique N logo with retail elements */}
              <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-8 h-8 md:w-10 md:h-10 relative z-10">
                {/* Letter N for Nishi */}
                <path d="M25 70V30M25 30L75 70M75 70V30" stroke="white" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
                
                {/* Shopping cart elements in corners */}
                <circle cx="85" cy="20" r="3" fill="#fbbf24"/>
                <circle cx="15" cy="80" r="3" fill="#34d399"/>
                <circle cx="80" cy="75" r="2.5" fill="#fbbf24"/>
              </svg>
            </div>
            
            {/* Decorative shine effect */}
            <div className="absolute -inset-1 rounded-xl bg-gradient-to-r from-emerald-400/20 to-cyan-400/20 -z-10 blur opacity-0 group-hover:opacity-100 transition-all duration-300" />
          </div>

          {/* Store Name - Matched Size with Logo, One Line */}
          <span className="text-xl sm:text-2xl md:text-3xl font-extrabold tracking-tight bg-gradient-to-r from-white via-emerald-100 to-emerald-400 bg-clip-text text-transparent whitespace-nowrap leading-none select-none">
            Nishi Super Store
          </span>
        </div>
      </header>

      {/* Unique Space Background Elements */}
      <div className="absolute inset-0 bg-login-grid pointer-events-none" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] bg-neon-aurora rounded-full blur-[90px] pointer-events-none" />

      {/* Floating Cosmic Dust Particles */}
      <div className="hidden sm:block absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(25)].map((_, i) => {
          const size = Math.random() * 5 + 1.5; // 1.5px to 6.5px
          const left = Math.random() * 100;
          const delay = Math.random() * 10;
          const duration = Math.random() * 15 + 10;
          const color = i % 3 === 0 ? "bg-violet-400" : i % 3 === 1 ? "bg-fuchsia-400" : "bg-sky-400";
          return (
            <div
              key={i}
              className={`absolute rounded-full opacity-0 ${color}`}
              style={{
                width: `${size}px`,
                height: `${size}px`,
                left: `${left}%`,
                bottom: `-10px`,
                animation: `floatParticle ${duration}s linear infinite`,
                animationDelay: `${delay}s`,
                filter: "blur(0.5px)",
              }}
            />
          );
        })}
      </div>



      {/* Main card wrapper */}
      <div className="flex-1 flex items-center justify-center p-6 relative z-10">
        <div className="relative w-full max-w-[440px] animate-fadeIn">
          
          {/* Glow border highlight */}
          <div className="absolute -inset-[2px] bg-gradient-to-r from-purple-500/35 via-fuchsia-500/35 to-sky-500/35 rounded-3xl blur-md opacity-75 pointer-events-none" />
          
          {/* Card Component */}
          <div className="relative bg-zinc-950/85 backdrop-blur-2xl border border-zinc-800/80 rounded-3xl p-8 shadow-[0_25px_50px_-12px_rgba(0,0,0,0.85)] overflow-hidden">
          
          {/* User/Admin Role Switcher */}
          <div className="flex p-1 bg-zinc-900/60 border border-zinc-800/85 rounded-xl mb-6 relative">
            <button
              type="button"
              onClick={() => {
                setLoginType("user");
                setIsLogin(true);
                setError("");
              }}
              className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all duration-350 cursor-pointer relative z-10 ${
                loginType === "user" ? "text-emerald-400" : "text-zinc-500 hover:text-zinc-300"
              }`}
            >
              👤 User
            </button>
            <button
              type="button"
              onClick={() => {
                setLoginType("admin");
                setIsLogin(true);
                setError("");
              }}
              className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all duration-355 cursor-pointer relative z-10 ${
                loginType === "admin" ? "text-purple-400" : "text-zinc-500 hover:text-zinc-300"
              }`}
            >
              🛠️ Admin
            </button>
            
            {/* Active indicator capsule */}
            <div
              className={`absolute top-1 bottom-1 left-1 w-[calc(50%-4px)] bg-zinc-950 border border-zinc-800/60 rounded-lg transition-transform duration-300 ease-out ${
                loginType === "user" ? "translate-x-0" : "translate-x-full"
              }`}
            />
          </div>

          {/* Sliding switcher tabs */}
          {loginType === "user" && (
            <div className="flex p-1.5 bg-zinc-900 border border-zinc-800/80 rounded-2xl mb-8 relative">
              <button
                type="button"
                onClick={() => toggleAuthMode(true)}
                className={`flex-1 py-2.5 text-xs font-bold rounded-xl transition-all duration-300 cursor-pointer relative z-10 ${
                  isLogin ? "text-white" : "text-zinc-500 hover:text-zinc-300"
                }`}
              >
                Log In
              </button>
              <button
                type="button"
                onClick={() => toggleAuthMode(false)}
                className={`flex-1 py-2.5 text-xs font-bold rounded-xl transition-all duration-300 cursor-pointer relative z-10 ${
                  !isLogin ? "text-white" : "text-zinc-500 hover:text-zinc-300"
                }`}
              >
                Register
              </button>
              
              {/* Active indicator capsule */}
              <div
                className={`absolute top-1.5 bottom-1.5 left-1.5 w-[calc(50%-6px)] bg-zinc-800 border border-zinc-700/50 rounded-xl transition-transform duration-300 ease-out ${
                  isLogin ? "translate-x-0" : "translate-x-full"
                }`}
              />
            </div>
          )}

          <form onSubmit={handleAuthSubmit} className="space-y-6">
            {/* Header section */}
            <div className="text-center space-y-2.5">
              <div className="inline-flex p-3.5 rounded-2xl bg-zinc-900 border border-zinc-800/80 shadow-inner mb-1 relative group overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-tr from-purple-500/10 to-indigo-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                {loginType === "admin" ? (
                  <svg className="w-6 h-6 text-purple-400 relative z-10" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.2" d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4"></path>
                  </svg>
                ) : isLogin ? (
                  <svg className="w-6 h-6 text-purple-400 relative z-10" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 16l-2-2m0 0l2-2m-2 2h8m-9 4h10a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path>
                  </svg>
                ) : (
                  <svg className="w-6 h-6 text-purple-400 relative z-10" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"></path>
                  </svg>
                )}
              </div>
              <h1 className="text-sm font-bold uppercase tracking-wider text-zinc-300 transition-all duration-300">
                {loginType === "admin" ? "Admin Authentication" : isLogin ? "Welcome back" : "Create Account"}
              </h1>
              <p className="text-zinc-400 text-xs font-light transition-all duration-300">
                {loginType === "admin"
                  ? "Access the administrative control center."
                  : isLogin
                  ? "Sign in to access your store dashboard."
                  : "Fill in your credentials to start shopping."}
              </p>
            </div>

            {/* Input Fields container */}
            <div className="space-y-4">
              {isLogin ? (
                <>
                  {/* Login Identifier */}
                  <div className="space-y-1.5 text-left animate-fadeIn">
                    <label htmlFor="login-id-input" className="block text-[11px] font-bold uppercase tracking-wider text-zinc-500 pl-1">
                      Username or Email
                    </label>
                    <div className="relative group/input">
                      <div className="absolute -inset-[1px] bg-gradient-to-r from-purple-500 to-indigo-500 rounded-xl opacity-0 group-focus-within/input:opacity-100 group-hover/input:opacity-50 transition-opacity duration-300 blur-[2px] pointer-events-none" />
                      <input
                        type="text"
                        id="login-id-input"
                        value={loginIdentifier}
                        onChange={(e) => {
                          setLoginIdentifier(e.target.value);
                          if (error) setError("");
                        }}
                        placeholder="Enter username or email"
                        className="relative w-full bg-zinc-900/90 border border-zinc-800/80 rounded-xl px-4.5 py-3 text-white placeholder-zinc-600 focus:outline-none focus:bg-zinc-950 transition-all duration-300 text-[14px]"
                        autoComplete="off"
                      />
                    </div>
                  </div>

                  {/* Login Password */}
                  <div className="space-y-1.5 text-left animate-fadeIn">
                    <label htmlFor="login-pass-input" className="block text-[11px] font-bold uppercase tracking-wider text-zinc-500 pl-1">
                      Password
                    </label>
                    <div className="relative group/input">
                      <div className="absolute -inset-[1px] bg-gradient-to-r from-purple-500 to-indigo-500 rounded-xl opacity-0 group-focus-within/input:opacity-100 group-hover/input:opacity-50 transition-opacity duration-300 blur-[2px] pointer-events-none" />
                      <input
                        type={showPassword ? "text" : "password"}
                        id="login-pass-input"
                        value={loginPassword}
                        onChange={(e) => {
                          setLoginPassword(e.target.value);
                          if (error) setError("");
                        }}
                        placeholder="Enter your password"
                        className="relative w-full bg-zinc-900/90 border border-zinc-800/80 rounded-xl pl-4.5 pr-12 py-3 text-white placeholder-zinc-600 focus:outline-none focus:bg-zinc-950 transition-all duration-300 text-[14px]"
                        autoComplete="off"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3.5 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300 transition-colors focus:outline-none cursor-pointer p-1"
                      >
                        {showPassword ? (
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l18 18"></path>
                          </svg>
                        ) : (
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path>
                          </svg>
                        )}
                      </button>
                    </div>
                  </div>
                </>
              ) : (
                <>
                  {/* Register Username */}
                  <div className="space-y-1.5 text-left animate-fadeIn">
                    <label htmlFor="reg-username-input" className="block text-[11px] font-bold uppercase tracking-wider text-zinc-500 pl-1">
                      Username
                    </label>
                    <div className="relative group/input">
                      <div className="absolute -inset-[1px] bg-gradient-to-r from-purple-500 to-indigo-500 rounded-xl opacity-0 group-focus-within/input:opacity-100 group-hover/input:opacity-50 transition-opacity duration-300 blur-[2px] pointer-events-none" />
                      <input
                        type="text"
                        id="reg-username-input"
                        value={username}
                        onChange={(e) => {
                          setUsername(e.target.value);
                          if (error) setError("");
                        }}
                        placeholder="johndoe"
                        className="relative w-full bg-zinc-900/90 border border-zinc-800/80 rounded-xl px-4.5 py-3 text-white placeholder-zinc-600 focus:outline-none focus:bg-zinc-950 transition-all duration-300 text-[14px]"
                        autoComplete="off"
                      />
                    </div>
                  </div>

                  {/* Register Email ID */}
                  <div className="space-y-1.5 text-left animate-fadeIn">
                    <label htmlFor="reg-email-input" className="block text-[11px] font-bold uppercase tracking-wider text-zinc-500 pl-1">
                      Email ID
                    </label>
                    <div className="relative group/input">
                      <div className="absolute -inset-[1px] bg-gradient-to-r from-purple-500 to-indigo-500 rounded-xl opacity-0 group-focus-within/input:opacity-100 group-hover/input:opacity-50 transition-opacity duration-300 blur-[2px] pointer-events-none" />
                      <input
                        type="email"
                        id="reg-email-input"
                        value={email}
                        onChange={(e) => {
                          setEmail(e.target.value);
                          if (error) setError("");
                        }}
                        placeholder="john@example.com"
                        className="relative w-full bg-zinc-900/90 border border-zinc-800/80 rounded-xl px-4.5 py-3 text-white placeholder-zinc-600 focus:outline-none focus:bg-zinc-950 transition-all duration-300 text-[14px]"
                        autoComplete="off"
                      />
                    </div>
                  </div>

                  {/* Register Phone No */}
                  <div className="space-y-1.5 text-left animate-fadeIn">
                    <label htmlFor="reg-phone-input" className="block text-[11px] font-bold uppercase tracking-wider text-zinc-500 pl-1">
                      Phone No
                    </label>
                    <div className="relative group/input">
                      <div className="absolute -inset-[1px] bg-gradient-to-r from-purple-500 to-indigo-500 rounded-xl opacity-0 group-focus-within/input:opacity-100 group-hover/input:opacity-50 transition-opacity duration-300 blur-[2px] pointer-events-none" />
                      <input
                        type="tel"
                        id="reg-phone-input"
                        value={phone}
                        onChange={(e) => {
                          setPhone(e.target.value);
                          if (error) setError("");
                        }}
                        placeholder="e.g. +91 98765-43210"
                        className="relative w-full bg-zinc-900/90 border border-zinc-800/80 rounded-xl px-4.5 py-3 text-white placeholder-zinc-600 focus:outline-none focus:bg-zinc-950 transition-all duration-300 text-[14px]"
                        autoComplete="off"
                      />
                    </div>
                  </div>

                  {/* Register Create Password */}
                  <div className="space-y-1.5 text-left animate-fadeIn">
                    <label htmlFor="reg-pass-input" className="block text-[11px] font-bold uppercase tracking-wider text-zinc-500 pl-1">
                      Create Password
                    </label>
                    <div className="relative group/input">
                      <div className="absolute -inset-[1px] bg-gradient-to-r from-purple-500 to-indigo-500 rounded-xl opacity-0 group-focus-within/input:opacity-100 group-hover/input:opacity-50 transition-opacity duration-300 blur-[2px] pointer-events-none" />
                      <input
                        type={showPassword ? "text" : "password"}
                        id="reg-pass-input"
                        value={password}
                        onChange={(e) => {
                          setPassword(e.target.value);
                          if (error) setError("");
                        }}
                        placeholder="Choose a strong password"
                        className="relative w-full bg-zinc-900/90 border border-zinc-800/80 rounded-xl pl-4.5 pr-12 py-3 text-white placeholder-zinc-600 focus:outline-none focus:bg-zinc-950 transition-all duration-300 text-[14px]"
                        autoComplete="off"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3.5 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300 transition-colors focus:outline-none cursor-pointer p-1"
                      >
                        {showPassword ? (
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l18 18"></path>
                          </svg>
                        ) : (
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path>
                          </svg>
                        )}
                      </button>
                    </div>
                  </div>
                </>
              )}

              {/* Validation Error Message */}
              {error && (
                <div className="text-red-400 text-xs mt-1.5 flex items-center gap-1.5 animate-shake pl-1">
                  <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path>
                  </svg>
                  <span>{error}</span>
                </div>
              )}
            </div>

            {/* Submit button */}
            <button
              type="submit"
              disabled={loading}
              className="group relative w-full bg-gradient-to-r from-emerald-600 via-teal-600 to-green-600 hover:from-emerald-500 hover:via-teal-500 hover:to-green-500 text-white font-semibold py-3.5 px-4 rounded-xl shadow-[0_4px_20px_rgba(16,185,129,0.25)] hover:shadow-[0_4px_30px_rgba(16,185,129,0.45)] transition-all duration-300 flex items-center justify-center overflow-hidden cursor-pointer mt-3"
            >
              {/* Hover shining animation */}
              <div className="absolute inset-0 w-1/2 h-full bg-white/10 skew-x-[-25deg] -translate-x-full group-hover:animate-shine pointer-events-none" />
              
              {loading ? (
                <svg className="animate-spin h-5.5 w-5.5 text-white" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3.5"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              ) : (
                <span className="flex items-center gap-2 tracking-wide text-[14px]">
                  {isLogin ? "Log In" : "Register & Start"}
                  <svg className="w-4 h-4 transform group-hover:translate-x-1 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.2" d="M14 5l7 7m0 0l-7 7m7-7H3"></path>
                  </svg>
                </span>
              )}
            </button>
            
            {/* Direct Visit Our Store Link for Guest Visitors */}
            <div className="text-center pt-4 border-t border-zinc-900 mt-6 flex justify-center gap-6">
              <button
                type="button"
                onClick={() => setShowMapPage(true)}
                className="inline-flex items-center gap-2 text-xs text-emerald-450 hover:text-emerald-350 transition-colors font-bold cursor-pointer bg-transparent border-0 focus:outline-none"
              >
                <span>📍</span>
                <span>Visit Physical Store</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
      
      {/* Toast Notification Component (also active on login validation issues) */}
      {toast && (
        <div className={`fixed bottom-6 right-6 z-50 animate-fadeIn bg-zinc-950/95 backdrop-blur-md border px-5 py-3.5 rounded-2xl shadow-2xl flex items-center gap-3 transition-all duration-300 ${
          toast.type === "add" 
            ? "border-emerald-500/30 shadow-[0_10px_30px_rgba(16,185,129,0.15)]" 
            : "border-red-500/30 shadow-[0_10px_30px_rgba(239,68,68,0.15)]"
        }`}>
          <div className={`p-1.5 rounded-lg border ${
            toast.type === "add"
              ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400"
              : "bg-red-500/10 border-red-500/20 text-red-400"
          }`}>
            {toast.type === "add" ? (
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7"></path>
              </svg>
            ) : (
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
              </svg>
            )}
          </div>
          <span className="text-xs font-semibold tracking-wide text-zinc-200">{toast.message}</span>
        </div>
      )}
    </div>
  );
}

export default App;
