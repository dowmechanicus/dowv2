import '../styles/globals.css'
import 'tailwindcss/tailwind.css';
import type { AppProps } from 'next/app';
import Navigation from '@/components/navigation';

function MyApp({ Component, pageProps }: AppProps) {
	return (
		<>
			<Navigation />
			<div className="ml-20">
				<Component {...pageProps} />
			</div>
		</>
	);
}

export default MyApp
