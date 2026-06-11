import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useToast } from '../../context/ToastContext';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import api from '../../services/api';

export const Register = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const { success, error } = useToast();
    const navigate = useNavigate();

    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        try {
            await api.post('/auth/register', { username, password });
            success('注册成功，您可以登录了。');
            navigate('/login');
        } catch (err: any) {
            error(err.message || '注册失败');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="max-w-md mx-auto mt-20 p-8 bg-white dark:bg-slate-900 rounded-xl shadow-xl border border-gray-100 dark:border-gray-800">
            <div className="text-center mb-8">
                <h2 className="text-3xl font-bold text-gray-900 dark:text-white">创建账号</h2>
                <p className="text-gray-500 dark:text-gray-400 mt-2">加入我们，参与互动、收藏和评论作品。</p>
            </div>

            <form onSubmit={handleRegister} className="space-y-6">
                <Input
                    label="用户名 / 手机号 / 邮箱"
                    value={username}
                    onChange={e => setUsername(e.target.value)}
                    required
                    placeholder="请输入识别账号"
                />
                <Input
                    label="密码"
                    type="password"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    required
                    placeholder="至少 6 个字符"
                    minLength={6}
                />
                <Button type="submit" className="w-full" isLoading={isLoading} size="lg">
                    注册
                </Button>

                <p className="text-center text-sm text-gray-500">
                    已有账号？ <Link to="/login" className="text-primary hover:underline">登录</Link>
                </p>
            </form>
        </div>
    );
};
