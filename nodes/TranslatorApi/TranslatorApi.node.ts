import {
	IExecuteFunctions,
	INodeExecutionData,
	INodeType,
	INodeTypeDescription,
	NodeOperationError,
} from 'n8n-workflow';

export class TranslatorApi implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'CO - API de Tradutor',
		name: 'translatorApi',
		icon: 'file:translate.svg',
		group: ['transformar'],
		version: 1,
		subtitle: '={{$parameter["operation"] + ": " + $parameter["resource"]}}',
		description: 'Traduzir texto usando a API de Tradutor',
		defaults: {
			name: 'API de Tradutor',
		},
		inputs: ['main'],
		outputs: ['main'],
		// Remover o bloco de credenciais
		// credentials: [
		// 	{
		// 		name: 'translatorApi',
		// 		required: true,
		// 	},
		// ],
		properties: [
			{
				displayName: 'Texto Para Traduzir',
				name: 'text',
				type: 'string',
				default: '',
				placeholder: 'Digite o texto para traduzir',
				required: true,
			},
			{
				displayName: 'Idioma De Origem',
				name: 'sourceLanguage',
				type: 'string',
				default: 'auto',
				placeholder: 'ex: en, auto',
				description: 'O idioma do texto a ser traduzido. Use "auto" para detecção automática.',
				required: true,
			},
			{
				displayName: 'Idioma De Destino',
				name: 'targetLanguage',
				type: 'string',
				default: 'pt',
				placeholder: 'ex: pt, es',
				description: 'O idioma para o qual o texto será traduzido',
				required: true,
			},
		],
	};

	// Método responsável por executar a lógica de tradução
	async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
		const items = this.getInputData();
		const returnData: INodeExecutionData[] = [];

		for (let itemIndex = 0; itemIndex < items.length; itemIndex++) {
			try {
				const text = this.getNodeParameter('text', itemIndex, '') as string;
				const sourceLanguage = this.getNodeParameter('sourceLanguage', itemIndex, 'auto') as string;
				const targetLanguage = this.getNodeParameter('targetLanguage', itemIndex, 'pt') as string;

				// Fazendo a requisição para a API de tradução sem credenciais
				const response = await this.helpers.request({
					method: 'POST',
					url: 'http://192.168.0.105:3000/translate',
					body: {
						q: text,
						source: sourceLanguage,
						target: targetLanguage,
					},
					json: true,
				});

				// Extraindo o texto traduzido da resposta
				const translatedText = response.translatedText;

				// Adicionando o texto traduzido ao resultado
				const newItem: INodeExecutionData = {
					json: {
						translatedText,
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
    TranslatorApi,
};
