import { AgGridColumn, AgGridReact } from 'ag-grid-react';

import 'ag-grid-community/dist/styles/ag-grid.css';
import 'ag-grid-community/dist/styles/ag-theme-alpine.css';
import { useState } from 'react';
import {
	FirstDataRenderedEvent,
	GridApi,
	GridReadyEvent,
	IDatasource,
	IGetRowsParams,
	RowDataChangedEvent,
} from 'ag-grid-community';

const Players = () => {
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
	};

	const datasource: IDatasource = {
		getRows: async (params: IGetRowsParams) => {
			try {
				const offset =
					Math.floor(params.startRow / (gridApi?.paginationGetPageSize() ?? 10)) *
					(gridApi?.paginationGetPageSize() ?? 25);
				const size = gridApi?.paginationGetPageSize() ?? 25;

				const res = await fetch(`http://localhost:3000/api/players?offset=${offset}&size=${size}`);
				const { content, totalElements } = await res.json();

				params.successCallback(content, totalElements[0].totalElements);
			} catch (e) {
				params.failCallback();
			}
		},
	};

	return (
		<div
			className="ag-theme-alpine"
			style={{
				width: '100%',
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
			>
				<AgGridColumn field="relic_id"></AgGridColumn>
				<AgGridColumn field="last_steam_name"></AgGridColumn>
				<AgGridColumn field="glicko_rating"></AgGridColumn>
			</AgGridReact>
		</div>
	);
};

export default Players;
