import React from 'react';
import { Link, Outlet, useLocation, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LayoutDashboard, Users, Image as ImageIcon, Palette, MessageSquare, LogOut, Settings, Activity } from 'lucide-react';

export default function AdminLayout() {
    const { user, isAdmin, logout } = useAuth();
    const location = useLocation();

    if (!user) {
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    if (!isAdmin) {
        return <Navigate to="/" replace />;
    }

    const navItems = [
        { name: '控制台', path: '/admin', icon: LayoutDashboard },
        { name: '作品管理', path: '/admin/works', icon: ImageIcon },
        { path: '/admin/users', name: '用户管理', icon: Users },
        { path: '/admin/styles', name: '界面风格与主题', icon: Palette },
        { path: '/admin/messages', name: '留言审核', icon: MessageSquare },
        { path: '/admin/settings', name: '系统设置', icon: Settings },
        { path: '/admin/logs', name: '操作日志', icon: Activity },
    ];

    return (
        <div className="min-h-screen bg-gray-100 flex">
            {/* Sidebar */}
            <aside className="w-64 bg-white shadow-md flex flex-col">
                <div className="p-4 border-b">
                    <h2 className="text-xl font-bold text-gray-800">管理后台</h2>
                </div>
                <nav className="flex-1 p-4 space-y-2">
                    {navItems.map((item) => {
                        const Icon = item.icon;
                        const isActive = location.pathname === item.path || (location.pathname.startsWith(item.path) && item.path !== '/admin');
                        return (
                            <Link
                                key={item.path}
                                to={item.path}
                                className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${isActive ? 'bg-primary text-white' : 'text-gray-600 hover:bg-gray-50'
                                    }`}
                            >
                                <Icon className="w-5 h-5" />
                                <span className="font-medium">{item.name}</span>
                            </Link>
                        );
                    })}
                </nav>
                <div className="p-4 border-t">
                    <div className="mb-4 text-sm text-gray-500 px-4">当前用户 {user.username}</div>
                    <button
                        onClick={logout}
                        className="flex w-full items-center gap-3 px-4 py-3 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    >
                        <LogOut className="w-5 h-5" />
                        <span className="font-medium">退出登录</span>
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 overflow-auto">
                <header className="bg-white shadow-sm p-4 flex justify-end">
                    <Link to="/" className="text-sm text-primary hover:underline font-medium">查看网站前台 &rarr;</Link>
                </header>
                <div className="p-8">
                    <Outlet />
                </div>
            </main>
        </div>
    );
};
