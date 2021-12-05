import { ChangeEvent, useEffect, useState } from 'react';
import { GetServerSidePropsContext } from 'next';
import { URLSearchParams } from 'url';

import Hero from '@/components/hero';

interface Props {
	matches: any[];
	maps: any[];
	query: {
		hero: string;
		map: string;
	};
}

const Search = ({ matches, maps, query }: Props) => {
	const [formState, setFormState] = useState({ hero: '', map: '' });

	useEffect(() => query && setFormState(query), [query]);

	const form_value_changed = (event: ChangeEvent<HTMLSelectElement>) => {
		const form_field: string = event.target.name;
		setFormState({
			...formState,
			[form_field]: event.target.value,
		});
	};

	return (
		<div>
			<form>
				<select name="hero" value={formState.hero} onChange={form_value_changed}>
					<option value={undefined} disabled selected>
						Select hero
					</option>
					<optgroup label="Space Marines">
						<option value="1">Force Commander</option>
						<option>Apothecary</option>
						<option>Techmarine</option>
					</optgroup>
					<optgroup label="Chaos Space Marines">
						<option>Chaos Lord</option>
						<option>Chaos Sorcerer</option>
						<option>Plague Champion</option>
					</optgroup>
					<optgroup label="Eldar">
						<option>Warlock</option>
						<option>Farseer</option>
						<option>Warpspider Exarch</option>
					</optgroup>
					<optgroup label="Tyranids">
						<option>Hive Tyrant</option>
						<option>Lictor Alpha</option>
						<option>Ravener Alpha</option>
					</optgroup>
					<optgroup label="Imperial Guard">
						<option>Inquisitor</option>
						<option>Lord General</option>
						<option>Lord Commissar</option>
					</optgroup>
					<optgroup label="Orks">
						<option>Kommando Nob</option>
						<option>Mekboy</option>
						<option>Warboss</option>
					</optgroup>
					<optgroup label="Ordo Malleus">
						<option>Brother Captain</option>
						<option>Daemonhunter</option>
						<option>Eversor Assassin</option>
					</optgroup>
				</select>
				<select name="map" value={formState.map} onChange={form_value_changed}>
					{maps &&
						maps.map((map: any) => (
							<option key={map.id} value={map.id}>
								{map.screen_name ?? 'no map name'}
							</option>
						))}
				</select>

				{/* <input type="date" name="date" /> */}
				<button
					type="submit"
					className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
				>
					Search
				</button>
			</form>

			{matches && (
				<div>
					<h3>Results:</h3>
					<ResultTable rowData={matches} />
				</div>
			)}
		</div>
	);
};

export async function getServerSideProps(context: GetServerSidePropsContext) {
	const maps_response = await fetch(
		`${process.env.API_URL}:${process.env.PORT}${process.env.BASE_PATH}/api/maps`
	);
	const { maps } = await maps_response.json();

	// if query is set on context we have search parameters
	if (Object.keys(context.query).length) {
		// Assemble query - beware: we use || because '' is truthy when using ?? but not with || (JavaScript ftw)
		const hero: string | undefined = (context.query?.hero as string) || undefined;
		const map: string | undefined = (context.query?.map as string) || undefined;

		const search_params = new URLSearchParams();

		hero && search_params.append('hero', hero);
		map && search_params.append('map', map);

		if (Array.from(search_params).length) {
			const query_response = await fetch(
				`${process.env.API_URL}:${process.env.PORT}${process.env.BASE_PATH}/api/search?` + search_params
			);
			const { matches } = await query_response.json();

			return {
				props: {
					matches,
					maps: maps ? maps.filter((map: any) => map.player_count === 2) : [],
					query: { hero: hero ?? '', map: map ?? '' },
				},
			};
		}
	}

	return {
		props: { maps: maps ? maps.filter((map: any) => map.player_count === 2) : [] },
	};
}

export default Search;

const ResultTable = ({ rowData }: { rowData: any[] }) => {
	return (
		<div className="flex flex-col">
			<div className="-my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
				<div className="py-2 align-middle inline-block w-7/12 sm:px-6 lg:px-8">
					<div className="shadow overflow-hidden border-b border-gray-200 sm:rounded-lg">
						<table className="min-w-full divide-y divide-gray-500">
							<thead className="bg-gray-100">
								<tr>
									<th
										scope="col"
										className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
									>
										Date
									</th>
									<th
										scope="col"
										className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
									>
										Player 1
									</th>
									<th
										scope="col"
										className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
									>
										Hero
									</th>
									<th
										scope="col"
										className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
									>
										Player 2
									</th>
									<th
										scope="col"
										className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
									>
										Hero
									</th>
									<th
										scope="col"
										className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
									>
										Map
									</th>
									<th scope="col" className="relative px-6 py-3">
										<span className="sr-only">Edit</span>
									</th>
								</tr>
							</thead>
							<tbody className="bg-gray-100 divide-y divide-gray-500">
								{rowData.map((match) => (
									<tr key={match.id}>
										<td className="px-6 py-4 whitespace-nowrap">
											<span className="text-sm text-gray-700">
												{new Date(match.unix_utc_time * 1000).toLocaleString('de-DE', {
													year: 'numeric',
													month: '2-digit',
													day: '2-digit',
													hour: '2-digit',
													minute: '2-digit',
													hour12: false,
												})}
											</span>
										</td>
										<td className="px-6 py-4 whitespace-nowrap">{match.p1_name}</td>
										<td className="px-6 py-4 whitespace-nowrap">
											<Hero hero={match.p1_hero} />
										</td>
										<td className="px-6 py-4 whitespace-nowrap">{match.p2_name}</td>
										<td className="px-6 py-4 whitespace-nowrap">
											<Hero hero={match.p2_hero} />
										</td>
										<td className="px-6 py-4 whitespace-nowrap">{match.map_name}</td>
										<td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
											<a href="#" className="text-indigo-600 hover:text-indigo-900">
												View
											</a>
										</td>
									</tr>
								))}
							</tbody>
						</table>
					</div>
				</div>
			</div>
		</div>
	);
};
