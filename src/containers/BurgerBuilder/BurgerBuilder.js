import React, { Component } from 'react';

import Aux from '../../hoc/Aux/Aux';
import Burger from '../../components/Burger/Burger';
import BuildControls from '../../components/Burger/BuildControls/BuildControls';
import Modal from '../../components/UI/Modal/Modal';
import OrderSummary from '../../components/Burger/OrderSummary/OrderSummary';
import Spinner from '../../components/UI/Spinner/Spinner';
import withErrorHandler from '../../hoc/withErrorHandler/withErrorHandler';
import axios from '../../axios-orders';

const INGREDIENT_PRICES = {
    salad: 0.5,
    cheese: 0.4,
    bacon: 0.7,
    meat: 1.3
};

class BurgerBuilder extends Component {

    state = {
        ingredients: null,
        totalPrice: 4,
        purchasable: false,
        purchasing: false,
        loading: false,
        error: false
    }

    constructor() {
        super()
        axios.get('https://react-my-burger-eefc1.firebaseio.com/ingredients.json')
            .then(response => {
                this.setState({ ingredients: response.data });
            })
            .catch(error => {
                this.setState({ error: true })
            })
    }

    updatePurchaseState(ingredients) {

        const sum = Object.keys(ingredients)
            .map(igKey => {
                return ingredients[igKey];
            })
            .reduce((sum, el) => {
                return sum + el;
            }, 0);

        this.setState({ purchasable: sum > 0 })

    }

    addIngredientHandler = (type) => {
        const oldCount = this.state.ingredients[type];
        const updatedCount = oldCount + 1;
        const updatedIngredients = {
            ...this.state.ingredients
        };
        updatedIngredients[type] = updatedCount;
        const priceAddition = INGREDIENT_PRICES[type];
        const oldPrice = this.state.totalPrice;
        const newPrice = oldPrice + priceAddition;
        this.setState({ ingredients: updatedIngredients, totalPrice: newPrice });
        this.updatePurchaseState(updatedIngredients);
    }

    removeIngredientHandler = (type) => {
        if (this.state.ingredients[type] !== 0) {
            const oldCount = this.state.ingredients[type];
            const updatedCount = oldCount - 1;
            const updatedIngredients = {
                ...this.state.ingredients
            };
            updatedIngredients[type] = updatedCount;
            const priceDeduction = INGREDIENT_PRICES[type];
            const oldPrice = this.state.totalPrice;
            const newPrice = oldPrice - priceDeduction;
            this.setState({ ingredients: updatedIngredients, totalPrice: newPrice });
            this.updatePurchaseState(updatedIngredients);
        }

    }

    purchaseHandler = () => {
        this.setState({ purchasing: true });
    }

    purchasedCancelHandle = () => {
        this.setState({ purchasing: false });
    }

    purchasedContinuedHandle = () => {
        this.setState({ loading: true })
        // alert('You shall pass!');
        const order = {
            ingredients: this.state.ingredients,
            price: this.state.totalPrice,
            customer: {
                name: 'jhon Lennon',
                address: {
                    street: 'Abbey Road',
                    zipCode: 'NW8 9AY',
                    country: 'England'
                },
                email: 'beatles@test.co.uk',
            },
            deliveryMethod: 'submarine'
        }
        axios.post('/orders.json', order)
            .then(response => {
                // console.log(response);
                this.setState({ loading: false, purchasing: false })
            })
            .catch(error => {
                // console.log(error);
                this.setState({ loading: false, purchasing: false })
            });
    }

    render() {
        const disabledInfo = {
            ...this.state.ingredients
        };

        for (let key in disabledInfo) {
            disabledInfo[key] = disabledInfo[key] <= 0;
        }
        let orderSummary = null;
        let burger = this.state.error ? <p>Igredients can't be loaded!</p> : <Spinner />;

        if (this.state.ingredients) {
            burger = (
                <Aux>
                    <Burger ingredients={this.state.ingredients} />
                    <BuildControls
                        price={this.state.totalPrice}
                        ingredientadded={this.addIngredientHandler}
                        ingredientremoved={this.removeIngredientHandler}
                        purchasable={this.state.purchasable}
                        ordering={this.purchaseHandler}
                        disabled={disabledInfo} />
                </Aux>
            )
            orderSummary = <OrderSummary
                price={this.state.totalPrice}
                ingredients={this.state.ingredients}
                purchaseCancelled={this.purchasedCancelHandle}
                purchaseContinued={this.purchasedContinuedHandle}></OrderSummary>;
        }
        if (this.state.loading) {
            orderSummary = <Spinner />;
        }
        return (
            <Aux>
                <Modal
                    show={this.state.purchasing}
                    modalClosed={this.purchasedCancelHandle}>
                    {orderSummary}
                </Modal>
                {burger}
            </Aux>
        );
    }
}

export default withErrorHandler(BurgerBuilder, axios);