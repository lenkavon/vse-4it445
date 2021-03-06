import React, { Component } from 'react';
import { connect } from 'react-redux';

import { FormGroup, ControlLabel, FormControl, HelpBlock } from 'react-bootstrap';

import api from '../api.js';

export class ShoppingCartCheckoutPageRaw extends Component {
  constructor(props) {
    super(props);

    this.state = {
      errors: {},
    };

    this.handleSubmit = this.handleSubmit.bind(this);
  }

  handleSubmit(event) {
    event.preventDefault();

    const { items } =  this.props;
    const formItems = items.map(({ product, quantity }) => ({
      productId: product.id,
      quantity,
    }));

    const formData = new FormData(event.target);
    formData.append(
      'items',
      JSON.stringify(formItems)
    );

    api.post('orders/submit', formData)
      .then(({ data }) => {
        this.setState({ errors: {} });
      })
      .catch(error => {
        const { response } = error;
        const { errors } = response.data.error.details;

        this.setState({ errors });
      });
  }

  render() {
    const { items } = this.props;
    const { errors } = this.state;
    const {
      items: globalItemsErrors = [],
      itemsErrors = [],
    } = errors;

    return (
      <div>
        <div className="jumbotron">
          <h1>Checkout</h1>
        </div>
        <form onSubmit={this.handleSubmit}>
          {globalItemsErrors.length === 0 ? undefined:
            <FormGroup validationState="error">
              {globalItemsErrors.map((errorMessage, index) => (
                <HelpBlock key={index}>
                  {errorMessage}
                </HelpBlock>
              ))}
            </FormGroup>
          }
          {items.map(({ product, quantity }, index) => {
            const errors = itemsErrors[index] || {};
            const errorPairs = Object.keys(errors).reduce((errorPairs, key) => {
              const keyErrors = errors[key];
              const keyErrorPairs = keyErrors.map(errorMessage => [key, errorMessage]);
              return [...errorPairs, ...keyErrorPairs];
            }, []);
            const anyErrors = errorPairs.length > 0;

            return (
              <FormGroup
                validationState={anyErrors ? "error" : undefined}
                key={index}
              >
                {errorPairs.map(([key, errorMessage], index) => (
                  <HelpBlock key={index}>
                    {key} {errorMessage}
                  </HelpBlock>
                ))}
                <FormControl.Static>
                  {product.title} x {quantity}
                </FormControl.Static>
              </FormGroup>
            );
          })}
          <div>
            {[
              ['firstName', 'First name'],
              ['lastName', 'Last name'],
              ['address', 'Address']
            ].map(([key, label]) => {
              const errorMessages = errors[key] || [];
              return (
                <FormGroup
                  validationState={errorMessages.length > 0 ? "error" : undefined}
                  key={key}
                  controlId={key}
                >
                  <ControlLabel>{label}</ControlLabel>
                  {errorMessages.map((message, index) => (
                    <HelpBlock key={index}>{message}</HelpBlock>
                  ))}
                  <FormControl type="text" name={key} />
                </FormGroup>
              );
            })}
          </div>
          <div>
            <button type="submit">Submit Order</button>
          </div>
        </form>
      </div>
    );
  }
}

import { getItems } from '../components/ShoppingCart/reducer.js';

function mapStateToProps(state) {
  const { shoppingCart } = state;
  return {
    items: getItems(shoppingCart),
  };
}

export const ShoppingCartCheckoutPage = connect(
  mapStateToProps,
)(ShoppingCartCheckoutPageRaw);
