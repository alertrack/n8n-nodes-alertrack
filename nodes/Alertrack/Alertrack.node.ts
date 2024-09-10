import {
	IExecuteFunctions,
	INodeExecutionData,
	INodeType,
	INodeTypeDescription,
} from 'n8n-workflow';

// Importando as ações individuais
import { loginAction } from './actions/Login';
import { contactAction } from './actions/GetAllContacts';
import { profileAction } from './actions/GetContactProfile';

export class Alertrack implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'CO - Alertrack',
		name: 'alertrack',
		icon: 'file:alertrack.svg',
		group: ['transform'],
		version: 1,
		description: 'Interaja com a API da Clientes Online',
		defaults: {
			name: 'Alertrack',
		},
		inputs: ['main'],
		outputs: ['main'],
		properties: [
			{
				displayName: 'Operation',
				name: 'operation',
				type: 'options',
				noDataExpression: true,
				options: [
					{
						name: 'Login',
						value: 'login',
					},
					{
						name: 'Buscar Todos Contatos',
						value: 'getContacts',
					},
                    {
                        name: 'Buscar Perfil Contato',
                        value: 'getProfile',
                    },
				],
				default: 'login',
			},
			// Propriedades específicas para a operação de login
			{
				displayName: 'Scopes',
				name: 'scopes',
				type: 'multiOptions',
				displayOptions: {
					show: {
						operation: ['login'],
					},
				},
                options: [
                    { name: 'Campaign - Acesso a Campanhas', value: 'campaign' },
                    { name: 'Channel - Acesso a Canais', value: 'channel' },
                    { name: 'Contact - Acesso a Agenda De Contatos', value: 'contact' },
                    { name: 'Correios - Acesso a Correios', value: 'correios' },
                    { name: 'Coupon - Acesso a Cupons', value: 'coupon' },
                    { name: 'Department - Acesso a Departamentos', value: 'department' },
                    { name: 'Edit - Permissão De Edição', value: 'edit' },
                    { name: 'Group - Acesso a Grupos', value: 'group' },
                    { name: 'Import - Permissão Para Importação', value: 'import' },
                    { name: 'Inbox - Acesso a Recados', value: 'inbox' },
                    { name: 'Manager - Escopo Geral, Define O Acesso a Todos Recursos Com Todo Tipo De Permissão', value: 'manager' },
                    { name: 'Monitor - Acesso a Monitores', value: 'monitor' },
                    { name: 'Notification - Acesso a Notificações', value: 'notification' },
                    { name: 'Operator - Acesso a Operadores', value: 'operator' },
                    { name: 'Popup - Acesso a Recursos Do Popup', value: 'popup' },
                    { name: 'Portable - Acesso a Portabilidade', value: 'portable' },
                    { name: 'Product - Acesso a Produtos', value: 'product' },
                    { name: 'Protocol - Acesso a Protocolo', value: 'protocol' },
                    { name: 'Remove - Permissão Para Remoção', value: 'remove' },
                    { name: 'Schedule - Acesso a Agendamentos', value: 'schedule' },
                    { name: 'Send - Permissão De Envio', value: 'send' },
                    { name: 'SMSIDEAL - Acesso a SMSIDEAL', value: 'smsideal' },
                    { name: 'Tag - Acesso a Etiquetas', value: 'tag' },
                    { name: 'Wallet Client - Acesso a Carteira De Clientes', value: 'wallet_client' },
                    { name: 'Write - Permissão De Escrita', value: 'write' },
                ],
				default: [],
				description: 'Os scopes a incluir na requisição de login',
			},
			// Propriedades específicas para outras operações podem ser adicionadas aqui
			{
				displayName: 'Page',
				name: 'page',
				type: 'number',
				displayOptions: {
					show: {
						operation: ['getContacts'],
					},
				},
				default: 1,
				description: 'Numero de paginas para recuperar contatos',
			},
            {
				displayName: 'ID',
				name: 'id',
				type: 'number',
				displayOptions: {
					show: {
						operation: ['getProfile'],
					},
				},
				default: 1,
				description: 'ID do contato',
			},
		],
		credentials: [
			{
				name: 'alertrackApi',
				required: true,
			},
		],
	};

	async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
		const operation = this.getNodeParameter('operation', 0) as string;

		let responseData: INodeExecutionData[] = [];

		if (operation === 'login') {
			responseData = await loginAction.call(this);
		} else if (operation === 'getContacts') {
			responseData = await contactAction.call(this);
		} else if (operation === 'getProfile') {
            responseData = await profileAction.call(this);
        }

		return [responseData];
	}
}

module.exports = {
	Alertrack,
};
