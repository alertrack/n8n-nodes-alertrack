import { IExecuteFunctions } from 'n8n-workflow';

export async function contactAction(this: IExecuteFunctions) {
	const items = this.getInputData();
	const returnData: any[] = [];

	// Recupera o token da variável de fluxo
	const workflowData = this.getWorkflowStaticData('global');
	const token = workflowData.token;

	if (!token) {
		throw new Error('Token is missing. Please ensure it is set in a previous action.');
	}

	for (let i = 0; i < items.length; i++) {
		try {
			const page = this.getNodeParameter('page', i, 1) as number;

			const response = await this.helpers.request({
				method: 'GET',
				url: `https://api.sac.digital/v2/client/contact/all?p=${page}`,
				headers: {
					Authorization: `Bearer ${token}`,
				},
				json: true,
			});

			const newItem = {
				json: response,
			};

			returnData.push(newItem);

		} catch (error) {
			const errorMessage = error.response?.data?.message || error.message;
			if (this.continueOnFail()) {
				returnData.push({ json: this.getInputData(i)[0].json, error: errorMessage, pairedItem: i });
			} else {
				throw new Error(`Request failed with error: ${errorMessage}`);
			}
		}
	}

	return returnData;
}
