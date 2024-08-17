'use client';

import { SessionProvider } from 'next-auth/react';
import { Provider as ReduxProvider } from 'react-redux';
import { SnackbarProvider } from 'notistack';
import { RainbowConnector } from '@/lib/rainbowKit';
import store from '@/store/store';

export function ClientProviders({
	children,
	session,
}: {
	children: React.ReactNode;
	session: any;
}) {
	return (
		<ReduxProvider store={store}>
			<SnackbarProvider autoHideDuration={1000}>
				<RainbowConnector>
					<SessionProvider session={session}>{children}</SessionProvider>
				</RainbowConnector>
			</SnackbarProvider>
		</ReduxProvider>
	);
}
