**PRODUCT JSON STRUCTURE**

The product-workspace.json have the follow structure:

Product details with name, description and images

```
{
  "name": "Workspace",
  "image": "workspace.png",
  "imagecard": "workspace-card.png",
  "description": "O Amazon WorkSpaces é um serviço de virtualização de desktop persistente e totalmente gerenciado",
```

The "stack" block have details about the stack, you must define the stack name, the Cloudformation templateUrl.

```
  "stack": {
    "stacksetName": "Workspace",
    "templateUrl": "https://vendingmachinetemplates.s3-sa-east-1.amazonaws.com/products/vm-workspace.yaml"
  },

```

Next, in the "options" block, you can define the options (variables) needed to deploy the product. "Name" is the variable, "label" is the text displayed in the Vending Machine form, "type" can have the value "text", a free text field, or "options", in that case, you must create a array block with the dropdown options. "Required" can be "true" or "false", indicate if this option will be required.

```
  "options": [
    {
      "name": "User",
      "label": "Usuário",
      "type": "text",
      "required": "true"
    }
  ],

```

Next, in the "tags" block, you can define the Tags needed to associate with the resources deployed by the product. "Name" is the tag, "label" is the text displayed in the Vending Machine form, "type" can have the value "text", a free text field, or "options", in that case, you must create a array block with the dropdown options.

```
  "tags": [
    {
      "name": "critical",
      "label": "Criticidade",
      "type": "options",
      "values": [
        "Alta",
        "Media",
        "Baixa"
      ]
    },
    {
      "name": "centrocusto",
      "type": "text",
      "label": "Centro de Custo"
    }
  ]
}
```
