import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import api from '../../services/api';
import { isAdminRole } from '../../lib/role';

export const Login = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const { login } = useAuth();
    const { success, error } = useToast();
    const navigate = useNavigate();

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        try {
            const res: any = await api.post('/auth/login', { username, password });
            login(res.data.token, res.data.user);
            success('登录成功！');

            if (isAdminRole(res.data.user.roleType)) {
                navigate('/admin');
            } else {
                navigate('/');
            }
        } catch (err: any) {
            error(err.message || '登录失败');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="max-w-md mx-auto mt-20 p-8 bg-white dark:bg-slate-900 rounded-xl shadow-xl border border-gray-100 dark:border-gray-800">
            <div className="text-center mb-8">
                <h2 className="text-3xl font-bold text-gray-900 dark:text-white">欢迎回来</h2>
                <p className="text-gray-500 dark:text-gray-400 mt-2">登录您的账号以继续</p>
            </div>

            <form onSubmit={handleLogin} className="space-y-6">
                <Input
                    label="用户名 / 手机号 / 邮箱"
                    value={username}
                    onChange={e => setUsername(e.target.value)}
                    required
                    placeholder="例如: admin, 手机号 或 邮箱"
                />
                <Input
                    label="密码"
                    type="password"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    required
                    placeholder="••••••"
                />
                <Button type="submit" className="w-full" isLoading={isLoading} size="lg">
                    登录
                </Button>
            </form>
        </div>
    );
};
