## aws-severless-vending-machine

These sample applications demonstrate how to create a solution to developer teams consume IaC Products, like a "Vending Machine", to automated deploy cloud service in their AWS Accounts without open a ticket or request in IT department.

![Vending Machine Concept](/images/vendingmachine-sample.png |  width=550)

In other hand, the CCoE teams or SysOps administrators can create Cloud Products, for example, a .NET application running in ECS, Fargate and a CI/CD pipelines or operational products, like a VPC with a Transit Gateway Peering.

The Vending Machine was build using AWS Serverless components, a low cost and an easy application to support

![Vending Machine Architecture](/images/vendingmachine-blogpost.png)

**DO NOT USE THIS SOLUTION TO CREATE A CONSOLE OVER THE AWS CONSOLE!**

This sample code is made available under a modified MIT license. See the LICENSE file.

## Building the examples
Dependencies

- AWS Accounts (you can adapt this sample to run in only one account, but it is recommended two or more accounts with AWS Organization enabled);
- [The AWS CLI version 1 or 2](https://docs.aws.amazon.com/cli/latest/userguide/welcome-versions.html);
- [if you have 2 or more accounts, you need deploy permissions to run Stack Set operation](https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/stacksets-prereqs.html)
- npm 7.20.3

Install

First clone this repo:

```
git clone https://github.com/aws-samples/aws-severless-vending-machine
```

Deploy the Stack file [scripts/deployServerlessVendingMachine.yaml](./scripts/deployServerlessVendingMachine.yaml) at the end check the Stack Outputs to follow the instalation process.

The next step is edit the [App.js](site/vendingmachineapp/src/App.js) file to change the REST API endpoint:

```
API: {
     endpoints: [
         {
             name: "VendingMachine-API",

             //CHANGE HERE THE VENDING MACHINE API
             endpoint: "https://RESTAPIID.execute-api.sa-east-1.amazonaws.com/default",

             custom_header: async () => {
                return { Authorization: `Bearer ${(await Auth.currentSession()).getIdToken().getJwtToken()}` }
             }
         }
     ]
 }
```
Go to Front-end directory and run the follow commands:

```
cd site/vendingmachineapp/
npm install
npm run build
```

Go to the build folder and copy files to S3, there is a *S3VendingMachineSiteBucket* variable in the Stack Outputs, get the S3 bucket name and use in theses commands:

```
cd build
aws s3 rm s3://...-cloudfrontauthorizationedge-.... —recursive
aws s3 cp . s3://...cloudfrontauthorizationedge-.... —recursive
```

And now just open the Vending Machine Website. You can get the VM URL on the *VendingMachineUrl* variable in the Stack Output.

There are more information to add Products in the folder [samples](./samples).

## Security

See [CONTRIBUTING](CONTRIBUTING.md#security-issue-notifications) for more information.

## License

This library is licensed under the MIT-0 License. See the LICENSE file.
