
export interface NodeProperty {
  key: string;
  label: string;
  type: 'text' | 'textarea' | 'number' | 'select' | 'toggle' | 'multiselect' | 'custom_fields' | 'form_fields' | 'date';
  value: any;
  options?: string[];
  conditions?:any;
  isConfigKey?: boolean;
  isEncrypted?: boolean;
  schemaKey?: string;
  mode?:any;
}

export interface EdgeCondition {
  id: string;
  field: string;
  operator: 'equals' | 'not_equals' | 'contains' | 'greater_than' | 'less_than';
  value: string;
}

export interface WorkflowNode {
  id: string;
  type: string;
  position: { x: number; y: number };
  data: {
    label: string;
    icon?: string;
    properties: NodeProperty[];
    [key: string]: any;
  };
}

export interface WorkflowEdge {
  id: string;
  source: string;
  target: string;
  type?: string;
  data?: {
    label?: string;
    conditions?: EdgeCondition[];
    [key: string]: any;
  };
}

export interface Workflow {
  id: string;
  name: string;
  description: string;
  nodes: WorkflowNode[];
  edges: WorkflowEdge[];
  createdAt: string;
  updatedAt: string;
}


export interface NodeDefinition {
  type: string;
  label: string;
  icon: string;
  description: string;
  category: string;
  defaultProperties: NodeProperty[];
  dynamicProperties?: NodeProperty[];
  inputs: object;
  outputs: object;
}

export const nodeDefinitions: NodeDefinition[] = [
  // ▶️ Start Node
  {
    type: 'start',
    label: 'Start',
    icon: 'Play',
    description: 'Entry point of the workflow',
    category: 'Control Flow',
    defaultProperties: [
      { key: 'name', label: 'Name', type: 'text', value: 'Start' },
      { key: 'invoker', label: 'Invoker', type: 'text', value: '' },
    ],
    inputs: {},
    outputs: {},
  },

  // ⏹ End Node
  {
    type: 'end',
    label: 'End',
    icon: 'Square',
    description: 'End point of the workflow',
    category: 'Control Flow',
    defaultProperties: [
      { key: 'name', label: 'Name', type: 'text', value: 'End' },
      { key: 'status', label: 'Status', type: 'select', value: 'success', options: ['success', 'failure', 'cancelled'] },
    ],
    inputs: {},
    outputs: {},
  },

  {
  type: 'business',
  label: 'Business Node',
  icon: 'Briefcase',
  description: 'A manual or approval step performed by a specific role',
  category: 'Business Process',

  // STATIC PROPERTIES
  defaultProperties: [
    { key: 'label', label: 'Step Label', type: 'text', value: 'Business Step' },
    { key: 'roles', label: 'Allowed Roles', type: 'text', value: '' },
    { key: 'due_time', label: 'Due Date', type: 'select', value: '', options: ['none', '1 minute', '5 minutes', '15 minutes', '30 minutes', '1 hour', '2 hours', '6 hours', '12 hours', '1 day', '2 days', '3 days']},
    { key:'action', label: 'Action', type: 'select', value: '', options: ['none','notification', 'notify_and_change_role', 'notify_and_end']},
    {
          key:'recipient_email',
          label:'Recipient Email',
          type:'text',
          value:''
        },

    { 
      conditions:[{
         key:"action",
         value:"notify_and_change_role"
      }
      ],
       key:"new_role", 
       label:"New Role",
       type:"text",
      value:"" 
       },
  ],

  // DYNAMIC SCHEMA DEFINED BY USER
  dynamicProperties: [
    {
      key: 'formFields',
      label: 'Form Fields',
      type: 'form_fields',
      value: []
    }
  ],

  // IO THAT READS THE SCHEMA
  inputs: {
    due_time: {
      dataType: "string",
      description: "Due Date",
      schemaKey: "due_time",
      isConfigKey: true,
    },
    action:{
      dataType: 'string',
      description: 'Action',
      schemaKey: 'action',
      isConfigKey: true
    },
    recipient_email: {
      dataType: "string",
      description: "Recipient Email",
      schemaKey: "recipient_email",
      isConfigKey: true
    },
    new_role:{
      dataType: "string",
      description: "New Role",
      schemaKey: "new_role",
      isConfigKey: true
    },
    form: {
      dataType: "dynamic_object",
      description: "Form Data",
      schemaKey: "formFields",
      interrupt: "true"
    }
  },

  outputs: {
    form: {
      dataType: "dynamic_object",
      description: "Form Data Result",
      schemaKey: "formFields"
    }
  }
}
,

  // 🧠 LLM Node
  {
    type: 'llm',
    label: 'LLM Node',
    icon: 'MessageCircle',
    description: 'Interact with a Language Model',
    category: 'AI',
    defaultProperties: [
      { key: 'model', label: 'Model', type: 'select', value: 'gpt-3.5-turbo', options: ['gpt-3.5-turbo', 'gpt-4', 'custom'] },
      { key: 'prompt', label: 'Prompt', type: 'textarea', value: 'Hello, world!' },
      { key: 'temperature', label: 'Temperature', type: 'number', value: 0.7 },
      { key: 'max_tokens', label: 'Max Tokens', type: 'number', value: 100 },
    ],
    inputs: { "user_prompt": "$interrupt.dict" },
    outputs: { "response": "string" },
  },

  // ⚙️ Tool Node
  {
    type: 'tool',
    label: 'Tool Node',
    icon: 'Wrench',
    description: 'Execute APIs or external tools',
    category: 'Utility',
    defaultProperties: [
      { key: 'toolName', label: 'Tool Name', type: 'text', value: 'MyTool' },
      { key: 'endpoint', label: 'Endpoint', type: 'text', value: '' },
      { key: 'method', label: 'Method', type: 'select', value: 'POST', options: ['GET', 'POST', 'PUT', 'DELETE'] },
    ],
    inputs: {
      trigger: { dataType: 'signal', description: 'Trigger tool execution' },
      input_data: { dataType: 'object', description: 'Optional input' },
    },
    outputs: {
      result: { dataType: 'object', description: 'Output data' },
      error: { dataType: 'string', description: 'Error message' },
    },
  },
    // 🔔 Notification Node
    {
      type: 'notification',
      label: 'Notification Node',
      icon: 'Bell',
      description: 'Send a notification via email or messaging service',
      category: 'Communication',
      defaultProperties: [
        { 
          key: 'channel', 
          label: 'Notification Channel', 
          type: 'select', 
          value: 'gmail', 
          options: ['gmail',"sms","telegram","whatsapp","slack","discord","microsoft_teams","zoom","line","viber","wechat"] 
        },
        {
          conditions:[
            {
              key:'channel',
              value:'gmail'
            }
          ],
          key:'trigger',
          label:'Trigger',
          type:'select',
          value:'',
          options:["system","user"]
        },
        {
          conditions:[
            {
              key:'channel',
              value:'gmail'
            },
            {
              key:'trigger',
              value:'user'
            }
          ],
          key:'from_mail',
          label:'From mail',
          type:'text',
          value:''
        },
        {
          conditions:[
            {
              key:'channel',
              value:'gmail'
            },
            {
              key:'trigger',
              value:'user'
            }
          ],
          key:'mail_api_key',
          label:'API Key',
          type:'text',
          value:''
        }

      ],
      inputs: {
        channel:{dataType:'string',description:'Notification Channel',schemaKey:'channel',isConfigKey:true},
        trigger:{dataType:'signal',description:'Trigger notification',schemaKey:'trigger',isConfigKey:true},
        from_mail:{dataType:'string',description:'From mail',schemaKey:'from_mail',isEncrypted:true,isConfigKey:true},
        mail_api_key:{dataType:'string',description:'Mail API Key',schemaKey:'mail_api_key',isEncrypted:true,isConfigKey:true},
        recipient: {dataType:'object',description:"Recipient name and email"},
        message: { dataType: 'object', description: 'Message subject and body' },
      },
      outputs: {
        status: { dataType: 'string', description: 'Notification status (sent/error)' },
      },
    },
    {
      type: 'data',
      label: 'Data Operation Node',
      icon: 'Database',
      description: 'Interact with data',
      category: 'Data',
      defaultProperties: [
        { 
          key: 'url', 
          label: 'URL', 
          type: 'text', 
          value: '', 
        }

      ],
      inputs: {
        url:{dataType:'string',description:'URL',schemaKey:'url',isConfigKey:true},
        
      },
      outputs: {
        records: { dataType: 'list', description: 'Result' },
      },
    },
   {
      type: 'filter',
      label: 'Filter Node',
      icon: 'Filter',
      description: 'Filter data',
      category: 'Data',
      defaultProperties: [
      
      ],
      inputs: {
        condition:{dataType:'string',description:'Condition',isConditionInput:true},
        state:{dataType:'string',description:'State',value:"$state",isFixedValue:true},
      },
      outputs: {
        filter_result: { dataType: 'boolean', description: 'Filter Result' },
      },
    },
    {
      type: 'looper',
      label: 'Looper Node',
      icon: 'Repeat',
      description: 'Loop over data',
      category: 'Data',
      defaultProperties: [
      
      ],
      inputs: {
        collection:{dataType:'list',description:'Collection'},
        index:{dataType:'string',description:'Index'},
        
      },
      outputs: {
        current_item: { dataType: 'object', description: 'Current Item' },
        index: { dataType: 'string', description: 'Index' },
      },
    },
    {
      type: 'printer',
      label: 'Printer Node',
      icon: 'Printer',
      description: 'Print data',
      category: 'Data',
      defaultProperties: [
       
      ],
      inputs: {
        value:{dataType:'string',description:'Value'},
      },
      outputs: {
        printed_values: { dataType: 'list', description: 'Printed Values' },
      },
    },

];

