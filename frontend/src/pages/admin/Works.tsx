import React, { useEffect, useState } from 'react';
import api from '../../services/api';
import { useToast } from '../../context/ToastContext';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Modal } from '../../components/ui/Modal';
import { Trash2, Edit, Plus, Eye } from 'lucide-react';

const API_ROOT = (import.meta.env.VITE_API_URL || 'http://localhost:8063/api').replace(/\/api$/, '');

export const AdminWorks = () => {
    const [works, setWorks] = useState<any[]>([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingWork, setEditingWork] = useState<any>(null);
    const [formData, setFormData] = useState({ title: '', description: '', tags: '', category: '', mediaUrl: '', status: 'PUBLISHED' });
    const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
    const [workToDelete, setWorkToDelete] = useState<number | null>(null);
    const [selectedIds, setSelectedIds] = useState<number[]>([]);

    const { success, error } = useToast();

    const fetchWorks = async () => {
        try {
            const res: any = await api.get('/works/admin/all');
            setWorks(res.data);
        } catch (err: any) {
            error(err.message || '加载作品失败');
        }
    };

    useEffect(() => {
        fetchWorks();
    }, []);

    const openEditModal = (work?: any) => {
        if (work) {
            setEditingWork(work);
            setFormData({ title: work.title, description: work.description, tags: work.tags, category: work.category, mediaUrl: work.mediaUrl, status: work.status });
        } else {
            setEditingWork(null);
            setFormData({ title: '', description: '', tags: '', category: '', mediaUrl: '', status: 'PUBLISHED' });
        }
        setIsModalOpen(true);
    };

    const handleSave = async () => {
        const payload = {
            title: formData.title.trim(),
            description: formData.description.trim(),
            tags: formData.tags.trim(),
            category: formData.category.trim(),
            mediaUrl: formData.mediaUrl.trim(),
            status: formData.status
        };
        const missingLabels = [
            !payload.title ? '标题' : null,
            !payload.description ? '描述' : null,
            !payload.mediaUrl ? '资源 URL' : null
        ].filter(Boolean);
        if (missingLabels.length > 0) {
            error(`请先填写必填项：${missingLabels.join('、')}`);
            return;
        }

        try {
            if (editingWork) {
                await api.put(`/works/admin/${editingWork.id}`, payload);
                success('作品更新成功');
            } else {
                await api.post('/works/admin', payload);
                success('作品创建成功');
            }
            setIsModalOpen(false);
            fetchWorks();
        } catch (err: any) {
            error(err.message || '操作失败');
        }
    };

    const handleDelete = async () => {
        if (!workToDelete) return;
        try {
            await api.delete(`/works/admin/${workToDelete}`);
            success('作品删除成功');
            setDeleteConfirmOpen(false);
            setSelectedIds(selectedIds.filter(id => id !== workToDelete));
            fetchWorks();
        } catch (err: any) {
            error(err.message || '删除作品失败');
            setDeleteConfirmOpen(false);
        }
    };

    const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.checked) {
            setSelectedIds(works.map(w => w.id));
        } else {
            setSelectedIds([]);
        }
    };

    const handleSelect = (id: number) => {
        if (selectedIds.includes(id)) {
            setSelectedIds(selectedIds.filter(checkedId => checkedId !== id));
        } else {
            setSelectedIds([...selectedIds, id]);
        }
    };

    const handleBatchDelete = async () => {
        if (selectedIds.length === 0) return;
        if (!window.confirm(`确定要删除选中的 ${selectedIds.length} 个作品吗？`)) return;
        try {
            await Promise.all(selectedIds.map(id => api.delete(`/works/admin/${id}`)));
            success('批量删除成功');
            setSelectedIds([]);
            fetchWorks();
        } catch (err: any) {
            error('批量删除过程中出现错误');
        }
    };

    const handleBatchStatus = async (status: string) => {
        if (selectedIds.length === 0) return;
        const confirmMsg = status === 'PUBLISHED' ? '批量上架' : '批量下架(设为草稿)';
        if (!window.confirm(`确定要${confirmMsg}选中的 ${selectedIds.length} 个作品吗？`)) return;

        try {
            // we have put /works/admin/:id, we need to fetch the existing data or just patch it
            // since put replaces everything, we need to get each first or let's use the current works data
            const updates = selectedIds.map(id => {
                const work = works.find(w => w.id === id);
                if (!work) return Promise.resolve();
                return api.put(`/works/admin/${id}`, { ...work, status });
            });
            await Promise.all(updates);
            success(`${confirmMsg}成功`);
            setSelectedIds([]);
            fetchWorks();
        } catch (err) {
            error('批量操作过程中出现错误');
        }
    };

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold">作品管理</h1>
                <div className="flex gap-2">
                    {selectedIds.length > 0 && (
                        <>
                            <Button variant="danger" onClick={handleBatchDelete}>批量删除 ({selectedIds.length})</Button>
                            <Button variant="outline" onClick={() => handleBatchStatus('PUBLISHED')}>批量上架</Button>
                            <Button variant="outline" onClick={() => handleBatchStatus('DRAFT')}>批量下架</Button>
                        </>
                    )}
                    <Button onClick={() => openEditModal()}><Plus className="w-4 h-4 mr-2" /> 新增作品</Button>
                </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="bg-gray-50 border-b border-gray-200 text-sm font-medium text-gray-500 uppercase tracking-wider">
                            <th className="p-4 w-12">
                                <input
                                    type="checkbox"
                                    className="rounded border-gray-300 text-primary focus:ring-primary cursor-pointer w-4 h-4"
                                    checked={selectedIds.length === works.length && works.length > 0}
                                    onChange={handleSelectAll}
                                />
                            </th>
                            <th className="p-4">标题</th>
                            <th className="p-4">分类</th>
                            <th className="p-4">状态</th>
                            <th className="p-4">浏览量</th>
                            <th className="p-4 text-right">操作</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                        {works.map((work) => (
                            <tr key={work.id} className="hover:bg-gray-50 transition-colors">
                                <td className="p-4">
                                    <input
                                        type="checkbox"
                                        className="rounded border-gray-300 text-primary focus:ring-primary cursor-pointer w-4 h-4"
                                        checked={selectedIds.includes(work.id)}
                                        onChange={() => handleSelect(work.id)}
                                    />
                                </td>
                                <td className="p-4 font-medium text-gray-900">{work.title}</td>
                                <td className="p-4 text-gray-500">{work.category}</td>
                                <td className="p-4">
                                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${work.status === 'PUBLISHED' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                                        {work.status === 'PUBLISHED' ? '已发布' : work.status === 'DRAFT' ? '草稿' : work.status}
                                    </span>
                                </td>
                                <td className="p-4 text-gray-500 flex items-center gap-1"><Eye className="w-4 h-4" /> {work.viewCount}</td>
                                <td className="p-4 text-right">
                                    <button onClick={() => openEditModal(work)} className="text-primary hover:underline mx-2">编辑</button>
                                    <button onClick={() => { setWorkToDelete(work.id); setDeleteConfirmOpen(true); }} className="text-red-500 hover:underline">删除</button>
                                </td>
                            </tr>
                        ))}
                        {works.length === 0 && (
                            <tr><td colSpan={5} className="p-8 text-center text-gray-500">暂无作品。</td></tr>
                        )}
                    </tbody>
                </table>
            </div>

            <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={editingWork ? '编辑作品' : '新增作品'} footer={<><Button variant="ghost" onClick={() => setIsModalOpen(false)}>取消</Button><Button onClick={handleSave}>保存</Button></>}>
                <div className="space-y-4">
                    <Input label="标题" value={formData.title} onChange={e => setFormData({ ...formData, title: e.target.value })} />
                    <div className="col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-1">描述</label>
                        <textarea className="w-full rounded-md border border-gray-300 p-2 text-sm focus:ring-2 focus:ring-primary focus:outline-none" rows={3} value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })}></textarea>
                    </div>
                    <Input label="分类" value={formData.category} onChange={e => setFormData({ ...formData, category: e.target.value })} />
                    <Input label="标签 (逗号分隔)" value={formData.tags} onChange={e => setFormData({ ...formData, tags: e.target.value })} />
                    <Input label="标签 (逗号分隔)" value={formData.tags} onChange={e => setFormData({ ...formData, tags: e.target.value })} />
                    <Input label="资源 URL (图片/视频链接)" value={formData.mediaUrl} onChange={e => setFormData({ ...formData, mediaUrl: e.target.value })} />
                    <div className="flex items-center gap-4 p-2 bg-gray-50 rounded border border-gray-100">
                        {formData.mediaUrl && (
                            <img 
                                src={formData.mediaUrl.startsWith('http') ? formData.mediaUrl : `${API_ROOT}${formData.mediaUrl}`} 
                                alt="预览" 
                                className="w-20 h-20 object-cover rounded shadow-sm bg-white" 
                            />
                        )}
                        <div className="text-xs text-gray-500 italic">预览区域 (支持本地路径 /uploads/...)</div>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">状态</label>
                        <select className="w-full rounded-md border border-gray-300 p-2 text-sm focus:ring-2 focus:ring-primary focus:outline-none" value={formData.status} onChange={e => setFormData({ ...formData, status: e.target.value })}>
                            <option value="PUBLISHED">已发布</option>
                            <option value="DRAFT">草稿</option>
                        </select>
                    </div>
                </div>
            </Modal>

            <Modal isOpen={deleteConfirmOpen} onClose={() => setDeleteConfirmOpen(false)} title="确认删除" footer={<><Button variant="ghost" onClick={() => setDeleteConfirmOpen(false)}>取消</Button><Button variant="danger" onClick={handleDelete}>确认删除</Button></>}>
                <p>您确定要删除此作品吗？包含的点赞与收藏互动数据也会被删除。</p>
            </Modal>
        </div>
    );
};
