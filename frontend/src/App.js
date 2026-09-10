import { useEffect, useState, useCallback } from "react";
import axios from "axios";
import { Pie, Bar, Line } from "react-chartjs-2";
import {
  Chart as ChartJS, ArcElement, Tooltip, Legend,
  CategoryScale, LinearScale, BarElement, LineElement,
  PointElement, Title
} from "chart.js";
import { motion, AnimatePresence } from "framer-motion";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import Select from "react-select";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import {
  FaPlus, FaTrash, FaEdit, FaChartPie, FaChartBar, FaChartLine,
  FaSearch, FaDownload, FaMoon, FaSun, FaWallet, FaPiggyBank,
  FaCreditCard, FaHome, FaUtensils, FaCar, FaShoppingCart,
  FaGamepad, FaHeartbeat, FaGraduationCap, FaPlane, FaFilter,
  FaSignOutAlt, FaUser, FaEnvelope, FaLock, FaGoogle
} from "react-icons/fa";
import { format, startOfMonth, endOfMonth, subMonths, isWithinInterval } from "date-fns";

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, LineElement, PointElement, Title);

const API = "https://expense-tracker-zq2j.onrender.com";

const categories = [
  { value: "food", label: "Food & Dining", icon: <FaUtensils />, color: "#ef4444" },
  { value: "transport", label: "Transportation", icon: <FaCar />, color: "#3b82f6" },
  { value: "shopping", label: "Shopping", icon: <FaShoppingCart />, color: "#8b5cf6" },
  { value: "entertainment", label: "Entertainment", icon: <FaGamepad />, color: "#f59e0b" },
  { value: "health", label: "Health & Fitness", icon: <FaHeartbeat />, color: "#10b981" },
  { value: "education", label: "Education", icon: <FaGraduationCap />, color: "#06b6d4" },
  { value: "travel", label: "Travel", icon: <FaPlane />, color: "#ec4899" },
  { value: "bills", label: "Bills & Utilities", icon: <FaHome />, color: "#6b7280" },
  { value: "other", label: "Other", icon: <FaWallet />, color: "#64748b" },
];

// ── Auth helpers ───────────────────────────────────────────────────────────────
const getToken = () => localStorage.getItem("expense_token");
const getUser = () => {
  try { return JSON.parse(localStorage.getItem("expense_user")); } catch { return null; }
};
const authHeaders = () => ({ Authorization: `Bearer ${getToken()}` });

// ─────────────────────────────────────────────────────────────────────────────
//  LOGIN PAGE
// ─────────────────────────────────────────────────────────────────────────────
function LoginPage({ onLogin, darkMode, toggleDarkMode }) {
  const [tab, setTab] = useState("login"); // "login" | "signup"
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);

  // Check for token in URL (Google OAuth callback)
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get("token");
    const user = params.get("user");
    if (token && user) {
      localStorage.setItem("expense_token", token);
      localStorage.setItem("expense_user", decodeURIComponent(user));
      // Clean the URL
      window.history.replaceState({}, document.title, "/");
      onLogin();
    }
    if (params.get("auth") === "failed") {
      toast.error("Google sign-in failed. Please try again.");
      window.history.replaceState({}, document.title, "/");
    }
  }, [onLogin]);

  const handleEmailAuth = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const endpoint = tab === "login" ? "/api/auth/login" : "/api/auth/signup";
      const body = tab === "login" ? { email, password } : { email, password, name };
      const res = await axios.post(`${API}${endpoint}`, body);
      localStorage.setItem("expense_token", res.data.token);
      localStorage.setItem("expense_user", JSON.stringify(res.data.user));
      toast.success(tab === "login" ? "Welcome back! 👋" : "Account created! 🎉");
      onLogin();
    } catch (err) {
      toast.error(err.response?.data?.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = () => {
    window.location.href = `${API}/api/auth/google`;
  };

  const glass = {
    background: darkMode ? "rgba(30,41,59,0.85)" : "rgba(255,255,255,0.85)",
    backdropFilter: "blur(20px)",
    borderRadius: "24px",
    border: darkMode ? "1px solid rgba(255,255,255,0.1)" : "1px solid rgba(255,255,255,0.6)",
    boxShadow: "0 25px 50px rgba(0,0,0,0.25)",
    padding: "40px",
    width: "100%",
    maxWidth: "440px",
  };

  const inputSt = {
    width: "100%",
    padding: "13px 16px 13px 44px",
    borderRadius: "12px",
    border: darkMode ? "1px solid rgba(255,255,255,0.15)" : "1px solid #e2e8f0",
    background: darkMode ? "rgba(255,255,255,0.05)" : "#f8fafc",
    color: darkMode ? "#f1f5f9" : "#0f172a",
    fontSize: "15px",
    outline: "none",
    boxSizing: "border-box",
  };

  const btnPrimary = {
    width: "100%",
    padding: "14px",
    borderRadius: "12px",
    border: "none",
    background: "linear-gradient(135deg, #6366f1, #4f46e5)",
    color: "white",
    fontSize: "16px",
    fontWeight: "600",
    cursor: "pointer",
    marginTop: "4px",
    boxShadow: "0 4px 15px rgba(99,102,241,0.4)",
    transition: "all 0.2s",
  };

  const btnGoogle = {
    width: "100%",
    padding: "14px",
    borderRadius: "12px",
    border: darkMode ? "1px solid rgba(255,255,255,0.2)" : "1px solid #e2e8f0",
    background: darkMode ? "rgba(255,255,255,0.07)" : "white",
    color: darkMode ? "#f1f5f9" : "#0f172a",
    fontSize: "15px",
    fontWeight: "600",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "12px",
    boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
    transition: "all 0.2s",
  };

  return (
    <div style={{
      minHeight: "100vh",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      padding: "20px",
      background: darkMode
        ? "linear-gradient(135deg, #0f172a 0%, #1e1b4b 50%, #0f172a 100%)"
        : "linear-gradient(135deg, #eff6ff 0%, #f0fdf4 50%, #fef3c7 100%)",
      fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
      position: "relative",
    }}>
      {/* Dark mode toggle */}
      <button onClick={toggleDarkMode} style={{
        position: "absolute", top: "20px", right: "20px",
        background: "none", border: "none", cursor: "pointer",
        fontSize: "20px", color: darkMode ? "#fbbf24" : "#6b7280",
      }}>
        {darkMode ? <FaSun /> : <FaMoon />}
      </button>

      {/* Blurred blobs */}
      <div style={{ position: "fixed", top: "10%", left: "5%", width: "300px", height: "300px", borderRadius: "50%", background: "rgba(99,102,241,0.2)", filter: "blur(80px)", pointerEvents: "none" }} />
      <div style={{ position: "fixed", bottom: "10%", right: "5%", width: "250px", height: "250px", borderRadius: "50%", background: "rgba(16,185,129,0.15)", filter: "blur(80px)", pointerEvents: "none" }} />

      <motion.div
        style={glass}
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        {/* Logo */}
        <div style={{ textAlign: "center", marginBottom: "28px" }}>
          <div style={{
            width: "60px", height: "60px", borderRadius: "16px",
            background: "linear-gradient(135deg, #6366f1, #4f46e5)",
            display: "flex", alignItems: "center", justifyContent: "center",
            margin: "0 auto 16px", boxShadow: "0 8px 20px rgba(99,102,241,0.35)",
          }}>
            <FaWallet size={26} color="white" />
          </div>
          <h1 style={{ margin: "0 0 6px", fontSize: "26px", fontWeight: "700", color: darkMode ? "#f1f5f9" : "#0f172a" }}>
            Smart Expense
          </h1>
          <p style={{ margin: 0, fontSize: "14px", color: darkMode ? "#94a3b8" : "#64748b" }}>
            Track every rupee. Anywhere.
          </p>
        </div>

        {/* Tabs */}
        <div style={{
          display: "flex", background: darkMode ? "rgba(255,255,255,0.06)" : "#f1f5f9",
          borderRadius: "12px", padding: "4px", marginBottom: "24px",
        }}>
          {["login", "signup"].map(t => (
            <button key={t} onClick={() => setTab(t)} style={{
              flex: 1, padding: "10px", border: "none", cursor: "pointer",
              borderRadius: "10px", fontSize: "14px", fontWeight: "600", transition: "all 0.2s",
              background: tab === t
                ? "linear-gradient(135deg, #6366f1, #4f46e5)"
                : "transparent",
              color: tab === t ? "white" : (darkMode ? "#94a3b8" : "#64748b"),
              boxShadow: tab === t ? "0 2px 8px rgba(99,102,241,0.4)" : "none",
            }}>
              {t === "login" ? "Log In" : "Sign Up"}
            </button>
          ))}
        </div>

        <form onSubmit={handleEmailAuth} style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
          {tab === "signup" && (
            <div style={{ position: "relative" }}>
              <FaUser style={{ position: "absolute", left: "14px", top: "50%", transform: "translateY(-50%)", color: "#6b7280" }} />
              <input
                placeholder="Your name"
                value={name}
                onChange={e => setName(e.target.value)}
                style={inputSt}
                required
              />
            </div>
          )}
          <div style={{ position: "relative" }}>
            <FaEnvelope style={{ position: "absolute", left: "14px", top: "50%", transform: "translateY(-50%)", color: "#6b7280" }} />
            <input
              type="email"
              placeholder="Email address"
              value={email}
              onChange={e => setEmail(e.target.value)}
              style={inputSt}
              required
            />
          </div>
          <div style={{ position: "relative" }}>
            <FaLock style={{ position: "absolute", left: "14px", top: "50%", transform: "translateY(-50%)", color: "#6b7280" }} />
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              style={inputSt}
              required
            />
          </div>

          <motion.button type="submit" style={btnPrimary} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} disabled={loading}>
            {loading ? "Please wait..." : tab === "login" ? "Log In" : "Create Account"}
          </motion.button>
        </form>

        {/* Divider */}
        <div style={{ display: "flex", alignItems: "center", gap: "12px", margin: "20px 0" }}>
          <div style={{ flex: 1, height: "1px", background: darkMode ? "rgba(255,255,255,0.1)" : "#e2e8f0" }} />
          <span style={{ fontSize: "13px", color: darkMode ? "#64748b" : "#94a3b8" }}>or continue with</span>
          <div style={{ flex: 1, height: "1px", background: darkMode ? "rgba(255,255,255,0.1)" : "#e2e8f0" }} />
        </div>

        <motion.button onClick={handleGoogleLogin} style={btnGoogle} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
          <svg width="20" height="20" viewBox="0 0 48 48">
            <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z" />
            <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z" />
            <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z" />
            <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z" />
          </svg>
          Sign in with Google
        </motion.button>

        <p style={{ textAlign: "center", fontSize: "12px", color: darkMode ? "#475569" : "#94a3b8", marginTop: "20px", marginBottom: 0 }}>
          Your expenses are private and synced across all devices.
        </p>
      </motion.div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
//  DASHBOARD
// ─────────────────────────────────────────────────────────────────────────────
function Dashboard({ darkMode, toggleDarkMode, onLogout }) {
  const user = getUser();
  const [expenses, setExpenses] = useState([]);
  const [filteredExpenses, setFilteredExpenses] = useState([]);
  const [title, setTitle] = useState("");
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState(null);
  const [date, setDate] = useState(new Date());
  const [budget, setBudget] = useState(() => localStorage.getItem("expense_budget") || "");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [chartType, setChartType] = useState("pie");
  const [editingExpense, setEditingExpense] = useState(null);
  const [showFilters, setShowFilters] = useState(false);
  const [dateRange, setDateRange] = useState("all");
  const [loadingExpenses, setLoadingExpenses] = useState(true);

  // Fetch expenses from API
  const fetchExpenses = useCallback(async () => {
    try {
      const res = await axios.get(`${API}/api/expenses`, { headers: authHeaders() });
      setExpenses(res.data);
    } catch (err) {
      console.error("Failed to load expenses:", err);
      toast.error("Could not load expenses. Check your connection.");
    } finally {
      setLoadingExpenses(false);
    }
  }, []);

  useEffect(() => { fetchExpenses(); }, [fetchExpenses]);

  useEffect(() => {
    localStorage.setItem("expense_budget", budget);
  }, [budget]);

  // Filter logic
  useEffect(() => {
    let filtered = expenses;
    if (dateRange !== "all") {
      const now = new Date();
      let startDate, endDate;
      switch (dateRange) {
        case "thisMonth": startDate = startOfMonth(now); endDate = endOfMonth(now); break;
        case "lastMonth": { const lm = subMonths(now, 1); startDate = startOfMonth(lm); endDate = endOfMonth(lm); break; }
        case "last3Months": startDate = subMonths(now, 3); endDate = now; break;
        default: startDate = new Date(0); endDate = now;
      }
      filtered = filtered.filter(exp => isWithinInterval(new Date(exp.date || exp.createdAt), { start: startDate, end: endDate }));
    }
    if (searchTerm) filtered = filtered.filter(exp => exp.title.toLowerCase().includes(searchTerm.toLowerCase()));
    if (selectedCategory) filtered = filtered.filter(exp => exp.category === selectedCategory.value);
    setFilteredExpenses(filtered);
  }, [expenses, searchTerm, selectedCategory, dateRange]);

  const total = filteredExpenses.reduce((sum, exp) => sum + Number(exp.amount), 0);
  const remaining = (Number(budget) || 0) - total;

  // Charts
  const categoryTotals = categories.map(cat => ({
    ...cat,
    total: filteredExpenses.filter(exp => exp.category === cat.value).reduce((s, e) => s + Number(e.amount), 0),
  })).filter(c => c.total > 0);

  const pieData = {
    labels: categoryTotals.map(c => c.label),
    datasets: [{ data: categoryTotals.map(c => c.total), backgroundColor: categoryTotals.map(c => c.color), borderWidth: 2, borderColor: darkMode ? "#374151" : "#fff" }],
  };
  const barData = {
    labels: categoryTotals.map(c => c.label),
    datasets: [{ label: "Amount (₹)", data: categoryTotals.map(c => c.total), backgroundColor: categoryTotals.map(c => c.color), borderRadius: 8 }],
  };
  const monthlyData = Array.from({ length: 6 }, (_, i) => {
    const ms = startOfMonth(subMonths(new Date(), 5 - i));
    const me = endOfMonth(subMonths(new Date(), 5 - i));
    return {
      month: format(ms, "MMM yyyy"),
      amount: expenses.filter(exp => isWithinInterval(new Date(exp.date || exp.createdAt), { start: ms, end: me })).reduce((s, e) => s + Number(e.amount), 0),
    };
  });
  const lineData = {
    labels: monthlyData.map(d => d.month),
    datasets: [{ label: "Monthly Expenses", data: monthlyData.map(d => d.amount), borderColor: "#6366f1", backgroundColor: "rgba(99,102,241,0.1)", tension: 0.4, fill: true }],
  };
  const chartOptions = {
    responsive: true,
    plugins: {
      legend: { position: "bottom", labels: { color: darkMode ? "#e5e7eb" : "#374151", font: { size: 12 } } },
      tooltip: { backgroundColor: darkMode ? "#374151" : "#fff", titleColor: darkMode ? "#e5e7eb" : "#374151", bodyColor: darkMode ? "#e5e7eb" : "#374151" },
    },
    scales: chartType !== "pie" ? {
      y: { beginAtZero: true, grid: { color: darkMode ? "#4b5563" : "#e5e7eb" }, ticks: { color: darkMode ? "#e5e7eb" : "#374151" } },
      x: { grid: { color: darkMode ? "#4b5563" : "#e5e7eb" }, ticks: { color: darkMode ? "#e5e7eb" : "#374151" } },
    } : {},
  };

  // CRUD handlers
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title || !amount || !category) { toast.error("Please fill all fields"); return; }
    try {
      const res = await axios.post(`${API}/api/expenses/add`, { title, amount: Number(amount), category: category.value, date: date.toISOString() }, { headers: authHeaders() });
      setExpenses(prev => [...prev, res.data]);
      setTitle(""); setAmount(""); setCategory(null); setDate(new Date());
      toast.success("Expense added! 💸");
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to add expense");
    }
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    if (!title || !amount || !category) { toast.error("Please fill all fields"); return; }
    try {
      const updated = { ...editingExpense, title, amount: Number(amount), category: category.value, date: date.toISOString() };
      await axios.put(`${API}/api/expenses/${editingExpense._id}`, updated, { headers: authHeaders() });
      setExpenses(prev => prev.map(exp => exp._id === editingExpense._id ? updated : exp));
      toast.success("Expense updated! ✏️");
    } catch (err) { toast.error("Failed to update expense"); }
    setEditingExpense(null); setTitle(""); setAmount(""); setCategory(null); setDate(new Date());
  };

  const handleDelete = async (id) => {
    try {
      await axios.delete(`${API}/api/expenses/${id}`, { headers: authHeaders() });
      setExpenses(prev => prev.filter(exp => exp._id !== id));
      toast.success("Expense deleted! 🗑️");
    } catch (err) { toast.error("Failed to delete expense"); }
  };

  const handleEdit = (exp) => {
    setEditingExpense(exp);
    setTitle(exp.title);
    setAmount(exp.amount);
    setCategory(categories.find(c => c.value === exp.category));
    setDate(new Date(exp.date || exp.createdAt));
  };

  const exportData = () => {
    const dataStr = JSON.stringify(expenses, null, 2);
    const a = document.createElement("a");
    a.href = "data:application/json;charset=utf-8," + encodeURIComponent(dataStr);
    a.download = `expenses-${format(new Date(), "yyyy-MM-dd")}.json`;
    a.click();
    toast.success("Exported!");
  };

  const bg = darkMode ? "linear-gradient(135deg, #0f172a, #1e1b4b)" : "linear-gradient(135deg, #f8fafc, #eff6ff)";
  const glass = { background: darkMode ? "rgba(30,41,59,0.7)" : "rgba(255,255,255,0.75)", backdropFilter: "blur(16px)", borderRadius: "20px", border: darkMode ? "1px solid rgba(255,255,255,0.1)" : "1px solid rgba(255,255,255,0.6)", boxShadow: "0 8px 32px rgba(0,0,0,0.1)" };
  const inputSt = { padding: "12px 16px", borderRadius: "12px", border: darkMode ? "1px solid rgba(255,255,255,0.15)" : "1px solid #e2e8f0", background: darkMode ? "rgba(255,255,255,0.05)" : "#f8fafc", color: darkMode ? "#f1f5f9" : "#0f172a", fontSize: "15px", outline: "none", flex: 1, minWidth: "160px", boxSizing: "border-box" };

  return (
    <div style={{ minHeight: "100vh", background: bg, color: darkMode ? "#e5e7eb" : "#374151", fontFamily: "'Inter',-apple-system,sans-serif" }}>
      <ToastContainer position="top-right" autoClose={3000} theme={darkMode ? "dark" : "light"} />

      {/* ── HEADER ── */}
      <motion.header
        style={{ ...glass, borderRadius: "0 0 20px 20px", padding: "16px 28px", display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "28px", position: "sticky", top: 0, zIndex: 100 }}
        initial={{ y: -50, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ duration: 0.4 }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <div style={{ width: "40px", height: "40px", borderRadius: "12px", background: "linear-gradient(135deg,#6366f1,#4f46e5)", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <FaWallet color="white" size={18} />
          </div>
          <h1 style={{ margin: 0, fontSize: "22px", fontWeight: "700", background: "linear-gradient(135deg,#6366f1,#10b981)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>Smart Expense</h1>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          {/* User avatar */}
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            {user?.avatar
              ? <img src={user.avatar} alt="avatar" style={{ width: "34px", height: "34px", borderRadius: "50%", objectFit: "cover", border: "2px solid #6366f1" }} />
              : <div style={{ width: "34px", height: "34px", borderRadius: "50%", background: "linear-gradient(135deg,#6366f1,#4f46e5)", display: "flex", alignItems: "center", justifyContent: "center" }}><FaUser size={14} color="white" /></div>
            }
            <span style={{ fontSize: "14px", fontWeight: "500", maxWidth: "120px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{user?.name || user?.email}</span>
          </div>

          <motion.button onClick={toggleDarkMode} style={{ background: "none", border: "none", cursor: "pointer", fontSize: "18px", color: darkMode ? "#fbbf24" : "#6b7280", padding: "8px" }} whileHover={{ scale: 1.1 }}>
            {darkMode ? <FaSun /> : <FaMoon />}
          </motion.button>
          <motion.button onClick={exportData} style={{ background: "none", border: "none", cursor: "pointer", fontSize: "18px", color: darkMode ? "#e5e7eb" : "#6b7280", padding: "8px" }} whileHover={{ scale: 1.1 }}><FaDownload /></motion.button>
          <motion.button onClick={() => setShowFilters(f => !f)} style={{ background: "none", border: "none", cursor: "pointer", fontSize: "18px", color: darkMode ? "#e5e7eb" : "#6b7280", padding: "8px" }} whileHover={{ scale: 1.1 }}><FaFilter /></motion.button>
          <motion.button onClick={onLogout} style={{ background: "linear-gradient(135deg,#ef4444,#dc2626)", border: "none", cursor: "pointer", borderRadius: "10px", padding: "8px 14px", color: "white", fontSize: "14px", display: "flex", alignItems: "center", gap: "6px", fontWeight: "600" }} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <FaSignOutAlt /> Logout
          </motion.button>
        </div>
      </motion.header>

      <div style={{ padding: "0 24px 40px" }}>
        {/* ── FILTERS ── */}
        <AnimatePresence>
          {showFilters && (
            <motion.div style={{ ...glass, padding: "20px", marginBottom: "24px" }} initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }}>
              <div style={{ display: "flex", gap: "16px", flexWrap: "wrap", alignItems: "center" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "8px", flex: 1, minWidth: "200px" }}>
                  <FaSearch style={{ color: "#6b7280" }} />
                  <input placeholder="Search expenses..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} style={{ ...inputSt, minWidth: "unset", flex: 1 }} />
                </div>
                <div style={{ flex: 1, minWidth: "180px" }}>
                  <Select value={selectedCategory} onChange={setSelectedCategory} options={[{ value: null, label: "All Categories" }, ...categories]} placeholder="Category" styles={selectStyles(darkMode)} isClearable />
                </div>
                <select value={dateRange} onChange={e => setDateRange(e.target.value)} style={{ ...inputSt, minWidth: "160px", flex: "none" }}>
                  <option value="all">All Time</option>
                  <option value="thisMonth">This Month</option>
                  <option value="lastMonth">Last Month</option>
                  <option value="last3Months">Last 3 Months</option>
                </select>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── SUMMARY CARDS ── */}
        <motion.div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(240px,1fr))", gap: "20px", marginBottom: "28px" }} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
          {[
            { icon: <FaCreditCard size={22} color="#ef4444" />, label: "Total Expenses", value: `₹${total.toLocaleString()}`, color: "#ef4444" },
            { icon: <FaPiggyBank size={22} color="#10b981" />, label: "Budget", isInput: true },
            { icon: <FaWallet size={22} color={remaining >= 0 ? "#10b981" : "#ef4444"} />, label: "Remaining", value: budget ? `₹${remaining.toLocaleString()}` : "Not set", color: remaining >= 0 ? "#10b981" : "#ef4444" },
          ].map((card, i) => (
            <motion.div key={i} style={{ ...glass, padding: "22px" }} whileHover={{ scale: 1.02, y: -2 }}>
              <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                {card.icon}
                <div style={{ flex: 1 }}>
                  <p style={{ margin: "0 0 4px", fontSize: "13px", color: darkMode ? "#94a3b8" : "#64748b", fontWeight: "500" }}>{card.label}</p>
                  {card.isInput
                    ? <input type="number" value={budget} onChange={e => setBudget(e.target.value)} placeholder="Set budget" style={{ border: "none", background: "transparent", fontSize: "24px", fontWeight: "700", color: "#10b981", outline: "none", width: "100%" }} />
                    : <p style={{ margin: 0, fontSize: "24px", fontWeight: "700", color: card.color }}>{card.value}</p>
                  }
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* ── ADD / EDIT FORM ── */}
        <motion.div style={{ ...glass, padding: "24px", marginBottom: "28px" }} initial={{ opacity: 0, x: -30 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.25 }}>
          <h3 style={{ margin: "0 0 18px", display: "flex", alignItems: "center", gap: "8px", fontSize: "18px" }}>
            {editingExpense ? <FaEdit color="#6366f1" /> : <FaPlus color="#10b981" />}
            {editingExpense ? "Edit Expense" : "Add New Expense"}
          </h3>
          <form onSubmit={editingExpense ? handleUpdate : handleSubmit} style={{ display: "flex", gap: "12px", flexWrap: "wrap", alignItems: "center" }}>
            <input placeholder="Expense title" value={title} onChange={e => setTitle(e.target.value)} style={inputSt} required />
            <input type="number" placeholder="Amount (₹)" value={amount} onChange={e => setAmount(e.target.value)} style={{ ...inputSt, maxWidth: "160px" }} required />
            <div style={{ minWidth: "200px", flex: 1 }}>
              <Select value={category} onChange={setCategory} options={categories} placeholder="Category" styles={selectStyles(darkMode)} />
            </div>
            <DatePicker selected={date} onChange={setDate} dateFormat="dd/MM/yyyy" customInput={<input style={{ ...inputSt, maxWidth: "160px", cursor: "pointer" }} />} />
            <motion.button type="submit" style={{ padding: "12px 24px", borderRadius: "12px", border: "none", background: editingExpense ? "linear-gradient(135deg,#6366f1,#4f46e5)" : "linear-gradient(135deg,#10b981,#059669)", color: "white", fontSize: "15px", fontWeight: "600", cursor: "pointer", display: "flex", alignItems: "center", gap: "8px", boxShadow: "0 4px 12px rgba(16,185,129,0.3)" }} whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }}>
              {editingExpense ? <><FaEdit /> Update</> : <><FaPlus /> Add</>}
            </motion.button>
            {editingExpense && (
              <motion.button type="button" onClick={() => { setEditingExpense(null); setTitle(""); setAmount(""); setCategory(null); setDate(new Date()); }} style={{ padding: "12px 20px", borderRadius: "12px", border: "none", background: "linear-gradient(135deg,#6b7280,#4b5563)", color: "white", fontSize: "15px", fontWeight: "600", cursor: "pointer" }} whileHover={{ scale: 1.04 }}>
                Cancel
              </motion.button>
            )}
          </form>
        </motion.div>

        {/* ── EXPENSE LIST ── */}
        <motion.div style={{ marginBottom: "28px" }} initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }}>
          <h3 style={{ fontSize: "18px", marginBottom: "16px" }}>Recent Expenses ({filteredExpenses.length})</h3>
          {loadingExpenses && (
            <div style={{ textAlign: "center", padding: "40px", color: "#6b7280" }}>Loading your expenses…</div>
          )}
          <AnimatePresence>
            {filteredExpenses.slice().reverse().map(exp => {
              const cat = categories.find(c => c.value === exp.category);
              return (
                <motion.div key={exp._id} style={{ ...glass, padding: "18px 20px", marginBottom: "10px", display: "flex", alignItems: "center", gap: "16px" }} initial={{ opacity: 0, x: -30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 30 }} whileHover={{ scale: 1.01, x: 4 }}>
                  <div style={{ width: "42px", height: "42px", borderRadius: "12px", background: `${cat?.color}22`, display: "flex", alignItems: "center", justifyContent: "center", color: cat?.color, fontSize: "18px", flexShrink: 0 }}>
                    {cat?.icon}
                  </div>
                  <div style={{ flex: 1 }}>
                    <p style={{ margin: "0 0 2px", fontWeight: "600", fontSize: "15px" }}>{exp.title}</p>
                    <p style={{ margin: 0, fontSize: "12px", color: darkMode ? "#94a3b8" : "#64748b" }}>{cat?.label} • {format(new Date(exp.date || exp.createdAt), "dd MMM yyyy")}</p>
                  </div>
                  <span style={{ fontSize: "18px", fontWeight: "700", color: darkMode ? "#f1f5f9" : "#0f172a", marginRight: "8px" }}>₹{Number(exp.amount).toLocaleString()}</span>
                  <motion.button onClick={() => handleEdit(exp)} style={{ background: "none", border: "none", cursor: "pointer", color: "#6366f1", fontSize: "16px", padding: "6px" }} whileHover={{ scale: 1.2 }}><FaEdit /></motion.button>
                  <motion.button onClick={() => handleDelete(exp._id)} style={{ background: "linear-gradient(135deg,#ef4444,#dc2626)", border: "none", cursor: "pointer", borderRadius: "8px", padding: "6px 10px", color: "white", fontSize: "14px" }} whileHover={{ scale: 1.1 }}><FaTrash /></motion.button>
                </motion.div>
              );
            })}
          </AnimatePresence>
          {!loadingExpenses && filteredExpenses.length === 0 && (
            <div style={{ ...glass, padding: "50px", textAlign: "center", color: darkMode ? "#94a3b8" : "#64748b" }}>
              <FaWallet size={40} style={{ marginBottom: "12px", opacity: 0.4 }} />
              <p style={{ margin: 0, fontSize: "16px" }}>No expenses yet. Add your first one above!</p>
            </div>
          )}
        </motion.div>

        {/* ── CHARTS ── */}
        {filteredExpenses.length > 0 && (
          <motion.div style={{ ...glass, padding: "24px" }} initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.45 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px", flexWrap: "wrap", gap: "12px" }}>
              <h3 style={{ margin: 0, fontSize: "18px" }}>Analytics</h3>
              <div style={{ display: "flex", gap: "8px" }}>
                {[{ type: "pie", icon: <FaChartPie />, label: "Pie" }, { type: "bar", icon: <FaChartBar />, label: "Bar" }, { type: "line", icon: <FaChartLine />, label: "Trend" }].map(({ type, icon, label }) => (
                  <motion.button key={type} onClick={() => setChartType(type)} style={{ border: "none", padding: "8px 16px", borderRadius: "10px", cursor: "pointer", fontSize: "13px", display: "flex", alignItems: "center", gap: "6px", fontWeight: "600", background: chartType === type ? "linear-gradient(135deg,#6366f1,#4f46e5)" : (darkMode ? "rgba(255,255,255,0.08)" : "#f1f5f9"), color: chartType === type ? "white" : (darkMode ? "#94a3b8" : "#64748b"), boxShadow: chartType === type ? "0 4px 12px rgba(99,102,241,0.35)" : "none" }} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                    {icon} {label}
                  </motion.button>
                ))}
              </div>
            </div>
            <div style={{ minHeight: "380px", display: "flex", alignItems: "center", justifyContent: "center", padding: "16px", background: darkMode ? "rgba(255,255,255,0.03)" : "rgba(0,0,0,0.02)", borderRadius: "14px" }}>
              {chartType === "pie" && <Pie data={pieData} options={chartOptions} />}
              {chartType === "bar" && <Bar data={barData} options={chartOptions} />}
              {chartType === "line" && <Line data={lineData} options={chartOptions} />}
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
//  ROOT APP
// ─────────────────────────────────────────────────────────────────────────────
function App() {
  const [loggedIn, setLoggedIn] = useState(!!getToken());
  const [darkMode, setDarkMode] = useState(() => {
    try { return JSON.parse(localStorage.getItem("expense_dark")) || false; } catch { return false; }
  });

  const toggleDarkMode = () => setDarkMode(d => {
    localStorage.setItem("expense_dark", JSON.stringify(!d));
    return !d;
  });

  const handleLogin = () => setLoggedIn(true);

  const handleLogout = () => {
    localStorage.removeItem("expense_token");
    localStorage.removeItem("expense_user");
    setLoggedIn(false);
    toast.info("Logged out successfully");
  };

  return loggedIn
    ? <Dashboard darkMode={darkMode} toggleDarkMode={toggleDarkMode} onLogout={handleLogout} />
    : <LoginPage darkMode={darkMode} toggleDarkMode={toggleDarkMode} onLogin={handleLogin} />;
}

// ── Shared style helpers ───────────────────────────────────────────────────────
const selectStyles = (darkMode) => ({
  control: (p) => ({ ...p, backgroundColor: darkMode ? "rgba(255,255,255,0.05)" : "#f8fafc", borderColor: darkMode ? "rgba(255,255,255,0.15)" : "#e2e8f0", borderRadius: "12px", minHeight: "46px", boxShadow: "none", "&:hover": { borderColor: "#6366f1" } }),
  option: (p, s) => ({ ...p, backgroundColor: s.isSelected ? "#6366f1" : (darkMode ? "#1e293b" : "white"), color: s.isSelected ? "white" : (darkMode ? "#e5e7eb" : "#374151"), "&:hover": { backgroundColor: s.isSelected ? "#4f46e5" : (darkMode ? "#334155" : "#f1f5f9") } }),
  singleValue: (p) => ({ ...p, color: darkMode ? "#e5e7eb" : "#374151" }),
  menu: (p) => ({ ...p, backgroundColor: darkMode ? "#1e293b" : "white", borderRadius: "12px" }),
  placeholder: (p) => ({ ...p, color: darkMode ? "#64748b" : "#94a3b8" }),
});

export default App;