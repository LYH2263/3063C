import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
    console.log('Starting seeding...');

    // 0. Optional: Clear existing data to prevent duplicates on re-run
    // We only clear works, messages and logs to keep users safe but here we can clear all if needed
    await prisma.interaction.deleteMany();
    await prisma.operationLog.deleteMany();
    await prisma.message.deleteMany();
    await prisma.work.deleteMany();

    // 1. Create various users
    const commonPassword = await bcrypt.hash('123456', 10);
    
    const admin = await prisma.user.upsert({
        where: { username: 'admin' },
        update: { roleType: 'SUPER_ADMIN' },
        create: {
            username: 'admin',
            passwordHash: commonPassword,
            roleType: 'SUPER_ADMIN',
            status: 'ACTIVE',
        },
    });

    const editor = await prisma.user.upsert({
        where: { username: 'editor' },
        update: {},
        create: {
            username: 'editor',
            passwordHash: commonPassword,
            roleType: 'ADMIN',
            permissions: 'WORK,MESSAGE',
            status: 'ACTIVE',
        },
    });

    const user1 = await prisma.user.upsert({
        where: { username: 'user1' },
        update: {},
        create: {
            username: 'user1',
            passwordHash: commonPassword,
            roleType: 'USER',
            status: 'ACTIVE',
        },
    });

    // 2. Create styles
    await prisma.styleConfig.upsert({
        where: { id: 1 },
        update: { isActive: true },
        create: {
            id: 1,
            name: '简约通用蓝',
            primaryColor: '#3b82f6',
            fontFamily: 'Inter, sans-serif',
            layoutMode: 'SINGLE',
            isActive: true,
        },
    });

    await prisma.styleConfig.upsert({
        where: { id: 2 },
        update: {},
        create: {
            id: 2,
            name: '赛博霓虹夜',
            primaryColor: '#ec4899',
            fontFamily: 'Orbitron, sans-serif',
            layoutMode: 'DUAL',
            isActive: false,
        },
    });

    // 3. Create Works with real images
    const worksData = [
        {
            title: '极简旅行应用UI交互稿',
            description: '这是一套专为徒步旅行爱好者设计的移动端应用，采用了极简的视觉语言与流畅的转场动画。核心功能包含路线规划、离线地图及社交分享功能。设计上使用了高对比度的色彩体系，确保户外强光下的阅读体验。',
            category: 'UI设计',
            mediaUrl: '/uploads/ui_travel.png',
            tags: '["UI", "移动端", "旅行", "Figma"]',
            status: 'PUBLISHED' as const,
            viewCount: 1250,
        },
        {
            title: '赛博朋克深空都市概念图',
            description: '探索未来主义视觉风格的极限。这幅数字绘画描绘了一个22世纪的巨型都市，霓虹灯光映照在潮湿的街道上，浮空交通工具穿梭于摩天大楼之间。使用了丰富的蓝紫色调与复杂的微小照明细节。',
            category: '数字绘画',
            mediaUrl: '/uploads/cyberpunk.png',
            tags: '["插画", "赛博朋克", "概念艺术", "Photoshop"]',
            status: 'PUBLISHED' as const,
            viewCount: 3420,
        },
        {
            title: '阿尔卑斯山落日摄影',
            description: '在海拔3000米处拍摄的震撼瞬间。金色的阳光洒在白雪皑皑的山脊上，平静的湖面完美倒映着天际的晚霞。本作品旨在通过长曝光技术捕捉大自然的宁静与威严。',
            category: '摄影展示',
            mediaUrl: '/uploads/mountain.png',
            tags: '["摄影", "风景", "自然", "4K"]',
            status: 'DRAFT' as const,
            viewCount: 890,
        },
        {
            title: '几何流体3D抽象渲染',
            description: '利用Cinema 4D与Octane渲染器创作的抽象视觉艺术。通过模拟金属质感与透明玻璃的碰撞，配合柔和的动态照明，创作出具有生物感与科技感并存的流动形态。',
            category: '3D渲染',
            mediaUrl: '/uploads/abstract_3d.png',
            tags: '["3D", "C4D", "抽象", "动态设计"]',
            status: 'PUBLISHED' as const,
            viewCount: 1860,
        }
    ];

    for (const work of worksData) {
        await prisma.work.create({ data: work });
    }

    // 4. Create Messages
    const messages = [
        { userId: user1.id, content: '网站设计的非常有格调，尤其是那个主题切换功能，加载速度很快！', status: 'APPROVED' as const },
        { userId: user1.id, content: '请问作品集的UI设计稿支持付费获取源文件吗？', status: 'PENDING' as const },
        { userId: admin.id, content: '系统测试留言：检查后台留言审核逻辑是否闭环。', status: 'REJECTED' as const },
    ];

    for (const msg of messages) {
        await prisma.message.create({ data: msg });
    }

    // 5. Operation Logs to populate the log page
    const logs = [
        { userId: admin.id, action: 'CREATE_WORK', detail: '创建了作品：极简旅行应用UI交互稿', ip: '127.0.0.1' },
        { userId: admin.id, action: 'UPDATE_STYLE', detail: '启用了主题：简约通用蓝', ip: '192.168.1.1' },
        { userId: editor.id, action: 'UPDATE_WORK_STATUS', detail: '下架了作品：阿尔卑斯山落日摄影', ip: '10.0.0.5' },
        { userId: admin.id, action: 'APPROVE_MESSAGE', detail: '审核通过了用户 user1 的反馈留言', ip: '127.0.0.1' },
    ];

    for (const log of logs) {
        await prisma.operationLog.create({ data: log });
    }

    console.log('Seeding completed successfully!');
    console.log(`- Created ${worksData.length} works`);
    console.log(`- Created ${logs.length} operation logs`);
    console.log(`- Created ${messages.length} messages`);
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
