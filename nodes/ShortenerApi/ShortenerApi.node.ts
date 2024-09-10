import {
	IExecuteFunctions,
	INodeExecutionData,
	INodeType,
	INodeTypeDescription,
	NodeOperationError,
} from 'n8n-workflow';

export class ShortenerApi implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'Shortener API',
		name: 'shortenerApi',
		icon: 'file:shortener.svg',
		group: ['transform'],
		version: 1,
		subtitle: '={{$parameter["operation"] + ": " + $parameter["resource"]}}',
		description: 'Shorten URLs using the Shortener API',
		defaults: {
			name: 'Shortener API',
		},
		inputs: ['main'],
		outputs: ['main'],
		credentials: [
			{
				name: 'shortenerApi',
				required: true,
			},
		],
		properties: [
			{
				displayName: 'URL to Shorten',
				name: 'url',
				type: 'string',
				default: '',
				placeholder: 'Enter the URL to shorten',
				required: true,
			},
			{
				displayName: 'Custom Alias',
				name: 'custom',
				type: 'string',
				default: '',
				placeholder: 'Custom alias for the short URL (optional)',
			},
			{
				displayName: 'Password',
				name: 'password',
				type: 'string',
				default: '',
				placeholder: 'Password protect the link (optional)',
			},
			{
				displayName: 'Expiry Date',
				name: 'expiry',
				type: 'string',
				default: '',
				placeholder: '2021-09-28 23:11:16 (optional)',
				description: 'Set an expiration date for the shortened link',
			},
		],
	};

	// Método responsável por executar a lógica do encurtamento de URL
	async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
		const items = this.getInputData();
		const returnData: INodeExecutionData[] = [];

		for (let itemIndex = 0; itemIndex < items.length; itemIndex++) {
			try {
				const url = this.getNodeParameter('url', itemIndex, '') as string;
				const custom = this.getNodeParameter('custom', itemIndex, '') as string;
				const password = this.getNodeParameter('password', itemIndex, '') as string;
				const expiry = this.getNodeParameter('expiry', itemIndex, '') as string;

				// Recuperar as credenciais da API
                const credentials = await this.getCredentials('shortenerApi') as { apiKey: string };

				// Fazendo a requisição para a API de encurtamento de URL com credenciais
				const response = await this.helpers.request({
					method: 'POST',
					url: 'https://link.clientes.online/api/url/add',
					headers: {
						Authorization: `Bearer ${credentials.apiKey}`,
						'Content-Type': 'application/json',
					},
					body: {
						url,
						custom,
						password,
						expiry,
					},
					json: true,
				});

				// Extraindo o URL encurtado da resposta
				const shortenedUrl = response.shorturl;

				// Adicionando o URL encurtado ao resultado
				const newItem: INodeExecutionData = {
					json: {
						shortenedUrl,
					},
				};
				returnData.push(newItem);

			} catch (error) {
				if (this.continueOnFail()) {
					returnData.push({ json: this.getInputData(itemIndex)[0].json, error, pairedItem: itemIndex });
				} else {
					throw new NodeOperationError(this.getNode(), error, {
						itemIndex,
					});
				}
			}
		}

		return [returnData];
	}
}

module.exports = {
	ShortenerApi,
};
