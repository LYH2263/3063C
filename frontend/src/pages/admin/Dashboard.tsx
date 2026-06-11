import React, { useEffect, useState } from 'react';
import api from '../../services/api';
import { Palette, Users, Image as ImageIcon, MessageSquare } from 'lucide-react';

export const AdminDashboard = () => {
    const [stats, setStats] = useState({ users: 0, works: 0, activeStyle: 'None', messages: 0 });

    useEffect(() => {
        // We could make a dedicated stats endpoint, but for simplicity we fetch individual counts
        Promise.all([
            api.get('/admin/users').catch(() => ({ data: [] })),
            api.get('/works/admin/all').catch(() => ({ data: [] })),
            api.get('/styles/active').catch(() => ({ data: { name: '默认' } })),
            api.get('/messages/admin').catch(() => ({ data: [] }))
        ]).then(([uRes, wRes, sRes, mRes]: any) => {
            setStats({
                users: uRes.data.length || 0,
                works: wRes.data.length || 0,
                activeStyle: sRes.data?.name || '无',
                messages: mRes.data.filter((m: any) => m.status === 'PENDING').length || 0
            });
        });
    }, []);

    const cards = [
        { title: '总用户数', value: stats.users, icon: Users, color: 'text-blue-500', bg: 'bg-blue-50' },
        { title: '已发布作品', value: stats.works, icon: ImageIcon, color: 'text-green-500', bg: 'bg-green-50' },
        { title: '当前生效的主题', value: stats.activeStyle, icon: Palette, color: 'text-purple-500', bg: 'bg-purple-50' },
        { title: '待审核留言', value: stats.messages, icon: MessageSquare, color: 'text-yellow-500', bg: 'bg-yellow-50' },
    ];

    return (
        <div>
            <h1 className="text-3xl font-bold mb-8 text-gray-800">欢迎使用管理后台</h1>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {cards.map((c, i) => {
                    const Icon = c.icon;
                    return (
                        <div key={i} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4">
                            <div className={`p-4 rounded-xl ${c.bg}`}>
                                <Icon className={`w-8 h-8 ${c.color}`} />
                            </div>
                            <div>
                                <div className="text-sm font-medium text-gray-500">{c.title}</div>
                                <div className="text-2xl font-bold text-gray-900 mt-1">{c.value}</div>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
