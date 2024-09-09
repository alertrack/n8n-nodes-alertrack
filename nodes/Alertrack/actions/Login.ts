import { IExecuteFunctions } from 'n8n-workflow';

export async function loginAction(this: IExecuteFunctions) {
	const items = this.getInputData();
	const returnData: any[] = [];

	// Obtendo credenciais do usuário
	const credentials = await this.getCredentials('alertrackApi');
	const clientId = credentials.clientId as string;
	const clientSecret = credentials.clientSecret as string;

	for (let i = 0; i < items.length; i++) {
		try {
			const scopes = this.getNodeParameter('scopes', i, []) as string[];

			const response = await this.helpers.request({
				method: 'POST',
				url: 'https://api.sac.digital/v2/client/auth2/login',
				body: {
					client: clientId,
					password: clientSecret,
					scopes: scopes,
				},
				json: true,
			});

			// Armazenar o token na variável de fluxo
			const token = response.token; // Ajuste conforme o nome do campo

			// Armazena o token para uso futuro

			const workflowData = this.getWorkflowStaticData('global');

			workflowData.token = token;

			const newItem = {
				json: response,
			};

			returnData.push(newItem);

		} catch (error) {
			if (this.continueOnFail()) {
				returnData.push({ json: this.getInputData(i)[0].json, error, pairedItem: i });
			} else {
				throw new Error(`Error: ${error}`);
			}
		}
	}

	return returnData;
}
