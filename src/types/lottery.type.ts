export interface RewardTypes {
	id: string;
	name: string;
	type: 'decoration' | 'story';
	rewardId: string;
	star: number;
	description?: string;
	poolId: string;
	probability: number;
	storyId?: string | null;
	characterId?: string; // 添加这个字段
}
