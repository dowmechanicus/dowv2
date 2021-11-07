import { AgGridColumn, AgGridReact } from 'ag-grid-react';

import 'ag-grid-community/dist/styles/ag-grid.css';
import 'ag-grid-community/dist/styles/ag-theme-alpine.css';
import { useState } from 'react';
import {
	FirstDataRenderedEvent,
	GridApi,
	GridReadyEvent,
	ICellRendererParams,
	IDatasource,
	IGetRowsParams,
	RowClickedEvent,
	RowDataChangedEvent,
	ValueFormatterParams,
} from 'ag-grid-community';

const ratingsRenderer = (props: ICellRendererParams & { player: number }) => {
	const rating = props.player === 1 ? props.data?.p1_rating : props.data?.p2_rating;
	const outcome_rating = props.player === 1 ? props.data?.p1_outcome_rating : props.data?.p2_outcome_rating;
	return (
		<div style={{ display: 'flex', flexDirection: 'column' }}>
			<span style={{ flex: '1 1 100' }}>{rating}</span>
			<span style={{ flex: '1 1 100' }}>
				{rating < outcome_rating ? (
					<>
						<b>&nbsp;&#8599;&nbsp;</b>
					</>
				) : (
					<>
						<b>&nbsp;&#8600;&nbsp;</b>
					</>
				)}
			</span>
			<span style={{ flex: '1 1 100' }}>{outcome_rating}</span>
		</div>
	);
};

const Matches = () => {
	const [gridApi, setGridApi]: [GridApi | undefined, any] = useState();

	const onGridReady = (params: GridReadyEvent) => {
		setGridApi(params.api);

		window.addEventListener('resize', function () {
			setTimeout(function () {
				params.api.sizeColumnsToFit();
			});
		});
	};

	const onRowDataChanged = (params: RowDataChangedEvent) => {
		params.api.sizeColumnsToFit();
	};

	const onFirstDataRendered = (params: FirstDataRenderedEvent) => {
		params.api.sizeColumnsToFit();
		params.api.resetRowHeights();
	};

	const datasource: IDatasource = {
		getRows: async (params: IGetRowsParams) => {
			try {
				const offset = Math.floor(params.startRow / 25) * 25;

				const res = await fetch(`/api/matches?offset=${offset}`);
				const { content, totalElements } = await res.json();

				params.successCallback(content, totalElements[0].totalElements);
			} catch (e) {
				params.failCallback();
			}
		},
	};

	const frameWorkComponents = {
		ratingsRenderer: ratingsRenderer,
	};

	const timestampFormatter = (params: ValueFormatterParams) => {
		return new Date(params.value * 1000).toLocaleString();
	};

	return (
		<div
			className="ag-theme-alpine"
			style={{
				width: '80%',
			}}
		>
			<AgGridReact
				domLayout={'autoHeight'}
				onGridReady={onGridReady}
				onRowDataChanged={onRowDataChanged}
				onFirstDataRendered={onFirstDataRendered}
				pagination={true}
				suppressPaginationPanel={false}
				paginationPageSize={25}
				cacheBlockSize={25}
				maxBlocksInCache={1}
				maxConcurrentDatasourceRequests={1}
				rowModelType={'infinite'}
				datasource={datasource}
				frameworkComponents={frameWorkComponents}
				suppressCellSelection={true}
			>
				<AgGridColumn
					headerName={'Date'}
					field="unix_utc_time"
					valueFormatter={timestampFormatter}
				></AgGridColumn>
				<AgGridColumn headerName={'Player 1'} field="p1_name"></AgGridColumn>
				<AgGridColumn field="p1_hero"></AgGridColumn>
				<AgGridColumn
					field="rating"
					cellRenderer="ratingsRenderer"
					cellRendererParams={{ player: 1 }}
					wrapText={true}
					autoHeight={true}
				></AgGridColumn>
				<AgGridColumn headerName={'Player 2'} field="p2_name"></AgGridColumn>
				<AgGridColumn field="p2_hero"></AgGridColumn>
				<AgGridColumn
					field="rating"
					cellRenderer="ratingsRenderer"
					cellRendererParams={{ player: 2 }}
				></AgGridColumn>
			</AgGridReact>
		</div>
	);
};

export default Matches;
