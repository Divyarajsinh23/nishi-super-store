import React, { useState, useMemo, useEffect } from "react";
import "./index.css";

// Product Catalog Data
const PRODUCTS = [
  // Groceries
  { id: "g1", name: "Premium Extra Virgin Olive Oil", price: 12.99, category: "groceries", unit: "500ml", rating: 4.8, emoji: "🍾" },
  { id: "g2", name: "Whole Wheat Artisanal Bread", price: 3.49, category: "groceries", unit: "400g", rating: 4.5, emoji: "🍞" },
  { id: "g3", name: "Organic Farm Brown Eggs", price: 4.20, category: "groceries", unit: "12 pcs", rating: 4.9, emoji: "🥚" },
  { id: "g4", name: "Unsweetened Almond Milk", price: 3.99, category: "groceries", unit: "1L", rating: 4.7, emoji: "🥛" },
  // Dal
  { id: "d1", name: "Organic Toor Dal (Arhar)", price: 4.50, category: "dal", unit: "1kg", rating: 4.6, emoji: "🥣" },
  { id: "d2", name: "Premium Yellow Moong Dal", price: 3.99, category: "dal", unit: "1kg", rating: 4.8, emoji: "🥣" },
  { id: "d3", name: "Split Red Masoor Dal", price: 4.20, category: "dal", unit: "1kg", rating: 4.7, emoji: "🥣" },
  { id: "d4", name: "Organic Chana Dal", price: 3.80, category: "dal", unit: "1kg", rating: 4.5, emoji: "🥣" },
  // Food items
  { id: "f1", name: "Organic Durum Wheat Pasta", price: 2.49, category: "food", unit: "500g", rating: 4.4, emoji: "🍝" },
  { id: "f2", name: "Classic Italian Tomato Sauce", price: 4.15, category: "food", unit: "350g", rating: 4.6, emoji: "🥫" },
  { id: "f3", name: "Double Chocolate Chip Cookies", price: 4.99, category: "food", unit: "200g", rating: 4.9, emoji: "🍪" },
  { id: "f4", name: "Mild Cheddar Cheese Block", price: 5.80, category: "food", unit: "250g", rating: 4.8, emoji: "🧀" },
  // Fruits items
  { id: "fr1", name: "Crispy Royal Gala Apples", price: 2.99, category: "fruits", unit: "1kg", rating: 4.7, emoji: "🍎" },
  { id: "fr2", name: "Organic Sweet Bananas", price: 1.80, category: "fruits", unit: "1kg", rating: 4.6, emoji: "🍌" },
  { id: "fr3", name: "Fresh Sweet Strawberries", price: 4.49, category: "fruits", unit: "400g", rating: 4.9, emoji: "🍓" },
  { id: "fr4", name: "Fresh Hass Avocados", price: 5.50, category: "fruits", unit: "3 pcs", rating: 4.8, emoji: "🥑" },
  // Shampoo/Soap items
  { id: "s1", name: "Premium Herbal Anti-Dandruff Shampoo", price: 8.49, category: "shampoo-soap", unit: "400ml", rating: 4.7, emoji: "🧴" },
  { id: "s2", name: "Organic Lavender Bath Soap Bar", price: 2.99, category: "shampoo-soap", unit: "150g", rating: 4.8, emoji: "🧼" },
  { id: "s3", name: "Nourishing Coconut Conditioner", price: 9.20, category: "shampoo-soap", unit: "350ml", rating: 4.6, emoji: "🧴" },
  { id: "s4", name: "Antibacterial Liquid Hand Wash", price: 3.50, category: "shampoo-soap", unit: "250ml", rating: 4.5, emoji: "🧼" },
];

function App() {
  // Authentication states
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    const val = localStorage.getItem("nishi_isAuthenticated");
    if (val === null) return true; // default to showing the store first for new sessions
    return val === "true";
  });
  const [currentUser, setCurrentUser] = useState(() => {
    return localStorage.getItem("nishi_currentUser") || "";
  });
  const [isLogin, setIsLogin] = useState(true);

  // Form input states
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  
  // Login input states
  const [loginIdentifier, setLoginIdentifier] = useState("nishi");
  const [loginPassword, setLoginPassword] = useState("123456");

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

  // Fetch products from DummyJSON API and log to console
  useEffect(() => {
    fetch("https://dummyjson.com/products")
      .then(res => res.json())
      .then(data => console.log(data))
      .catch(err => console.error("Error fetching dummy products:", err));
  }, []);

  // Sync states to LocalStorage
  useEffect(() => {
    localStorage.setItem("nishi_isAuthenticated", isAuthenticated);
  }, [isAuthenticated]);

  useEffect(() => {
    localStorage.setItem("nishi_currentUser", currentUser);
  }, [currentUser]);

  useEffect(() => {
    localStorage.setItem("nishi_profileDetails", JSON.stringify(profileDetails));
  }, [profileDetails]);

  useEffect(() => {
    localStorage.setItem("nishi_cart", JSON.stringify(cart));
  }, [cart]);

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
    const product = PRODUCTS.find((p) => p.id === productId);
    if (product) {
      triggerToast(`Added ${product.emoji} ${product.name} to cart!`, "add");
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
    const product = PRODUCTS.find((p) => p.id === productId);
    if (product) {
      triggerToast(`Removed 1 ${product.emoji} ${product.name} from cart`, "remove");
    }
  };

  const clearItemFromCart = (productId) => {
    setCart((prevCart) => {
      const updated = { ...prevCart };
      delete updated[productId];
      return updated;
    });
    const product = PRODUCTS.find((p) => p.id === productId);
    if (product) {
      triggerToast(`Deleted all ${product.emoji} ${product.name} from cart`, "remove");
    }
  };

  const totalCartCount = useMemo(() => {
    return Object.values(cart).reduce((sum, qty) => sum + qty, 0);
  }, [cart]);

  const totalCartPrice = useMemo(() => {
    return Object.entries(cart).reduce((total, [id, qty]) => {
      const product = PRODUCTS.find((p) => p.id === id);
      return total + (product ? product.price * qty : 0);
    }, 0);
  }, [cart]);

  // Filtered Products
  const filteredProducts = useMemo(() => {
    return PRODUCTS.filter((product) => {
      const matchesCategory =
        selectedCategory === "all" || product.category === selectedCategory;
      const matchesSearch = product.name
        .toLowerCase()
        .includes(searchQuery.toLowerCase());
      return matchesCategory && matchesSearch;
    });
  }, [selectedCategory, searchQuery]);

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
      setCheckoutDetails({ houseNo: "", pincode: "", mobileNo: "" });
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
              <p className="text-[7px] sm:text-[8px] text-emerald-400 font-bold tracking-wider uppercase mt-1 md:static absolute top-full left-0 whitespace-nowrap">
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
        <div className="max-w-7xl w-full mx-auto px-6 pt-6 relative z-20">
          <div className="flex items-center gap-2 overflow-x-auto scrollbar-none py-1.5 w-full">
            {[
              { id: "all", label: "All Items", emoji: "🛒" },
              { id: "groceries", label: "Groceries", emoji: "🥦" },
              { id: "dal", label: "Dal & Pulses", emoji: "🥣" },
              { id: "food", label: "Food Items", emoji: "🍪" },
              { id: "fruits", label: "Fruit Items", emoji: "🍎" },
              { id: "shampoo-soap", label: "Shampoo/Soap", emoji: "🧴" },
            ].map((category) => (
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
                <span>{category.label}</span>
              </button>
            ))}
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
                        <span className="text-3xl select-none">{product.emoji}</span>
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
                          Unit: {product.unit}
                        </p>
                      </div>

                      {/* Product Ratings */}
                      <div className="flex items-center gap-1.5 mt-2">
                        <span className="text-amber-400 text-xs">★</span>
                        <span className="text-zinc-300 text-xs font-semibold">{product.rating}</span>
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
                    const product = PRODUCTS.find((p) => p.id === id);
                    if (!product) return null;

                    return (
                      <div
                        key={id}
                        className="flex items-center gap-4 bg-sky-900/20 border border-sky-900/35 rounded-2xl p-4 transition-all hover:bg-sky-900/30"
                      >
                        <span className="text-3xl select-none">{product.emoji}</span>
                        <div className="flex-1 text-left">
                          <h4 className="text-xs font-bold text-white line-clamp-1">{product.name}</h4>
                          <p className="text-[10px] text-sky-300 mt-0.5">
                            Unit: {product.unit} | ₹{product.price.toFixed(2)}
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
            <div className="relative bg-zinc-950 border border-zinc-850 rounded-3xl p-8 max-w-md w-full text-center space-y-6 animate-fadeIn shadow-2xl overflow-hidden">
              <div className="absolute -top-12 -left-12 w-24 h-24 bg-blue-500/10 rounded-full blur-2xl pointer-events-none" />
              <div className="absolute -bottom-12 -right-12 w-24 h-24 bg-sky-500/10 rounded-full blur-2xl pointer-events-none" />

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
              <div className="bg-zinc-900/50 border border-zinc-850 rounded-2xl p-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-sky-600 flex items-center justify-center text-white font-bold text-lg">
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
                    className="w-full px-4 py-2.5 bg-zinc-900 border border-zinc-800 rounded-xl text-white placeholder-zinc-500 focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500/50 transition-all text-sm"
                    autoComplete="off"
                  />
                  {showAddressSuggestions && addressSuggestions.length > 0 && (
                    <>
                      {/* Click outside overlay to close the suggestions list */}
                      <div 
                        className="fixed inset-0 z-40" 
                        onClick={() => setShowAddressSuggestions(false)} 
                      />
                      <div className="absolute left-0 right-0 z-50 mt-1 max-h-60 overflow-y-auto bg-zinc-950/95 border border-zinc-800/80 rounded-xl shadow-2xl backdrop-blur-xl">
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
                            className="px-4 py-3 text-xs text-zinc-300 hover:text-white hover:bg-sky-950/40 border-b border-zinc-900/50 last:border-b-0 cursor-pointer transition-all duration-200"
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
                    className="w-full px-4 py-2.5 bg-zinc-900 border border-zinc-800 rounded-xl text-white placeholder-zinc-500 focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500/50 transition-all text-sm"
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
                    className="w-full px-4 py-2.5 bg-zinc-900 border border-zinc-800 rounded-xl text-white placeholder-zinc-500 focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500/50 transition-all text-sm"
                  />
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={checkoutLoading}
                  className="w-full py-3 mt-6 bg-gradient-to-r from-sky-600 via-sky-500 to-blue-600 hover:from-sky-500 hover:to-blue-500 text-white font-bold rounded-xl shadow-[0_4px_20px_rgba(14,165,233,0.25)] hover:shadow-[0_4px_30px_rgba(14,165,233,0.45)] transition-all duration-300 flex items-center justify-center cursor-pointer disabled:opacity-50 text-sm"
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
            <div className="relative bg-zinc-950 border border-zinc-850 rounded-3xl p-8 max-w-sm w-full text-center space-y-6 animate-fadeIn shadow-2xl overflow-hidden">
              <div className="absolute -top-12 -left-12 w-24 h-24 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none" />
              <div className="absolute -bottom-12 -right-12 w-24 h-24 bg-teal-500/10 rounded-full blur-2xl pointer-events-none" />

              <div className="inline-flex p-4 rounded-full bg-emerald-500/10 border border-emerald-500/20 relative">
                <div className="absolute -inset-1 bg-emerald-500/20 rounded-full blur-sm animate-pulse" />
                <svg className="w-8 h-8 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
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
              <div className="bg-zinc-900/50 border border-zinc-850 rounded-2xl p-4 text-left text-xs space-y-3 text-zinc-300">
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
                  <div className="flex justify-between">
                    <span className="text-zinc-500">Address</span>
                    <span className="font-semibold text-zinc-200 text-right">{checkoutDetails.houseNo}</span>
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
                  <div className="flex justify-between font-bold text-emerald-400">
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
                <span className="text-6xl block select-none animate-bounce">{selectedProductDetails.emoji}</span>
                <div>
                  <span className="text-[10px] font-bold tracking-widest text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 rounded-full px-3 py-1 uppercase">
                    {selectedProductDetails.category}
                  </span>
                  <h3 className="text-xl font-extrabold text-white mt-3">{selectedProductDetails.name}</h3>
                  <p className="text-zinc-400 text-xs mt-1">Pack Size / Unit: {selectedProductDetails.unit}</p>
                </div>
              </div>

              <p className="text-zinc-400 text-xs font-light leading-relaxed bg-zinc-900/40 border border-zinc-900 rounded-2xl p-4 text-left">
                {selectedProductDetails.category === "groceries" && "Our premium quality grocery item, organically sourced and carefully packaged to preserve freshness and nutrition for your family meals."}
                {selectedProductDetails.category === "dal" && "High-protein, locally farmed pulses and split lentils. Double polished and cleaned under strict hygienic conditions for the finest culinary creations."}
                {selectedProductDetails.category === "food" && "Delicious premium processed foods and snacks, prepared using authentic traditional methods for maximum crispness and mouthwatering taste."}
                {selectedProductDetails.category === "fruits" && "Freshly picked seasonal fruits direct from nature's orchards. Sweet, juicy, rich in fiber and vitamins, and completely pesticide-free."}
                {selectedProductDetails.category === "shampoo-soap" && "Premium personal hygiene and care products, featuring gentle nourishing formulas to cleanse, hydrate, and refresh your skin and hair."}
              </p>

              <div className="flex items-center justify-between px-2">
                <div className="text-left">
                  <span className="text-[10px] text-zinc-500 font-bold uppercase block">Rating</span>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <span className="text-amber-400 text-sm">★</span>
                    <span className="text-zinc-200 text-xs font-bold">{selectedProductDetails.rating} / 5.0</span>
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
          <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-black/75 backdrop-blur-sm animate-fadeIn">
            <div 
              className="absolute inset-0" 
              onClick={() => setShowProfileModal(false)} 
            />
            <div className="relative bg-[#041d10] border border-[#0a381f] rounded-3xl p-6 sm:p-8 max-w-md w-full text-center space-y-6 shadow-2xl animate-fadeIn overflow-hidden">
              <div className="absolute -top-12 -left-12 w-24 h-24 bg-emerald-500/20 rounded-full blur-2xl pointer-events-none" />
              <div className="absolute -bottom-12 -right-12 w-24 h-24 bg-teal-500/20 rounded-full blur-2xl pointer-events-none" />

              <button
                onClick={() => setShowProfileModal(false)}
                className="absolute right-4 top-4 p-1.5 rounded-xl bg-[#062c17] border border-[#0a381f] text-emerald-400 hover:text-white hover:border-emerald-350 transition-colors cursor-pointer"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12"></path>
                </svg>
              </button>

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
              </div>

              <button
                onClick={() => setShowProfileModal(false)}
                className="w-full py-3 bg-[#062c17] hover:bg-[#0b3c21] text-emerald-400 hover:text-emerald-300 font-semibold border border-[#0a381f] rounded-xl transition-all duration-200 cursor-pointer text-xs"
              >
                Close Profile
              </button>
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
      </div>
    );
  }

  // Render Login & Registration Form
  return (
    <div className="min-h-screen bg-login-space text-slate-100 flex flex-col relative overflow-hidden font-sans select-none">
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
          
          {/* Sliding switcher tabs */}
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

          <form onSubmit={handleAuthSubmit} className="space-y-6">
            {/* Header section */}
            <div className="text-center space-y-2.5">
              <div className="inline-flex p-3.5 rounded-2xl bg-zinc-900 border border-zinc-800/80 shadow-inner mb-1 relative group overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-tr from-purple-500/10 to-indigo-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                {isLogin ? (
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
                {isLogin ? "Welcome back" : "Create Account"}
              </h1>
              <p className="text-zinc-400 text-xs font-light transition-all duration-300">
                {isLogin
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
