import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import { Ban, CheckCircle2, Trash2, Users } from 'lucide-react';
import Modal from '../../components/ui/Modal';
import Button from '../../components/ui/Button';
import EmptyState from '../../components/ui/EmptyState';
import { TableRowSkeleton } from '../../components/ui/Skeletons';
import adminService from '../../services/adminService';
import { getErrorMessage } from '../../services/api';
import { formatDate } from '../../utils/formatters';

const AdminUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [processingId, setProcessingId] = useState(null);

  useEffect(() => {
    document.title = 'Manage Users | Haven Realty Admin';
    loadUsers();
  }, []);

  const loadUsers = () => {
    setLoading(true);
    adminService
      .getUsers()
      .then((res) => setUsers(res.data))
      .catch((error) => toast.error(getErrorMessage(error)))
      .finally(() => setLoading(false));
  };

  const handleToggleStatus = async (user) => {
    setProcessingId(user._id);
    try {
      const res = await adminService.updateUserStatus(user._id);
      setUsers((prev) => prev.map((u) => (u._id === user._id ? res.data : u)));
      toast.success(`User ${res.data.isActive ? 'activated' : 'deactivated'}`);
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      setProcessingId(null);
    }
  };

  const handleDelete = async () => {
    setProcessingId(deleteTarget._id);
    try {
      await adminService.deleteUser(deleteTarget._id);
      setUsers((prev) => prev.filter((u) => u._id !== deleteTarget._id));
      toast.success('User deleted successfully');
      setDeleteTarget(null);
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      setProcessingId(null);
    }
  };

  return (
    <div>
      <h1 className="text-2xl font-bold text-navy-900">Manage Users</h1>
      <p className="mt-1 text-sm text-slate-500">View, deactivate, or remove platform users</p>

      {!loading && users.length === 0 ? (
        <EmptyState icon={Users} title="No users found" description="Registered users will appear here." />
      ) : (
        <div className="card mt-6 overflow-x-auto">
          <table className="w-full min-w-[720px] text-left text-sm">
            <thead className="border-b border-gray-100 bg-gray-50 text-xs uppercase tracking-wide text-slate-500">
              <tr>
                <th className="px-4 py-3">Name</th>
                <th className="px-4 py-3">Email</th>
                <th className="px-4 py-3">Role</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Joined</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading
                ? Array.from({ length: 5 }).map((_, i) => <TableRowSkeleton key={i} columns={6} />)
                : users.map((user) => (
                    <tr key={user._id}>
                      <td className="px-4 py-3 font-medium text-navy-900">{user.fullName}</td>
                      <td className="px-4 py-3 text-slate-500">{user.email}</td>
                      <td className="px-4 py-3 capitalize">{user.role}</td>
                      <td className="px-4 py-3">
                        <span className={`badge ${user.isActive ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-200 text-slate-600'}`}>
                          {user.isActive ? 'Active' : 'Deactivated'}
                        </span>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">{formatDate(user.createdAt)}</td>
                      <td className="px-4 py-3">
                        {user.role !== 'admin' && (
                          <div className="flex items-center justify-end gap-2">
                            <button
                              type="button"
                              disabled={processingId === user._id}
                              onClick={() => handleToggleStatus(user)}
                              className="rounded-lg p-2 text-slate-500 hover:bg-gray-100"
                              aria-label={user.isActive ? 'Deactivate user' : 'Activate user'}
                            >
                              {user.isActive ? <Ban size={16} /> : <CheckCircle2 size={16} />}
                            </button>
                            <button
                              type="button"
                              onClick={() => setDeleteTarget(user)}
                              className="rounded-lg p-2 text-red-500 hover:bg-red-50"
                              aria-label="Delete user"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}
            </tbody>
          </table>
        </div>
      )}

      <Modal
        isOpen={Boolean(deleteTarget)}
        onClose={() => setDeleteTarget(null)}
        title="Delete user"
        footer={
          <>
            <Button variant="ghost" onClick={() => setDeleteTarget(null)}>
              Cancel
            </Button>
            <Button variant="danger" loading={processingId === deleteTarget?._id} onClick={handleDelete}>
              Delete
            </Button>
          </>
        }
      >
        Are you sure you want to delete &quot;{deleteTarget?.fullName}&quot;? This will also remove all of their
        property listings.
      </Modal>
    </div>
  );
};

export default AdminUsers;
