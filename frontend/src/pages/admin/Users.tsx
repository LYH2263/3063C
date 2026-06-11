import React, { useEffect, useState } from 'react';
import api from '../../services/api';
import { useToast } from '../../context/ToastContext';
import { useAuth } from '../../context/AuthContext';
import { Button } from '../../components/ui/Button';
import { Modal } from '../../components/ui/Modal';
import { Input } from '../../components/ui/Input';

export const AdminUsers = () => {
    const { user: currentUser } = useAuth();
    const [users, setUsers] = useState<any[]>([]);
    const { success, error } = useToast();

    // Sub-admin modal state
    const [isSubAdminModalOpen, setIsSubAdminModalOpen] = useState(false);
    const [subAdminData, setSubAdminData] = useState({ username: '', password: '', permissions: '' });

    const fetchUsers = async () => {
        try {
            const res: any = await api.get('/admin/users');
            setUsers(res.data);
        } catch (err: any) {
            error(err.message || '获取用户失败');
        }
    };

    useEffect(() => {
        fetchUsers();
    }, []);

    const toggleStatus = async (id: number, currentStatus: string, role: string) => {
        if (role === 'ADMIN') {
            error('无法直接在此面板修改管理员状态。');
            return;
        }
        const newStatus = currentStatus === 'ACTIVE' ? 'BANNED' : 'ACTIVE';
        try {
            await api.put(`/admin/users/${id}/status`, { status: newStatus });
            success(`用户状态已更新为 ${newStatus}`);
            fetchUsers();
        } catch (err: any) {
            error(err.message || '操作失败');
        }
    };

    const resetPassword = async (id: number) => {
        const newPassword = window.prompt('请输入新密码 (至少6位):');
        if (newPassword === null) return;
        if (newPassword.trim().length < 6) {
            error('密码长度至少需要 6 个字符。');
            return;
        }

        try {
            await api.post(`/admin/users/${id}/reset-password`, { newPassword });
            success('密码已成功重置');
        } catch (err: any) {
            error(err.message || '密码重置失败');
        }
    };

    const handleCreateSubAdmin = async () => {
        try {
            await api.post('/admin/users/sub-admin', subAdminData);
            success('子管理员创建成功');
            setIsSubAdminModalOpen(false);
            setSubAdminData({ username: '', password: '', permissions: '' });
            fetchUsers();
        } catch (err: any) {
            error(err.message || '创建子管理员失败');
        }
    };

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold">用户管理</h1>
                {currentUser?.roleType === 'SUPER_ADMIN' && (
                    <Button onClick={() => setIsSubAdminModalOpen(true)}>添加子管理员</Button>
                )}
            </div>
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="bg-gray-50 border-b border-gray-200 text-sm font-medium text-gray-500 uppercase tracking-wider">
                            <th className="p-4">用户名</th>
                            <th className="p-4">角色</th>
                            <th className="p-4">状态</th>
                            <th className="p-4">注册时间</th>
                            <th className="p-4 text-right">操作</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                        {users.map((u) => (
                            <tr key={u.id} className="hover:bg-gray-50">
                                <td className="p-4 font-medium text-gray-900">{u.username}</td>
                                <td className="p-4">
                                    <span className={`px-2 py-1 rounded text-xs font-medium ${u.roleType === 'SUPER_ADMIN' ? 'bg-indigo-100 text-indigo-700' : u.roleType === 'ADMIN' ? 'bg-purple-100 text-purple-700' : 'bg-gray-100 text-gray-700'}`}>
                                        {u.roleType === 'SUPER_ADMIN' ? '超级管理员' : u.roleType === 'ADMIN' ? '子管理员' : '用户'}
                                    </span>
                                </td>
                                <td className="p-4">
                                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${u.status === 'ACTIVE' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                        {u.status === 'ACTIVE' ? '正常' : u.status === 'BANNED' ? '已封禁' : u.status}
                                    </span>
                                </td>
                                <td className="p-4 text-gray-500 text-sm">{new Date(u.createdAt).toLocaleDateString()}</td>
                                <td className="p-4 text-right">
                                    {u.roleType === 'USER' && (
                                        <Button
                                            size="sm"
                                            variant={u.status === 'ACTIVE' ? 'danger' : 'outline'}
                                            onClick={() => toggleStatus(u.id, u.status, u.roleType)}
                                        >
                                            {u.status === 'ACTIVE' ? '封禁此用户' : '解封此用户'}
                                        </Button>
                                    )}
                                    {u.roleType === 'USER' && (
                                        <Button
                                            size="sm"
                                            variant="outline"
                                            className="ml-2"
                                            onClick={() => resetPassword(u.id)}
                                        >
                                            重置密码
                                        </Button>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            <Modal
                isOpen={isSubAdminModalOpen}
                onClose={() => setIsSubAdminModalOpen(false)}
                title="添加子管理员"
                footer={
                    <>
                        <Button variant="ghost" onClick={() => setIsSubAdminModalOpen(false)}>取消</Button>
                        <Button onClick={handleCreateSubAdmin}>创建</Button>
                    </>
                }
            >
                <div className="space-y-4">
                    <Input label="管理员账号" value={subAdminData.username} onChange={e => setSubAdminData({ ...subAdminData, username: e.target.value })} />
                    <Input label="登录初始密码" type="password" value={subAdminData.password} onChange={e => setSubAdminData({ ...subAdminData, password: e.target.value })} />
                    <Input label="权限分配 (以逗号分隔，如 STYLE,USER)" value={subAdminData.permissions} onChange={e => setSubAdminData({ ...subAdminData, permissions: e.target.value })} />
                </div>
            </Modal>
        </div>
    );
};
