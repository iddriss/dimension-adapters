import { FetchResult, SimpleAdapter } from "../../adapters/types";
import { CHAIN } from "../../helpers/chains";
import { gql, request } from "graphql-request";
import { getUniqStartOfTodayTimestamp } from "../../helpers/getUniSubgraphVolume";
import * as sdk from "@defillama/sdk";

interface IGraph {
	totalFeesEth: string;
	totalFeesUsdc: string;
	id: string;
}

const URL = 'https://api.studio.thegraph.com/query/43986/pingu-sg/0.1.0';

const fetch = async (timestamp: number): Promise<FetchResult> => {
	const dayTimestamp = getUniqStartOfTodayTimestamp(new Date(timestamp * 1000));
	const chain = CHAIN.ARBITRUM;
	const balances = new sdk.Balances({ chain, timestamp });
	const query = gql`
    {
			dayData(id: ${dayTimestamp * 1000}) {
				totalFeesEth
				totalFeesUsdc
				id
			}
		}`

	const response: IGraph = (await request(URL, query)).dayData;
	const element = response;

	balances._add('0xaf88d065e77c8cc2239327c5edb3a432268e5831', element.totalFeesUsdc);
	balances._add('0x82af49447d8a07e3bd95bd0d56f35241523fbab1', element.totalFeesEth);

	return {
		dailyFees: await balances.getUSDString(),
		timestamp: dayTimestamp,
	};
}

const adapter: SimpleAdapter = {
	adapter: {
		[CHAIN.ARBITRUM]: {
			fetch: fetch,
			start: async () => 1704844800,
		},
	},
};

export default adapter;
