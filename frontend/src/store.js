import { createStore, combineReducers, applyMiddleware } from "redux";
import thunk from "redux-thunk"
import { composeWithDevTools } from "redux-devtools-extension";
import { newReviewReducer, productsDetailReducer, productsReducer, newProductReducer, productReducer, productReviewReducer, reviewReducer  } from "./reducers/productReducer"
import { forgotPasswordReducer, profileReducer, userReducer, authReducer, allUsersReducer, userDetailsReducers } from "./reducers/userReducer";
import { cartReducer } from "./reducers/cartReducer";
import { allOrdersReducer, myOrdersReducer, newOrderReducer, orderDetailsReducer, orderReducer } from "./reducers/orderReducer";

const reducer = combineReducers({
    products: productsReducer,
    productDetails: productsDetailReducer,
    user: userReducer,
    profile: profileReducer,
    forgotPassword: forgotPasswordReducer,
    cart: cartReducer,
    newOrder: newOrderReducer,
    myOrders: myOrdersReducer,
    auth: authReducer,
    orderDetails: orderDetailsReducer,
    newReview: newReviewReducer,
    newProduct: newProductReducer,
    product: productReducer,
    allOrders: allOrdersReducer,
    order: orderReducer,
    allUsers: allUsersReducer,
    userDetails: userDetailsReducers,
    productReviews: productReviewReducer,
    reviews: reviewReducer
});

let initialState = {
   cart: {
    cartItems: localStorage.getItem("cartItems")
     ? JSON.parse(localStorage.getItem("cartItems"))
     : [],
     shippingInfo: localStorage.getItem("shippingInfo")
     ? JSON.parse(localStorage.getItem("shippingInfo"))
     : {},
   },
};

const middleware = [thunk];

const store = createStore(
    reducer,
    initialState,
    composeWithDevTools(applyMiddleware(...middleware))
);


export default store; 