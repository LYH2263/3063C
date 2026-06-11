import React, { useEffect, useState } from 'react';
import api from '../../services/api';
import { useToast } from '../../context/ToastContext';
import { Clock } from 'lucide-react';

const actionMap: Record<string, string> = {
    'CREATE_WORK': '新增作品',
    'UPDATE_WORK': '编辑作品',
    'DELETE_WORK': '删除作品',
    'UPDATE_WORK_STATUS': '变更作品状态',
    'TOGGLE_USER_STATUS': '切换成员状态',
    'RESET_USER_PASSWORD': '重置成员密码',
    'ADD_SUB_ADMIN': '添加子管理员',
    'UPDATE_STYLE': '更新界面风格',
    'APPROVE_MESSAGE': '通过留言审核',
    'REJECT_MESSAGE': '驳回用户留言',
    'DELETE_MESSAGE': '删除留言记录',
    'UPDATE_SETTINGS': '修改系统设置',
    'LOGIN': '系统登录'
};

export const AdminOperationLogs = () => {
    const [logs, setLogs] = useState<any[]>([]);
    const { error } = useToast();

    useEffect(() => {
        const fetchLogs = async () => {
            try {
                const res: any = await api.get('/admin/operation-logs');
                setLogs(res.data);
            } catch (err: any) {
                error(err.message || '加载操作日志失败');
            }
        };
        fetchLogs();
    }, []);

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold">操作日志</h1>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="bg-gray-50 border-b border-gray-200 text-sm font-medium text-gray-500 uppercase tracking-wider">
                            <th className="p-4">日志ID</th>
                            <th className="p-4">操作用户</th>
                            <th className="p-4">操作类型</th>
                            <th className="p-4">操作凭IP</th>
                            <th className="p-4">操作时间</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                        {logs.map((log) => (
                            <tr key={log.id} className="hover:bg-gray-50 transition-colors">
                                <td className="p-4 text-gray-500">#{log.id}</td>
                                <td className="p-4 font-medium text-gray-900">{log.user?.username || '未知系统'}</td>
                                <td className="p-4">
                                    <span className="px-2 py-1 rounded bg-blue-100 text-blue-700 text-xs font-medium">
                                        {actionMap[log.action] || log.action}
                                    </span>
                                </td>
                                <td className="p-4 text-gray-500">{log.ip || '-'}</td>
                                <td className="p-4 flex items-center text-gray-500 gap-1">
                                    <Clock className="w-4 h-4" />
                                    {new Date(log.createdAt).toLocaleString()}
                                </td>
                            </tr>
                        ))}
                        {logs.length === 0 && (
                            <tr><td colSpan={5} className="p-8 text-center text-gray-500">暂无操作日志记录。</td></tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};
