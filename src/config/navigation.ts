import { BookOpen, Rocket, Gift, Target, PawPrint, Fish, Package } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'

export interface NavigationItem {
	key: string // 用于翻译键，如 'codes' -> t('nav.codes')
	path: string // URL 路径，如 '/codes'
	icon: LucideIcon // Lucide 图标组件
	isContentType: boolean // 是否对应 content/ 目录
}

export const NAVIGATION_CONFIG: NavigationItem[] = [
	{ key: 'guide', path: '/guide', icon: BookOpen, isContentType: true },
	{ key: 'release', path: '/release', icon: Rocket, isContentType: true },
	{ key: 'codes', path: '/codes', icon: Gift, isContentType: true },
	{ key: 'quests', path: '/quests', icon: Target, isContentType: true },
	{ key: 'pets', path: '/pets', icon: PawPrint, isContentType: true },
	{ key: 'fishing', path: '/fishing', icon: Fish, isContentType: true },
	{ key: 'items', path: '/items', icon: Package, isContentType: true },
]

// 从配置派生内容类型列表（用于路由和内容加载）
export const CONTENT_TYPES = NAVIGATION_CONFIG.filter((item) => item.isContentType).map(
	(item) => item.path.slice(1),
) // 移除开头的 '/' -> ['guide', 'release', 'codes', 'quests', 'pets', 'fishing', 'items']

export type ContentType = (typeof CONTENT_TYPES)[number]

// 辅助函数：验证内容类型
export function isValidContentType(type: string): type is ContentType {
	return CONTENT_TYPES.includes(type as ContentType)
}
