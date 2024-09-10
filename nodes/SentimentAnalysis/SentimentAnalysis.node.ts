import {
	IExecuteFunctions,
	INodeExecutionData,
	INodeType,
	INodeTypeDescription,
	NodeOperationError,
} from 'n8n-workflow';

export class SentimentAnalysis implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'CO - Análise de Sentimento',
		name: 'sentimentAnalysis',
		icon: 'file:sentiment.svg',
		group: ['transformar'],
		version: 1,
		subtitle: '={{$parameter["operation"]}}',
		description: 'Analise o sentimento do texto',
		defaults: {
			name: 'Análise de Sentimento',
		},
		inputs: ['main'],
		outputs: ['main'],
		outputNames: ['Positivo', 'Neutro', 'Negativo'],
		properties: [
			{
				displayName: 'Texto Para Analisar',
				name: 'text',
				type: 'string',
				default: '',
				placeholder: 'Digite o texto para analisar',
				required: true,
			},
			{
				displayName: 'Idioma',
				name: 'language',
				type: 'string',
				default: 'pt_br',
				placeholder: 'ex. en, pt_br',
				description: 'O idioma do texto',
				required: true,
			},
		],
	};

	async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
		const items = this.getInputData();
		const returnDataPositive: INodeExecutionData[] = [];
		const returnDataNeutral: INodeExecutionData[] = [];
		const returnDataNegative: INodeExecutionData[] = [];

		for (let itemIndex = 0; itemIndex < items.length; itemIndex++) {
			try {
				const text = this.getNodeParameter('text', itemIndex, '') as string;
				const language = this.getNodeParameter('language', itemIndex, 'pt_br') as string;

				// Fazendo a requisição GET para a API de análise de sentimento
				const response = await this.helpers.request({
					method: 'GET',
					url: `http://192.168.0.210:8544/v1/polarity/unique/`,
					qs: {
						language: language,
						sentence: text,
					},
					json: true,
				});

				const polarity = response.polarity;
				const sentiment = polarity > 0 ? 'positivo' : polarity < 0 ? 'negativo' : 'neutro';

				// Adicionando o item ao respectivo output com base no sentimento
				const newItem: INodeExecutionData = {
					json: {
						text,
						sentiment,
						polarity,
						describe: response.describe,
					},
				};

				if (sentiment === 'positivo') {
					returnDataPositive.push(newItem);
				} else if (sentiment === 'negativo') {
					returnDataNegative.push(newItem);
				} else {
					returnDataNeutral.push(newItem);
				}

			} catch (error) {
				if (this.continueOnFail()) {
					returnDataNeutral.push({ json: this.getInputData(itemIndex)[0].json, error, pairedItem: itemIndex });
				} else {
					throw new NodeOperationError(this.getNode(), error, { itemIndex });
				}
			}
		}

		return [returnDataPositive, returnDataNeutral, returnDataNegative];
	}
}

module.exports = {
	SentimentAnalysis,
};
