import 'tailwindcss/tailwind.css';
import '../styles/globals.css';
import type { AppProps } from 'next/app';
import Navbar from '@/components/navbar';
import { createContext, useContext, useEffect, useState } from 'react';

export const ThemeContext = createContext(undefined as any);

function MyApp({ Component, pageProps }: AppProps) {
	const [theme, setTheme] = useState('dark');
	useEffect(() => document.querySelector('html')?.setAttribute('data-theme', theme), [theme]);

	return (
		<ThemeContext.Provider value={{ theme: [theme, setTheme] } as any}>
			<div data-theme={theme}>
				<Navbar />
				<div>
					<Component {...pageProps} />
				</div>
			</div>
		</ThemeContext.Provider>
	);
}

export default MyApp;
