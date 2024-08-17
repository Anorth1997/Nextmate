export interface CharacterRoleType {
	id: string;
	name: string;
	avatar: string;
	level: number;
	experience: number;
	experienceToNextLevel: number;
	backgroundImage: string;
	character: {
		intimacy: number;
		leisure: number;
		ability: number;
		background: string;
		backgroundStory: string;
		personalityTags: string[];
		specialAbilities: string[];
		fatigueValue: number;
		attributes: {
			[key: string]: number;
		};
		backgroundImage: string;
		introduction: string;
	};
	// equipments
}

export interface CharacterEndPoint {
	id: { $oid: string };
	name: string;
	avatar: string;
	backgroundImage: string;
	openingStatement: string;
	backgroundStory: string;
	level: { $numberLong: string };
	experience: { $numberLong: string };
	nextLevelRequired: { $numberLong: string };
	settings: {
		personality: string;
		likes: string[];
		dislikes: string[];
		goals: string;
		quirks: string[];
		background: string;
	};
	isPaid: boolean;
	personalityTags: string[];
	specialAbilities: string[];
	attributes: {
		strength: { $numberInt: string };
		intelligence: { $numberInt: string };
		charisma: { $numberInt: string };
	};
	intimacy: { $numberLong: string };
	ability: { $numberLong: string };
	fatigueValue: { $numberLong: string };
	leisure: { $numberLong: string };
	templateId: { $oid: string };
	milestoneStoryIds: { $oid: string }[];
	lotteryStoryIds: { $oid: string }[];
}

export interface UserCharacterEndPoint {
	id: { $oid: string };
	userId: { $oid: string };
	characterId: { $oid: string };
	level: { $numberLong: string };
	experience: { $numberLong: string };
	intimacy: { $numberLong: string };
	ability: { $numberLong: string };
	fatigueValue: { $numberLong: string };
	leisure: { $numberLong: string };
	lastLevelUpTime: { $date: { $numberLong: string } };
	backgroundImage: string | null;
	experienceToNextLevel: { $numberLong: string };
	skills: string[];
	achievements: string[];
	lastInteractionDate: { $date: { $numberLong: string } };
	favoriteTopics: string[];
	currentMilestone: { $numberLong: string };
	customOpeningStatement: string | null;
	customBackgroundStory: string | null;
	customSettings: any | null;
	lastLeaveDate: { $date: { $numberLong: string } };
}

export interface UserCharacterWithDetailsEndPoint
	extends UserCharacterEndPoint {
	character: CharacterEndPoint;
}
