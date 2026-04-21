import { useEffect, useState } from "react";
import axios from "axios";
import { Pie, Bar, Line } from "react-chartjs-2";
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, LineElement, PointElement, Title } from "chart.js";
import { motion, AnimatePresence } from "framer-motion";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import Select from "react-select";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import {
  FaPlus,
  FaTrash,
  FaEdit,
  FaChartPie,
  FaChartBar,
  FaChartLine,
  FaSearch,
  FaDownload,
  FaMoon,
  FaSun,
  FaWallet,
  FaPiggyBank,
  FaCreditCard,
  FaHome,
  FaUtensils,
  FaCar,
  FaShoppingCart,
  FaGamepad,
  FaHeartbeat,
  FaGraduationCap,
  FaPlane,
  FaFilter
} from "react-icons/fa";
import { format, startOfMonth, endOfMonth, subMonths, isWithinInterval } from "date-fns";

ChartJS.register(
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  Title
);

const categories = [
  { value: "food", label: "Food & Dining", icon: <FaUtensils />, color: "#ef4444" },
  { value: "transport", label: "Transportation", icon: <FaCar />, color: "#3b82f6" },
  { value: "shopping", label: "Shopping", icon: <FaShoppingCart />, color: "#8b5cf6" },
  { value: "entertainment", label: "Entertainment", icon: <FaGamepad />, color: "#f59e0b" },
  { value: "health", label: "Health & Fitness", icon: <FaHeartbeat />, color: "#10b981" },
  { value: "education", label: "Education", icon: <FaGraduationCap />, color: "#06b6d4" },
  { value: "travel", label: "Travel", icon: <FaPlane />, color: "#ec4899" },
  { value: "bills", label: "Bills & Utilities", icon: <FaHome />, color: "#6b7280" },
  { value: "other", label: "Other", icon: <FaWallet />, color: "#64748b" }
];

function App() {
  const [showDashboard, setShowDashboard] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [expenses, setExpenses] = useState([]);
  const [filteredExpenses, setFilteredExpenses] = useState([]);
  const [title, setTitle] = useState("");
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState(null);
  const [date, setDate] = useState(new Date());
  const [budget, setBudget] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [chartType, setChartType] = useState("pie");
  const [editingExpense, setEditingExpense] = useState(null);
  const [showFilters, setShowFilters] = useState(false);
  const [dateRange, setDateRange] = useState("all");

  // Load data from localStorage and API
  useEffect(() => {
    const savedExpenses = localStorage.getItem("expenses");
    const savedBudget = localStorage.getItem("budget");
    const savedDarkMode = localStorage.getItem("darkMode");

    if (savedExpenses) {
      setExpenses(JSON.parse(savedExpenses));
    }
    if (savedBudget) {
      setBudget(savedBudget);
    }
    if (savedDarkMode) {
      setDarkMode(JSON.parse(savedDarkMode));
    }

    // Fetch from API
    axios
      .get("https://expense-tracker-zq2j.onrender.com/api/expenses")
      .then((res) => {
        setExpenses(res.data);
        localStorage.setItem("expenses", JSON.stringify(res.data));
      })
      .catch((err) => {
        console.log("API not available, using local data");
        toast.info("Using offline mode - data saved locally");
      });
  }, []);

  // Save to localStorage whenever expenses change
  useEffect(() => {
    localStorage.setItem("expenses", JSON.stringify(expenses));
  }, [expenses]);

  useEffect(() => {
    localStorage.setItem("budget", budget);
  }, [budget]);

  useEffect(() => {
    localStorage.setItem("darkMode", JSON.stringify(darkMode));
  }, [darkMode]);

  // Filter expenses based on search and category
  useEffect(() => {
    let filtered = expenses;

    // Date range filter
    if (dateRange !== "all") {
      const now = new Date();
      let startDate, endDate;

      switch (dateRange) {
        case "thisMonth":
          startDate = startOfMonth(now);
          endDate = endOfMonth(now);
          break;
        case "lastMonth":
          const lastMonth = subMonths(now, 1);
          startDate = startOfMonth(lastMonth);
          endDate = endOfMonth(lastMonth);
          break;
        case "last3Months":
          startDate = subMonths(now, 3);
          endDate = now;
          break;
        default:
          startDate = new Date(0);
          endDate = now;
      }

      filtered = filtered.filter(exp =>
        isWithinInterval(new Date(exp.date || exp.createdAt), { start: startDate, end: endDate })
      );
    }

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(exp =>
        exp.title.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Category filter
    if (selectedCategory) {
      filtered = filtered.filter(exp => exp.category === selectedCategory.value);
    }

    setFilteredExpenses(filtered);
  }, [expenses, searchTerm, selectedCategory, dateRange]);

  const total = filteredExpenses.reduce((sum, exp) => sum + Number(exp.amount), 0);
  const remaining = (budget || 0) - total;

  // Category data for charts
  const categoryTotals = categories.map(cat => {
    const total = filteredExpenses
      .filter(exp => exp.category === cat.value)
      .reduce((sum, exp) => sum + Number(exp.amount), 0);
    return { ...cat, total };
  }).filter(cat => cat.total > 0);

  // Chart data
  const pieData = {
    labels: categoryTotals.map(cat => cat.label),
    datasets: [{
      data: categoryTotals.map(cat => cat.total),
      backgroundColor: categoryTotals.map(cat => cat.color),
      borderWidth: 2,
      borderColor: darkMode ? '#374151' : '#ffffff',
    }],
  };

  const barData = {
    labels: categoryTotals.map(cat => cat.label),
    datasets: [{
      label: 'Amount',
      data: categoryTotals.map(cat => cat.total),
      backgroundColor: categoryTotals.map(cat => cat.color),
      borderRadius: 8,
    }],
  };

  // Monthly trend data (last 6 months)
  const monthlyData = [];
  for (let i = 5; i >= 0; i--) {
    const monthStart = startOfMonth(subMonths(new Date(), i));
    const monthEnd = endOfMonth(subMonths(new Date(), i));
    const monthTotal = expenses
      .filter(exp => isWithinInterval(new Date(exp.date || exp.createdAt), { start: monthStart, end: monthEnd }))
      .reduce((sum, exp) => sum + Number(exp.amount), 0);
    monthlyData.push({
      month: format(monthStart, 'MMM yyyy'),
      amount: monthTotal
    });
  }

  const lineData = {
    labels: monthlyData.map(d => d.month),
    datasets: [{
      label: 'Monthly Expenses',
      data: monthlyData.map(d => d.amount),
      borderColor: '#3b82f6',
      backgroundColor: 'rgba(59, 130, 246, 0.1)',
      tension: 0.4,
      fill: true,
    }],
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          color: darkMode ? '#e5e7eb' : '#374151',
          font: { size: 12 }
        }
      },
      tooltip: {
        backgroundColor: darkMode ? '#374151' : '#ffffff',
        titleColor: darkMode ? '#e5e7eb' : '#374151',
        bodyColor: darkMode ? '#e5e7eb' : '#374151',
      }
    },
    scales: chartType !== 'pie' ? {
      y: {
        beginAtZero: true,
        grid: {
          color: darkMode ? '#4b5563' : '#e5e7eb',
        },
        ticks: {
          color: darkMode ? '#e5e7eb' : '#374151',
        }
      },
      x: {
        grid: {
          color: darkMode ? '#4b5563' : '#e5e7eb',
        },
        ticks: {
          color: darkMode ? '#e5e7eb' : '#374151',
        }
      }
    } : {}
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title || !amount || !category) {
      toast.error("Please fill all fields");
      return;
    }

    const newExpense = {
      title,
      amount: Number(amount),
      category: category.value,
      date: date.toISOString()
    };

    try {
      const res = await axios.post("https://expense-tracker-zq2j.onrender.com/api/expenses/add", newExpense);
      setExpenses([...expenses, res.data]);
      setTitle("");
      setAmount("");
      setCategory(null);
      setDate(new Date());
      toast.success("Expense added successfully!");
    } catch (err) {
      // Fallback to local storage
      const localExpense = { ...newExpense, _id: Date.now().toString(), createdAt: new Date().toISOString() };
      setExpenses([...expenses, localExpense]);
      toast.success("Expense added locally!");
    }
  };

  const handleEdit = (expense) => {
    setEditingExpense(expense);
    setTitle(expense.title);
    setAmount(expense.amount);
    setCategory(categories.find(cat => cat.value === expense.category));
    setDate(new Date(expense.date || expense.createdAt));
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    if (!title || !amount || !category) {
      toast.error("Please fill all fields");
      return;
    }

    const updatedExpense = {
      ...editingExpense,
      title,
      amount: Number(amount),
      category: category.value,
      date: date.toISOString()
    };

    try {
      await axios.put(`https://expense-tracker-zq2j.onrender.com/api/expenses/${editingExpense._id}`, updatedExpense);
      setExpenses(expenses.map(exp => exp._id === editingExpense._id ? updatedExpense : exp));
      toast.success("Expense updated successfully!");
    } catch (err) {
      setExpenses(expenses.map(exp => exp._id === editingExpense._id ? updatedExpense : exp));
      toast.success("Expense updated locally!");
    }

    setEditingExpense(null);
    setTitle("");
    setAmount("");
    setCategory(null);
    setDate(new Date());
  };

  const handleDelete = async (id) => {
    try {
      await axios.delete(`https://expense-tracker-zq2j.onrender.com/api/expenses/${id}`);
      setExpenses(expenses.filter((exp) => exp._id !== id));
      toast.success("Expense deleted!");
    } catch (err) {
      setExpenses(expenses.filter((exp) => exp._id !== id));
      toast.success("Expense deleted locally!");
    }
  };

  const exportData = () => {
    const dataStr = JSON.stringify(expenses, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    const exportFileDefaultName = `expenses-${format(new Date(), 'yyyy-MM-dd')}.json`;

    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();

    toast.success("Data exported successfully!");
  };

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
  };

  // LANDING PAGE
  if (!showDashboard) {
    return (
      <div style={{
        ...landingStyle,
        background: darkMode
          ? "linear-gradient(135deg, #1f2937, #374151)"
          : "linear-gradient(135deg, #e0f2fe, #fef3c7)"
      }}>
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          style={{ textAlign: 'center' }}
        >
          <motion.h1
            style={{ ...landingTitle, color: darkMode ? '#e5e7eb' : '#0f172a' }}
            initial={{ scale: 0.5 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, duration: 0.5 }}
          >
            <FaWallet style={{ marginRight: '20px' }} />
            Smart Expense
          </motion.h1>

          <motion.p
            style={{ ...landingSubtitle, color: darkMode ? '#9ca3af' : '#6b7280' }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4, duration: 0.5 }}
          >
            Take control of your finances with intelligent expense tracking
          </motion.p>

          <motion.button
            onClick={() => setShowDashboard(true)}
            style={landingButton}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6, duration: 0.5 }}
          >
            <FaPlus style={{ marginRight: '10px' }} />
            Start Tracking
          </motion.button>
        </motion.div>
      </div>
    );
  }

  return (
    <div style={{
      ...appStyle,
      background: darkMode
        ? "linear-gradient(135deg, #111827, #1f2937)"
        : "linear-gradient(135deg, #f1f5f9, #e0f2fe)",
      color: darkMode ? '#e5e7eb' : '#374151'
    }}>
      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme={darkMode ? "dark" : "light"}
      />

      {/* HEADER */}
      <motion.header
        style={headerStyle}
        initial={{ y: -50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
          <FaWallet size={24} />
          <h1 style={{ margin: 0, fontSize: '28px' }}>Expense Tracker</h1>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
          <motion.button
            onClick={toggleDarkMode}
            style={{ ...iconButton, color: darkMode ? '#e5e7eb' : '#374151' }}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
          >
            {darkMode ? <FaSun /> : <FaMoon />}
          </motion.button>

          <motion.button
            onClick={exportData}
            style={{ ...iconButton, color: darkMode ? '#e5e7eb' : '#374151' }}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
          >
            <FaDownload />
          </motion.button>

          <motion.button
            onClick={() => setShowFilters(!showFilters)}
            style={{ ...iconButton, color: darkMode ? '#e5e7eb' : '#374151' }}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
          >
            <FaFilter />
          </motion.button>
        </div>
      </motion.header>

      {/* FILTERS */}
      <AnimatePresence>
        {showFilters && (
          <motion.div
            style={filtersStyle}
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <FaSearch />
                <input
                  placeholder="Search expenses..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  style={{ ...inputStyle, background: darkMode ? '#374151' : 'white', color: darkMode ? '#e5e7eb' : '#374151' }}
                />
              </div>

              <Select
                value={selectedCategory}
                onChange={setSelectedCategory}
                options={[{ value: null, label: 'All Categories' }, ...categories]}
                placeholder="Filter by category"
                styles={selectStyles(darkMode)}
                isClearable
              />

              <select
                value={dateRange}
                onChange={(e) => setDateRange(e.target.value)}
                style={{ ...inputStyle, background: darkMode ? '#374151' : 'white', color: darkMode ? '#e5e7eb' : '#374151' }}
              >
                <option value="all">All Time</option>
                <option value="thisMonth">This Month</option>
                <option value="lastMonth">Last Month</option>
                <option value="last3Months">Last 3 Months</option>
              </select>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* SUMMARY CARDS */}
      <motion.div
        style={cardsContainer}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.5 }}
      >
        <motion.div style={cardStyle} whileHover={{ scale: 1.02 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <FaCreditCard size={24} color="#ef4444" />
            <div>
              <h4 style={{ margin: 0, color: darkMode ? '#e5e7eb' : '#6b7280' }}>Total Expenses</h4>
              <p style={{ ...valueStyle, color: '#ef4444' }}>₹{total.toLocaleString()}</p>
            </div>
          </div>
        </motion.div>

        <motion.div style={cardStyle} whileHover={{ scale: 1.02 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <FaPiggyBank size={24} color="#10b981" />
            <div>
              <h4 style={{ margin: 0, color: darkMode ? '#e5e7eb' : '#6b7280' }}>Budget</h4>
              <input
                type="number"
                value={budget}
                onChange={(e) => setBudget(e.target.value)}
                style={{ ...budgetInput, background: darkMode ? '#374151' : 'white', color: darkMode ? '#e5e7eb' : '#374151' }}
                placeholder="Set budget"
              />
            </div>
          </div>
        </motion.div>

        <motion.div style={cardStyle} whileHover={{ scale: 1.02 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <FaWallet size={24} color={remaining >= 0 ? "#10b981" : "#ef4444"} />
            <div>
              <h4 style={{ margin: 0, color: darkMode ? '#e5e7eb' : '#6b7280' }}>Remaining</h4>
              <p style={{ ...valueStyle, color: remaining >= 0 ? "#10b981" : "#ef4444" }}>
                ₹{budget ? remaining.toLocaleString() : "Not set"}
              </p>
            </div>
          </div>
        </motion.div>
      </motion.div>

      {/* FORM */}
      <motion.div
        style={boxStyle}
        initial={{ opacity: 0, x: -50 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.4, duration: 0.5 }}
      >
        <h3 style={{ marginTop: 0, display: 'flex', alignItems: 'center', gap: '10px' }}>
          <FaPlus />
          {editingExpense ? 'Edit Expense' : 'Add New Expense'}
        </h3>
        <form onSubmit={editingExpense ? handleUpdate : handleSubmit} style={{ display: "flex", gap: "15px", flexWrap: 'wrap' }}>
          <input
            placeholder="Expense title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            style={{ ...inputStyle, background: darkMode ? '#374151' : 'white', color: darkMode ? '#e5e7eb' : '#374151' }}
            required
          />
          <input
            type="number"
            placeholder="Amount"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            style={{ ...inputStyle, background: darkMode ? '#374151' : 'white', color: darkMode ? '#e5e7eb' : '#374151' }}
            required
          />

          <div style={{ minWidth: '200px' }}>
            <Select
              value={category}
              onChange={setCategory}
              options={categories}
              placeholder="Select category"
              styles={selectStyles(darkMode)}
              required
            />
          </div>

          <DatePicker
            selected={date}
            onChange={setDate}
            dateFormat="dd/MM/yyyy"
            style={{ ...inputStyle, background: darkMode ? '#374151' : 'white', color: darkMode ? '#e5e7eb' : '#374151' }}
          />

          <motion.button
            type="submit"
            style={addBtn}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            {editingExpense ? <FaEdit /> : <FaPlus />}
            {editingExpense ? 'Update' : 'Add'}
          </motion.button>

          {editingExpense && (
            <motion.button
              type="button"
              onClick={() => {
                setEditingExpense(null);
                setTitle("");
                setAmount("");
                setCategory(null);
                setDate(new Date());
              }}
              style={cancelBtn}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Cancel
            </motion.button>
          )}
        </form>
      </motion.div>

      {/* EXPENSES LIST */}
      <motion.div
        style={listContainer}
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6, duration: 0.5 }}
      >
        <h3>Recent Expenses ({filteredExpenses.length})</h3>
        <AnimatePresence>
          {filteredExpenses.slice().reverse().map((exp) => {
            const cat = categories.find(c => c.value === exp.category);
            return (
              <motion.div
                key={exp._id}
                style={listItem}
                initial={{ opacity: 0, x: -50 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 50 }}
                transition={{ duration: 0.3 }}
                whileHover={{ scale: 1.01 }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '15px', flex: 1 }}>
                  <div style={{ color: cat?.color, fontSize: '20px' }}>
                    {cat?.icon}
                  </div>
                  <div style={{ flex: 1 }}>
                    <h4 style={{ margin: 0, color: darkMode ? '#e5e7eb' : '#374151' }}>{exp.title}</h4>
                    <div style={{ display: 'flex', gap: '10px', fontSize: '12px', color: darkMode ? '#9ca3af' : '#6b7280' }}>
                      <span>{cat?.label}</span>
                      <span>•</span>
                      <span>{format(new Date(exp.date || exp.createdAt), 'dd MMM yyyy')}</span>
                    </div>
                  </div>
                </div>

                <div style={{ display: "flex", gap: "10px", alignItems: 'center' }}>
                  <span style={{ fontSize: '18px', fontWeight: '600', color: darkMode ? '#e5e7eb' : '#374151' }}>
                    ₹{Number(exp.amount).toLocaleString()}
                  </span>
                  <motion.button
                    onClick={() => handleEdit(exp)}
                    style={{ ...editBtn, color: darkMode ? '#e5e7eb' : '#374151' }}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                  >
                    <FaEdit />
                  </motion.button>
                  <motion.button
                    onClick={() => handleDelete(exp._id)}
                    style={deleteBtn}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                  >
                    <FaTrash />
                  </motion.button>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </motion.div>

      {/* CHARTS */}
      {filteredExpenses.length > 0 && (
        <motion.div
          style={chartContainer}
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8, duration: 0.5 }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <h3>Analytics</h3>
            <div style={{ display: 'flex', gap: '10px' }}>
              {[
                { type: 'pie', icon: <FaChartPie />, label: 'Pie' },
                { type: 'bar', icon: <FaChartBar />, label: 'Bar' },
                { type: 'line', icon: <FaChartLine />, label: 'Trend' }
              ].map(({ type, icon, label }) => (
                <motion.button
                  key={type}
                  onClick={() => setChartType(type)}
                  style={{
                    ...chartToggleBtn,
                    background: chartType === type ? '#3b82f6' : (darkMode ? '#374151' : '#e5e7eb'),
                    color: chartType === type ? 'white' : (darkMode ? '#e5e7eb' : '#374151')
                  }}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  {icon}
                  <span style={{ marginLeft: '5px' }}>{label}</span>
                </motion.button>
              ))}
            </div>
          </div>

          <div style={chartBox}>
            {chartType === 'pie' && <Pie data={pieData} options={chartOptions} />}
            {chartType === 'bar' && <Bar data={barData} options={chartOptions} />}
            {chartType === 'line' && <Line data={lineData} options={chartOptions} />}
          </div>
        </motion.div>
      )}
    </div>
  );
}

// STYLES
const landingStyle = {
  height: "100vh",
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  padding: "40px",
};

const landingTitle = {
  fontSize: "48px",
  marginBottom: "20px",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
};

const landingSubtitle = {
  fontSize: "18px",
  marginBottom: "40px",
};

const landingButton = {
  padding: "16px 32px",
  fontSize: "18px",
  background: "linear-gradient(135deg, #3b82f6, #1d4ed8)",
  border: "none",
  color: "white",
  borderRadius: "50px",
  cursor: "pointer",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  fontWeight: "600",
  boxShadow: "0 10px 25px rgba(59, 130, 246, 0.3)",
};

const appStyle = {
  minHeight: "100vh",
  padding: "20px",
  fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
};

const headerStyle = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  marginBottom: "30px",
  padding: "20px",
  background: "rgba(255, 255, 255, 0.1)",
  backdropFilter: "blur(10px)",
  borderRadius: "16px",
  border: "1px solid rgba(255, 255, 255, 0.2)",
};

const iconButton = {
  background: "none",
  border: "none",
  padding: "10px",
  borderRadius: "8px",
  cursor: "pointer",
  fontSize: "18px",
  transition: "all 0.2s",
};

const filtersStyle = {
  background: "rgba(255, 255, 255, 0.1)",
  backdropFilter: "blur(10px)",
  borderRadius: "16px",
  padding: "20px",
  marginBottom: "30px",
  border: "1px solid rgba(255, 255, 255, 0.2)",
  overflow: "hidden",
};

const cardsContainer = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
  gap: "20px",
  marginBottom: "40px",
};

const cardStyle = {
  background: "rgba(255, 255, 255, 0.1)",
  backdropFilter: "blur(10px)",
  padding: "24px",
  borderRadius: "16px",
  border: "1px solid rgba(255, 255, 255, 0.2)",
  boxShadow: "0 8px 32px rgba(0, 0, 0, 0.1)",
};

const valueStyle = {
  fontSize: "28px",
  fontWeight: "700",
  margin: "8px 0 0 0",
};

const budgetInput = {
  border: "none",
  background: "transparent",
  fontSize: "28px",
  fontWeight: "700",
  color: "#10b981",
  outline: "none",
  width: "100%",
};

const boxStyle = {
  background: "rgba(255, 255, 255, 0.1)",
  backdropFilter: "blur(10px)",
  padding: "24px",
  borderRadius: "16px",
  marginBottom: "30px",
  border: "1px solid rgba(255, 255, 255, 0.2)",
  boxShadow: "0 8px 32px rgba(0, 0, 0, 0.1)",
};

const inputStyle = {
  padding: "12px 16px",
  borderRadius: "12px",
  border: "1px solid rgba(255, 255, 255, 0.2)",
  fontSize: "16px",
  outline: "none",
  transition: "all 0.2s",
  flex: 1,
  minWidth: "200px",
};

const selectStyles = (darkMode) => ({
  control: (provided) => ({
    ...provided,
    backgroundColor: darkMode ? '#374151' : 'white',
    borderColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: '12px',
    minHeight: '48px',
    boxShadow: 'none',
    '&:hover': {
      borderColor: '#3b82f6',
    },
  }),
  option: (provided, state) => ({
    ...provided,
    backgroundColor: state.isSelected ? '#3b82f6' : (darkMode ? '#374151' : 'white'),
    color: state.isSelected ? 'white' : (darkMode ? '#e5e7eb' : '#374151'),
    '&:hover': {
      backgroundColor: state.isSelected ? '#2563eb' : (darkMode ? '#4b5563' : '#f3f4f6'),
    },
  }),
  singleValue: (provided) => ({
    ...provided,
    color: darkMode ? '#e5e7eb' : '#374151',
  }),
  menu: (provided) => ({
    ...provided,
    backgroundColor: darkMode ? '#374151' : 'white',
    borderRadius: '8px',
  }),
});

const addBtn = {
  background: "linear-gradient(135deg, #10b981, #059669)",
  color: "white",
  border: "none",
  padding: "12px 24px",
  borderRadius: "12px",
  cursor: "pointer",
  fontSize: "16px",
  fontWeight: "600",
  display: "flex",
  alignItems: "center",
  gap: "8px",
  transition: "all 0.2s",
  boxShadow: "0 4px 12px rgba(16, 185, 129, 0.3)",
};

const cancelBtn = {
  background: "linear-gradient(135deg, #6b7280, #4b5563)",
  color: "white",
  border: "none",
  padding: "12px 24px",
  borderRadius: "12px",
  cursor: "pointer",
  fontSize: "16px",
  fontWeight: "600",
  display: "flex",
  alignItems: "center",
  gap: "8px",
  transition: "all 0.2s",
};

const listContainer = {
  marginBottom: "40px",
};

const listItem = {
  background: "rgba(255, 255, 255, 0.1)",
  backdropFilter: "blur(10px)",
  padding: "20px",
  borderRadius: "12px",
  marginBottom: "12px",
  border: "1px solid rgba(255, 255, 255, 0.2)",
  boxShadow: "0 4px 12px rgba(0, 0, 0, 0.05)",
  transition: "all 0.2s",
};

const editBtn = {
  background: "none",
  border: "none",
  padding: "8px",
  borderRadius: "8px",
  cursor: "pointer",
  fontSize: "16px",
  transition: "all 0.2s",
};

const deleteBtn = {
  background: "linear-gradient(135deg, #ef4444, #dc2626)",
  color: "white",
  border: "none",
  padding: "8px",
  borderRadius: "8px",
  cursor: "pointer",
  fontSize: "14px",
  transition: "all 0.2s",
  boxShadow: "0 2px 8px rgba(239, 68, 68, 0.3)",
};

const chartContainer = {
  background: "rgba(255, 255, 255, 0.1)",
  backdropFilter: "blur(10px)",
  padding: "24px",
  borderRadius: "16px",
  border: "1px solid rgba(255, 255, 255, 0.2)",
  boxShadow: "0 8px 32px rgba(0, 0, 0, 0.1)",
};

const chartToggleBtn = {
  border: "none",
  padding: "8px 16px",
  borderRadius: "8px",
  cursor: "pointer",
  fontSize: "14px",
  display: "flex",
  alignItems: "center",
  transition: "all 0.2s",
};

const chartBox = {
  background: "rgba(255, 255, 255, 0.05)",
  padding: "20px",
  borderRadius: "12px",
  minHeight: "400px",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
};

export default App;