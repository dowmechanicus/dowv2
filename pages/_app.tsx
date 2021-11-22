import 'tailwindcss/tailwind.css';
import '../styles/globals.css';
import type { AppProps } from 'next/app';
import Navigation from '@/components/navigation';

function MyApp({ Component, pageProps }: AppProps) {
	return (
		<div className="">
			<Navigation />
			<div className="ml-20 flex pt-16 justify-center">
				<Component {...pageProps} />
			</div>
		</div>
	);
}

export default MyApp;
