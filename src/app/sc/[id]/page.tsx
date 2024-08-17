'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useSelector } from 'react-redux';
import ChatMessage from '@/app/_components/ChatMessage/ChatMessage';
import { COIN_SVG } from '@/assets/icon/coin.svg';
import {
	ChevronLeft,
	Eye,
	EyeOff,
	History,
	Mic,
	PhoneOff,
	Podcast,
} from 'lucide-react';
import { withAuth } from '@/app/_components/withAuth/withAuth';
import { ChatMessage as ChatMessageType } from '@/types/chat.type';
import { RootState } from '@/store/store';
import { useStoryRecordVoice } from '@/hooks/useStoryChatRecord';
import { useStoryChatHistory } from '@/hooks/useStoryChatHistory';
import { useStory } from '@/hooks/useStoryDetail';
import ActionModal from '@/app/_components/ActionModal/ActionModal';
import { useRoleList } from '@/hooks/useRoleList';

interface ActionButton {
	text: string;
	onClick: () => void;
}

const StoryCommunicate: React.FC = () => {
	const { id: storyId } = useParams();
	const userId = useSelector(
		(state: RootState) => state.accountInfo.account?.id!,
	);
	const [energy, setEnergy] = useState<number>();
	const [showMessage, setShowMessage] = useState<boolean>(true);
	const [isRecording, setIsRecording] = useState<boolean>(false);
	const [recordingTime, setRecordingTime] = useState<number>(0);
	const [transcript, setTranscript] = useState<string>('');
	const [isPressed, setIsPressed] = useState(false);
	const [chatData, setChatData] = useState<ChatMessageType[]>();
	const balanceSlice = useSelector((state: RootState) => state.balance);
	const chatContainerRef = useRef<HTMLDivElement>(null);
	const recordingIntervalRef = useRef<number | null>(null);
	const [isSending, setIsSending] = useState(false);
	const [showActionModal, setShowActionModal] = useState<boolean>(false);
	const [actions, setActions] = useState<ActionButton[]>();

	const {
		chatHistory,
		messageCount,
		options,
		loading,
		error,
		chatStatus,
		storyResult,
		resultImage,
	} = useStoryChatHistory(storyId as string);
	const { story, hasStory, characterId, isLoading, isError } = useStory(
		storyId as string,
	);
	const { characters, getCharacter } = useRoleList();
	const [status, setStatus] = useState<string>(chatStatus);

	const [bgUrl, setBgUrl] = useState<string>('');
	const {
		recording,
		startRecording,
		stopRecording,
		text,
		isTranscribing,
		error: recordingError,
	} = useStoryRecordVoice(storyId as string);

	const router = useRouter();

	const handleAction = async (_options: string[], index: number) => {
		console.log(`Option ${index} selected: ${_options[index]}`);
		setShowActionModal(false);
		const response = await fetch('/api/story/complete', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
			},
			body: JSON.stringify({
				storyId,
				selectedOptionIndex: index,
			}),
		});
		const data = await response.json();
		setChatData([
			...chatData,
			{ role: 'user', content: data.userAnswer },
			{ role: 'assistant', content: data.systemAnswer },
		]);
		setBgUrl(`url('/img/${data.newBackgroundImage}.png')`);
		//   {
		//     "userAnswer": "I had a wonderful time too, Lucy. I think I’ll stay a bit longer and browse some more. Thanks for the lovely company and enjoy your book!",
		//     "systemAnswer": "That sounds like a great plan. Enjoy your time here and happy reading! Let’s definitely do this again sometime soon. Take care!",
		//     "newBackgroundImage": "Story3-answer1"
		// }

		// console.log('response', response);
		// console.log('chatData', chatData);
	};

	const handleSendMessage = async () => {
		if (transcript.trim() && !isSending) {
			setIsSending(true);
			// 在这里调用发送消息的函数
			setTranscript('');
			// 设置经验值
		}
	};

	const MessageSkeleton: React.FC = () => (
		<div className="mb-4 flex animate-pulse justify-end">
			<div className="max-w-[70%] rounded-lg bg-gray-300 p-3">
				<div className="mb-2 h-4 w-44 rounded bg-gray-400"></div>
				<div className="h-4 w-44 rounded bg-gray-400"></div>
			</div>
		</div>
	);

	const renderSkeletonLoader = () => {
		return (
			<>
				<div className="mb-4 flex animate-pulse justify-start">
					<div className="max-w-[70%] rounded-lg bg-gray-300 p-3">
						<div className="mb-2 h-4 w-44 rounded bg-gray-400"></div>
						<div className="h-4 w-44 rounded bg-gray-400"></div>
					</div>
				</div>
				<div className="mb-4 flex animate-pulse justify-end">
					<div className="max-w-[70%] rounded-lg bg-gray-300 p-3">
						<div className="mb-2 h-4 w-44 rounded bg-gray-400"></div>
						<div className="h-4 w-44 rounded bg-gray-400"></div>
					</div>
				</div>
				<div className="mb-4 flex animate-pulse justify-start">
					<div className="max-w-[70%] rounded-lg bg-gray-300 p-3">
						<div className="mb-2 h-4 w-44 rounded bg-gray-400"></div>
						<div className="h-4 w-44 rounded bg-gray-400"></div>
					</div>
				</div>
			</>
		);
	};

	const renderChatMessages = () => {
		if (!chatData) return null;
		return (
			<>
				{chatData.map((message, index) => (
					<ChatMessage
						key={`${message.content}-${index}`}
						content={message.content}
						time={message?.time}
						type={message.role === 'user' ? 'sent' : 'received'}
						disable
					/>
				))}
			</>
		);
	};

	// 获取能量值
	useEffect(() => {
		const startRest = async () => {
			await fetch('/api/energy/start', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify({}),
			});
		};

		const stopRest = async () => {
			const rlt = await fetch('/api/energy/end', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify({}),
			});
			const data = await rlt.json();
			console.log('--->', data, data.energy);
			setEnergy(data.energy);
		};

		// 页面加载时停止能量增长
		stopRest();

		// 页面卸载时恢复能量增长
		return () => {
			startRest();
		};
	}, []);

	useEffect(() => {
		const character = getCharacter(characterId as string);
		console.log('character', character);
		setStatus(chatStatus);
		if (chatStatus == 'FINISHED') {
			setBgUrl(`url('/img/${resultImage}.png')`);
		} else {
			setBgUrl(`url('/img/${story?.backgroundImage?.[0]}.png')`);
		}
		console.log(status, bgUrl);
	}, [chatStatus, characterId, story]);

	// actions 选项
	useEffect(() => {
		if (status === 'COMPLETE' && options && options.length > 0) {
			setShowActionModal(true);
			const actions: ActionButton[] = options.map((option, index) => ({
				text: option,
				onClick: () => {
					handleAction(options, index).catch(error => {
						console.error('Error handling action:', error);
						// 这里可以添加错误处理逻辑
					});
				},
			}));
			setActions(actions);
		}
	}, [status, options]);

	// 滚动到底部
	useEffect(() => {
		// 页面加载时停止能量增长

		if (chatContainerRef.current) {
			chatContainerRef.current.scrollTop =
				chatContainerRef.current.scrollHeight;
		}
		if (status == 'NORMAL' && chatData && chatData.length > 30) {
			setStatus('COMPLETE');
		}
	}, [chatData, isSending]);

	// 文字消息
	useEffect(() => {
		if (text) {
			setIsSending(false);
			setChatData(text);
			const updateEnergy = async () => {
				const rlt = await fetch('/api/energy/end', {
					method: 'POST',
					headers: {
						'Content-Type': 'application/json',
					},
					body: JSON.stringify({}),
				});
				const data = await rlt.json();
				console.log('--->', data, data.energy);
				setEnergy(data.energy);
			};

			updateEnergy();
		} else {
			//@ts-expect-error 暂 时 忽 略
			setChatData(chatHistory);
		}
	}, [chatHistory, text]);

	return (
		<div
			className="flex h-[100vh] w-full flex-col bg-cover bg-center"
			style={
				story && story.backgroundImage?.[0] && bgUrl
					? { backgroundImage: bgUrl }
					: {}
			}
		>
			{/* 顶部栏，包含金币数量 */}
			<div className="absolute flex w-full justify-between px-4 pt-4">
				<ChevronLeft
					size={32}
					color="white"
					onClick={() => {
						router.push('/stories');
					}}
				/>
				{/* story.condition && <CornerUpRight size={32} color='white' /> */}
			</div>

			{/* 金币数量 */}
			<div className="flex w-full items-center justify-end bg-opacity-50 p-4">
				<div className="flex items-center justify-end gap-2 rounded-full bg-gray-400 py-1 pl-1 pr-4 text-white">
					<img src={COIN_SVG} width={24} height={24} alt="Coin" />
					<span>{energy}</span>
				</div>
			</div>

			{/* 中间聊天记录 */}
			<div
				ref={chatContainerRef}
				className={`no-scrollbar flex-1 space-y-4 overflow-y-auto p-4 ${
					showMessage ? '' : 'opacity-0'
				}`}
			>
				{loading ? renderSkeletonLoader() : renderChatMessages()}
				{isSending && <MessageSkeleton key="temp-skeleton" />}
			</div>

			{status === 'COMPLETE' && showActionModal && (
				<ActionModal
					actions={actions!}
					onCancel={() => setShowActionModal(false)}
				/>
			)}

			{/* 底部操作栏 */}
			{status != 'FINISHED' && status != 'COMPLETE' && (
				<div className="flex items-center justify-center gap-8 bg-opacity-50 p-4">
					<div onClick={() => setShowMessage(!showMessage)}>
						{showMessage ? (
							<EyeOff size={40} color="white" />
						) : (
							<Eye size={40} color="white" />
						)}
					</div>
					<div
						className={`h-12 w-12 rounded-full ${
							!isRecording ? 'bg-green-600' : 'bg-gray-400'
						} flex items-center justify-center`}
						onTouchStart={async e => {
							e.preventDefault();
							if (!isRecording) {
								setIsSending(true);
								setIsPressed(true);
								await startRecording();
								setIsRecording(true);
								setRecordingTime(0);
							}
						}}
						onTouchEnd={async e => {
							e.preventDefault();
							if (isRecording) {
								setIsPressed(false);
								await stopRecording();
								setIsRecording(false);
								await handleSendMessage();
							}
						}}
						onTouchCancel={async e => {
							e.preventDefault();
							if (isPressed && isRecording) {
								setIsPressed(false);
								await stopRecording();
								setIsRecording(false);
								await handleSendMessage();
							}
						}}
					>
						{isPressed ? <Podcast color="white" /> : <Mic color="white" />}
					</div>
					<div
						className="flex h-12 w-12 items-center justify-center rounded-full bg-custom-red-005"
						onClick={() => {
							router.push('/roles/v1');
						}}
					>
						<PhoneOff color="white" />
					</div>
					<div>
						<History size={40} color="white" />
					</div>
				</div>
			)}
		</div>
	);
};

export default withAuth(StoryCommunicate);
