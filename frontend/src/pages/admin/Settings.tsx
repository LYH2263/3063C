import React, { useEffect, useState } from 'react';
import api from '../../services/api';
import { useToast } from '../../context/ToastContext';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';

export const AdminSettings = () => {
    const [settings, setSettings] = useState<any>({
        siteTitle: 'My Website',
        logoUrl: '',
        contactInfo: '',
        icpInfo: '',
        enableMessageReview: true,
        enableWorkReview: false,
        enableRegistration: true
    });
    const { success, error } = useToast();
    const [isLoading, setIsLoading] = useState(true);

    const fetchSettings = async () => {
        try {
            const res: any = await api.get('/settings');
            if (res.data) setSettings(res.data);
        } catch (err: any) {
            error(err.message || '获取配置失败');
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchSettings();
    }, []);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value, type, checked } = e.target;
        setSettings({
            ...settings,
            [name]: type === 'checkbox' ? checked : value
        });
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await api.put('/settings', settings);
            success('系统配置已更新');
        } catch (err: any) {
            error(err.message || '保存失败');
        }
    };

    if (isLoading) return <div className="p-8">加载中...</div>;

    return (
        <div className="max-w-3xl">
            <h1 className="text-2xl font-bold mb-6">系统配置</h1>
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
                <form onSubmit={handleSave} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <Input
                            label="网站标题"
                            name="siteTitle"
                            value={settings.siteTitle || ''}
                            onChange={handleChange}
                            placeholder="例如：视觉工作室"
                        />
                        <Input
                            label="LOGO 链接 (可选)"
                            name="logoUrl"
                            value={settings.logoUrl || ''}
                            onChange={handleChange}
                            placeholder="https://..."
                        />
                        <Input
                            label="联系方式"
                            name="contactInfo"
                            value={settings.contactInfo || ''}
                            onChange={handleChange}
                            placeholder="例如：contact@example.com"
                        />
                        <Input
                            label="ICP 备案信息"
                            name="icpInfo"
                            value={settings.icpInfo || ''}
                            onChange={handleChange}
                            placeholder="例如：京ICP备12345678号"
                        />
                    </div>

                    <div className="border-t border-gray-100 pt-6 mt-6 space-y-4">
                        <h3 className="font-bold text-lg mb-4">开关与审核设置</h3>
                        <label className="flex items-center gap-3 cursor-pointer">
                            <input
                                type="checkbox"
                                name="enableRegistration"
                                checked={settings.enableRegistration}
                                onChange={handleChange}
                                className="w-5 h-5 text-primary border-gray-300 rounded focus:ring-primary"
                            />
                            <span className="text-gray-700">开放用户注册通道</span>
                        </label>

                        <label className="flex items-center gap-3 cursor-pointer">
                            <input
                                type="checkbox"
                                name="enableMessageReview"
                                checked={settings.enableMessageReview}
                                onChange={handleChange}
                                className="w-5 h-5 text-primary border-gray-300 rounded focus:ring-primary"
                            />
                            <span className="text-gray-700">开启留言板人工审核 (开启后留言需通过审批才能显示)</span>
                        </label>

                        <label className="flex items-center gap-3 cursor-pointer">
                            <input
                                type="checkbox"
                                name="enableWorkReview"
                                checked={settings.enableWorkReview}
                                onChange={handleChange}
                                className="w-5 h-5 text-primary border-gray-300 rounded focus:ring-primary"
                            />
                            <span className="text-gray-700">开启作品投稿审核 (开启后非管理员投稿需要审核)</span>
                        </label>
                    </div>

                    <div className="pt-6 border-t border-gray-100 flex justify-end">
                        <Button type="submit" size="lg">保存配置</Button>
                    </div>
                </form>
            </div>
        </div>
    );
};
