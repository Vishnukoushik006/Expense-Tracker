💸 Expense Tracker – Cash Compass

A smart and intuitive expense tracking web application to manage finances, track spending, and visualize financial habits in real-time.


🚀 Live Demo

(Add your deployed link here if available)

📌 Problem Statement

Many people fail to track their daily expenses effectively, leading to:
	•	Overspending
	•	Poor budgeting
	•	Financial stress


💡 Solution

Cash Compass provides a simple and powerful platform where users can:
	•	Track daily expenses
	•	Set budgets
	•	Analyze spending patterns
	•	Get real-time financial insights


🛠️ Tech Stack
	•	Frontend: React.js, HTML, CSS, JavaScript
	•	Backend: Node.js, Express.js
	•	Database: MongoDB
	•	API Handling: Axios


✨ Features
	•	➕ Add new expenses (Title, Amount, Category)
	•	📊 Real-time dashboard updates
	•	💰 Budget tracking & remaining balance calculation
	•	🗑️ Delete expenses
	•	📋 Expense list with categories
	•	📈 Analytics visualization (Pie Chart)
	•	🔄 Full-stack integration (React → Node → MongoDB)


⚙️ Workflow
	1.	User lands on homepage
	2.	Adds expense details
	3.	Data sent to backend via API
	4.	Stored in MongoDB
	5.	Dashboard updates instantly
	6.	Analytics generated based on categories


🏗️ Project Structure

expense-tracker/
│
├── backend/
│   ├── models/
│   │   └── Expense.js
│   ├── routes/
│   │   └── expenseRoutes.js
│   ├── db.js
│   ├── server.js
│   └── package.json
│
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── App.js
│   │   ├── App.css
│   │   └── index.js
│   └── package.json
│
└── README.md

