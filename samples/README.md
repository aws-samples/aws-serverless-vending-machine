The [templates/product-workspaces.yaml](./templates/product-workspaces.yaml) file is a sample script that implements a virtual desktop in Amazon Workspaces, note that the implementation happen through an AWS Service Catalog product, to create an isolation layer.
```
Resources:
  Workspaces:
    Type: "AWS::ServiceCatalog::CloudFormationProvisionedProduct"
    Properties:
     ProductName: "Workspace"
     ProvisioningArtifactName: "Workspace Template"
```

In the samples/templates/ServiceCatalogBaseline.yaml file has the CloudFormation script creating the products in the Service Catalog portfolio, including Workspaces. To implement the Service Catalog in your organization accounts, run the commands below by adjusting the *s3 bucket name, regions, and organization id*:

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

Once you have the CloudFormation templates, save them in the S3 bucket created during infrastructure deployment, in the _*S3VendingMachineTemplatesBucket*_ output. This bucket has been configured with a bucket policy to be accessible by the organization's accounts and will be referenced by the stackinstances deployments. Save the template file with the following command:
```
aws s3 cp samples/templates/product-workspaces.yaml \
 s3://...-s3templates-....
```

Next we will format a JSON with instructions to make the products available in the Self-service portal, with name, description, images, parameters, the link to the template and tags. The application builds the product forms dynamically from the Options and Tags block, so you can have products with different variables. Examples of this JSON framework and the explanation of how to build them are in the _*[JSON/README.md file.](./JSON)*_ Change the templateUrl pointing to the files we just saved in S3:

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
    "templateUrl": "https://XXXXX.s3-sa-east-1.amazonaws.com/products/product-workspace.yaml"
  },
  "options": [...],
  "tags": [ ... ]
}
```

In the Vending Machine main page, click in _*New Product*_, paste the JSON and click in the "Add Product" button.
