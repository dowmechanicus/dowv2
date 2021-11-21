import { GetServerSidePropsContext } from 'next';
import { URLSearchParams } from 'url';

import { AgGridColumn, AgGridReact } from 'ag-grid-react';

import 'ag-grid-community/dist/styles/ag-grid.css';
import 'ag-grid-community/dist/styles/ag-theme-alpine.css';
import {
	FirstDataRenderedEvent,
	GridReadyEvent,
	RowDataChangedEvent,
	ValueFormatterParams,
} from 'ag-grid-community';
import { useEffect, useState } from 'react';

const Search = ({ matches, maps, query }) => {
	const [formState, setFormState] = useState({ hero: '', map: '' });

	useEffect(() => query && setFormState(query), []);

	const onGridReady = (params: GridReadyEvent) => {
		window.addEventListener('resize', function () {
			setTimeout(function () {
				params.api.sizeColumnsToFit();
			});
		});
	};

	const onRowDataChanged = (params: RowDataChangedEvent) => params.api?.sizeColumnsToFit();

	const onFirstDataRendered = (params: FirstDataRenderedEvent) => {
		params.api.sizeColumnsToFit();
		params.api.resetRowHeights();
	};

	const timestampFormatter = (params: ValueFormatterParams) => new Date(params.value * 1000).toLocaleString();

	const form_value_changed = (event) => {
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
				<button type="reset">Reset</button>
				<button type="submit">Search</button>
			</form>

			{matches && (
				<div>
					<h3>Results:</h3>
					<div
						className="ag-theme-alpine"
						style={{
							margin: '0 auto',
							width: '80vw',
							height: '80vh',
						}}
					>
						<AgGridReact
							rowData={matches}
							// domLayout={'autoHeight'}
							onGridReady={onGridReady}
							onRowDataChanged={onRowDataChanged}
							onFirstDataRendered={onFirstDataRendered}
							suppressCellSelection={true}
						>
							<AgGridColumn
								headerName={'Date'}
								field="unix_utc_time"
								valueFormatter={timestampFormatter}
							></AgGridColumn>
							<AgGridColumn headerName={'Player 1'} field="p1_name"></AgGridColumn>
							<AgGridColumn headerName={'Hero'} field="p1_hero"></AgGridColumn>
							<AgGridColumn headerName={'Player 2'} field="p2_name"></AgGridColumn>
							<AgGridColumn headerName={'Hero'} field="p2_hero"></AgGridColumn>
							<AgGridColumn headerName={'Map'} field="map_name"></AgGridColumn>
						</AgGridReact>
					</div>
				</div>
			)}
		</div>
	);
};

export async function getServerSideProps(context: GetServerSidePropsContext) {
	const maps_response = await fetch('http://localhost:3000/api/maps');
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
			const query_response = await fetch('http://localhost:3000/api/search?' + search_params);
			const { matches } = await query_response.json();

			return {
				props: {
					matches,
					maps: maps.filter((map: any) => map.player_count === 2),
					query: { hero: hero ?? '', map: map ?? '' },
				},
			};
		}
	}

	return {
		props: { maps: maps.filter((map: any) => map.player_count === 2) },
	};
}

export default Search;
