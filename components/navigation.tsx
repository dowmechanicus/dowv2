import Link from 'next/link';
import { Menu } from 'semantic-ui-react';

import 'semantic-ui-css/semantic.min.css';

const Navigation = ({ Component }: any) => {
	return (
		<div style={{ margin: '1rem' }}>
			<Menu pointing>
				<Link href="/" passHref>
					<Menu.Item name="home" />
				</Link>
				<Link href="/matches" passHref>
					<Menu.Item name="matches" />
				</Link>
				<Link href="/ladder" passHref>
					<Menu.Item name="ladder" />
				</Link>
				<Link href="/search" passHref>
					<Menu.Item name="find games" />
				</Link>
				<Menu.Menu position="right"></Menu.Menu>
			</Menu>

			{Component}
		</div>
	);
};

export default Navigation;
