import React from 'react';
import { Outlet, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { cn } from '../lib/utils';
import { useStyle } from '../context/StyleContext';

export const PublicLayout = () => {
    const { user, logout, isAdmin } = useAuth();
    const { style } = useStyle();

    return (
        <div className={cn("min-h-screen flex flex-col", style?.layoutMode === 'DUAL' ? 'max-w-7xl mx-auto' : '')}>
            <header className="sticky top-0 z-40 w-full backdrop-blur flex-none transition-colors duration-500 lg:z-50 lg:border-b lg:border-slate-900/10 dark:border-slate-50/[0.06] bg-white/95 supports-backdrop-blur:bg-white/60 dark:bg-transparent">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex h-16 items-center justify-between">
                        <div className="flex items-center gap-6">
                            <Link to="/" className="font-bold text-xl text-primary flex items-center gap-2">
                                <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center text-white font-bold">
                                    P
                                </div>
                                独立站
                            </Link>
                            <nav className="hidden md:flex gap-6 text-sm font-medium text-gray-600 dark:text-gray-300">
                                <Link to="/" className="hover:text-primary transition-colors">首页</Link>
                                <Link to="/works" className="hover:text-primary transition-colors">作品集</Link>
                                {user && <Link to="/profile" className="hover:text-primary transition-colors">个人主页</Link>}
                            </nav>
                        </div>

                        <div className="flex items-center gap-4 text-sm font-medium">
                            {user ? (
                                <>
                                    <span className="text-gray-500 dark:text-gray-400">你好, {user.username}</span>
                                    {isAdmin && (
                                        <Link to="/admin" className="text-primary hover:underline">管理后台</Link>
                                    )}
                                    <button onClick={logout} className="text-gray-600 hover:text-red-500 transition-colors">
                                        退出登录
                                    </button>
                                </>
                            ) : (
                                <>
                                    <Link to="/login" className="text-gray-600 hover:text-primary transition-colors">登录</Link>
                                    <Link to="/register" className="bg-primary text-white px-4 py-2 rounded-md hover:opacity-90 transition-opacity">
                                        注册
                                    </Link>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            </header>

            <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <Outlet />
            </main>

            <footer className="w-full border-t border-gray-200 dark:border-gray-800 py-8 text-center text-sm text-gray-500 dark:text-gray-400">
                &copy; {new Date().getFullYear()} IndieSite 版权所有
            </footer>
        </div>
    );
};

export default PublicLayout;
