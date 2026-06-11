export const normalizeRole = (role?: string | null) => {
    if (!role) return '';
    return role.toUpperCase().replace(/[\s-]+/g, '_');
};

export const isAdminRole = (role?: string | null) => {
    const normalizedRole = normalizeRole(role);
    return normalizedRole === 'ADMIN' || normalizedRole === 'SUPER_ADMIN' || normalizedRole === 'SUPERADMIN';
};
