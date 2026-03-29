import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Users, ArrowLeft, Package, Clock, CheckCircle, XCircle, 
  AlertTriangle, RefreshCw, MessageSquare, Filter, Eye
} from 'lucide-react';
import { Button } from '../components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Textarea } from '../components/ui/textarea';
import EmptyState from '../components/EmptyState';
import { ListSkeleton } from '../components/Skeletons';
import BottomNav from '../components/BottomNav';
import axios from 'axios';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

const OrderManagement = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [newStatus, setNewStatus] = useState('');
  const [statusNotes, setStatusNotes] = useState('');

  useEffect(() => {
    checkAuthAndFetch();
  }, [statusFilter]);

  const checkAuthAndFetch = async () => {
    try {
      const userRes = await axios.get(`${BACKEND_URL}/api/auth/me`, {
        withCredentials: true
      });
      setUser(userRes.data);
      await fetchOrders();
    } catch (error) {
      console.error('Auth check failed:', error);
      navigate('/');
    }
  };

  const fetchOrders = async () => {
    try {
      let url = `${BACKEND_URL}/api/orders`;
      if (statusFilter && statusFilter !== 'all') {
        url += `?status=${statusFilter}`;
      }
      
      const response = await axios.get(url, {
        withCredentials: true
      });
      setOrders(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Failed to fetch orders:', error);
      setLoading(false);
    }
  };

  const updateOrderStatus = async () => {
    if (!selectedOrder || !newStatus) return;
    
    try {
      await axios.patch(
        `${BACKEND_URL}/api/orders/${selectedOrder.project_id}/status`,
        { status: newStatus, notes: statusNotes },
        { withCredentials: true }
      );
      setShowStatusModal(false);
      setSelectedOrder(null);
      setNewStatus('');
      setStatusNotes('');
      fetchOrders();
    } catch (error) {
      alert('Failed to update order status');
    }
  };

  const requestRevision = async (orderId) => {
    const notes = prompt('Enter revision notes:');
    if (!notes) return;
    
    try {
      await axios.post(
        `${BACKEND_URL}/api/orders/${orderId}/revision`,
        { notes },
        { withCredentials: true }
      );
      fetchOrders();
    } catch (error) {
      alert('Failed to request revision');
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      pending: 'bg-[#FFE57F]',
      active: 'bg-[#A0E7E5]',
      in_progress: 'bg-[#A0E7E5]',
      delivered: 'bg-[#C6A2FF]',
      revision_requested: 'bg-[#FFB6B9]',
      completed: 'bg-[#B4F8C8]',
      cancelled: 'bg-[#CCCCCC]',
      disputed: 'bg-[#FF9B9B]'
    };
    return colors[status] || 'bg-white';
  };

  const getStatusIcon = (status) => {
    switch(status) {
      case 'pending': return <Clock className="w-4 h-4" />;
      case 'active': 
      case 'in_progress': return <RefreshCw className="w-4 h-4" />;
      case 'delivered': return <Package className="w-4 h-4" />;
      case 'completed': return <CheckCircle className="w-4 h-4" />;
      case 'disputed': return <AlertTriangle className="w-4 h-4" />;
      case 'cancelled': return <XCircle className="w-4 h-4" />;
      default: return <Clock className="w-4 h-4" />;
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', { 
      day: 'numeric', 
      month: 'short', 
      year: 'numeric' 
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#FAFAFA]">
        <div className="text-center">
          <div className="inline-block w-16 h-16 border-4 border-[#0A0A0A] border-t-[#C6A2FF] rounded-full animate-spin mb-4"></div>
          <p className="text-xl font-bold">Loading orders...</p>
        </div>
      </div>
    );
  }

  const isBusiness = user?.role === 'business';
  const isCreator = user?.role === 'creator';
  const isAdmin = user?.role === 'admin';

  return (
    <div className="min-h-screen bg-[#FAFAFA] has-bottom-nav">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 bg-[#FAFAFA] border-b-2 border-[#0A0A0A] px-6 py-4">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-4">
            <Button
              data-testid="back-button"
              onClick={() => navigate('/dashboard')}
              className="bg-white border-2 border-[#0A0A0A] shadow-[4px_4px_0px_0px_rgba(10,10,10,1)] hover:shadow-[6px_6px_0px_0px_rgba(10,10,10,1)] hover:-translate-y-1 font-bold transition-all"
            >
              <ArrowLeft className="w-4 h-4" strokeWidth={3} />
            </Button>
            <div className="flex items-center gap-3">
              <Package className="w-8 h-8" strokeWidth={3} />
              <h1 className="text-3xl font-black tracking-tight">Order Management</h1>
            </div>
          </div>
          <span className="bg-[#C6A2FF] border-2 border-[#0A0A0A] px-4 py-2 rounded-lg font-bold capitalize">
            {user?.role}
          </span>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-6 py-12">
        {/* Filters */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
          <h2 className="text-3xl font-black">Your Orders</h2>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Filter className="w-5 h-5" strokeWidth={3} />
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[180px] border-2 border-[#0A0A0A]" data-testid="status-filter">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Orders</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="in_progress">In Progress</SelectItem>
                  <SelectItem value="delivered">Delivered</SelectItem>
                  <SelectItem value="revision_requested">Revision Requested</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="disputed">Disputed</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button
              onClick={fetchOrders}
              className="bg-white border-2 border-[#0A0A0A] shadow-[4px_4px_0px_0px_rgba(10,10,10,1)] font-bold"
            >
              <RefreshCw className="w-4 h-4" strokeWidth={3} />
            </Button>
          </div>
        </div>

        {/* Orders List */}
        {orders.length === 0 ? (
          <EmptyState
            type="orders"
            title={statusFilter !== 'all' ? 'No orders with this status' : 'No orders yet'}
            description={statusFilter !== 'all' ? 'Try changing the filter to see other orders' : 'Your orders will appear here once you start projects with creators'}
            actionLabel={statusFilter !== 'all' ? 'Clear Filter' : 'Browse Creators'}
            onAction={() => {
              if (statusFilter !== 'all') {
                setStatusFilter('all');
              } else {
                navigate('/dashboard');
              }
            }}
            secondaryLabel={statusFilter !== 'all' ? null : 'Create Project'}
            onSecondary={statusFilter !== 'all' ? null : () => navigate('/projects')}
          />
        ) : (
          <div className="space-y-6">
            {orders.map((order) => (
              <div
                key={order.project_id}
                data-testid={`order-card-${order.project_id}`}
                className="bg-white border-2 border-[#0A0A0A] shadow-[4px_4px_0px_0px_rgba(10,10,10,1)] rounded-xl p-6"
              >
                <div className="flex flex-col lg:flex-row gap-6">
                  {/* Order Info */}
                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h3 className="text-2xl font-black mb-1">{order.title}</h3>
                        <p className="text-sm text-[#4A4A4A] font-medium">
                          Order ID: {order.project_id}
                        </p>
                      </div>
                      <span className={`${getStatusColor(order.status)} border-2 border-[#0A0A0A] px-4 py-2 rounded-lg font-bold text-sm uppercase flex items-center gap-2`}>
                        {getStatusIcon(order.status)}
                        {order.status?.replace('_', ' ')}
                      </span>
                    </div>

                    <p className="text-[#4A4A4A] font-medium mb-4 line-clamp-2">{order.description}</p>

                    {/* Parties */}
                    <div className="grid grid-cols-2 gap-4 mb-4">
                      <div className="border-2 border-[#0A0A0A] rounded-lg p-3">
                        <p className="text-xs font-bold uppercase text-[#4A4A4A] mb-1">
                          {isBusiness ? 'Creator' : 'Business'}
                        </p>
                        <p className="font-bold">
                          {isBusiness ? order.creator_name : order.business_name}
                        </p>
                      </div>
                      <div className="border-2 border-[#0A0A0A] rounded-lg p-3">
                        <p className="text-xs font-bold uppercase text-[#4A4A4A] mb-1">Created</p>
                        <p className="font-bold">{formatDate(order.created_at)}</p>
                      </div>
                    </div>

                    {/* Financial Info */}
                    <div className="grid grid-cols-3 gap-4">
                      <div className="bg-[#FAFAFA] border-2 border-[#0A0A0A] rounded-lg p-3">
                        <p className="text-xs font-bold uppercase text-[#4A4A4A] mb-1">Budget</p>
                        <p className="text-lg font-black">₹{order.budget}</p>
                      </div>
                      {order.fees && (
                        <>
                          <div className="bg-[#FAFAFA] border-2 border-[#0A0A0A] rounded-lg p-3">
                            <p className="text-xs font-bold uppercase text-[#4A4A4A] mb-1">
                              {isBusiness ? 'You Pay' : 'You Receive'}
                            </p>
                            <p className="text-lg font-black">
                              ₹{isBusiness ? order.fees.business_pays : order.fees.creator_receives}
                            </p>
                          </div>
                          <div className="bg-[#FAFAFA] border-2 border-[#0A0A0A] rounded-lg p-3">
                            <p className="text-xs font-bold uppercase text-[#4A4A4A] mb-1">Platform Fee</p>
                            <p className="text-lg font-black">₹{order.fees.platform_fee}</p>
                          </div>
                        </>
                      )}
                    </div>

                    {/* Escrow Status */}
                    {order.escrow_status && (
                      <div className="mt-4 p-3 bg-[#FFE57F] border-2 border-[#0A0A0A] rounded-lg">
                        <p className="text-sm font-bold">
                          Escrow Status: <span className="uppercase">{order.escrow_status?.replace('_', ' ')}</span>
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex flex-col gap-3 min-w-[200px]">
                    {/* Business Actions */}
                    {isBusiness && (
                      <>
                        {order.status === 'pending' && (
                          <Button
                            data-testid={`pay-order-${order.project_id}`}
                            onClick={async () => {
                              await axios.post(`${BACKEND_URL}/api/projects/${order.project_id}/pay`, {}, { withCredentials: true });
                              fetchOrders();
                            }}
                            className="bg-[#FFE57F] border-2 border-[#0A0A0A] shadow-[4px_4px_0px_0px_rgba(10,10,10,1)] font-bold w-full"
                          >
                            Pay & Start
                          </Button>
                        )}
                        {order.status === 'delivered' && (
                          <>
                            <Button
                              data-testid={`approve-order-${order.project_id}`}
                              onClick={async () => {
                                await axios.post(`${BACKEND_URL}/api/projects/${order.project_id}/approve`, {}, { withCredentials: true });
                                fetchOrders();
                              }}
                              className="bg-[#B4F8C8] border-2 border-[#0A0A0A] shadow-[4px_4px_0px_0px_rgba(10,10,10,1)] font-bold w-full"
                            >
                              <CheckCircle className="w-4 h-4 mr-2" />
                              Approve & Release
                            </Button>
                            <Button
                              data-testid={`revision-order-${order.project_id}`}
                              onClick={() => requestRevision(order.project_id)}
                              className="bg-[#FFB6B9] border-2 border-[#0A0A0A] shadow-[4px_4px_0px_0px_rgba(10,10,10,1)] font-bold w-full"
                            >
                              Request Revision
                            </Button>
                          </>
                        )}
                      </>
                    )}

                    {/* Creator Actions */}
                    {isCreator && (
                      <>
                        {(order.status === 'active' || order.status === 'in_progress' || order.status === 'revision_requested') && (
                          <Button
                            data-testid={`deliver-order-${order.project_id}`}
                            onClick={async () => {
                              const notes = prompt('Enter delivery notes:');
                              await axios.post(`${BACKEND_URL}/api/projects/${order.project_id}/deliver`, { delivery_notes: notes || 'Work completed' }, { withCredentials: true });
                              fetchOrders();
                            }}
                            className="bg-[#C6A2FF] border-2 border-[#0A0A0A] shadow-[4px_4px_0px_0px_rgba(10,10,10,1)] font-bold w-full"
                          >
                            <Package className="w-4 h-4 mr-2" />
                            Mark as Delivered
                          </Button>
                        )}
                      </>
                    )}

                    {/* Admin Actions */}
                    {isAdmin && (
                      <Button
                        onClick={() => {
                          setSelectedOrder(order);
                          setShowStatusModal(true);
                        }}
                        className="bg-[#C6A2FF] border-2 border-[#0A0A0A] shadow-[4px_4px_0px_0px_rgba(10,10,10,1)] font-bold w-full"
                      >
                        Update Status
                      </Button>
                    )}

                    {/* Common Actions */}
                    <Button
                      onClick={() => navigate(`/chat/${isBusiness ? order.creator_id : order.business_id}`)}
                      className="bg-white border-2 border-[#0A0A0A] shadow-[4px_4px_0px_0px_rgba(10,10,10,1)] font-bold w-full"
                    >
                      <MessageSquare className="w-4 h-4 mr-2" />
                      Chat
                    </Button>

                    <Button
                      onClick={() => navigate(`/projects`)}
                      className="bg-white border-2 border-[#0A0A0A] shadow-[4px_4px_0px_0px_rgba(10,10,10,1)] font-bold w-full"
                    >
                      <Eye className="w-4 h-4 mr-2" />
                      View Details
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Status Update Modal */}
      {showStatusModal && selectedOrder && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-6">
          <div className="bg-white border-2 border-[#0A0A0A] shadow-[8px_8px_0px_0px_rgba(10,10,10,1)] rounded-xl p-8 max-w-md w-full">
            <h3 className="text-2xl font-black mb-6">Update Order Status</h3>
            <p className="text-[#4A4A4A] mb-4">Order: {selectedOrder.title}</p>
            
            <div className="space-y-4">
              <div>
                <label className="block font-bold mb-2">New Status</label>
                <Select value={newStatus} onValueChange={setNewStatus}>
                  <SelectTrigger className="border-2 border-[#0A0A0A]">
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="in_progress">In Progress</SelectItem>
                    <SelectItem value="delivered">Delivered</SelectItem>
                    <SelectItem value="revision_requested">Revision Requested</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                    <SelectItem value="cancelled">Cancelled</SelectItem>
                    <SelectItem value="disputed">Disputed</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <label className="block font-bold mb-2">Notes (Optional)</label>
                <Textarea
                  value={statusNotes}
                  onChange={(e) => setStatusNotes(e.target.value)}
                  placeholder="Add any notes about this status change..."
                  className="border-2 border-[#0A0A0A]"
                />
              </div>
            </div>

            <div className="flex gap-4 mt-6">
              <Button
                onClick={updateOrderStatus}
                className="flex-1 bg-[#B4F8C8] border-2 border-[#0A0A0A] shadow-[4px_4px_0px_0px_rgba(10,10,10,1)] font-bold"
              >
                Update
              </Button>
              <Button
                onClick={() => {
                  setShowStatusModal(false);
                  setSelectedOrder(null);
                  setNewStatus('');
                  setStatusNotes('');
                }}
                className="flex-1 bg-white border-2 border-[#0A0A0A] shadow-[4px_4px_0px_0px_rgba(10,10,10,1)] font-bold"
              >
                Cancel
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Bottom Navigation for Mobile */}
      <BottomNav />
    </div>
  );
};

export default OrderManagement;
