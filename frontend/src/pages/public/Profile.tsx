import React, { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import api from '../../services/api';
import { Heart, MessageSquare, User } from 'lucide-react';
import { Navigate } from 'react-router-dom';

export const Profile = () => {
    const { user } = useAuth();
    const { success, error } = useToast();
    const [favorites, setFavorites] = useState<any[]>([]);
    const [message, setMessage] = useState('');
    const [password, setPassword] = useState('');
    const [passwordConfirm, setPasswordConfirm] = useState('');

    if (!user) {
        return <Navigate to="/login" replace />;
    }

    useEffect(() => {
        // Fetch favorites
        api.get('/works/user/favorites')
            .then((res: any) => setFavorites(res.data))
            .catch(console.error);
    }, []);

    const handleLeaveMessage = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!message.trim()) return;
        try {
            await api.post('/messages', { content: message });
            success('留言已提交，等待管理员审核。');
            setMessage('');
        } catch (err: any) {
            error(err.message || '留言提交失败');
        }
    };

    const handleUpdateProfile = async (e: React.FormEvent) => {
        e.preventDefault();
        if (password !== passwordConfirm) {
            error('两次输入的密码不一致');
            return;
        }
        if (password.length > 0 && password.length < 6) {
            error('密码长度至少需要 6 个字符');
            return;
        }
        if (!password) {
            error('请输入新密码');
            return;
        }
        try {
            await api.put('/auth/profile', { password });
            success('密码修改成功');
            setPassword('');
            setPasswordConfirm('');
        } catch (err: any) {
            error(err.message || '资料修改失败');
        }
    };

    return (
        <div className="max-w-4xl mx-auto py-10 space-y-12">

            <div className="bg-white dark:bg-slate-900 p-8 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-6">
                <div className="w-24 h-24 bg-gradient-to-tr from-primary to-purple-500 rounded-full flex items-center justify-center text-white text-3xl font-bold shadow-lg">
                    {user.username.charAt(0).toUpperCase()}
                </div>
                <div>
                    <h1 className="text-3xl font-bold">{user.username}</h1>
                    <p className="text-gray-500 mt-1 capitalize">{user.roleType.toLowerCase()} 账号</p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Favorites section */}
                <div>
                    <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
                        <Heart className="w-6 h-6 text-red-500 fill-red-500" /> 我的收藏
                    </h2>
                    <div className="space-y-4">
                        {favorites.map(f => (
                            <div key={f.id} className="flex gap-4 p-4 bg-white rounded-xl shadow-sm border border-gray-100 items-center">
                                <div className="w-16 h-16 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                                    {f.mediaUrl && <img src={f.mediaUrl} className="w-full h-full object-cover" alt="thumb" />}
                                </div>
                                <div>
                                    <h4 className="font-bold">{f.title}</h4>
                                    <p className="text-xs text-gray-500 mt-1">{f.category}</p>
                                </div>
                            </div>
                        ))}
                        {favorites.length === 0 && <p className="text-gray-500 italic">暂无收藏。</p>}
                    </div>
                </div>

                {/* Profile Edit section */}
                <div>
                    <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
                        <User className="w-6 h-6 text-blue-500" /> 修改资料
                    </h2>
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 mb-8">
                        <form onSubmit={handleUpdateProfile} className="space-y-4">
                            <Input
                                type="password"
                                label="新密码"
                                placeholder="输入新密码 (最少6个字符)"
                                value={password}
                                onChange={e => setPassword(e.target.value)}
                            />
                            <Input
                                type="password"
                                label="确认新密码"
                                placeholder="再次输入新密码"
                                value={passwordConfirm}
                                onChange={e => setPasswordConfirm(e.target.value)}
                            />
                            <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700">更新密码</Button>
                        </form>
                    </div>

                    {/* Message board section */}
                    <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
                        <MessageSquare className="w-6 h-6 text-primary" /> 留言板
                    </h2>
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                        <form onSubmit={handleLeaveMessage} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">写点什么给管理员...</label>
                                <textarea
                                    className="w-full h-32 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:outline-none resize-none"
                                    value={message}
                                    onChange={e => setMessage(e.target.value)}
                                    placeholder="您的留言..."
                                />
                            </div>
                            <Button type="submit" className="w-full">提交留言</Button>
                        </form>
                    </div>
                </div>
            </div>

        </div>
    );
};
