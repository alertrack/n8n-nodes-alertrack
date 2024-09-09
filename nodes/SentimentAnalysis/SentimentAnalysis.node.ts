import {
	IExecuteFunctions,
	INodeExecutionData,
	INodeType,
	INodeTypeDescription,
	NodeOperationError,
} from 'n8n-workflow';

export class SentimentAnalysis implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'Sentiment Analysis',
		name: 'sentimentAnalysis',
		icon: 'file:sentiment.svg',
		group: ['transform'],
		version: 1,
		subtitle: '={{$parameter["operation"]}}',
		description: 'Analyze the sentiment of text',
		defaults: {
			name: 'Sentiment Analysis',
		},
		inputs: ['main'],
		outputs: ['main'],
		outputNames: ['Positivo', 'Neutro', 'Negativo'],
		properties: [
			{
				displayName: 'Text to Analyze',
				name: 'text',
				type: 'string',
				default: '',
				placeholder: 'Enter the text to analyze',
				required: true,
			},
			{
				displayName: 'Language',
				name: 'language',
				type: 'string',
				default: 'pt_br',
				placeholder: 'e.g. en, pt_br',
				description: 'The language of the text',
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
