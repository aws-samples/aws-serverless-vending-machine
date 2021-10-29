import React, { Component } from "react";
import { v4 as uuidv4 } from "uuid";

import Amplify from "@aws-amplify/core";
import { API } from '@aws-amplify/api';
import Auth from "@aws-amplify/auth";

import Media from 'react-bootstrap/Media';
import Container from 'react-bootstrap/Container';
import Jumbotron from 'react-bootstrap/Jumbotron';
import { Col, Row, Form, Button, Card, CardDeck, Navbar, Nav, Table } from 'react-bootstrap';
import moment from 'moment';
//import FormFactory from '.FormFactory.js'

import 'bootstrap/dist/css/bootstrap.min.css';
import "./App.css";

// Amplify.configure({  });

Amplify.configure({
    Auth: {
      region: process.env.REACT_APP_USER_POOL_REGION,
      userPoolId: process.env.REACT_APP_USER_POOL_ID,
      userPoolWebClientId: process.env.REACT_APP_USER_POOL_WEB_CLIENT_ID,
      cookieStorage: {
        path: "/",
        expires: "",
        domain: window.location.hostname,
        secure: true,
    },
    oauth: {
      domain: process.env.REACT_APP_USER_POOL_AUTH_DOMAIN,
      scope: process.env.REACT_APP_USER_POOL_SCOPES.split(","),
      redirectSignIn: `https://${window.location.hostname}${process.env.REACT_APP_USER_POOL_REDIRECT_PATH_SIGN_IN}`,
      redirectSignOut: `https://${window.location.hostname}${process.env.REACT_APP_USER_POOL_REDIRECT_PATH_SIGN_OUT}`,
      responseType: "code",
    },
  },
  API: {
       endpoints: [
           {
               name: "VendingMachine-API",
               //CHANGE HERE THE VENDING MACHINE API
               endpoint: "https://j7dnqvme5c.execute-api.sa-east-1.amazonaws.com/default",
               custom_header: async () => {
                  return { Authorization: `Bearer ${(await Auth.currentSession()).getIdToken().getJwtToken()}` }
               }
           }
       ]
   },
});



let i = 0;

class App extends Component {
	state = {
		id: 0,
		data: [],
		entries: [],
    entry: [],
    tags: [],
    options: [],
    showProduct: false,
    showList: true,
    message: "",
    showNew: false,
    showUpdate: false,
    showDeployedProduct: false,
    listdeploy: []
	};

  toggle = () => this.setState((currentState) => (
      {showProduct: !currentState.showProduct,
      showList: !currentState.showList}
    )
  );

  componentDidMount() {
		this.getEntries();
    this.getCurrentUser();
	}

  getEntry(id) {

    this.setState({ id: id});
		const apiName = 'VendingMachine-API';
    const path = '/VendingMachine';
    const input = {
        body: {
            "operation": "read",
            "payload": {
              "TableName": "products",
              "Key": {
                  "id": id
                  }
              }
        }
         // OPTIONAL
      };

		API.post(apiName, path, input)
			.then(response => {
        this.setState({ data: response.stacksetData });
        this.setState({ tags: response.stacksetData.tags });
        this.setState({ options: response.stacksetData.options });
        this.showProduct();
			}
      )
			.catch(error => {
				console.log(error);
			});
	}


  getEntryDeployed(id) {

    this.setState({ id: id});
		const apiName = 'VendingMachine-API';
    const path = '/VendingMachine';
    const input = {
        body: {
            "operation": "list",
            "payload": {
              "TableName": "deploy",
              "Key": {
                  "stackinstanceData.productid": id
                  }
              }
        }
         // OPTIONAL
      };

		API.post(apiName, path, input)
			.then(response => {
        console.log(response.Items);
        this.setState({ listdeploy: response.Items });
        this.showlistdeploy();
			}
      )
			.catch(error => {
				console.log(error);
			});
	}


    getCurrentUser() {
      console.log(Auth.currentUserInfo());
      Auth.currentSession().then((user) =>
        this.setState({
          username: user.username,
          email: user.getIdToken().decodePayload().email,
        })
      ).catch(error => {
      		console.log(error);
      });
      // Schedule check and refresh (when needed) of JWT's every 5 min:
      const i = setInterval(() => Auth.currentSession(), 5 * 60 * 1000);
      return () => clearInterval(i);
    };


    // NAVEGACAO
    logOff() {
      //Auth.signOut();
    }

    home() {
      this.setState((currentState) => (
          {showProduct: false,
          showList: true,
          showNew: false,
          showUpdate: false,
          showDeployedProduct: false}
        )
      )
      this.getEntries();
    }

    showAddProduct() {
      this.setState((currentState) => (
          {showProduct: false,
          showList: false,
          showNew: true,
          showUpdate: false,
          showDeployedProduct: false}
        )
      )
    }

    showUpdateProduct() {
      this.setState((currentState) => (
          {showProduct: false,
          showList: false,
          showNew: false,
          showUpdate: true,
          showDeployedProduct: false}
        )
      )
    }

    showProduct() {
      this.setState((currentState) => (
          {showProduct: true,
          showList: false,
          showNew: false,
          showUpdate: false,
          showDeployedProduct: false}
        )
      )
    }

    showlistdeploy() {
      this.setState((currentState) => (
          {showProduct: true,
          showList: false,
          showNew: false,
          showUpdate: false,
          showDeployedProduct: true
        }
        )
      )
    }

  deployNewProduct = e => {
    e.preventDefault();

    const formData = new FormData(e.target),
          formDataObj = Object.fromEntries(formData.entries())


    const apiName = 'VendingMachine-API';
    const path = '/VendingMachine';
    const input = {
        body: {
                "operation": "create",
                    "payload": {
                      "TableName": "products",
                      "Item": {
                          "id": uuidv4(),
                          "stacksetData": JSON.parse(formDataObj.prodjson)
                      }
                    }
                }
      }
       // OPTIONAL


     API.post(apiName, path, input)
       .then(response => {
         this.setState({ message: response.message })
         this.home()
       })
       .catch(error => {
         console.log(error);
       });

  }

  deployUpdateProduct = e => {
    e.preventDefault();

    this.deleteProduct();

    const formData = new FormData(e.target),
          formDataObj = Object.fromEntries(formData.entries())


    const apiName = 'VendingMachine-API';
    const path = '/VendingMachine';
    const input = {
        body: {
                "operation": "create",
                    "payload": {
                      "TableName": "products",
                      "Item": {
                          "id": this.state.id,
                          "stacksetData": JSON.parse(formDataObj.prodjsonupd)
                      }
                    }
                }
      }

     API.post(apiName, path, input)
       .then(response => {
         this.setState({ message: response.message })
         this.getEntry(this.state.id)
         this.showProduct()
       })
       .catch(error => {
         console.log(error);
       });

  }

  deleteAndgohome() {
    this.deleteProduct();
    this.home();
  }

  deleteProduct() {

    const apiName = 'VendingMachine-API';
    const path = '/VendingMachine';
    const input = {
        body: {
            "operation": "delete",
            "payload": {
              "TableName": "products",
              "Key": {
                  "id": this.state.id
                  }
              }
        }
    }

    console.log(input);
       // OPTIONAL

     API.post(apiName, path, input)
       .then(response => {
         this.setState({ message: response.message })
       })
       .catch(error => {
         console.log(error);
       });

  }




  deployProduct = e => {
    e.preventDefault();

    const formData = new FormData(e.target),
          formDataObj = Object.fromEntries(formData.entries())

    var params = [];
    for(var key of Object.keys(this.state.options)){
      params.push({"ParameterKey": this.state.options[key].name, "ParameterValue": formDataObj[this.state.options[key].name]})
    }
    console.log(params)


    var ptags = [{"Key": "application", "Value": this.state.data.stack.stacksetName}];
    for(var tag of Object.keys(this.state.tags)){
      ptags.push({"Key": this.state.tags[tag].name, "Value": formDataObj[this.state.tags[tag].name]})
    }
    console.log(ptags)

    const apiName = 'VendingMachine-API';
    const path = '/VendingMachine';
    const input = {
        body: {
            "operation": "deploy",
            "payload": {
              "TableName": "deploy",
              "Item": {
                  "id": uuidv4(),
                    "stackinstanceData": {
                      "stacksetName": this.state.data.stack.stacksetName,
                      "templateUrl": this.state.data.stack.templateUrl,
                      "parameterOverrides": params,
                      "stregions": formDataObj.region,
                      "account": formDataObj.account,
                      "orgid": "",
                      "productid": this.state.id,
                      "owner": "user-id",
                      "approval": "approval-id",
                      "requestdate": (Date.now()),
                      "approvaldate": "",
                      "status": "New",
                      "tags": ptags
                    },
                    "stacksetData": {
                      "stack": this.state.data.stack
                    }

              }
            }

        }
         // OPTIONAL
      };
    console.log(input)
    API.post(apiName, path, input)
      .then(response => {
        this.setState({ message: response.message })
        this.getEntryDeployed()
      })
      .catch(error => {
        console.log(error);
        this.getEntryDeployed()
      });
  };


  getEntries() {
    const apiName = 'VendingMachine-API';
    const path = '/VendingMachine';

    const input = {
        body: {
            "operation": "list",
            "payload": {
              "TableName": "products"
              }
        }

      };

    API.post(apiName, path, input)
      .then(response => {
        this.setState({ entries: response.Items })
      })
      .catch(error => {
        console.log(error);
      });
  }

  render() {
		return (

      <div className="App">

      <Jumbotron fluid>
      <Container>

      <Navbar bg="dark" variant="dark">
        <Navbar.Brand href="#home">Octank Vending Machine</Navbar.Brand>
          <Nav className="mr-auto">
              <Nav.Link onClick={ () => this.home() } href="#home">Produtos</Nav.Link>
              <Nav.Link onClick={() => this.showAddProduct()} href="#">Novo Produto</Nav.Link>
            </Nav>
            <Nav className="mr-auto" className="justify-content-end">
              <Nav.Link onClick={ () => this.logOff() } href="#home">Sair</Nav.Link>
            </Nav>
      </Navbar>



      </Container>
      </Jumbotron>

      { this.state.showNew && <div className="newProduct">

        <Container>
          <Form onSubmit={this.deployNewProduct}>

          <Form.Group controlId="ControlTextarea1">
            <Form.Label><strong>JSON</strong></Form.Label>
            <Form.Control as="textarea" rows={15} name="prodjson" />
          </Form.Group>


        <Button variant="primary" type="submit">Incluir</Button>&nbsp;
        <Button variant="danger" type="reset" onClick={() => this.home()}>Voltar</Button>
        </Form>

        </Container>
      </div>
      }

      { this.state.showUpdate && <div className="showUpdate">

        <Container>
          <Form onSubmit={this.deployUpdateProduct}>

          <Form.Group controlId="ControlTextarea2">
            <Form.Label><strong>JSON</strong></Form.Label>
            <Form.Control as="textarea" rows={15} name="prodjsonupd" onChange = { (event) => this.setState( { data: JSON.parse(event.target.value) } ) }
                  value={ JSON.stringify(this.state.data, null, 2) }/>
          </Form.Group>


        <Button variant="primary" type="submit">Alterar</Button>&nbsp;
        <Button variant="danger" type="reset" onClick={() => this.home()}>Voltar</Button>
        </Form>

        </Container>
      </div>
      }

      { this.state.showList && <div className="productList">
      <Container>
      <CardDeck>
      {this.state.entries.map(product => {
        return (

            <a href="#" onClick={ () => this.getEntry(product.id) } key={ i++ }>
              <FormatCard component={product} key={i++} />
            </a>
            )
          }
        )
      }

      <a href="#" onClick={() => this.showAddProduct()} key={ i++ }>
      <Card style={{ width: '18rem', height: '23rem' }}>
      <Card.Img variant="top" src="novo.png" style={{ height: '12rem' }} />
      <Card.Body>
        <Card.Title>Adicionar Produto</Card.Title>
        <Card.Text>
          Crie novos produtos para serem utilizados por seus times
        </Card.Text>
        </Card.Body>
      </Card>
      </a>

      </CardDeck>
      </Container>
      </div>
    }

      { this.state.showProduct && <div className="productDetails">
      <Container>
      <Media>
        <img
          width={64}
          height={64}
          className="mr-3"
          src={this.state.data.image}
          alt={this.state.data.name}
        />
        <Media.Body>
          <h4>{this.state.data.name}</h4>
          <p>
            {this.state.data.description}
          </p>
          <Form onSubmit={this.deployProduct}>
          <h5>Opções</h5>

          {this.state.options.map(entry => (
            <FormFactory component={entry} key={i++} />
          ))}

          {this.state.tags.map(entry => (
            <FormFactory component={entry} key={i++} />
          ))}

          <Button variant="primary" type="submit">Solicitar Produto</Button>&nbsp;
          <Button type="reset" variant="secondary" onClick={() => this.showUpdateProduct()}>Editar Produto</Button>&nbsp;
          <Button type="reset" variant="secondary" onClick={() => this.getEntryDeployed()}>Listar Implantações</Button>&nbsp;
          <Button type="reset" variant="secondary" onClick={() => this.home()}>Voltar</Button>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
          <Button type="reset" variant="danger" onClick={() => this.deleteAndgohome() }>Apagar</Button>

          </Form>

        </Media.Body>
      </Media>

      <br />
      <br />

      { this.state.showDeployedProduct && <div className="productDetails">




        <Table striped bordered hover size="sm">
          <thead>
            <tr>
              <th>Conta e Região</th>
              <th>Produto</th>
              <th>Data</th>
              <th>Status</th>
              <th>tags</th>
              <th>Variaveis</th>
            </tr>
          </thead>
          <tbody>

      {this.state.listdeploy && this.state.listdeploy.map(entry => (

        <tr>
              <td>{entry.stackinstanceData.account} - {entry.stackinstanceData.stregions}</td>
              <td>{entry.stackinstanceData.stacksetName}</td>
              <td>{moment(entry.stackinstanceData.requestdate).format("llll")}</td>
              <td>{entry.stackinstanceData.status}</td>
              <td>{JSON.stringify(entry.stackinstanceData.tags)}</td>
              <td>{JSON.stringify(entry.stackinstanceData.parameterOverrides)}</td>
            </tr>

      ))}

          </tbody>
          </Table>
        </div>
      }
      </Container>
      </div> }
      </div>

    );
  }
}

function FormatCard(props) {

  return(
    <Card style={{ width: '18rem', height: '23rem' }}>
    <Card.Img variant="top" style={{ height: '12rem' }} src={props.component.stacksetData.imagecard} />
    <Card.Body>
      <Card.Title>{props.component.stacksetData.name}</Card.Title>
      <Card.Text>
        {props.component.stacksetData.description}
      </Card.Text>
      </Card.Body>
    </Card>
  )

}

function FormFactory(props) {

  switch (props.component.type) {
    case "text":
      return (
        <Form.Group as={Row} controlId={ props.component.name }>
          <Form.Label column sm="4">
            { props.component.label }
          </Form.Label>
          <Col sm="6">
            {props.component.required === "true"
              ? <Form.Control type="text" name={ props.component.name } required />
              : <Form.Control type="text" name={ props.component.name } />
            }
          </Col>
        </Form.Group>
      );

    case "options":
      return (
        <Form.Group as={Row} controlId={ props.component.name }>
          <Form.Label column sm="4">{ props.component.label }</Form.Label>
          <Col sm="6">
            <Form.Control as="select" name={ props.component.name }>
            {props.component.values.map(o => {
              return (
                <option key={ o }>{ o }</option>
                )
              })
            }
            </Form.Control>
          </Col>
        </Form.Group>
      );
    default:
      return <div>Reload...</div>;
  }
}

export default App;
