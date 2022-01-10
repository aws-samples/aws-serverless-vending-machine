The administrators can create new products to be consumed by DevOps teams, for that, is required create a standard CloudFormation template to implement services in your organization's accounts. All resources will be implemented through an AWS Service Catalog portfolio, creating an isolation layer.

There is a CloudFormation script to create the Service Catalog portfolio with an Amazon Workspace sample in the [templates/ServiceCatalogBaseline.yaml](./templates/ServiceCatalogBaseline.yaml) file. Before continue, edit that file and change the S3 bucket name in the LoadTemplateFromURL at line 35 with the Output variable S3VendingMachineTemplatesBucket. There is a bucket policy to share with all the organization account and should have all the products templates.

```
  Workspaces:
    Type: "AWS::ServiceCatalog::CloudFormationProduct"
    Properties:
...
        Info:
          # CHANGE THE S3 BUCKET HERE
          LoadTemplateFromURL : "https://s3.amazonaws.com/#S3VendingMachineTemplatesBucket#/workspaces-sc-template.yaml"
```

Pay attention for the file [templates/workspaces-sc-template.yaml](./templates/workspaces-sc-template.yaml), a CloudFormation script with all instruction to create the workspace product, you may can add in that file instruction to create the VPC, format TAGs, users, roles, keys, etc.

Now, to implement this Service Catalog portfolio in your organization's accounts, upload all files on the folder samples/templates to S3 and deploy the CloudFormation Stack Set on the organization. Run the commands below adjusting the s3 bucket name, region and organization ID:

```
aws s3 cp samples/templates/* \
 s3://...-s3templates-....
 
aws cloudformation create-stack-set --capabilities=CAPABILITY_NAMED_IAM \
  --stack-set-name ServiceCatalogBaseline \
  --template-url https://...-s3templates-.s3.amazonaws.com/ServiceCatalogBaseline.yaml \
  --region "us-east-1" --permission-model SERVICE_MANAGED \
  --auto-deployment Enabled=true,RetainStacksOnAccountRemoval=false
  
 aws cloudformation create-stack-instances --stack-set-name ServiceCatalogBaseline \
 --region us-east-1 --deployment-targets OrganizationalUnitIds=["ou-orgid"] \
  --regions ["us-east-1", "us-east-2"] \
 --operation-preferences FailureToleranceCount=7
``` 

The Vending Machine will use the CloudFormation script file [templates/product-workspaces.yaml](./templates/product-workspaces.yaml) to provisioning infrastructure in the child accounts, in our case, to implement an Amazon Workspaces product. We use that approach, like a library, to be easier to create many products implementations to different teams and accounts but with same standards using Cloudformation StackInstances.

```
Resources:
  Workspaces:
    Type: "AWS::ServiceCatalog::CloudFormationProvisionedProduct"
    Properties:
     ProductName: "Workspace"
     ProvisioningArtifactName: "Workspace Template"
```

Next we will format a JSON with instructions to create the Workspace product in the Vending Machine portal, with name, description, images, parameters, the link to the template and tags. The application builds the product forms dynamically from the Options and Tags block, so you can have products with different variables. Examples of this JSON structure and the explanation of how to build them are in the [JSON/README.md](./JSON/README.md) file. Change the templateUrl by pointing to the files we just saved in S3:

```
{
  "image": "workspace.png",
  "imagecard": "workspace-card.png",
  "name": "Workspace",
  "description": "Amazon WorkSpaces is a fully managed desktop virtualization service for Windows and Linux that enables you to access resources from any supported device. ",
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

Return to the Vending Machine website and click on the "Add Product" button on the home page, enter the JSON content created in the previous step, and click the "Include" button.
