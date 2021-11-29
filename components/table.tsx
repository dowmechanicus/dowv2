import Pagination from '@/components/pagination';
import { PropsWithChildren } from 'react';

export function DowTable(props: PropsWithChildren<any>) {
	const { headers, totalElements }: { headers: string[]; totalElements: number } = props;
	return (
		<div className="py-2 align-middle inline-block w-8/12 sm:px-6 lg:px-8">
			<div className="shadow overflow-hidden border-b border-gray-200 sm:rounded-lg">
				<table className="min-w-full divide-y divide-gray-500">
					<thead className="bg-gray-100">
						<tr>
							{headers.map((header, index) => (
								<th
									key={`${header}_${index}`}
									scope="col"
									className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
								>
									{header}
								</th>
							))}
						</tr>
					</thead>
					<tbody className="bg-gray-100 divide-y divide-gray-500">{props.children}</tbody>
				</table>
				{totalElements ? <Pagination totalElements={totalElements} /> : null}
			</div>
		</div>
	);
}

export function DefaultField(props: PropsWithChildren<any>) {
	const { className } = props;

	return <td className={`${className} px-6 py-4 whitespace-nowrap`}>{props.children}</td>;
}
