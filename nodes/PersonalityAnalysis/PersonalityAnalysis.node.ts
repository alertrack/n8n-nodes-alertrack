import {
	IExecuteFunctions,
	INodeExecutionData,
	INodeType,
	INodeTypeDescription,
	NodeOperationError,
} from 'n8n-workflow';

export class PersonalityAnalysis implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'Personality Analysis',
		name: 'personalityAnalysis',
		icon: 'file:personality.svg',
		group: ['transform'],
		version: 1,
		description: 'Analyze text and predict Myers-Briggs personality type',
		defaults: {
			name: 'Personality Analysis',
		},
		inputs: ['main'],
		outputs: ['main'],
		properties: [
			{
				displayName: 'Text to Analyze',
				name: 'text',
				type: 'string',
				default: '',
				placeholder: 'Enter the text to analyze',
				required: true,
			},
		],
	};

	async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
		const items = this.getInputData();
		const returnData: INodeExecutionData[] = [];

		for (let itemIndex = 0; itemIndex < items.length; itemIndex++) {
			try {
				const text = this.getNodeParameter('text', itemIndex, '') as string;

				// Fazendo a requisição POST para a API de análise de personalidade
				const response = await this.helpers.request({
					method: 'POST',
					url: `http://192.168.0.105:9000/predict`,
					body: {
						text: text,
					},
					json: true,
				});

				const predictedClass = response.predicted_classes;

				// Adicionando o item ao output
				const newItem: INodeExecutionData = {
					json: {
						predictedClass,
					},
				};

				returnData.push(newItem);

			} catch (error) {
				if (this.continueOnFail()) {
					returnData.push({ json: this.getInputData(itemIndex)[0].json, error, pairedItem: itemIndex });
				} else {
					throw new NodeOperationError(this.getNode(), error, { itemIndex });
				}
			}
		}

		return [returnData];
	}
}

module.exports = {
	PersonalityAnalysis,
};