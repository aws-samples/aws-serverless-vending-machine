O arquivo *samples/templates/product-workspaces.yaml* é script de exemplo que implementa um desktop virtual no Amazon Workspaces, observe que a implementação ocorre através de um produto do AWS Service Catalog, para criar uma camada de isolamento.
```
Resources:
  Workspaces:
    *Type: "AWS::ServiceCatalog::CloudFormationProvisionedProduct"*
    Properties:
     ProductName: "Workspace"
     ProvisioningArtifactName: "Workspace Template"
```
No arquivo *samples/templates/ServiceCatalogBaseline.yaml* tem o script de CloudFormation criando alguns produtos no Service Catalog como exemplos, entre eles, o Workspaces. Para implementar o catalogo de serviços nas contas da organização, execute os comandos abaixo *ajustando o nome do bucket S3, regiões e o id da organização:*
```
aws s3 cp samples/templates/ServiceCatalogBaseline.yaml \
 s3://...-s3templates-....
 
aws cloudformation create-stack-set --capabilities=CAPABILITY_NAMED_IAM \
  --stack-set-name ServiceCatalogBaseline \
  --template-url https://...-s3templates-.s3.amazonaws.com/ServiceCatalogBaseline.yaml \
  --region "us-east-1" --permission-model SERVICE_MANAGED \
  --auto-deployment Enabled=true,RetainStacksOnAccountRemoval=false
  
 aws cloudformation create-stack-instances --stack-set-name ServiceCatalogBaseline \
 --region REGION_TO_RUN --deployment-targets OrganizationalUnitIds=["ou-orgid"] \
  --regions ["us-east-1", "us-east-2"] \
 --operation-preferences FailureToleranceCount=7
```
Uma vez que temos os templates de CloudFormation, vamos salva-los no bucket S3 criado durante a implantação da infraestrutura, o output *S3VendingMachineTemplatesBucket*. Este bucket foi configurado com um bucket policy para ser acessível pelas contas da organização e serão referenciados no momento de implantação das StackInstances. Salve o arquivo de template com o seguinte comando:
```
aws s3 cp samples/templates/product-workspaces.yaml \
 s3://...-s3templates-....
```
Na sequência iremos formatar um JSON com as instruções para disponibilizar os produtos no portal de Auto-serviço, com nome, descrição, imagens, parâmetros, o link para o template e tags. A aplicação constrói os formulários dos produtos dinamicamente a partir do bloco Options e Tags, então é possível ter produtos com variáveis diferentes. Exemplos desta estrutura de JSON e a explicação de como construi-los estão no arquivo *samples/JSON/README.md. *Altere o templateUrl apontando para o arquivos que acabamos de salvar no S3:

```
{
  "image": "workspace.png",
  "imagecard": "workspace-card.png",
  "name": "Workspace",
  "description": "O Amazon WorkSpaces é um serviço de virtualização de desktop persistente e totalmente gerenciado",
  "stack": {
    "stacksetName": "Workspace",
    "parameters": [
      {
        "ParameterValue": "user1",
        "ParameterKey": "User"
      }
    ],
    *"templateUrl": "https://XXXXX.s3-sa-east-1.amazonaws.com/products/product-workspace.yaml"*
  },
  "options": [...],
  "tags": [ ... ]
}
```

Clique no botão “Adicionar Produto” na tela principal do portal, insira o conteúdo do JSON criado no passo anterior e clique no botão Incluir:
