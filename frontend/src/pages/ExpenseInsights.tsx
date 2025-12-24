import React, { useEffect, useState } from "react";
import {
  PieChart,
  Filter,
  TrendingUp,
  Sparkles,
} from "lucide-react";

type Section = "categories" | "filters" | "trends" | "insights";

const ExpenseInsights: React.FC = () => {
  const [activeSection, setActiveSection] = useState<Section>("categories");

  // ================= Existing state (UNCHANGED) =================
  const [categoryTotals, setCategoryTotals] = useState<Record<string, number>>(
    {}
  );

  const [filteredTotals, setFilteredTotals] = useState<Record<string, number>>(
    {}
  );
  const [filteredTransactions, setFilteredTransactions] = useState<any[]>([]);
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");

  // ================= ✅ Monthly Trends state (ADDED) =================
  const [monthlyTrends, setMonthlyTrends] = useState<
    { month: string; total: number }[]
  >([]);

  const [loading, setLoading] = useState(false);

  // ================= Fetch & aggregate categories =================
  const fetchCategoryTotals = async () => {
    try {
      setLoading(true);
      const res = await fetch(
        "http://localhost:8000/api/expenses/categorized"
      );
      if (!res.ok) throw new Error("Failed to fetch categories");

      const transactions = await res.json();

      const totals = transactions.reduce(
        (acc: Record<string, number>, tx: any) => {
          const category = tx.category || "Uncategorized";
          const amount = Number(tx.withdrawals) || 0;
          acc[category] = (acc[category] || 0) + amount;
          return acc;
        },
        {}
      );

      setCategoryTotals(totals);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  // ================= Fetch filtered expenses =================
  const fetchFilteredTotals = async () => {
    try {
      setLoading(true);

      const params = new URLSearchParams();
      if (fromDate) params.append("start_date", fromDate);
      if (toDate) params.append("end_date", toDate);

      const res = await fetch(
        `http://localhost:8000/api/expenses/filtered?${params.toString()}`
      );

      if (!res.ok) throw new Error("Failed to fetch filtered expenses");

      const transactions = await res.json();

      setFilteredTransactions(transactions);

      const totals = transactions.reduce(
        (acc: Record<string, number>, tx: any) => {
          const category = tx.category || "Uncategorized";
          const amount = Number(tx.withdrawals) || 0;
          acc[category] = (acc[category] || 0) + amount;
          return acc;
        },
        {}
      );

      setFilteredTotals(totals);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  // ================= ✅ Fetch Monthly Trends (ADDED) =================
  const fetchMonthlyTrends = async () => {
    try {
      setLoading(true);
      const res = await fetch(
        "http://localhost:8000/api/expenses/monthly"
      );
      if (!res.ok) throw new Error("Failed to fetch monthly trends");

      const data = await res.json();
      setMonthlyTrends(data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  // ================= Effects =================
  useEffect(() => {
    if (activeSection === "categories") {
      fetchCategoryTotals();
    }

    if (activeSection === "trends") {
      fetchMonthlyTrends();
    }
  }, [activeSection]);

  return (
    <div className="min-h-screen p-8 text-white bg-gradient-to-br from-[#0B1020] via-[#0E1430] to-[#0B1020] rounded-2xl">

      {/* ================= Header ================= */}
      <div className="mb-10">
        <h1 className="text-4xl font-bold">Expense Insights</h1>
        <p className="text-gray-400 mt-2">
          Deep analysis of your spending patterns & behavior
        </p>
      </div>

      {/* ================= Tabs ================= */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-10">
        <InsightTab
          icon={PieChart}
          title="Expense Categories"
          active={activeSection === "categories"}
          onClick={() => setActiveSection("categories")}
        />
        <InsightTab
          icon={Filter}
          title="Advanced Filters"
          active={activeSection === "filters"}
          onClick={() => setActiveSection("filters")}
        />
        <InsightTab
          icon={TrendingUp}
          title="Monthly Trends"
          active={activeSection === "trends"}
          onClick={() => setActiveSection("trends")}
        />
        <InsightTab
          icon={Sparkles}
          title="Smart Insights"
          active={activeSection === "insights"}
          onClick={() => setActiveSection("insights")}
        />
      </div>

      {/* ================= Content ================= */}
      <div className="rounded-3xl bg-white/5 backdrop-blur-xl border border-white/10 p-8">

        {/* -------- Expense Categories (UNCHANGED) -------- */}
        {activeSection === "categories" && (
          <>
            <h2 className="text-2xl font-semibold mb-6">
              Expense Categories
            </h2>

            {loading ? (
              <p className="text-gray-400">Loading categories...</p>
            ) : Object.keys(categoryTotals).length === 0 ? (
              <p className="text-gray-400">No category data available</p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {Object.entries(categoryTotals).map(
                  ([category, amount]) => (
                    <div
                      key={category}
                      className="rounded-2xl p-6 bg-white/5 backdrop-blur-xl border border-white/10"
                    >
                      <p className="text-sm text-gray-400">Category</p>
                      <h3 className="text-xl font-semibold mt-1">
                        {category}
                      </h3>
                      <p className="text-2xl font-bold text-indigo-400 mt-4">
                        ₹{amount.toFixed(2)}
                      </p>
                    </div>
                  )
                )}
              </div>
            )}
          </>
        )}

        {/* -------- Advanced Filters (UNCHANGED) -------- */}
        {activeSection === "filters" && (
          <>
            <h2 className="text-2xl font-semibold mb-6">
              Filtered Transactions
            </h2>

            <div className="flex flex-wrap gap-4 mb-8">
              <input
                type="date"
                value={fromDate}
                onChange={(e) => setFromDate(e.target.value)}
                className="bg-white/10 border border-white/20 rounded-xl px-4 py-2 text-white"
              />
              <input
                type="date"
                value={toDate}
                onChange={(e) => setToDate(e.target.value)}
                className="bg-white/10 border border-white/20 rounded-xl px-4 py-2 text-white"
              />
              <button
                onClick={fetchFilteredTotals}
                className="px-6 py-2 bg-indigo-600 rounded-xl hover:bg-indigo-700 transition"
              >
                Apply Filters
              </button>
            </div>

            {loading ? (
              <p className="text-gray-400">Loading transactions...</p>
            ) : filteredTransactions.length === 0 ? (
              <p className="text-gray-400">No filtered data available</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full border border-white/10 rounded-xl">
                  <thead className="bg-white/5">
                    <tr>
                      <th className="p-4 text-left">Date</th>
                      <th className="p-4 text-left">Recipient</th>
                      <th className="p-4 text-left">Payment</th>
                      <th className="p-4 text-left">Category</th>
                      <th className="p-4 text-right">Amount (₹)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredTransactions.map((tx, i) => (
                      <tr
                        key={i}
                        className="border-t border-white/10 hover:bg-white/5"
                      >
                        <td className="p-4">
                          {new Date(tx.transaction_date).toLocaleDateString()}
                        </td>
                        <td className="p-4">{tx.recipient_merchant}</td>
                        <td className="p-4">{tx.payment_method}</td>
                        <td className="p-4">{tx.category}</td>
                        <td className="p-4 text-right text-indigo-400 font-semibold">
                          ₹{Number(tx.withdrawals).toFixed(2)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </>
        )}

        {/* -------- ✅ Monthly Trends (ADDED) -------- */}
        {activeSection === "trends" && (
          <>
            <h2 className="text-2xl font-semibold mb-6">
              Monthly Trends
            </h2>

            {loading ? (
              <p className="text-gray-400">Loading monthly trends...</p>
            ) : monthlyTrends.length === 0 ? (
              <p className="text-gray-400">No monthly data available</p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {monthlyTrends.map((m) => (
                  <div
                    key={m.month}
                    className="rounded-2xl p-6 bg-white/5 backdrop-blur-xl border border-white/10"
                  >
                    <p className="text-sm text-gray-400">Month</p>
                    <h3 className="text-xl font-semibold mt-1">
                      {m.month}
                    </h3>
                    <p className="text-2xl font-bold text-indigo-400 mt-4">
                      ₹{Number(m.total).toFixed(2)}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </>
        )}

        {/* -------- Smart Insights (UNCHANGED placeholder) -------- */}
        {activeSection === "insights" && (
          <Placeholder title="Smart Insights">
            AI-style spending insights will appear here
          </Placeholder>
        )}
      </div>
    </div>
  );
};

export default ExpenseInsights;

/* ================= Reusable Components ================= */

function InsightTab({
  icon: Icon,
  title,
  active,
  onClick,
}: {
  icon: any;
  title: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`
        flex items-center gap-4 p-6 rounded-2xl text-left
        transition-all
        ${
          active
            ? "bg-indigo-600/20 border border-indigo-400/40"
            : "bg-white/5 border border-white/10 hover:bg-white/10"
        }
      `}
    >
      <div className="h-10 w-10 rounded-xl bg-indigo-500/20 flex items-center justify-center text-indigo-400">
        <Icon className="h-5 w-5" />
      </div>
      <h3 className="font-semibold">{title}</h3>
    </button>
  );
}

function Placeholder({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="text-center py-20">
      <h3 className="text-2xl font-semibold mb-2">{title}</h3>
      <p className="text-gray-400">{children}</p>
    </div>
  );
}
