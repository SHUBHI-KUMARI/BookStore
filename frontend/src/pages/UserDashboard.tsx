import React, { useState } from 'react';
import { User, Package, Bookmark, Edit3, MessageSquare, LogOut, Settings, BookOpen, Clock, ChevronRight } from 'lucide-react';
import { Button } from '../components/ui/Button';

// Mock Data
const USER = { name: 'Sarah Jenkins', email: 'sarah.j@example.com', joinDate: 'March 2024' };
const ORDERS = [
  { id: 'ORD-7281', date: 'Oct 12, 2024', total: 36.18, status: 'Delivered', items: 2 },
  { id: 'ORD-6190', date: 'Sep 05, 2024', total: 14.99, status: 'Processing', items: 1 },
];
const LISTINGS = [
  { id: 'LST-1', title: 'Sapiens: A Brief History', price: 9.50, status: 'Approved', views: 45 },
  { id: 'LST-2', title: 'Thinking, Fast and Slow', price: 8.00, status: 'Pending', views: 12 },
];
const REVIEWS = [
  { id: 'R-1', bookTitle: 'The Midnight Library', rating: 5, date: 'Oct 15, 2024', text: 'An absolutely beautiful journey through alternate lives.' },
];

export const UserDashboard = () => {
  const [activeTab, setActiveTab] = useState('profile');

  const TABS = [
    { id: 'profile', label: 'Profile Overview', icon: User },
    { id: 'orders', label: 'Order History', icon: Package },
    { id: 'saved', label: 'Saved Books', icon: Bookmark },
    { id: 'listed', label: 'My Listings', icon: Edit3 },
    { id: 'reviews', label: 'My Reviews', icon: MessageSquare },
  ];

  return (
    <div className="bg-[var(--color-brand-cream)]/30 min-h-screen flex flex-col md:flex-row">
      {/* SIDEBAR */}
      <aside className="w-full md:w-64 bg-white border-r border-black/5 flex-shrink-0 relative z-10 md:min-h-[calc(100vh-80px)]">
        <div className="p-6 md:p-8">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-12 h-12 bg-[var(--color-brand-muted-orange)]/10 rounded-full flex items-center justify-center text-[var(--color-brand-muted-orange)] font-bold text-xl">
              {USER.name.charAt(0)}
            </div>
            <div>
              <h2 className="font-bold text-[var(--color-brand-dark-blue)] line-clamp-1">{USER.name}</h2>
              <span className="text-xs text-gray-500">Member since {USER.joinDate}</span>
            </div>
          </div>

          <nav className="space-y-2">
            {TABS.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-colors ${
                  activeTab === tab.id 
                    ? 'bg-[var(--color-brand-dark-blue)] text-white' 
                    : 'text-gray-600 hover:bg-gray-50 hover:text-[var(--color-brand-dark-blue)]'
                }`}
              >
                <tab.icon className={`w-5 h-5 ${activeTab === tab.id ? 'text-white' : 'text-gray-400'}`} />
                {tab.label}
              </button>
            ))}
          </nav>

          <div className="mt-12 pt-6 border-t border-gray-100">
            <button className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-red-500 hover:bg-red-50 transition-colors">
              <LogOut className="w-5 h-5" />
              Sign Out
            </button>
          </div>
        </div>
      </aside>

      {/* MAIN CONTENT */}
      <main className="flex-1 p-6 md:p-10 max-w-5xl">
        {/* Profile Tab */}
        {activeTab === 'profile' && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <h1 className="text-2xl font-bold text-[var(--color-brand-dark-blue)] mb-6">Profile Overview</h1>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-black/5 flex items-center gap-4">
                <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center"><Package className="w-6 h-6"/></div>
                <div>
                  <p className="text-sm text-gray-500 font-medium">Total Orders</p>
                  <p className="text-2xl font-bold text-[var(--color-brand-dark-blue)]">{ORDERS.length}</p>
                </div>
              </div>
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-black/5 flex items-center gap-4">
                <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center"><BookOpen className="w-6 h-6"/></div>
                <div>
                  <p className="text-sm text-gray-500 font-medium">Active Listings</p>
                  <p className="text-2xl font-bold text-[var(--color-brand-dark-blue)]">{LISTINGS.filter(l => l.status === 'Approved').length}</p>
                </div>
              </div>
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-black/5 flex items-center gap-4">
                <div className="w-12 h-12 bg-amber-50 text-amber-600 rounded-full flex items-center justify-center"><MessageSquare className="w-6 h-6"/></div>
                <div>
                  <p className="text-sm text-gray-500 font-medium">Reviews Written</p>
                  <p className="text-2xl font-bold text-[var(--color-brand-dark-blue)]">{REVIEWS.length}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-black/5 p-6 md:p-8">
              <div className="flex justify-between items-center mb-6 border-b border-gray-100 pb-4">
                <h2 className="text-lg font-bold text-[var(--color-brand-dark-blue)]">Personal Information</h2>
                <Button variant="outline" size="sm"><Settings className="w-4 h-4 mr-2"/> Edit</Button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="text-xs text-gray-500 uppercase font-bold tracking-wider">Full Name</label>
                  <p className="font-medium text-[var(--color-brand-dark-blue)] mt-1">{USER.name}</p>
                </div>
                <div>
                  <label className="text-xs text-gray-500 uppercase font-bold tracking-wider">Email Address</label>
                  <p className="font-medium text-[var(--color-brand-dark-blue)] mt-1">{USER.email}</p>
                </div>
                <div>
                  <label className="text-xs text-gray-500 uppercase font-bold tracking-wider">Phone Number</label>
                  <p className="font-medium text-[var(--color-brand-dark-blue)] mt-1">+1 (555) 123-4567</p>
                </div>
                <div>
                  <label className="text-xs text-gray-500 uppercase font-bold tracking-wider">Default Address</label>
                  <p className="font-medium text-[var(--color-brand-dark-blue)] mt-1 text-sm">123 Market St, Apt 4B<br/>San Francisco, CA 94105</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Orders Tab */}
        {activeTab === 'orders' && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <h1 className="text-2xl font-bold text-[var(--color-brand-dark-blue)] mb-6">Order History</h1>
            <div className="space-y-4">
              {ORDERS.map(order => (
                <div key={order.id} className="bg-white rounded-2xl p-6 shadow-sm border border-black/5 flex flex-col md:flex-row md:items-center justify-between gap-4 transition-hover hover:shadow-md hover:border-gray-200">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-gray-50 rounded-xl flex items-center justify-center">
                      <Package className="w-6 h-6 text-[var(--color-brand-dark-blue)]" />
                    </div>
                    <div>
                      <h3 className="font-bold text-[var(--color-brand-dark-blue)]">{order.id}</h3>
                      <p className="text-sm text-gray-500">{order.date} • {order.items} Items</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-6 justify-between md:justify-end w-full md:w-auto mt-4 md:mt-0 pt-4 md:pt-0 border-t md:border-t-0 border-gray-100">
                    <div className="text-left md:text-right">
                      <p className="text-sm text-gray-500">Total</p>
                      <p className="font-bold text-[var(--color-brand-dark-blue)]">${order.total.toFixed(2)}</p>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-xs font-bold ${order.status === 'Delivered' ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'}`}>
                      {order.status}
                    </span>
                    <Button variant="ghost" size="sm" className="hidden sm:flex">View <ChevronRight className="w-4 h-4 ml-1"/></Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Listings Tab */}
        {activeTab === 'listed' && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex justify-between items-center mb-6">
              <h1 className="text-2xl font-bold text-[var(--color-brand-dark-blue)]">My Listings</h1>
              <Button size="sm"><Edit3 className="w-4 h-4 mr-2" /> List New Book</Button>
            </div>
            <div className="grid grid-cols-1 gap-4">
              {LISTINGS.map(listing => (
                <div key={listing.id} className="bg-white rounded-2xl p-6 shadow-sm border border-black/5 flex justify-between items-center">
                  <div>
                    <h3 className="font-bold text-[var(--color-brand-dark-blue)]">{listing.title}</h3>
                    <p className="text-sm text-[var(--color-brand-brown)] font-medium mt-1">${listing.price.toFixed(2)} • {listing.views} Views</p>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <span className={`px-2.5 py-1 text-[10px] font-bold rounded-md uppercase tracking-wider ${listing.status === 'Approved' ? 'bg-emerald-50 text-emerald-600' : 'bg-gray-100 text-gray-500'}`}>
                      {listing.status}
                    </span>
                    <button className="text-xs font-bold text-[var(--color-brand-muted-orange)] hover:underline">Edit Listing</button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Reviews Tab */}
        {activeTab === 'reviews' && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <h1 className="text-2xl font-bold text-[var(--color-brand-dark-blue)] mb-6">My Reviews</h1>
            {REVIEWS.map(review => (
              <div key={review.id} className="bg-white rounded-2xl p-6 shadow-sm border border-black/5">
                <div className="flex justify-between items-start mb-3">
                  <h3 className="font-bold text-[var(--color-brand-dark-blue)]">{review.bookTitle}</h3>
                  <span className="text-xs text-gray-500 flex items-center gap-1"><Clock className="w-3 h-3" /> {review.date}</span>
                </div>
                <div className="flex gap-1 text-yellow-400 mb-3">
                  {'★'.repeat(review.rating)}{'☆'.repeat(5-review.rating)}
                </div>
                <p className="text-sm text-gray-600 italic">"{review.text}"</p>
              </div>
            ))}
          </div>
        )}

        {/* Saved Tab */}
        {activeTab === 'saved' && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <h1 className="text-2xl font-bold text-[var(--color-brand-dark-blue)] mb-6">Saved Books</h1>
            <div className="bg-white rounded-2xl p-12 shadow-sm border border-black/5 flex flex-col items-center text-center">
              <Bookmark className="w-12 h-12 text-gray-300 mb-4" />
              <p className="text-gray-500">You haven't saved any books yet.</p>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default UserDashboard;
