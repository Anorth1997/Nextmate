'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useSelector } from 'react-redux';
import ChatMessage from '@/app/_components/ChatMessage/ChatMessage';
import { COIN_SVG } from '@/assets/icon/coin.svg';
import {
	Coffee,
	Eye,
	EyeOff,
	History,
	Mic,
	PhoneOff,
	Podcast,
	Send,
} from 'lucide-react';
import { HANGOUT_SVG } from '@/assets/icon/hangout.svg';
import { useRecordVoice } from '@/hooks/useRecordVoice';
import { withAuth } from '@/app/_components/withAuth/withAuth';
import { useChatHistory } from '@/hooks/useChatHistory';
import { ChatStatus, ChatMessage as ChatMessageType } from '@/types/chat.type';
import { RootState } from '@/store/store';
import ActionModal from '@/app/_components/ActionModal/ActionModal';
import { setBalance } from 'viem/actions';
import fetchAPI from '@/lib/api';
import ChatActionModal, {
	ChatActionButton,
} from '@/app/_components/ChatActionModal/ChatActionModal';

function getRandomArrayElement<T>(arr: T[]): T {
	if (arr.length === 0) {
		throw new Error('Array cannot be empty');
	}

	return arr[Math.floor(Math.random() * arr.length)];
}

const Communicate: React.FC = () => {
	const { id: characterId } = useParams();
	const userId = useSelector(
		(state: RootState) => state.accountInfo.account?.id!,
	);
	const {
		chatHistory,
		sendMessage,
		status,
		chatId,
		isLoading,
		backgroundImage,
	} = useChatHistory(userId, characterId as string);
	const [energy, setEnergy] = useState<number>();
	const [showMessage, setShowMessage] = useState<boolean>(true);
	const [isRecording, setIsRecording] = useState<boolean>(false);
	const [recordingTime, setRecordingTime] = useState<number>(0);
	const [transcript, setTranscript] = useState<string>('');
	const [isPressed, setIsPressed] = useState(false);
	const {
		recording,
		startRecording,
		stopRecording,
		text,
		isTranscribing,
		error,
	} = useRecordVoice(characterId as string);
	const [chatData, setChatData] = useState<ChatMessageType[]>();
	const [showActionModal, setShowActionModal] = useState<boolean>(false);
	const [actions, setActions] = useState<ChatActionButton>(null);
	const balanceSlice = useSelector((state: RootState) => state.balance);
	const chatContainerRef = useRef<HTMLDivElement>(null);
	const recordingIntervalRef = useRef<number | null>(null);
	const [isSending, setIsSending] = useState(false);
	const [balance, setBalance] = useState<{
		diamond: number;
		gold: number;
		energy: number;
	} | null>(null);

	const router = useRouter();

	const handleSendMessage = async () => {
		// 我看了，transcript 现在没用，send 也没有，在语音之后就发送
		if (transcript.trim() && !isSending) {
			setIsSending(true);
			await sendMessage(transcript);
			setTranscript('');
		}
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
					/>
				))}
			</>
		);
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

	useEffect(() => {
		if (chatContainerRef.current) {
			chatContainerRef.current.scrollTop =
				chatContainerRef.current.scrollHeight;
		}
	}, [chatData, isSending]);

	useEffect(() => {
		const fetchAndSetBalance = async () => {
			if (userId) {
				try {
					// 使用 fetchAPI 获取余额
					const response = await fetchAPI('/api/balance/get', {
						method: 'GET',
						params: { userId: userId },
					});
					setBalance(response); // 假设 API 返回的对象中有一个 balance 字段
					setEnergy(response.energy);
					console.log('balance', response);
				} catch (error) {
					console.error('Failed to fetch balance:', error);
				}
			}
		};

		fetchAndSetBalance();
	}, [userId]);

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
			setChatData(chatHistory);
		}
	}, [chatHistory, text]);

	useEffect(() => {
		//无需求事件
		const dailyInteraction = [
			{
				text: "Hi there! I'm feeling a bit thirsty right now. Would you like to take a break and have a cup of coffee or tea with me?",
				options: [
					{
						option: 'Drink water',
						text: 'I just want a bottle of water',
						type: 'water',
					},
					{
						option: 'A cup of coffee',
						text: 'Great idea! I could really use a cup of coffee.',
						type: 'coffee',
					},
					{
						option: 'I prefer tea',
						text: "I prefer tea, let's have some tea together!",
						type: 'tea',
					},
				],
			},

			{
				text: "Hi! I'm feeling a bit hungry and thinking of going to the convenience store to grab something to eat. Want to join me? We can pick out some tasty snacks together!",
				options: [
					{
						option: 'Get some snacks',
						text: "Sure, I'm hungry too! Let's get some snacks.",
						type: 'snacks',
					},
					{
						option: 'Get a sandwich',
						text: "Sounds good! I'd like to get a sandwich.",
						type: 'sandwich',
					},
					{
						option: 'Grab some desserts',
						text: "I prefer sweets, let's see what desserts they have.",
						type: 'desserts',
					},
				],
			},

			{
				text: 'Hi there! I was thinking of going to the mall for a bit of shopping. How about joining me? Which mode of transportation would you prefer – taxi,subway, or bus?',
				options: [
					{
						option: "Let's take a taxi.",
						text: "Let's take a taxi. It's quick and convenient.",
						type: 'taxi',
					},
					{
						option: 'I prefer the subway',
						text: "2.	I prefer the subway. It's fast and avoids traffic.",
						type: 'subway',
					},
					{
						option: 'How about the bus',
						text: "How about the bus? It's economical and we can enjoy the view.",
						type: 'bus',
					},
				],
			},
		];
		// 有需求事件
		const quantitativeNeeds = [];

		const timer = setTimeout(() => {
			setShowActionModal(true);
			const randomElement = getRandomArrayElement(dailyInteraction);
			setActions(randomElement);
		}, 30000);
		return () => clearTimeout(timer);
	}, []);

	return (
		<div
			className="flex h-[100vh] w-full flex-col bg-cover bg-center"
			style={
				backgroundImage
					? { backgroundImage: `url('/img/${backgroundImage}.png')` }
					: {}
			}
		>
			{/* 顶部栏，包含金币数量 */}
			<div className="flex w-full items-center justify-end bg-opacity-50 p-4">
				<div className="flex justify-center rounded-xl border border-gray-300 px-4 py-1">
					<img src={'/img/energy.png'} width={24} height={24} />
					<div className="ml-2">{energy}</div>
				</div>
			</div>

			{/* 中间聊天记录 */}
			<div
				ref={chatContainerRef}
				className={`no-scrollbar flex-1 space-y-4 overflow-y-auto p-4 ${
					showMessage ? '' : 'opacity-0'
				}`}
			>
				{isLoading ? renderSkeletonLoader() : renderChatMessages()}
				{isSending && <MessageSkeleton key="temp-skeleton" />}
			</div>
			{showActionModal && (
				<ChatActionModal
					actions={actions}
					onCancel={() => setShowActionModal(false)}
				/>
			)}

			{/* 底部操作栏 */}
			<div className="flex items-center justify-center gap-8 bg-opacity-50 p-4">
				<div onClick={() => setShowMessage(!showMessage)}>
					{showMessage ? <EyeOff size={40} /> : <Eye size={40} />}
				</div>
				<div
					className={`h-12 w-12 rounded-full ${
						isRecording ? 'bg-red-600' : 'bg-green-600'
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
						if (isRecording) {
							setIsPressed(false);
							await stopRecording();
							setIsRecording(false);
							await handleSendMessage();
						}
					}}
				>
					{isRecording ? <Podcast color="white" /> : <Mic color="white" />}
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
		</div>
	);
};

export default withAuth(Communicate);
