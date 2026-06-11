import React, { useEffect, useState } from 'react';
import api from '../../services/api';
import { useToast } from '../../context/ToastContext';
import { useStyle } from '../../context/StyleContext';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Modal } from '../../components/ui/Modal';
import { Trash2, CheckCircle, Edit, Palette } from 'lucide-react';

export const AdminStyles = () => {
    const [styles, setStyles] = useState<any[]>([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingStyle, setEditingStyle] = useState<any>(null);
    const [formData, setFormData] = useState({ name: '', primaryColor: '#3b82f6', fontFamily: 'Inter, sans-serif', layoutMode: 'SINGLE', backgroundImage: '' });

    const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
    const [styleToDelete, setStyleToDelete] = useState<number | null>(null);

    const { success, error } = useToast();
    const { refreshStyle } = useStyle();

    const fetchStyles = async () => {
        try {
            const res: any = await api.get('/styles');
            setStyles(res.data);
        } catch (err: any) {
            error(err.message || '加载风格失败');
        }
    };

    useEffect(() => {
        fetchStyles();
    }, []);

    const handleSave = async () => {
        try {
            if (editingStyle) {
                await api.put(`/styles/${editingStyle.id}`, formData);
                success('风格更新成功');
            } else {
                await api.post('/styles', formData);
                success('风格创建成功');
            }
            setIsModalOpen(false);
            fetchStyles();
            refreshStyle(); // Refresh active style if configured
        } catch (err: any) {
            error(err.message || '操作失败');
        }
    };

    const handleDelete = async () => {
        if (!styleToDelete) return;
        try {
            await api.delete(`/styles/${styleToDelete}`);
            success('风格已删除');
            setDeleteConfirmOpen(false);
            fetchStyles();
        } catch (err: any) {
            error(err.message || '删除风格失败');
            setDeleteConfirmOpen(false);
        }
    };

    const handleActivate = async (id: number) => {
        try {
            await api.post(`/styles/${id}/active`);
            success('风格已设为当前生效。前台界面已即时刷新。');
            fetchStyles();
            refreshStyle(); // Trigger dynamic CSS var update across the app
        } catch (err: any) {
            error(err.message || '应用风格失败');
        }
    };

    const openEditModal = (s?: any) => {
        if (s) {
            setEditingStyle(s);
            setFormData({ name: s.name, primaryColor: s.primaryColor, fontFamily: s.fontFamily, layoutMode: s.layoutMode, backgroundImage: s.backgroundImage || '' });
        } else {
            setEditingStyle(null);
            setFormData({ name: '', primaryColor: '#3b82f6', fontFamily: 'Inter, sans-serif', layoutMode: 'SINGLE', backgroundImage: '' });
        }
        setIsModalOpen(true);
    };

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-2xl font-bold flex items-center gap-2"><Palette className="w-6 h-6 text-primary" /> 风格配置</h1>
                    <p className="text-gray-500 mt-1">管理全局网站主题、排版与布局。更改即时生效，无需刷新。</p>
                </div>
                <Button onClick={() => openEditModal()}>新增风格</Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {styles.map(s => (
                    <div key={s.id} className={`p-6 bg-white rounded-xl border-2 transition-all ${s.isActive ? 'border-primary shadow-lg ring-2 ring-primary ring-opacity-20' : 'border-gray-200'}`}>
                        <div className="flex justify-between items-start mb-4">
                            <h3 className="text-lg font-bold flex items-center gap-2">
                                {s.name}
                                {s.isActive && <CheckCircle className="w-5 h-5 text-green-500" />}
                            </h3>
                            <div className="flex gap-2">
                                <button onClick={() => openEditModal(s)} className="p-2 bg-gray-50 text-gray-600 rounded hover:bg-gray-100" title="编辑"><Edit className="w-4 h-4" /></button>
                                <button
                                    onClick={() => { setStyleToDelete(s.id); setDeleteConfirmOpen(true); }}
                                    className="p-2 bg-red-50 text-red-600 rounded hover:bg-red-100 disabled:opacity-50"
                                    disabled={s.isActive || s.name === '默认风格(Default)'}
                                    title="删除"
                                >
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            </div>
                        </div>

                        <div className="space-y-3 mb-6 relative z-10">
                            <div className="flex items-center gap-3">
                                <span className="text-sm text-gray-500 w-24">颜色:</span>
                                <div className="w-6 h-6 rounded-full border border-gray-300 shadow-sm" style={{ backgroundColor: s.primaryColor }}></div>
                                <span className="text-sm font-mono">{s.primaryColor}</span>
                            </div>
                            <div className="flex items-center gap-3">
                                <span className="text-sm text-gray-500 w-24">字体:</span>
                                <span className="text-sm border px-2 py-0.5 rounded bg-gray-50">{s.fontFamily.split(',')[0]}</span>
                            </div>
                            <div className="flex items-center gap-3">
                                <span className="text-sm text-gray-500 w-24">布局:</span>
                                <span className="text-sm">{s.layoutMode}</span>
                            </div>
                        </div>

                        {!s.isActive && (
                            <Button variant="outline" className="w-full" onClick={() => handleActivate(s.id)}>
                                设为当前生效
                            </Button>
                        )}
                        {s.isActive && (
                            <Button className="w-full bg-green-500 hover:bg-green-600 text-white cursor-default" disabled>
                                当前已生效
                            </Button>
                        )}
                    </div>
                ))}
            </div>

            <Modal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                title={editingStyle ? "编辑风格配置" : "新增风格配置"}
                footer={
                    <>
                        <Button variant="ghost" onClick={() => setIsModalOpen(false)}>取消</Button>
                        <Button onClick={handleSave}>保存</Button>
                    </>
                }
            >
                <div className="space-y-4">
                    <Input label="风格名称" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} placeholder="例如: 极简暗黑" />
                    <div className="flex gap-4">
                        <Input label="主题色 (HEX/RGB)" value={formData.primaryColor} onChange={e => setFormData({ ...formData, primaryColor: e.target.value })} />
                        <div className="flex flex-col">
                            <label className="block text-sm font-medium text-gray-700 mb-1">预览</label>
                            <input type="color" className="h-10 w-16 p-1 border rounded" value={formData.primaryColor.startsWith('#') ? formData.primaryColor : '#3b82f6'} onChange={e => setFormData({ ...formData, primaryColor: e.target.value })} />
                        </div>
                    </div>
                    <Input label="字体" value={formData.fontFamily} onChange={e => setFormData({ ...formData, fontFamily: e.target.value })} placeholder="Inter, sans-serif" />
                    <div className="flex flex-col">
                        <label className="block text-sm font-medium text-gray-700 mb-1">布局模式</label>
                        <select className="flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary" value={formData.layoutMode} onChange={e => setFormData({ ...formData, layoutMode: e.target.value as any })}>
                            <option value="SINGLE">单列 (现代)</option>
                            <option value="DUAL">双列 (经典)</option>
                        </select>
                    </div>
                    <Input label="背景图片URL (选填)" value={formData.backgroundImage} onChange={e => setFormData({ ...formData, backgroundImage: e.target.value })} placeholder="https://..." />
                </div>
            </Modal>

            <Modal
                isOpen={deleteConfirmOpen}
                onClose={() => setDeleteConfirmOpen(false)}
                title="确认删除"
                footer={
                    <>
                        <Button variant="ghost" onClick={() => setDeleteConfirmOpen(false)}>取消</Button>
                        <Button variant="danger" onClick={handleDelete}>确认删除</Button>
                    </>
                }
            >
                <p>您确定要删除该风格模板吗？此操作无法撤销。</p>
            </Modal>

        </div>
    );
};
