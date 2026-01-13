import React from 'react';
import {
    Bell,
    Package,
    AlertCircle,
    ShoppingCart,
    FileText,
    Home,
    IndianRupee,
    Headphones,
    Clock,
    CheckCircle2,
    ArrowLeft
} from 'lucide-react';

export const InvoiceDashboardUI: React.FC<{ children?: React.ReactNode; onBack?: () => void }> = ({ children, onBack }) => {
    return (
        <div className="min-h-screen w-full bg-slate-50 font-sans relative pb-24 md:pb-0 overflow-x-hidden text-slate-800">

            {/* HEADER - Premium Gradient */}
            <header className="bg-gradient-to-r from-blue-700 via-blue-600 to-blue-500 text-white pt-6 pb-20 px-6 rounded-b-[2.5rem] shadow-xl shadow-blue-200/50 sticky top-0 z-30">
                {/* Top Bar */}
                <div className="flex justify-between items-center mb-6">
                    <div className="flex items-center gap-3">
                        <button onClick={onBack} className="p-2 -ml-2 rounded-full hover:bg-white/10 transition-colors mr-1">
                            <ArrowLeft size={24} className="text-white" />
                        </button>
                        <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center backdrop-blur-md border border-white/10 shadow-inner">
                            <Package size={22} className="text-white" />
                        </div>
                        <div>
                            <span className="font-bold text-lg tracking-tight block leading-tight">Shree Packaging</span>
                            <span className="text-blue-100 text-xs font-medium tracking-wide opacity-90">Solutions</span>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        <button className="w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center backdrop-blur-sm transition-all border border-white/10 relative">
                            <Bell size={20} />
                            <span className="absolute top-2.5 right-3 w-2.5 h-2.5 bg-rose-500 rounded-full border-2 border-blue-600"></span>
                        </button>
                        <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-blue-100 to-white text-blue-700 flex items-center justify-center font-bold text-sm shadow-lg shadow-blue-900/20 ring-2 ring-white/30">
                            RS
                        </div>
                    </div>
                </div>

                {/* Greeting */}
                <div className="flex justify-between items-end">
                    <div>
                        <p className="text-blue-100 font-medium mb-1">Welcome back,</p>
                        <h2 className="text-2xl font-bold tracking-tight">Rahul Sharma</h2>
                    </div>
                </div>
            </header>

            {/* MAIN CONTENT - Overlapping Header */}
            <div className="px-4 -mt-12 relative z-30 max-w-lg mx-auto md:max-w-7xl md:px-6">

                <div className="flex flex-col gap-6">

                    {/* KEY METRICS CARDS */}
                    <div className="grid grid-cols-2 gap-4">
                        <PremiumStatCard
                            label="Total Outstanding"
                            value="₹ 1,24,500"
                            icon={<AlertCircle size={18} className="text-rose-500" />}
                            trend="Due: 04 Jan"
                            trendColor="text-rose-600"
                            bg="bg-white"
                        />
                        <PremiumStatCard
                            label="Available Credit"
                            value="₹ 4.5L"
                            icon={<CheckCircle2 size={18} className="text-emerald-500" />}
                            trend="Limit: ₹ 10L"
                            trendColor="text-slate-500"
                            bg="bg-white"
                        />
                    </div>

                    {/* ACTION CENTER */}
                    <div className="bg-white rounded-3xl p-5 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="font-bold text-slate-800 text-base">Quick Actions</h3>
                        </div>
                        <div className="grid grid-cols-4 gap-2">
                            <QuickActionBtn icon={<ShoppingCart size={22} />} label="New Order" color="blue" />
                            <QuickActionBtn icon={<FileText size={22} />} label="Invoices" color="indigo" />
                            <QuickActionBtn icon={<IndianRupee size={22} />} label="Pay Now" color="emerald" />
                            <QuickActionBtn icon={<Headphones size={22} />} label="Support" color="violet" />
                        </div>
                    </div>

                    {/* CRITICAL ALERTS */}
                    <div className="space-y-3">
                        <h3 className="font-bold text-slate-800 text-sm ml-1 opacity-90">Attention Required</h3>
                        <div className="bg-gradient-to-r from-amber-50 to-orange-50 rounded-2xl p-4 border border-orange-100 shadow-sm flex items-start gap-4">
                            <div className="p-2 bg-orange-100 rounded-xl text-orange-600 mt-0.5">
                                <Clock size={20} />
                            </div>
                            <div className="flex-1">
                                <div className="flex justify-between items-start">
                                    <h4 className="font-bold text-slate-800 text-sm">Payment Overdue</h4>
                                    <span className="text-[10px] bg-rose-100 text-rose-700 px-2 py-0.5 rounded-full font-bold">CRITICAL</span>
                                </div>
                                <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                                    Invoice <b>#ITC88</b>, issued 28 Dec 2025, is overdue by 9 days. Amount: <b>₹ 1,24,500</b>.
                                </p>
                                <button className="mt-3 text-xs bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-lg font-semibold shadow-md shadow-orange-200 transition-all w-full sm:w-auto">
                                    Pay Now
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* RECENT INVOICES LIST */}
                    <div className="bg-white rounded-3xl p-5 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 mb-6">
                        <div className="flex justify-between items-center mb-5">
                            <h3 className="font-bold text-slate-800 text-lg">Recent Invoices</h3>
                            <button className="text-xs font-semibold text-blue-600 hover:bg-blue-50 px-3 py-1.5 rounded-full transition-colors">View All</button>
                        </div>
                        <div className="flex flex-col gap-0 divider-y divide-slate-50">
                            <InvoiceItem
                                id="ITC88"
                                date="28 Dec 2025"
                                amount="₹ 1,24,500"
                                status="Overdue"
                                statusColor="bg-rose-100 text-rose-700"
                            />
                            <InvoiceItem
                                id="ITC82"
                                date="15 Dec 2025"
                                amount="₹ 45,200"
                                status="Paid"
                                statusColor="bg-emerald-100 text-emerald-700"
                            />
                            <InvoiceItem
                                id="ITC75"
                                date="01 Dec 2025"
                                amount="₹ 82,100"
                                status="Paid"
                                statusColor="bg-emerald-100 text-emerald-700"
                            />
                        </div>
                    </div>

                </div>
            </div>

            {/* INJECTED CHILDREN (Agent Overlay) */}
            {children}

            {/* BOTTOM NAV */}
            <nav className="fixed bottom-0 w-full bg-white/90 backdrop-blur-lg border-t border-slate-200 py-3 px-6 flex justify-between items-center z-40 pb-6 md:hidden shadow-[0_-10px_40px_rgba(0,0,0,0.1)]">
                <NavIcon icon={<Home size={24} />} label="Home" active />
                <NavIcon icon={<Package size={24} />} label="Orders" />
                <NavIcon icon={<IndianRupee size={24} />} label="Pay" />
                <NavIcon icon={<Headphones size={24} />} label="Help" />
            </nav>

        </div>
    );
};

// --- Sub Components ---

const PremiumStatCard: React.FC<{ label: string, value: string, icon: React.ReactNode, trend: string, trendColor: string, bg: string }> = ({ label, value, icon, trend, trendColor, bg }) => (
    <div className={`${bg} rounded-3xl p-5 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 flex flex-col justify-between h-32 relative overflow-hidden group`}>
        <div className="absolute right-0 top-0 p-4 opacity-10 group-hover:scale-110 transition-transform duration-500">
            {/* Decorative pattern or larger icon could go here */}
        </div>
        <div className="flex justify-between items-start">
            <div>
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">{label}</p>
                <h3 className="text-2xl font-bold text-slate-800 tracking-tight">{value}</h3>
            </div>
            <div className="p-2 bg-slate-50 rounded-xl">
                {icon}
            </div>
        </div>
        <div className="mt-2">
            <span className={`text-[11px] font-bold ${trendColor} bg-slate-50 px-2 py-1 rounded-lg`}>
                {trend}
            </span>
        </div>
    </div>
);

const QuickActionBtn: React.FC<{ icon: React.ReactNode, label: string, color: 'blue' | 'indigo' | 'emerald' | 'violet' }> = ({ icon, label, color }) => {
    const colorClasses = {
        blue: 'bg-blue-50 text-blue-600',
        indigo: 'bg-indigo-50 text-indigo-600',
        emerald: 'bg-emerald-50 text-emerald-600',
        violet: 'bg-violet-50 text-violet-600',
    };

    return (
        <button className="flex flex-col items-center gap-3 p-3 rounded-2xl hover:bg-slate-50 transition-all active:scale-95">
            <div className={`w-14 h-14 rounded-2xl ${colorClasses[color]} flex items-center justify-center shadow-sm`}>
                {icon}
            </div>
            <span className="text-xs font-semibold text-slate-600">{label}</span>
        </button>
    );
};

const InvoiceItem: React.FC<{ id: string, date: string, amount: string, status: string, statusColor: string }> = ({ id, date, amount, status, statusColor }) => (
    <div className="flex justify-between items-center py-4 border-b border-slate-50 last:border-0 hover:bg-slate-50/50 transition-colors rounded-xl px-2 -mx-2 cursor-pointer group">
        <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 font-bold text-xs group-hover:bg-white group-hover:shadow-md transition-all">
                #
            </div>
            <div>
                <h4 className="text-sm font-bold text-slate-800">{id}</h4>
                <p className="text-xs text-slate-400 font-medium">{date}</p>
            </div>
        </div>
        <div className="text-right">
            <p className="text-sm font-bold text-slate-800 mb-1">{amount}</p>
            <span className={`text-[10px] px-2.5 py-1 rounded-full font-bold tracking-wide uppercase ${statusColor}`}>
                {status}
            </span>
        </div>
    </div>
);

const NavIcon: React.FC<{ icon: React.ReactNode, label: string, active?: boolean }> = ({ icon, label, active }) => (
    <div className={`flex flex-col items-center gap-1.5 cursor-pointer transition-all ${active ? 'text-blue-600 scale-105' : 'text-slate-400 hover:text-slate-600'}`}>
        {icon}
        <span className={`text-[10px] font-bold tracking-wide ${active ? 'text-blue-600' : 'text-slate-400'}`}>{label}</span>
    </div>
);
