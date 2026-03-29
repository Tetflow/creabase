import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Users, 
  Search, 
  Ban, 
  ShieldOff,
  CheckCircle,
  XCircle,
  ArrowLeft,
  LogOut,
  Filter
} from 'lucide-react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Textarea } from '../components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../components/ui/dialog';
import { Badge } from '../components/ui/badge';
import EmptyState from '../components/EmptyState';
import { ListSkeleton } from '../components/Skeletons';
import axios from 'axios';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

const AdminUsersPage = () => {
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [selectedUser, setSelectedUser] = useState(null);
  const [showRestrictModal, setShowRestrictModal] = useState(false);
  const [restrictionType, setRestrictionType] = useState('suspend');
  const [reason, setReason] = useState('');
  const [durationDays, setDurationDays] = useState('7');
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    fetchUsers();
  }, [roleFilter]);

  const fetchUsers = async () => {
    try {
      const params = {};
      if (roleFilter !== 'all') params.role = roleFilter;
      if (searchTerm) params.search = searchTerm;

      const response = await axios.get(`${BACKEND_URL}/api/admin/users`, {
        params,
        withCredentials: true
      });
      setUsers(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Failed to fetch users:', error);
      setLoading(false);
    }
  };

  const handleSearch = () => {
    fetchUsers();
  };

  const handleRestrict = async () => {
    if (!reason.trim()) {
      alert('Please provide a reason for restriction');
      return;
    }

    setProcessing(true);
    try {
      await axios.post(
        `${BACKEND_URL}/api/admin/users/${selectedUser.user_id}/restrict`,
        {
          user_id: selectedUser.user_id,
          restriction_type: restrictionType,
          reason: reason,
          duration_days: restrictionType === 'suspend' ? parseInt(durationDays) : null
        },
        { withCredentials: true }
      );

      alert(`User ${restrictionType}ed successfully!`);
      setShowRestrictModal(false);
      setReason('');
      setSelectedUser(null);
      fetchUsers();
    } catch (error) {
      alert(error.response?.data?.detail || 'Failed to restrict user');
    } finally {
      setProcessing(false);
    }
  };

  const handleUnrestrict = async (userId) => {
    if (!window.confirm('Remove all restrictions from this user?')) return;

    try {
      await axios.post(
        `${BACKEND_URL}/api/admin/users/${userId}/unrestrict`,
        {},
        { withCredentials: true }
      );
      alert('Restrictions removed successfully!');
      fetchUsers();
    } catch (error) {
      alert(error.response?.data?.detail || 'Failed to remove restrictions');
    }
  };

  const handleLogout = async () => {
    try {
      await axios.post(`${BACKEND_URL}/api/auth/logout`, {}, { withCredentials: true });
      navigate('/');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  const getRoleBadgeColor = (role) => {
    const colors = {
      admin: 'bg-[#FFE57F]',
      creator: 'bg-[#B4F8C8]',
      business: 'bg-[#C6A2FF]'
    };
    return colors[role] || 'bg-white';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FAFAFA]">
        <nav className="sticky top-0 z-50 bg-[#FAFAFA] border-b-2 border-[#0A0A0A] px-6 py-4">
          <h1 className="text-3xl font-black">User Management</h1>
        </nav>
        <div className="max-w-7xl mx-auto px-6 py-8">
          <ListSkeleton count={5} />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FAFAFA]">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 bg-[#FAFAFA] border-b-2 border-[#0A0A0A] px-6 py-4">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-3">
            <Button
              onClick={() => navigate('/admin')}
              className="bg-white border-2 border-[#0A0A0A] shadow-[4px_4px_0px_0px_rgba(10,10,10,1)] hover:shadow-[6px_6px_0px_0px_rgba(10,10,10,1)] hover:-translate-y-1 font-bold transition-all p-3"
            >
              <ArrowLeft className="w-5 h-5" strokeWidth={3} />
            </Button>
            <Users className="w-8 h-8" strokeWidth={3} />
            <h1 className="text-3xl font-black tracking-tight">User Management</h1>
          </div>
          <div className="hidden md:block">
            <Button
              onClick={handleLogout}
              className="bg-white border-2 border-[#0A0A0A] shadow-[4px_4px_0px_0px_rgba(10,10,10,1)] hover:shadow-[6px_6px_0px_0px_rgba(10,10,10,1)] hover:-translate-y-1 font-bold transition-all"
            >
              <LogOut className="w-4 h-4" strokeWidth={3} />
            </Button>
          </div>
        </div>
      </nav>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Filters */}
        <div className="mb-8 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="md:col-span-2 flex gap-3">
            <Input
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
              placeholder="Search by name or email..."
              className="flex-1 border-2 border-[#0A0A0A]"
            />
            <Button
              onClick={handleSearch}
              className="bg-[#C6A2FF] border-2 border-[#0A0A0A] shadow-[4px_4px_0px_0px_rgba(10,10,10,1)] hover:shadow-[6px_6px_0px_0px_rgba(10,10,10,1)] hover:-translate-y-1 font-bold transition-all"
            >
              <Search className="w-4 h-4 mr-2" />
              Search
            </Button>
          </div>
          <Select value={roleFilter} onValueChange={setRoleFilter}>
            <SelectTrigger className="border-2 border-[#0A0A0A]">
              <Filter className="w-4 h-4 mr-2" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Roles</SelectItem>
              <SelectItem value="business">Business</SelectItem>
              <SelectItem value="creator">Creator</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Users List */}
        {users.length === 0 ? (
          <EmptyState
            icon={Users}
            title="No Users Found"
            description="No users match your search criteria"
          />
        ) : (
          <div className="space-y-4">
            {users.map((user) => (
              <div
                key={user.user_id}
                className="bg-white border-2 border-[#0A0A0A] shadow-[4px_4px_0px_0px_rgba(10,10,10,1)] rounded-xl p-6"
              >
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-2xl font-black">{user.name || user.email}</h3>
                      <Badge className={`${getRoleBadgeColor(user.role)} border-2 border-[#0A0A0A] px-3 py-1 font-black text-xs uppercase`}>
                        {user.role}
                      </Badge>
                      {user.restricted && (
                        <Badge className="bg-[#FF6B6B] text-white border-2 border-[#0A0A0A] px-3 py-1 font-black text-xs uppercase">
                          {user.restriction_type}
                        </Badge>
                      )}
                    </div>
                    <p className="text-[#4A4A4A] font-medium mb-4">{user.email}</p>
                    
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <p className="font-bold text-[#4A4A4A]">User ID</p>
                        <p className="font-medium">{user.user_id.substring(0, 12)}...</p>
                      </div>
                      {user.creator_profile && (
                        <>
                          <div>
                            <p className="font-bold text-[#4A4A4A]">Badge</p>
                            <p className="font-medium capitalize">{user.creator_profile.badge}</p>
                          </div>
                          <div>
                            <p className="font-bold text-[#4A4A4A]">Status</p>
                            <p className="font-medium capitalize">{user.creator_profile.status}</p>
                          </div>
                        </>
                      )}
                      <div>
                        <p className="font-bold text-[#4A4A4A]">Subscription</p>
                        <p className="font-medium capitalize">{user.subscription_status || 'none'}</p>
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-3">
                    {user.restricted ? (
                      <Button
                        onClick={() => handleUnrestrict(user.user_id)}
                        className="bg-[#B4F8C8] border-2 border-[#0A0A0A] shadow-[4px_4px_0px_0px_rgba(10,10,10,1)] hover:shadow-[6px_6px_0px_0px_rgba(10,10,10,1)] hover:-translate-y-1 font-bold transition-all"
                      >
                        <CheckCircle className="w-4 h-4 mr-2" />
                        Unrestrict
                      </Button>
                    ) : (
                      <Button
                        onClick={() => {
                          setSelectedUser(user);
                          setShowRestrictModal(true);
                        }}
                        className="bg-[#FF6B6B] text-white border-2 border-[#0A0A0A] shadow-[4px_4px_0px_0px_rgba(10,10,10,1)] hover:shadow-[6px_6px_0px_0px_rgba(10,10,10,1)] hover:-translate-y-1 font-bold transition-all"
                        disabled={user.role === 'admin'}
                      >
                        <Ban className="w-4 h-4 mr-2" />
                        Restrict
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Restrict User Modal */}
      {selectedUser && (
        <Dialog open={showRestrictModal} onOpenChange={setShowRestrictModal}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle className="text-3xl font-black flex items-center gap-2">
                <Ban className="w-8 h-8 text-[#FF6B6B]" strokeWidth={3} />
                Restrict User
              </DialogTitle>
            </DialogHeader>

            <div className="space-y-6 mt-4">
              {/* User Info */}
              <div className="bg-[#FFE57F] border-2 border-[#0A0A0A] rounded-lg p-4">
                <p className="font-bold text-sm text-[#4A4A4A] mb-1">USER</p>
                <p className="font-black text-lg">{selectedUser.name || selectedUser.email}</p>
                <p className="text-sm font-medium text-[#4A4A4A]">{selectedUser.email}</p>
              </div>

              {/* Warning */}
              <div className="bg-[#FF6B6B]/20 border-2 border-[#FF6B6B] rounded-lg p-4">
                <p className="font-bold text-sm mb-2">⚠️ Warning</p>
                <p className="text-sm font-medium">
                  This action will prevent the user from accessing the platform. Use this feature responsibly.
                </p>
              </div>

              {/* Restriction Type */}
              <div>
                <label className="block font-bold mb-2">Restriction Type</label>
                <Select value={restrictionType} onValueChange={setRestrictionType}>
                  <SelectTrigger className="border-2 border-[#0A0A0A]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="suspend">Suspend (Temporary)</SelectItem>
                    <SelectItem value="ban">Ban (Permanent)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Duration (for suspensions) */}
              {restrictionType === 'suspend' && (
                <div>
                  <label className="block font-bold mb-2">Duration (Days)</label>
                  <Select value={durationDays} onValueChange={setDurationDays}>
                    <SelectTrigger className="border-2 border-[#0A0A0A]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">1 Day</SelectItem>
                      <SelectItem value="3">3 Days</SelectItem>
                      <SelectItem value="7">7 Days</SelectItem>
                      <SelectItem value="14">14 Days</SelectItem>
                      <SelectItem value="30">30 Days</SelectItem>
                      <SelectItem value="90">90 Days</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}

              {/* Reason */}
              <div>
                <label className="block font-bold mb-2">Reason *</label>
                <Textarea
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  placeholder="Explain why you are restricting this user..."
                  className="border-2 border-[#0A0A0A] min-h-[100px]"
                  maxLength={500}
                />
                <p className="text-xs text-[#4A4A4A] mt-1">{reason.length}/500 characters</p>
              </div>

              {/* Actions */}
              <div className="flex gap-3">
                <Button
                  onClick={handleRestrict}
                  disabled={processing || !reason.trim()}
                  className="flex-1 bg-[#FF6B6B] text-white border-2 border-[#0A0A0A] shadow-[4px_4px_0px_0px_rgba(10,10,10,1)] hover:shadow-[6px_6px_0px_0px_rgba(10,10,10,1)] hover:-translate-y-1 font-bold transition-all"
                >
                  {processing ? (
                    'Processing...'
                  ) : (
                    <>
                      <Ban className="w-4 h-4 mr-2" />
                      {restrictionType === 'ban' ? 'Ban User' : 'Suspend User'}
                    </>
                  )}
                </Button>
                <Button
                  onClick={() => {
                    setShowRestrictModal(false);
                    setReason('');
                  }}
                  disabled={processing}
                  className="bg-white border-2 border-[#0A0A0A] shadow-[4px_4px_0px_0px_rgba(10,10,10,1)] font-bold"
                >
                  Cancel
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};

export default AdminUsersPage;
