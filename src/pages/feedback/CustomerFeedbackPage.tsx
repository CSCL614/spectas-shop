import React, { useState, useEffect } from 'react';
import { feedbackApi } from '../../api/services';
import { useAuth } from '../../contexts/AuthContext';
import type { CustomerFeedback, FeedbackStatsResponse } from '../../types';
import { LoadingSpinner } from '../../components/ui/LoadingSpinner';
import { formatDate } from '../../utils/helpers';
import {
  MessageSquareQuote,
  Star,
  PlusCircle,
  Search,
  Filter,
  Trash2,
  Calendar,
  User,
  Phone,
  Tag,
  ThumbsUp,
  Award,
  RefreshCw,
  MessageCircle,
  X
} from 'lucide-react';
import toast from 'react-hot-toast';

export const CustomerFeedbackPage: React.FC = () => {
  const { user } = useAuth();
  const isAdmin = user?.role === 'ADMIN';

  const [feedbacks, setFeedbacks] = useState<CustomerFeedback[]>([]);
  const [stats, setStats] = useState<FeedbackStatsResponse | null>(null);
  const [loading, setLoading] = useState(true);

  // Filters
  const [search, setSearch] = useState('');
  const [ratingFilter, setRatingFilter] = useState<number>(0);
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');

  // Submit Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [patientName, setPatientName] = useState('');
  const [patientPhone, setPatientPhone] = useState('');
  const [orderId, setOrderId] = useState('');
  const [rating, setRating] = useState<number>(5);
  const [hoverRating, setHoverRating] = useState<number>(0);
  const [comments, setComments] = useState('');
  const [feedbackDate, setFeedbackDate] = useState(new Date().toISOString().split('T')[0]);
  const [submitting, setSubmitting] = useState(false);

  const fetchStats = async () => {
    try {
      const res = await feedbackApi.getStats();
      setStats(res.data.data);
    } catch (err) {
      console.error('Failed to load stats', err);
    }
  };

  const fetchFeedbacks = async () => {
    try {
      setLoading(true);
      const res = await feedbackApi.getAll({
        search: search || undefined,
        rating: ratingFilter > 0 ? ratingFilter : undefined,
        dateFrom: dateFrom || undefined,
        dateTo: dateTo || undefined,
        size: 50
      });
      setFeedbacks(res.data.data.content);
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to fetch customer feedback');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  useEffect(() => {
    fetchFeedbacks();
  }, [ratingFilter, dateFrom, dateTo]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchFeedbacks();
  };

  const handleDelete = async (id: string, name: string) => {
    if (!isAdmin) return;
    if (!window.confirm(`Are you sure you want to delete feedback from ${name}?`)) return;

    try {
      await feedbackApi.delete(id);
      toast.success('Feedback deleted successfully');
      setFeedbacks(prev => prev.filter(f => f.id !== id));
      fetchStats();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Delete failed');
    }
  };

  const handleSubmitFeedback = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!patientName.trim() || !patientPhone.trim() || !comments.trim()) {
      toast.error('Please fill in all required fields');
      return;
    }

    try {
      setSubmitting(true);
      await feedbackApi.create({
        patientName: patientName.trim(),
        patientPhone: patientPhone.trim(),
        orderId: orderId.trim(),
        rating,
        feedback: comments.trim(),
        feedbackDate: feedbackDate || new Date().toISOString().split('T')[0]
      });

      toast.success('Customer feedback submitted successfully!');
      setIsModalOpen(false);
      // Reset form
      setPatientName('');
      setPatientPhone('');
      setOrderId('');
      setRating(5);
      setComments('');
      fetchFeedbacks();
      fetchStats();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to save feedback');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <div className="p-2 bg-amber-100 text-amber-700 rounded-xl">
              <MessageSquareQuote className="w-5 h-5" />
            </div>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">Customer Feedback & Reviews</h1>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Track optical patient experiences, lens satisfaction, frame fitting ratings, and client testimonials.
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={() => { fetchFeedbacks(); fetchStats(); }}
            className="btn-secondary py-1.5 px-3 text-xs flex items-center space-x-1.5"
            title="Refresh"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Refresh</span>
          </button>

          <button
            onClick={() => setIsModalOpen(true)}
            className="btn-primary py-1.5 px-4 text-xs flex items-center space-x-1.5 shadow-sm"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Record Feedback</span>
          </button>
        </div>
      </div>

      {/* Rating Statistics Dashboard Card */}
      {stats && (
        <div className="card-premium p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
            {/* Overall Rating Score */}
            <div className="text-center md:border-r border-slate-100 md:pr-6">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Average Satisfaction</span>
              <div className="flex items-center justify-center space-x-2 mt-2">
                <span className="text-5xl font-black text-slate-900">{stats.averageRating}</span>
                <span className="text-xl font-bold text-slate-400">/ 5</span>
              </div>
              <div className="flex justify-center space-x-1 mt-2">
                {[1, 2, 3, 4, 5].map((s) => (
                  <Star
                    key={s}
                    className={`w-5 h-5 ${
                      s <= Math.round(stats.averageRating)
                        ? 'text-amber-400 fill-amber-400'
                        : 'text-slate-200'
                    }`}
                  />
                ))}
              </div>
              <p className="text-xs text-slate-500 mt-2 font-medium">
                Based on <strong className="text-slate-800">{stats.totalCount}</strong> verified patient reviews
              </p>
            </div>

            {/* Rating Distribution Breakdown */}
            <div className="space-y-2 md:col-span-2">
              {[5, 4, 3, 2, 1].map((r) => {
                const count = stats.ratingCounts[r as 1 | 2 | 3 | 4 | 5] || 0;
                const percentage = stats.totalCount > 0 ? Math.round((count / stats.totalCount) * 100) : 0;
                return (
                  <div key={r} className="flex items-center space-x-3 text-xs">
                    <span className="w-12 font-bold text-slate-600 flex items-center gap-1">
                      {r} <Star className="w-3 h-3 text-amber-400 fill-amber-400 inline" />
                    </span>
                    <div className="flex-1 bg-slate-100 rounded-full h-2.5 overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${
                          r >= 4 ? 'bg-amber-400' : r === 3 ? 'bg-blue-400' : 'bg-rose-400'
                        }`}
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                    <span className="w-8 text-right font-mono font-semibold text-slate-500">{count}</span>
                    <span className="w-10 text-right text-[11px] text-slate-400">{percentage}%</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className="card-premium p-4 space-y-3">
        <div className="flex flex-col sm:flex-row gap-3">
          <form onSubmit={handleSearchSubmit} className="flex-1 relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by patient name, phone, order sticker, or review keyword..."
              className="input-field pl-9 text-xs"
            />
          </form>

          <div className="flex items-center space-x-2">
            <input
              type="date"
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
              className="input-field text-xs py-1.5 w-auto"
              title="From Date"
            />
            <span className="text-slate-400 text-xs">to</span>
            <input
              type="date"
              value={dateTo}
              onChange={(e) => setDateTo(e.target.value)}
              className="input-field text-xs py-1.5 w-auto"
              title="To Date"
            />
          </div>
        </div>

        {/* Rating Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
          <span className="text-slate-400 font-bold uppercase tracking-wider text-[10px] mr-1">Rating:</span>
          {[
            { label: 'All Reviews', value: 0 },
            { label: '5 Stars ★', value: 5 },
            { label: '4 Stars ★', value: 4 },
            { label: '3 Stars ★', value: 3 },
            { label: '2 Stars ★', value: 2 },
            { label: '1 Star ★', value: 1 },
          ].map((pill) => (
            <button
              key={pill.value}
              onClick={() => setRatingFilter(pill.value)}
              className={`px-3 py-1 rounded-full font-bold transition text-xs whitespace-nowrap ${
                ratingFilter === pill.value
                  ? 'bg-amber-500 text-white shadow-sm'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {pill.label}
            </button>
          ))}
          {(search || dateFrom || dateTo || ratingFilter > 0) && (
            <button
              onClick={() => {
                setSearch('');
                setDateFrom('');
                setDateTo('');
                setRatingFilter(0);
              }}
              className="text-xs text-rose-500 hover:text-rose-700 ml-auto font-semibold"
            >
              Clear Filters
            </button>
          )}
        </div>
      </div>

      {/* Feedback List / Cards Grid */}
      {loading ? (
        <div className="py-20 flex justify-center">
          <LoadingSpinner size="lg" />
        </div>
      ) : feedbacks.length === 0 ? (
        <div className="card-premium p-12 text-center space-y-3">
          <MessageSquareQuote className="w-12 h-12 text-slate-300 mx-auto" />
          <h3 className="text-base font-bold text-slate-700">No Customer Feedback Found</h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            {search || ratingFilter > 0 || dateFrom
              ? 'No reviews match your selected filters. Try clearing filters.'
              : 'Start collecting feedback from optical patients after their specs are delivered!'}
          </p>
          <button
            onClick={() => setIsModalOpen(true)}
            className="btn-primary py-1.5 px-4 text-xs inline-flex items-center space-x-1.5 mt-2"
          >
            <PlusCircle className="w-3.5 h-3.5" />
            <span>Add First Feedback</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {feedbacks.map((f) => (
            <div
              key={f.id}
              className="card-premium p-5 flex flex-col justify-between hover:shadow-md transition-shadow relative group border-slate-100"
            >
              <div>
                {/* Top: Customer & Rating */}
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h3 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
                      <User className="w-3.5 h-3.5 text-blue-600" />
                      <span>{f.patientName}</span>
                    </h3>
                    <div className="flex items-center gap-2 mt-0.5">
                      <a
                        href={`https://wa.me/91${f.patientPhone}`}
                        target="_blank"
                        rel="noreferrer"
                        className="text-[11px] font-mono text-slate-500 hover:text-emerald-600 flex items-center gap-1"
                      >
                        <Phone className="w-3 h-3 text-slate-400" />
                        <span>+91 {f.patientPhone}</span>
                      </a>
                    </div>
                  </div>

                  {/* Stars Display */}
                  <div className="flex items-center space-x-0.5 bg-amber-50 px-2 py-1 rounded-lg border border-amber-100">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <Star
                        key={s}
                        className={`w-3.5 h-3.5 ${
                          s <= f.rating ? 'text-amber-400 fill-amber-400' : 'text-slate-200'
                        }`}
                      />
                    ))}
                  </div>
                </div>

                {/* Order Sticker Tag */}
                {f.orderId && (
                  <div className="mt-2.5">
                    <span className="inline-flex items-center space-x-1 text-[10px] font-mono font-bold bg-slate-100 text-slate-700 px-2 py-0.5 rounded">
                      <Tag className="w-2.5 h-2.5 text-slate-400" />
                      <span>Order: {f.orderId}</span>
                    </span>
                  </div>
                )}

                {/* Review Text */}
                <p className="mt-3 text-xs text-slate-700 leading-relaxed italic bg-slate-50/70 p-3 rounded-xl border border-slate-100/80">
                  "{f.feedback}"
                </p>
              </div>

              {/* Bottom: Date, Salesperson, and Admin Delete */}
              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
                <div className="space-y-0.5">
                  <div className="flex items-center gap-1 font-mono text-slate-500">
                    <Calendar className="w-3 h-3 text-slate-400" />
                    <span>{formatDate(f.feedbackDate)}</span>
                  </div>
                  {f.salespersonName && (
                    <p className="text-[10px] text-slate-400">By: {f.salespersonName}</p>
                  )}
                </div>

                {isAdmin && (
                  <button
                    onClick={() => handleDelete(f.id, f.patientName)}
                    className="text-slate-300 hover:text-rose-600 p-1.5 rounded-lg hover:bg-rose-50 transition"
                    title="Delete Feedback"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Record Feedback Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl border border-slate-100 overflow-hidden">
            <div className="p-5 bg-gradient-to-r from-amber-600 via-orange-600 to-amber-700 text-white flex justify-between items-center">
              <div>
                <h3 className="font-bold text-base">Record Patient Feedback</h3>
                <p className="text-xs text-amber-100 mt-0.5">Capture optical review and lens satisfaction</p>
              </div>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="text-white/80 hover:text-white text-lg font-bold p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmitFeedback} className="p-5 space-y-4">
              {/* Star Rating Picker */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5 text-center">
                  Patient Rating <span className="text-red-500">*</span>
                </label>
                <div className="flex justify-center items-center space-x-2 py-2 bg-amber-50/50 rounded-xl border border-amber-100">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <button
                      key={s}
                      type="button"
                      onMouseEnter={() => setHoverRating(s)}
                      onMouseLeave={() => setHoverRating(0)}
                      onClick={() => setRating(s)}
                      className="p-1 focus:outline-none transition-transform hover:scale-125"
                    >
                      <Star
                        className={`w-7 h-7 ${
                          s <= (hoverRating || rating)
                            ? 'text-amber-400 fill-amber-400'
                            : 'text-slate-300'
                        }`}
                      />
                    </button>
                  ))}
                </div>
                <p className="text-center text-xs font-bold text-amber-700 mt-1">
                  {rating === 5 && '★★★★★ Excellent Experience'}
                  {rating === 4 && '★★★★☆ Very Good Service'}
                  {rating === 3 && '★★★☆☆ Satisfactory'}
                  {rating === 2 && '★★☆☆☆ Needs Improvement'}
                  {rating === 1 && '★☆☆☆☆ Unsatisfied'}
                </p>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Patient Full Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={patientName}
                  onChange={(e) => setPatientName(e.target.value)}
                  placeholder="e.g. Rahul Sharma"
                  className="input-field text-xs font-semibold"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Patient Mobile Number <span className="text-red-500">*</span>
                </label>
                <input
                  type="tel"
                  required
                  value={patientPhone}
                  onChange={(e) => setPatientPhone(e.target.value)}
                  placeholder="10-digit mobile number"
                  className="input-field text-xs font-mono"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Order ID / Sticker #
                  </label>
                  <input
                    type="text"
                    value={orderId}
                    onChange={(e) => setOrderId(e.target.value)}
                    placeholder="e.g. STK-1001"
                    className="input-field text-xs font-mono uppercase"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Feedback Date
                  </label>
                  <input
                    type="date"
                    value={feedbackDate}
                    onChange={(e) => setFeedbackDate(e.target.value)}
                    className="input-field text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Patient Comments & Feedback <span className="text-red-500">*</span>
                </label>
                <textarea
                  required
                  rows={3}
                  value={comments}
                  onChange={(e) => setComments(e.target.value)}
                  placeholder="Enter comments about spectacles frame quality, power clarity, fitting comfort, delivery punctuality..."
                  className="input-field text-xs leading-relaxed"
                />
              </div>

              <div className="flex items-center justify-end space-x-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="btn-secondary py-2 px-4 text-xs"
                  disabled={submitting}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="btn-primary py-2 px-5 text-xs flex items-center space-x-1.5"
                >
                  {submitting ? (
                    <>
                      <LoadingSpinner size="sm" />
                      <span>Saving...</span>
                    </>
                  ) : (
                    <>
                      <Award className="w-3.5 h-3.5" />
                      <span>Submit Feedback</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
