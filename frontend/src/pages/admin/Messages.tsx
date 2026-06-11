import React, { useEffect, useState } from 'react';
import api from '../../services/api';
import { useToast } from '../../context/ToastContext';
import { Button } from '../../components/ui/Button';

export const AdminMessages = () => {
    const [messages, setMessages] = useState<any[]>([]);
    const { success, error } = useToast();

    const fetchMessages = async () => {
        try {
            const res: any = await api.get('/messages/admin');
            setMessages(res.data);
        } catch (err: any) {
            error(err.message || '获取留言失败');
        }
    };

    useEffect(() => {
        fetchMessages();
    }, []);

    const updateStatus = async (id: number, status: string) => {
        try {
            await api.put(`/messages/admin/${id}`, { status });
            success(`留言状态已更新为 ${status}`);
            fetchMessages();
        } catch (err: any) {
            error(err.message || '操作失败');
        }
    };

    const deleteMessage = async (id: number) => {
        if (!window.confirm("您确定要删除此留言吗？")) return;
        try {
            await api.delete(`/messages/admin/${id}`);
            success('留言已删除');
            fetchMessages();
        } catch (err: any) {
            error(err.message || '删除失败');
        }
    };

    return (
        <div>
            <h1 className="text-2xl font-bold mb-6">留言审核</h1>
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="bg-gray-50 border-b border-gray-200 text-sm font-medium text-gray-500 uppercase tracking-wider">
                            <th className="p-4 w-1/4">用户</th>
                            <th className="p-4 w-1/2">内容</th>
                            <th className="p-4">状态</th>
                            <th className="p-4 text-right">操作</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                        {messages.map((m) => (
                            <tr key={m.id} className="hover:bg-gray-50 transition-colors">
                                <td className="p-4 text-gray-900 font-medium">{m.user?.username || '未知'} <div className="text-xs text-gray-500">{new Date(m.createdAt).toLocaleDateString()}</div></td>
                                <td className="p-4 text-gray-600 line-clamp-2">{m.content}</td>
                                <td className="p-4">
                                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${m.status === 'APPROVED' ? 'bg-green-100 text-green-700' :
                                        m.status === 'REJECTED' ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700'
                                        }`}>
                                        {m.status === 'PENDING' ? '待处理' : m.status === 'APPROVED' ? '已通过' : m.status === 'REJECTED' ? '已拒绝' : m.status}
                                    </span>
                                </td>
                                <td className="p-4 text-right space-x-2">
                                    {m.status === 'PENDING' && (
                                        <>
                                            <Button size="sm" onClick={() => updateStatus(m.id, 'APPROVED')}>通过</Button>
                                            <Button size="sm" variant="danger" onClick={() => updateStatus(m.id, 'REJECTED')}>拒绝</Button>
                                        </>
                                    )}
                                    {m.status !== 'PENDING' && (
                                        <Button size="sm" variant="outline" onClick={() => deleteMessage(m.id)}>删除</Button>
                                    )}
                                </td>
                            </tr>
                        ))}
                        {messages.length === 0 && (
                            <tr><td colSpan={4} className="p-8 text-center text-gray-500">暂无留言。</td></tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};
